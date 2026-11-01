export type Role = 'ROLE_CITIZEN' | 'ROLE_RESEARCHER' | 'ROLE_STATE_ADMIN' | 'ROLE_CENTRAL_ADMIN' | 'ROLE_SUPER_ADMIN';

export type ThemeType = 'lavender' | 'skyblue' | 'mint' | 'peach' | 'neutral';
export type LanguageType = 'en' | 'hi';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  stateScope?: string;
  status: string;
  institution?: string;
  researchField?: string;
  preferredTheme?: ThemeType;
  preferredLanguage?: LanguageType;
}

export interface MonitoringStation {
  id: number;
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  agency?: string;
  status: string;
  lastReportedAt?: string;
  aqiValue?: number | null;
  aqiCategory?: string;
  prominentPollutant?: string | null;
  observationTime?: string | null;
}

export interface PollutantObservation {
  id: number;
  stationId: number;
  pollutantCode: string;
  measurement: number;
  unit: string;
  observationTime: string;
  retrievalTime: string;
  dataSource: string;
  qualityFlag: string;
  subIndex?: number;
}

export interface OfficialAqiRecord {
  id: number;
  stationId: number;
  aqiValue: number | null;
  aqiCategory: string;
  prominentPollutant: string | null;
  observationTime: string;
  retrievalTime: string;
  officialCpcb: boolean;
  methodology: string;
}

export interface NationalOverview {
  totalStationsConfigured: number;
  reportingStations: number;
  statesCount: number;
  reportingStates: string[];
  lastSuccessfulUpdate: string | null;
  totalOfficialAqiReadings: number;
  categoryDistribution: {
    Good: number;
    Satisfactory: number;
    Moderate: number;
    Poor: number;
    'Very Poor': number;
    Severe: number;
  };
}

export interface WatchlistItem {
  id: number;
  userId: number;
  stationId: number;
  cityName: string;
  stationName: string;
  addedAt: string;
}

export interface AlertSubscription {
  id: number;
  userId: number;
  stationId?: number;
  cityName?: string;
  thresholdCategory: string;
  thresholdAqiValue?: number;
  pollutantCode?: string;
  pollutantThreshold?: number;
  active: boolean;
  createdAt: string;
}

export interface ResearchProject {
  id: number;
  userId: number;
  title: string;
  description: string;
  filterConfigJson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearcherApplication {
  id: number;
  userId: number;
  applicantName: string;
  email: string;
  institution: string;
  researchField: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByUserId?: number;
  reviewerEmail?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  appliedAt: string;
}

export interface HelpArticle {
  id: number;
  targetRole: string;
  category: string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  sortOrder: number;
  faq: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: number;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityName: string;
  entityId: number;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DataQualityIssue {
  id: number;
  stationId: number;
  pollutantCode?: string;
  issueType: string;
  severity: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
}

export interface DataSourceConfig {
  id: number;
  sourceCode: string;
  sourceName: string;
  endpointUrl: string;
  apiKeyRequired: boolean;
  active: boolean;
  updateIntervalMinutes: number;
  lastSuccessfulSync?: string;
  lastSyncStatus: string;
  termsAndAttribution: string;
}

export interface DataSyncLog {
  id: number;
  dataSourceCode: string;
  syncStartTime: string;
  syncEndTime?: string;
  status: string;
  recordsRetrieved: number;
  recordsStored: number;
  details: string;
  triggeredBy: string;
}

