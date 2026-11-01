import {
  User, MonitoringStation, OfficialAqiRecord, PollutantObservation,
  NationalOverview, WatchlistItem, AlertSubscription, ResearchProject,
  ResearcherApplication, HelpArticle, AuditLog, DataQualityIssue,
  DataSourceConfig, DataSyncLog, ThemeType, LanguageType
} from '../types';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('airwise_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Safely parse a fetch Response as JSON. Throws a readable Error on empty or non-JSON bodies. */
const safeJson = async (res: Response): Promise<any> => {
  const text = await res.text();
  if (!text || text.trim() === '') return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned unexpected content (HTTP ${res.status}): ${text.substring(0, 120)}`);
  }
};

export const api = {
  // AUTH
  getSetupStatus: async () => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/setup-status`);
    } catch {
      throw new Error('Could not reach the AIRWISE backend. Please ensure it is running on port 8080.');
    }
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(`Backend returned an empty response (HTTP ${res.status}). Please check the backend logs.`);
    }
    try {
      return JSON.parse(text) as { superAdminConfigured: boolean; platformName: string };
    } catch {
      throw new Error(`Backend returned an unexpected response (HTTP ${res.status}). Expected JSON but received: ${text.substring(0, 120)}`);
    }
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
      throw new Error('Could not reach the AIRWISE backend. Please ensure it is running on port 8080.');
    }
    const text = await res.text();
    let body: any = {};
    if (text && text.trim() !== '') {
      try {
        body = JSON.parse(text);
      } catch {
        if (!res.ok) {
          throw new Error(`Server error (HTTP ${res.status}): ${text.substring(0, 200)}`);
        }
      }
    }
    if (!res.ok) {
      throw new Error(body.error || `Setup failed with status ${res.status}.`);
    }
    return body;
  },
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body.error || 'Login failed');
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
    return res.json() as Promise<NationalOverview>;
  },
  getStations: async () => {
    const res = await fetch(`${API_BASE}/public/stations`);
    return res.json() as Promise<MonitoringStation[]>;
  },
  getStates: async () => {
    const res = await fetch(`${API_BASE}/public/states`);
    return res.json() as Promise<string[]>;
  },
  getCities: async (state?: string) => {
    const url = state ? `${API_BASE}/public/cities?state=${encodeURIComponent(state)}` : `${API_BASE}/public/cities`;
    const res = await fetch(url);
    return res.json() as Promise<string[]>;
  },
  getStationDetails: async (id: number) => {
    const res = await fetch(`${API_BASE}/public/station/${id}`);
    if (!res.ok) throw new Error('Station not found');
    return res.json() as Promise<{
      station: MonitoringStation;
      aqiRecord: OfficialAqiRecord | null;
      pollutants: PollutantObservation[];
      lastUpdated: string | null;
    }>;
  },
  getHistoricalAqi: async (id: number, hours = 168) => {
    const res = await fetch(`${API_BASE}/public/station/${id}/history/aqi?hours=${hours}`);
    return res.json() as Promise<OfficialAqiRecord[]>;
  },
  getHistoricalPollutant: async (id: number, pollutant: string, hours = 168) => {
    const res = await fetch(`${API_BASE}/public/station/${id}/history/pollutant?pollutant=${encodeURIComponent(pollutant)}&hours=${hours}`);
    return res.json() as Promise<PollutantObservation[]>;
  },
  getPollutantsInfo: async () => {
    const res = await fetch(`${API_BASE}/public/pollutants/info`);
    return res.json() as Promise<Array<{ code: string; name: string; standard: string; source: string; health: string }>>;
  },

  // CITIZEN
  getWatchlist: async () => {
    const res = await fetch(`${API_BASE}/citizen/watchlist`, { headers: getHeaders() });
    return res.json() as Promise<WatchlistItem[]>;
  },
  addToWatchlist: async (stationId: number) => {
    const res = await fetch(`${API_BASE}/citizen/watchlist/${stationId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json() as Promise<WatchlistItem>;
  },
  removeFromWatchlist: async (stationId: number) => {
    const res = await fetch(`${API_BASE}/citizen/watchlist/${stationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },
  getAlerts: async () => {
    const res = await fetch(`${API_BASE}/citizen/alerts`, { headers: getHeaders() });
    return res.json() as Promise<AlertSubscription[]>;
  },
  createAlert: async (data: Partial<AlertSubscription>) => {
    const res = await fetch(`${API_BASE}/citizen/alerts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<AlertSubscription>;
  },
  deleteAlert: async (alertId: number) => {
    const res = await fetch(`${API_BASE}/citizen/alerts/${alertId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // RESEARCHER
  queryObservations: async (stationId: number, pollutant = 'ALL', start?: string, end?: string) => {
    let url = `${API_BASE}/research/query?stationId=${stationId}&pollutant=${pollutant}`;
    if (start) url += `&start=${start}`;
    if (end) url += `&end=${end}`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json() as Promise<PollutantObservation[]>;
  },
  getFingerprint: async (stationId: number, days = 7) => {
    const res = await fetch(`${API_BASE}/research/fingerprint/${stationId}?days=${days}`, { headers: getHeaders() });
    return res.json();
  },
  getPersistence: async (stationId: number, pollutant: string, threshold?: number, days = 7) => {
    let url = `${API_BASE}/research/persistence?stationId=${stationId}&pollutant=${encodeURIComponent(pollutant)}&days=${days}`;
    if (threshold) url += `&threshold=${threshold}`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },
  getAnomalies: async (stationId: number, pollutant: string, days = 7) => {
    const res = await fetch(`${API_BASE}/research/anomalies?stationId=${stationId}&pollutant=${encodeURIComponent(pollutant)}&days=${days}`, { headers: getHeaders() });
    return res.json();
  },
  getCoverageGaps: async () => {
    const res = await fetch(`${API_BASE}/research/coverage-gaps`, { headers: getHeaders() });
    return res.json();
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
    return res.json() as Promise<ResearchProject[]>;
  },
  saveProject: async (data: Partial<ResearchProject>) => {
    const res = await fetch(`${API_BASE}/research/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ResearchProject>;
  },
  deleteProject: async (id: number) => {
    const res = await fetch(`${API_BASE}/research/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // ADMIN
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getHeaders() });
    return res.json();
  },
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
    return res.json() as Promise<User[]>;
  },
  createStateAdmin: async (data: { fullName: string; email: string; password: string; stateScope: string }) => {
    const res = await fetch(`${API_BASE}/admin/create-state-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create State Admin');
    }
    return res.json();
  },
  createCentralAdmin: async (data: { fullName: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/admin/super/create-central-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create Central Admin');
    }
    return res.json();
  },
  getResearcherApplications: async () => {
    const res = await fetch(`${API_BASE}/admin/researcher-applications`, { headers: getHeaders() });
    return res.json() as Promise<ResearcherApplication[]>;
  },
  reviewApplication: async (id: number, approve: boolean, notes: string) => {
    const res = await fetch(`${API_BASE}/admin/researcher-applications/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ approve, notes }),
    });
    return res.json();
  },
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() });
    return res.json() as Promise<AuditLog[]>;
  },
  getDataQualityIssues: async () => {
    const res = await fetch(`${API_BASE}/admin/data-quality`, { headers: getHeaders() });
    return res.json() as Promise<DataQualityIssue[]>;
  },
  resolveQualityIssue: async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/data-quality/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },
  getDataSources: async () => {
    const res = await fetch(`${API_BASE}/admin/data-sources`, { headers: getHeaders() });
    return res.json() as Promise<DataSourceConfig[]>;
  },
  toggleDataSource: async (id: number, active: boolean) => {
    const res = await fetch(`${API_BASE}/admin/data-sources/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ active }),
    });
    return res.json();
  },
  triggerSync: async () => {
    const res = await fetch(`${API_BASE}/admin/sync/trigger`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json() as Promise<DataSyncLog>;
  },
  getSyncLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/sync/logs`, { headers: getHeaders() });
    return res.json() as Promise<DataSyncLog[]>;
  },

  // HELP
  getHelpArticles: async (role?: string) => {
    const url = role ? `${API_BASE}/help/articles?role=${role}` : `${API_BASE}/help/articles`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json() as Promise<HelpArticle[]>;
  },
  createHelpArticle: async (article: Partial<HelpArticle>) => {
    const res = await fetch(`${API_BASE}/help/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    return res.json();
  },
  updateHelpArticle: async (id: number, article: Partial<HelpArticle>) => {
    const res = await fetch(`${API_BASE}/help/articles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    return res.json();
  },
  deleteHelpArticle: async (id: number) => {
    const res = await fetch(`${API_BASE}/help/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },
};

