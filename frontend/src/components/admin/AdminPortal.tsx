import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Shield, Users, CheckCircle2, XCircle, RefreshCw, AlertTriangle,
  Database, FileText, Settings, Key, MapPin, Eye, Play, Lock, Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User, ResearcherApplication, AuditLog, DataQualityIssue,
  DataSourceConfig, DataSyncLog, MonitoringStation
} from '../../types';

export const AdminPortal: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);

  // Users & Applications
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<ResearcherApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [qualityIssues, setQualityIssues] = useState<DataQualityIssue[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
  const [syncLogs, setSyncLogs] = useState<DataSyncLog[]>([]);
  const [stations, setStations] = useState<MonitoringStation[]>([]);

  // State Admin creation form
  const [newStateAdminName, setNewStateAdminName] = useState('');
  const [newStateAdminEmail, setNewStateAdminEmail] = useState('');
  const [newStateAdminPassword, setNewStateAdminPassword] = useState('');
  const [newStateAdminState, setNewStateAdminState] = useState('Delhi');

  // Central Admin creation form (Super Admin only)
  const [newCentralAdminName, setNewCentralAdminName] = useState('');
  const [newCentralAdminEmail, setNewCentralAdminEmail] = useState('');
  const [newCentralAdminPassword, setNewCentralAdminPassword] = useState('');

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = isAuthenticated && user && (
    user.role === 'ROLE_SUPER_ADMIN' ||
    user.role === 'ROLE_CENTRAL_ADMIN' ||
    user.role === 'ROLE_STATE_ADMIN'
  );

  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN';
  const isStateAdmin = user?.role === 'ROLE_STATE_ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
    }
  }, [isAdmin]);

  const loadOverview = async () => {
    try {
      const data = await api.getAdminOverview();
      setOverviewData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = () => api.getUsers().then(setUsers).catch(console.error);
  const loadApplications = () => api.getResearcherApplications().then(setApplications).catch(console.error);
  const loadAuditLogs = () => api.getAuditLogs().then(setAuditLogs).catch(console.error);
  const loadQualityIssues = () => api.getDataQualityIssues().then(setQualityIssues).catch(console.error);
  const loadDataSources = () => api.getDataSources().then(setDataSources).catch(console.error);
  const loadSyncLogs = () => api.getSyncLogs().then(setSyncLogs).catch(console.error);
  const loadStations = () => api.getStations().then(setStations).catch(console.error);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeSection === 'users') loadUsers();
    if (activeSection === 'applications') loadApplications();
    if (activeSection === 'audit') loadAuditLogs();
    if (activeSection === 'quality') loadQualityIssues();
    if (activeSection === 'sources') loadDataSources();
    if (activeSection === 'sync') loadSyncLogs();
    if (activeSection === 'stations') loadStations();
  }, [activeSection, isAdmin]);

  const handleReviewApplication = async (id: number, approve: boolean) => {
    try {
      await api.reviewApplication(id, approve, approve ? 'Approved after verification' : 'Rejected');
      setMessage(`Application ${approve ? 'approved' : 'rejected'} successfully.`);
      loadApplications();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateStateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStateAdmin({
        fullName: newStateAdminName,
        email: newStateAdminEmail,
        password: newStateAdminPassword,
        stateScope: newStateAdminState,
      });
      setMessage(`State Admin for ${newStateAdminState} created successfully.`);
      setNewStateAdminName('');
      setNewStateAdminEmail('');
      setNewStateAdminPassword('');
      loadUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateCentralAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCentralAdmin({
        fullName: newCentralAdminName,
        email: newCentralAdminEmail,
        password: newCentralAdminPassword,
      });
      setMessage('Central Admin account created successfully.');
      setNewCentralAdminName('');
      setNewCentralAdminEmail('');
      setNewCentralAdminPassword('');
      loadUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await api.triggerSync();
      setMessage(`Manual data sync completed: ${res.recordsStored} observations ingested.`);
      loadOverview();
      loadSyncLogs();
    } catch (err: any) {
      setMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleResolveQualityIssue = async (id: number) => {
    try {
      await api.resolveQualityIssue(id);
      loadQualityIssues();
      setMessage('Data quality issue marked as resolved.');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-theme-text">Administrator Access Required</h2>
        <p className="text-xs text-theme-muted max-w-sm mx-auto leading-relaxed">
          Access to the AIRWISE Administrative Portal is strictly restricted to authorised
          Central, State, and Super Administrators.
        </p>
        {!isAuthenticated && (
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign In as Administrator
            </Link>
          </div>
        )}
        {isAuthenticated && user && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            You are logged in as <strong>{user.role.replace('ROLE_', '')}</strong>.
            This role does not have administrative access.
          </div>
        )}
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: t('admin.overview'), icon: Shield },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'applications', label: t('admin.applications'), icon: CheckCircle2 },
    { id: 'stateAdmin', label: t('admin.stateAdmin'), icon: MapPin },
    { id: 'stations', label: t('admin.stations'), icon: Database },
    { id: 'sources', label: t('admin.sources'), icon: Database },
    { id: 'sync', label: t('admin.sync'), icon: RefreshCw },
    { id: 'quality', label: t('admin.quality'), icon: AlertTriangle },
    { id: 'audit', label: t('admin.audit'), icon: FileText },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-theme-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-theme-primary text-white">
              {user?.role.replace('ROLE_', '')}
            </span>
            {isStateAdmin && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Scope: {user?.stateScope}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-theme-text mt-1">
            {t('admin.portalTitle')}
          </h1>
          <p className="text-xs text-theme-muted">
            Hierarchical Governance · Logged in as <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{syncing ? 'Synchronizing...' : t('admin.triggerSync')}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-emerald-900">&times;</button>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-theme-card border border-theme-border text-xs font-medium">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const active = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION: OVERVIEW */}
      {activeSection === 'overview' && overviewData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-theme-border bg-theme-card">
              <span className="text-xs text-theme-muted">Registered Users</span>
              <div className="text-2xl font-bold text-theme-text mt-1">{overviewData.totalUsers}</div>
            </div>
            <div className="p-4 rounded-xl border border-theme-border bg-theme-card">
              <span className="text-xs text-theme-muted">Pending Applications</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{overviewData.pendingResearcherApplications}</div>
            </div>
            <div className="p-4 rounded-xl border border-theme-border bg-theme-card">
              <span className="text-xs text-theme-muted">Monitored Stations</span>
              <div className="text-2xl font-bold text-theme-text mt-1">{overviewData.totalStations}</div>
            </div>
            <div className="p-4 rounded-xl border border-theme-border bg-theme-card">
              <span className="text-xs text-theme-muted">Active Quality Issues</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{overviewData.activeQualityIssues}</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-theme-border bg-theme-card space-y-3">
            <h3 className="text-base font-bold text-theme-text">Governance and State Scope Notice</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              In accordance with platform governance inspired by Indian environmental architecture,
              <strong> State Administrators</strong> have their visibility and actions strictly isolated to their assigned State/UT jurisdiction.
              <strong> Central Administrators</strong> and <strong>Super Administrators</strong> maintain nationwide oversight across all 30+ CAAQMS telemetry streams.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: USER MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">User Accounts</h3>
          <div className="overflow-x-auto max-h-96 border border-theme-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-bg text-theme-muted sticky top-0 border-b border-theme-border">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">State Scope</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Institution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-theme-bg/50">
                    <td className="p-3 font-mono">{u.id}</td>
                    <td className="p-3 font-bold text-theme-text">{u.fullName}</td>
                    <td className="p-3 text-theme-muted">{u.email}</td>
                    <td className="p-3 font-semibold text-theme-primary">{u.role.replace('ROLE_', '')}</td>
                    <td className="p-3">{u.stateScope || 'National'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-theme-muted text-[11px]">{u.institution || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: RESEARCHER APPROVAL */}
      {activeSection === 'applications' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">Researcher Access Applications</h3>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-theme-text">{app.applicantName}</h4>
                      <span className="text-xs text-theme-muted">({app.email})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-theme-muted">
                      <strong>Institution:</strong> {app.institution} · <strong>Discipline:</strong> {app.researchField}
                    </div>
                    <p className="text-xs text-theme-text italic bg-theme-card p-2 rounded-lg border border-theme-border/60">
                      &ldquo;{app.justification}&rdquo;
                    </p>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReviewApplication(app.id, true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReviewApplication(app.id, false)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-theme-muted">
              No researcher applications on file.
            </div>
          )}
        </div>
      )}

      {/* SECTION: STATE ADMIN & CREATION */}
      {activeSection === 'stateAdmin' && (
        <div className="space-y-6">
          {(isSuperAdmin || user?.role === 'ROLE_CENTRAL_ADMIN') && (
            <form onSubmit={handleCreateStateAdmin} className="p-6 rounded-2xl border border-theme-border bg-theme-card space-y-4">
              <h3 className="text-base font-bold text-theme-text">Create Authorized State Administrator</h3>
              <p className="text-xs text-theme-muted">
                Assign administrative authority scoped exclusively to a specific Indian State or Union Territory.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={newStateAdminName}
                    onChange={(e) => setNewStateAdminName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="stateadmin.delhi@airwise.in"
                    value={newStateAdminEmail}
                    onChange={(e) => setNewStateAdminEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Secure password"
                    value={newStateAdminPassword}
                    onChange={(e) => setNewStateAdminPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Assigned State Jurisdiction</label>
                  <select
                    value={newStateAdminState}
                    onChange={(e) => setNewStateAdminState(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
              >
                Create State Admin Account
              </button>
            </form>
          )}

          {isSuperAdmin && (
            <form onSubmit={handleCreateCentralAdmin} className="p-6 rounded-2xl border border-theme-border bg-theme-card space-y-4">
              <h3 className="text-base font-bold text-theme-text">Create Central Administrator (Super Admin Privilege)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="National Administrator Name"
                    value={newCentralAdminName}
                    onChange={(e) => setNewCentralAdminName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="central.admin@airwise.in"
                    value={newCentralAdminEmail}
                    onChange={(e) => setNewCentralAdminEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Secure password"
                    value={newCentralAdminPassword}
                    onChange={(e) => setNewCentralAdminPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 shadow-xs"
              >
                Create Central Admin Account
              </button>
            </form>
          )}
        </div>
      )}

      {/* SECTION: MONITORING STATIONS */}
      {activeSection === 'stations' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">Continuous CAAQMS Monitoring Network</h3>
          <div className="overflow-x-auto max-h-96 border border-theme-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-bg text-theme-muted sticky top-0 border-b border-theme-border">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Station Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Agency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {stations.map((s) => (
                  <tr key={s.id} className="hover:bg-theme-bg/50">
                    <td className="p-3 font-mono font-bold text-theme-primary">{s.stationCode}</td>
                    <td className="p-3 font-semibold text-theme-text">{s.stationName}</td>
                    <td className="p-3">{s.city}</td>
                    <td className="p-3">{s.state}</td>
                    <td className="p-3 text-theme-muted">{s.agency}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-theme-muted text-[11px]">
                      {s.lastReportedAt ? new Date(s.lastReportedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: DATA SOURCES */}
      {activeSection === 'sources' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">Official Data Sources Configuration</h3>
          <div className="space-y-4">
            {dataSources.map((ds) => (
              <div key={ds.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-theme-primary">{ds.sourceCode}</span>
                    <h4 className="text-sm font-bold text-theme-text">{ds.sourceName}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ds.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ds.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="text-xs text-theme-muted font-mono truncate">{ds.endpointUrl}</div>
                <p className="text-[11px] text-theme-muted italic">{ds.termsAndAttribution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SYNC MONITOR */}
      {activeSection === 'sync' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-theme-text">Synchronization Audit Logs</h3>
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-theme-primary text-white"
            >
              Trigger Immediate Polling
            </button>
          </div>

          <div className="overflow-x-auto max-h-96 border border-theme-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-bg text-theme-muted sticky top-0 border-b border-theme-border">
                <tr>
                  <th className="p-3">Source</th>
                  <th className="p-3">Start Time (IST)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Retrieved</th>
                  <th className="p-3">Stored</th>
                  <th className="p-3">Triggered By</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-theme-bg/50">
                    <td className="p-3 font-mono font-bold text-theme-primary">{log.dataSourceCode}</td>
                    <td className="p-3 font-medium text-theme-text">
                      {new Date(log.syncStartTime).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">{log.recordsRetrieved}</td>
                    <td className="p-3 font-bold">{log.recordsStored}</td>
                    <td className="p-3 text-theme-muted text-[11px]">{log.triggeredBy}</td>
                    <td className="p-3 text-theme-muted text-[11px] truncate max-w-[200px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: DATA QUALITY */}
      {activeSection === 'quality' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">Data Quality and Integrity Issues</h3>
          {qualityIssues.length > 0 ? (
            <div className="space-y-3">
              {qualityIssues.map((issue) => (
                <div key={issue.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-theme-text">{issue.issueType}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {issue.severity}
                      </span>
                      {issue.resolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-muted mt-1">{issue.description}</p>
                  </div>
                  {!issue.resolved && (
                    <button
                      onClick={() => handleResolveQualityIssue(issue.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-theme-muted">
              No outstanding data quality flags recorded.
            </div>
          )}
        </div>
      )}

      {/* SECTION: AUDIT LOGS */}
      {activeSection === 'audit' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">Platform Audit Trail</h3>
          <div className="overflow-x-auto max-h-96 border border-theme-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-bg text-theme-muted sticky top-0 border-b border-theme-border">
                <tr>
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-theme-bg/50">
                    <td className="p-3 text-theme-muted font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-theme-text">{log.actorEmail}</td>
                    <td className="p-3 text-theme-primary">{log.actorRole.replace('ROLE_', '')}</td>
                    <td className="p-3 font-bold text-theme-text">{log.action}</td>
                    <td className="p-3">{log.entityName} #{log.entityId}</td>
                    <td className="p-3 text-theme-muted text-[11px] truncate max-w-[250px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: SETTINGS */}
      {activeSection === 'settings' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <h3 className="text-base font-bold text-theme-text">{t('admin.settings')}</h3>
          <div className="space-y-3 text-xs text-theme-muted">
            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-between">
              <div>
                <div className="font-bold text-theme-text">Initial Super Admin Provisioning</div>
                <div>Status: <span className="font-semibold text-emerald-600">Configured and Permanently Locked</span></div>
              </div>
              <Check className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-between">
              <div>
                <div className="font-bold text-theme-text">Password Hashing Standard</div>
                <div>BCrypt with 10 salt rounds applied on all credentials</div>
              </div>
              <Key className="w-5 h-5 text-theme-primary" />
            </div>

            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-between">
              <div>
                <div className="font-bold text-theme-text">JWT Cryptographic Algorithm</div>
                <div>HMAC-SHA256 (HS256) with 24-hour token expiration</div>
              </div>
              <Lock className="w-5 h-5 text-theme-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

