import {
  User, MonitoringStation, OfficialAqiRecord, PollutantObservation,
  NationalOverview, WatchlistItem, AlertSubscription, ResearchProject,
  ResearcherApplication, HelpArticle, AuditLog, DataQualityIssue,
  DataSourceConfig, DataSyncLog, ThemeType, LanguageType
} from '../types';

const PROD_BACKEND_URL = 'https://airwise-backend-ycu9.onrender.com/api';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // Production fallback when hosted on Vercel or custom domain
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('airwise'))) {
    return PROD_BACKEND_URL;
  }
  return '/api';
};

const API_BASE = getApiBase();

const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('airwise_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Safely parse a fetch Response as JSON. Throws a readable Error on HTML or non-JSON bodies. */
const safeJson = async (res: Response): Promise<any> => {
  const text = await res.text();
  if (!text || text.trim() === '') return {};
  const trimmed = text.trim();
  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<!DOCTYPE')) {
    throw new Error(`Received HTML instead of JSON (HTTP ${res.status}). The backend service may still be starting up.`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid JSON (HTTP ${res.status}): ${text.substring(0, 120)}`);
  }
};

export const api = {
  // BASE URL EXPOSURE FOR DEBUGGING & LOGS
  getBaseUrl: () => API_BASE,

  // AUTH
  getSetupStatus: async () => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/setup-status`);
    } catch {
      throw new Error('Could not reach the AIRWISE backend server. The service may be starting up — please refresh in a moment.');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || `Failed to fetch setup status (HTTP ${res.status}).`);
    }
    return data as { superAdminConfigured: boolean; platformName: string };
  },

  setupSuperAdmin: async (data: { fullName: string; email: string; password: string }) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/setup-super-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error('Could not reach the AIRWISE backend server. Please verify network connectivity.');
    }
    const body = await safeJson(res);
    if (!res.ok) {
      throw new Error(body.error || `Setup failed with status ${res.status}.`);
    }
    return body;
  },

  login: async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Could not connect to authentication service. Backend may be waking up from cold start — please retry in 30 seconds.');
    }
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body.error || 'Login failed. Please verify credentials.');
    return body;
  },

  registerCitizen: async (data: { fullName: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/register-citizen`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body.error || 'Registration failed');
    return body;
  },

  registerResearcher: async (data: {
    fullName: string;
    email: string;
    password: string;
    institution: string;
    researchField: string;
    justification: string;
  }) => {
    const res = await fetch(`${API_BASE}/auth/register-researcher`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body.error || 'Application submission failed');
    return body;
  },

  updatePreferences: async (theme?: ThemeType, language?: LanguageType) => {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ theme, language }),
    });
    return safeJson(res);
  },

  // PUBLIC
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/public/overview`);
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || `Failed to retrieve overview (HTTP ${res.status})`);
    }
    return data as NationalOverview;
  },

  getStations: async () => {
    const res = await fetch(`${API_BASE}/public/stations`);
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || `Failed to retrieve stations (HTTP ${res.status})`);
    }
    return (Array.isArray(data) ? data : []) as MonitoringStation[];
  },

  getStates: async () => {
    const res = await fetch(`${API_BASE}/public/states`);
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || `Failed to retrieve states (HTTP ${res.status})`);
    }
    return (Array.isArray(data) ? data : []) as string[];
  },

  getCities: async (state?: string) => {
    const url = state ? `${API_BASE}/public/cities?state=${encodeURIComponent(state)}` : `${API_BASE}/public/cities`;
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || `Failed to retrieve cities (HTTP ${res.status})`);
    }
    return (Array.isArray(data) ? data : []) as string[];
  },

  getStationDetails: async (id: number) => {
    const res = await fetch(`${API_BASE}/public/station/${id}`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Station not found');
    return data as {
      station: MonitoringStation;
      aqiRecord: OfficialAqiRecord | null;
      pollutants: PollutantObservation[];
      lastUpdated: string | null;
    };
  },

  getHistoricalAqi: async (id: number, hours = 168) => {
    const res = await fetch(`${API_BASE}/public/station/${id}/history/aqi?hours=${hours}`);
    const data = await safeJson(res);
    if (!res.ok) return [];
    return (Array.isArray(data) ? data : []) as OfficialAqiRecord[];
  },

  getHistoricalPollutant: async (id: number, pollutant: string, hours = 168) => {
    const res = await fetch(`${API_BASE}/public/station/${id}/history/pollutant?pollutant=${encodeURIComponent(pollutant)}&hours=${hours}`);
    const data = await safeJson(res);
    if (!res.ok) return [];
    return (Array.isArray(data) ? data : []) as PollutantObservation[];
  },

  getPollutantsInfo: async () => {
    const res = await fetch(`${API_BASE}/public/pollutants/info`);
    const data = await safeJson(res);
    if (!res.ok) return [];
    return (Array.isArray(data) ? data : []) as Array<{ code: string; name: string; standard: string; source: string; health: string }>;
  },

  // CITIZEN
  getWatchlist: async () => {
    const res = await fetch(`${API_BASE}/citizen/watchlist`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as WatchlistItem[];
  },

  addToWatchlist: async (stationId: number) => {
    const res = await fetch(`${API_BASE}/citizen/watchlist/${stationId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return safeJson(res) as Promise<WatchlistItem>;
  },

  removeFromWatchlist: async (stationId: number) => {
    const res = await fetch(`${API_BASE}/citizen/watchlist/${stationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return safeJson(res);
  },

  getAlerts: async () => {
    const res = await fetch(`${API_BASE}/citizen/alerts`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as AlertSubscription[];
  },

  createAlert: async (data: Partial<AlertSubscription>) => {
    const res = await fetch(`${API_BASE}/citizen/alerts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return safeJson(res) as Promise<AlertSubscription>;
  },

  deleteAlert: async (alertId: number) => {
    const res = await fetch(`${API_BASE}/citizen/alerts/${alertId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return safeJson(res);
  },

  // RESEARCHER
  queryObservations: async (stationId: number, pollutant = 'ALL', start?: string, end?: string) => {
    let url = `${API_BASE}/research/query?stationId=${stationId}&pollutant=${pollutant}`;
    if (start) url += `&start=${start}`;
    if (end) url += `&end=${end}`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as PollutantObservation[];
  },

  getFingerprint: async (stationId: number, days = 7) => {
    const res = await fetch(`${API_BASE}/research/fingerprint/${stationId}?days=${days}`, { headers: getHeaders() });
    return safeJson(res);
  },

  getPersistence: async (stationId: number, pollutant: string, threshold?: number, days = 7) => {
    let url = `${API_BASE}/research/persistence?stationId=${stationId}&pollutant=${encodeURIComponent(pollutant)}&days=${days}`;
    if (threshold) url += `&threshold=${threshold}`;
    const res = await fetch(url, { headers: getHeaders() });
    return safeJson(res);
  },

  getAnomalies: async (stationId: number, pollutant: string, days = 7) => {
    const res = await fetch(`${API_BASE}/research/anomalies?stationId=${stationId}&pollutant=${encodeURIComponent(pollutant)}&days=${days}`, { headers: getHeaders() });
    return safeJson(res);
  },

  getCoverageGaps: async () => {
    const res = await fetch(`${API_BASE}/research/coverage-gaps`, { headers: getHeaders() });
    return safeJson(res);
  },

  exportExcelUrl: (stationId: number, pollutant = 'ALL') => {
    return `${API_BASE}/research/export/excel?stationId=${stationId}&pollutant=${pollutant}`;
  },

  generatePdfReport: async (data: { title: string; stationId: number; days: number }) => {
    const res = await fetch(`${API_BASE}/research/report/pdf`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('PDF Generation failed');
    return res.blob();
  },

  getProjects: async () => {
    const res = await fetch(`${API_BASE}/research/projects`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as ResearchProject[];
  },

  saveProject: async (data: Partial<ResearchProject>) => {
    const res = await fetch(`${API_BASE}/research/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return safeJson(res) as Promise<ResearchProject>;
  },

  deleteProject: async (id: number) => {
    const res = await fetch(`${API_BASE}/research/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return safeJson(res);
  },

  // ADMIN
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getHeaders() });
    return safeJson(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as User[];
  },

  createStateAdmin: async (data: { fullName: string; email: string; password: string; stateScope: string }) => {
    const res = await fetch(`${API_BASE}/admin/create-state-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const body = await safeJson(res);
    if (!res.ok) {
      throw new Error(body.error || 'Failed to create State Admin');
    }
    return body;
  },

  createCentralAdmin: async (data: { fullName: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/admin/super/create-central-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const body = await safeJson(res);
    if (!res.ok) {
      throw new Error(body.error || 'Failed to create Central Admin');
    }
    return body;
  },

  getResearcherApplications: async () => {
    const res = await fetch(`${API_BASE}/admin/researcher-applications`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as ResearcherApplication[];
  },

  reviewApplication: async (id: number, approve: boolean, notes: string) => {
    const res = await fetch(`${API_BASE}/admin/researcher-applications/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ approve, notes }),
    });
    return safeJson(res);
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as AuditLog[];
  },

  getDataQualityIssues: async () => {
    const res = await fetch(`${API_BASE}/admin/data-quality`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as DataQualityIssue[];
  },

  resolveQualityIssue: async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/data-quality/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return safeJson(res);
  },

  getDataSources: async () => {
    const res = await fetch(`${API_BASE}/admin/data-sources`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as DataSourceConfig[];
  },

  toggleDataSource: async (id: number, active: boolean) => {
    const res = await fetch(`${API_BASE}/admin/data-sources/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ active }),
    });
    return safeJson(res);
  },

  triggerSync: async () => {
    const res = await fetch(`${API_BASE}/admin/sync/trigger`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Synchronization trigger failed.');
    }
    return data as DataSyncLog;
  },

  getSyncLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/sync/logs`, { headers: getHeaders() });
    const data = await safeJson(res);
    return (Array.isArray(data) ? data : []) as DataSyncLog[];
  },

  // HELP
  getHelpArticles: async (role?: string) => {
    let url = `${API_BASE}/help/articles`;
    if (role && role !== 'ALL') {
      url += `?role=${encodeURIComponent(role)}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok) return [];
    return (Array.isArray(data) ? data : []) as HelpArticle[];
  },

  createHelpArticle: async (article: Partial<HelpArticle>) => {
    const res = await fetch(`${API_BASE}/help/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    return safeJson(res);
  },

  updateHelpArticle: async (id: number, article: Partial<HelpArticle>) => {
    const res = await fetch(`${API_BASE}/help/articles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    return safeJson(res);
  },

  deleteHelpArticle: async (id: number) => {
    const res = await fetch(`${API_BASE}/help/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return safeJson(res);
  },
};
