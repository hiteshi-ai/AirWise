import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BarChart3, FileSpreadsheet, FileText, Filter, Activity, Compass,
  AlertTriangle, Save, Trash2, Download, Search, CheckCircle2, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MonitoringStation, PollutantObservation, ResearchProject } from '../../types';

export const ResearcherPortal: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [selectedPollutant, setSelectedPollutant] = useState<string>('PM2.5');

  // Sub-modules
  const [activeTab, setActiveTab] = useState<'explorer' | 'fingerprint' | 'persistence' | 'anomalies' | 'gap' | 'builder' | 'projects'>('explorer');

  // Query Data
  const [observations, setObservations] = useState<PollutantObservation[]>([]);
  const [fingerprintData, setFingerprintData] = useState<Record<string, any>>({});
  const [persistenceData, setPersistenceData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<any>(null);

  // Graph Builder
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Saved Projects
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  // Report Modal
  const [reportTitle, setReportTitle] = useState('Air Quality Baseline Assessment');
  const [generatingReport, setGeneratingReport] = useState(false);

  const [loading, setLoading] = useState(false);

  const isAuthorized = isAuthenticated && user && (
    user.role === 'ROLE_RESEARCHER' ||
    user.role === 'ROLE_CENTRAL_ADMIN' ||
    user.role === 'ROLE_SUPER_ADMIN'
  );

  useEffect(() => {
    api.getStations().then((st) => {
      setStations(st);
      if (st.length > 0) setSelectedStationId(st[0].id);
    }).catch(console.error);

    if (isAuthenticated) {
      api.getProjects().then(setProjects).catch(console.error);
    }
  }, [isAuthenticated]);

  // Fetch data based on active tool
  useEffect(() => {
    if (!selectedStationId) return;

    if (activeTab === 'explorer' || activeTab === 'builder') {
      setLoading(true);
      api.queryObservations(selectedStationId, selectedPollutant)
        .then(setObservations)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'fingerprint') {
      setLoading(true);
      api.getFingerprint(selectedStationId, 7)
        .then(setFingerprintData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'persistence') {
      setLoading(true);
      api.getPersistence(selectedStationId, selectedPollutant)
        .then(setPersistenceData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'anomalies') {
      setLoading(true);
      api.getAnomalies(selectedStationId, selectedPollutant)
        .then(setAnomalies)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'gap') {
      setLoading(true);
      api.getCoverageGaps()
        .then(setCoverageGaps)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedStationId, selectedPollutant, activeTab]);

  const handleDownloadExcel = () => {
    const url = api.exportExcelUrl(selectedStationId, selectedPollutant);
    window.open(url, '_blank');
  };

  const handleDownloadCsv = () => {
    if (observations.length === 0) return;
    const headers = ['ID', 'StationId', 'Pollutant', 'Measurement', 'Unit', 'ObservationTime', 'Source', 'QualityFlag'];
    const rows = observations.map((o) => [
      o.id, o.stationId, o.pollutantCode, o.measurement, o.unit, o.observationTime, `"${o.dataSource}"`, o.qualityFlag
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIRWISE_Station_${selectedStationId}_${selectedPollutant}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePdf = async () => {
    try {
      setGeneratingReport(true);
      const blob = await api.generatePdfReport({
        title: reportTitle,
        stationId: selectedStationId,
        days: 7,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AIRWISE_Research_Dossier_Station_${selectedStationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectTitle) return;
    try {
      const config = JSON.stringify({
        stationId: selectedStationId,
        pollutant: selectedPollutant,
        chartType,
      });
      const saved = await api.saveProject({
        title: projectTitle,
        description: projectDesc,
        notes: projectNotes,
        filterConfigJson: config,
      });
      setProjects([saved, ...projects]);
      setProjectTitle('');
      setProjectDesc('');
      setProjectNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const selectedStationObj = stations.find((s) => s.id === selectedStationId);

  // If user is not an approved researcher, display transparent, role-specific guidance
  if (!isAuthorized) {
    // Authenticated but PENDING researcher
    if (isAuthenticated && user?.role === 'ROLE_RESEARCHER' && user?.status === 'PENDING') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Application Under Review</h2>
          <p className="text-sm text-theme-muted max-w-lg mx-auto leading-relaxed">
            Your researcher application has been received and is pending administrator review.
            You will be able to access the Research Portal once an administrator approves your credentials.
          </p>
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-xs text-amber-900 max-w-md mx-auto text-left space-y-1">
            <div className="font-semibold">Application details</div>
            <div>Name: <strong>{user.fullName}</strong></div>
            <div>Email: <strong>{user.email}</strong></div>
            <div>Institution: <strong>{user.institution || '—'}</strong></div>
            <div className="pt-2 text-amber-700">Please check back after an administrator reviews your application.</div>
          </div>
        </div>
      );
    }

    // Authenticated but REJECTED researcher
    if (isAuthenticated && user?.role === 'ROLE_RESEARCHER' && user?.status === 'REJECTED') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Application Not Approved</h2>
          <p className="text-sm text-theme-muted max-w-lg mx-auto leading-relaxed">
            Your researcher access application was not approved. If you believe this is an error,
            please contact the platform administrator.
          </p>
        </div>
      );
    }

    // Authenticated as citizen or admin who navigated here accidentally
    if (isAuthenticated && user) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Researcher Portal</h2>
          <p className="text-sm text-theme-muted max-w-lg mx-auto leading-relaxed">
            This portal is available to approved researchers only. Your current role
            (<strong>{user.role.replace('ROLE_', '')}</strong>) does not include researcher access.
          </p>
          <Link
            to="/citizen"
            className="inline-block px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
          >
            Go to Citizen Portal
          </Link>
        </div>
      );
    }

    // Not logged in — generic guidance
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-theme-text">
          {t('researcher.portalTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted max-w-xl mx-auto leading-relaxed">
          The Researcher Portal provides advanced analytics tools for approved environmental researchers,
          students and institutional analysts.
        </p>

        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card max-w-lg mx-auto text-left space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
            How to Get Access
          </h4>
          <ul className="text-xs text-theme-muted space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
              <span>Submit an application with your institutional affiliation and research purpose.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
              <span>An authorised administrator reviews and approves your credentials.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
              <span>Once approved, log in with your registered email and password to access full analytical tools.</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-theme-border flex items-center justify-between">
            <Link
              to="/apply-researcher"
              className="px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
            >
              Submit Researcher Application &rarr;
            </Link>
            <Link
              to="/login"
              className="text-xs text-theme-muted hover:text-theme-text font-medium"
            >
              Sign In with Approved Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-theme-border gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-theme-primary" />
            <span>{t('researcher.portalTitle')}</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Logged in as <strong>{user?.fullName}</strong> ({user?.institution || 'Authorised Analyst'})
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('researcher.exportExcel')}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-theme-border bg-theme-card hover:bg-theme-primary-light text-theme-text shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-theme-primary" />
            <span>{t('researcher.exportCsv')}</span>
          </button>

          <button
            onClick={handleGeneratePdf}
            disabled={generatingReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-theme-primary hover:bg-theme-primary-hover text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{generatingReport ? 'Generating...' : t('researcher.generateReport')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-theme-card border border-theme-border text-xs font-medium">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'explorer' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.explorer')}
        </button>
        <button
          onClick={() => setActiveTab('fingerprint')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'fingerprint' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.fingerprint')}
        </button>
        <button
          onClick={() => setActiveTab('persistence')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'persistence' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.persistence')}
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'anomalies' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.anomalies')}
        </button>
        <button
          onClick={() => setActiveTab('gap')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'gap' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.gapAnalysis')}
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'builder' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          {t('researcher.graphBuilder')}
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'projects' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          Saved Projects ({projects.length})
        </button>
      </div>

      {/* Global Researcher Filters */}
      {activeTab !== 'gap' && activeTab !== 'projects' && (
        <div className="p-4 rounded-xl border border-theme-border bg-theme-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Target Monitoring Station</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city} - {s.stationName} ({s.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Pollutant Parameter</label>
            <select
              value={selectedPollutant}
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none"
            >
              <option value="PM2.5">PM2.5 (Fine Particulates)</option>
              <option value="PM10">PM10 (Coarse Particulates)</option>
              <option value="NO2">NO2 (Nitrogen Dioxide)</option>
              <option value="SO2">SO2 (Sulphur Dioxide)</option>
              <option value="CO">CO (Carbon Monoxide)</option>
              <option value="O3">O3 (Ozone)</option>
              <option value="NH3">NH3 (Ammonia)</option>
              {activeTab === 'explorer' && <option value="ALL">All Available Pollutants</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Time Range</label>
            <select
              className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none"
              defaultValue="7"
            >
              <option value="7">Last 7 Days (Continuous)</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Data Source Verification</label>
            <div className="text-xs p-2 rounded-lg bg-theme-bg border border-theme-border text-emerald-600 font-semibold truncate">
              CPCB CAAQMS / data.gov.in
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: ADVANCED DATA EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-theme-text">Observation Records Data Explorer</h3>
                <p className="text-xs text-theme-muted">
                  Inspecting authentic time-series records for {selectedStationObj?.stationName}
                </p>
              </div>
              <span className="text-xs font-semibold text-theme-primary bg-theme-primary-light px-2.5 py-1 rounded-md">
                {observations.length} records retrieved
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 border border-theme-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-theme-bg text-theme-muted sticky top-0 border-b border-theme-border">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Timestamp (IST)</th>
                    <th className="p-3">Pollutant</th>
                    <th className="p-3">Measurement</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Sub-Index</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Quality Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {observations.map((obs) => (
                    <tr key={obs.id} className="hover:bg-theme-bg/50 transition-colors">
                      <td className="p-3 font-mono text-theme-muted">{obs.id}</td>
                      <td className="p-3 text-theme-text font-medium">
                        {new Date(obs.observationTime).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-theme-primary">{obs.pollutantCode}</td>
                      <td className="p-3 font-semibold text-theme-text">{obs.measurement}</td>
                      <td className="p-3 text-theme-muted">{obs.unit}</td>
                      <td className="p-3">{obs.subIndex ?? '—'}</td>
                      <td className="p-3 text-theme-muted text-[11px] truncate max-w-[150px]">{obs.dataSource}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {obs.qualityFlag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: POLLUTANT FINGERPRINT */}
      {activeTab === 'fingerprint' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-theme-text">Multi-Pollutant Fingerprint Profile</h3>
            <p className="text-xs text-theme-muted">
              Average concentration profile across all monitored atmospheric parameters at {selectedStationObj?.stationName}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(fingerprintData).map(([param, stats]: [string, any]) => (
              <div key={param} className="p-4 rounded-xl border border-theme-border bg-theme-bg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-theme-primary">{param}</span>
                  <span className="text-xs text-theme-muted">{stats.sampleCount} observations</span>
                </div>
                <div className="text-2xl font-bold text-theme-text">
                  {stats.averageConcentration} <span className="text-xs font-normal text-theme-muted">{param === 'CO' ? 'mg/m³' : 'µg/m³'}</span>
                </div>
                <div className="text-[11px] text-theme-muted flex justify-between pt-1 border-t border-theme-border/60">
                  <span>Min: <strong>{stats.minConcentration}</strong></span>
                  <span>Max: <strong>{stats.maxConcentration}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 3: PERSISTENCE ANALYSIS */}
      {activeTab === 'persistence' && persistenceData && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-theme-text">Pollution Persistence Analysis</h3>
            <p className="text-xs text-theme-muted">
              Calculates how frequently actual observations exceed standard CPCB NAAQS limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-theme-bg border border-theme-border text-center space-y-2">
              <span className="text-xs font-semibold text-theme-muted">Exceedance Persistence</span>
              <div className="text-4xl font-extrabold text-theme-primary">
                {persistenceData.persistencePercentage}%
              </div>
              <p className="text-xs text-theme-muted">
                of observation periods exceeded the standard threshold.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-theme-bg border border-theme-border space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span>Evaluated Parameter:</span>
                <strong className="text-theme-text">{persistenceData.pollutant}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span>Applied Threshold:</span>
                <strong className="text-theme-text">{persistenceData.thresholdApplied} µg/m³</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span>Standard Type:</span>
                <span className="font-semibold text-emerald-600">Official CPCB 24-hr NAAQS</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Samples Checked:</span>
                <strong>{persistenceData.totalObservations}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-primary-light/30 text-xs text-theme-muted leading-relaxed">
              <div className="font-bold text-theme-text mb-1">Methodology Note</div>
              Persistence calculates duration and frequency of elevated exposure. Sustained persistence above standard limits indicates continuous environmental pressure rather than brief transient spikes.
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: ANOMALIES & SPIKE DETECTION */}
      {activeTab === 'anomalies' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-theme-text">Statistical Spike & Anomaly Detection</h3>
              <p className="text-xs text-theme-muted">
                Identifies observations deviating significantly from station statistical mean (Z-Score &ge; 2.2).
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {anomalies.length} Potential Events Flagged
            </span>
          </div>

          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((anom, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-950">
                        {new Date(anom.observationTime).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Z-Score: {anom.zScore}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1">
                      Observed: <strong>{anom.measurement} {anom.unit}</strong> (Station Mean: {anom.mean} {anom.unit})
                    </p>
                  </div>
                  <div className="text-[11px] text-amber-700 italic">
                    {anom.confidenceLabel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-theme-muted">
              No statistical anomalies or acute spikes detected within the selected timeframe.
            </div>
          )}
        </div>
      )}

      {/* MODULE 5: COVERAGE GAP ANALYSIS */}
      {activeTab === 'gap' && coverageGaps && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-theme-text">National Monitoring Coverage Gap Analysis</h3>
            <p className="text-xs text-theme-muted">
              Audit of reporting stations, reporting latency, and areas without published continuous monitoring.
              <strong> AIRWISE never interprets missing data as clean air.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-theme-border bg-theme-bg">
              <span className="text-xs text-theme-muted">Active Reporting</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {coverageGaps.activeReportingStations}
              </div>
              <p className="text-[11px] text-theme-muted mt-1">Updated within past 24 hours</p>
            </div>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-bg">
              <span className="text-xs text-theme-muted">Delayed Reporting</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {coverageGaps.delayedReportingStations}
              </div>
              <p className="text-[11px] text-theme-muted mt-1">Transmission interval delayed</p>
            </div>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-bg">
              <span className="text-xs text-theme-muted">No Published Coverage</span>
              <div className="text-3xl font-extrabold text-rose-600 mt-1">
                {coverageGaps.uncoveredStations}
              </div>
              <p className="text-[11px] text-theme-muted mt-1">Awaiting continuous telemetry</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: INTERACTIVE GRAPH BUILDER */}
      {activeTab === 'builder' && (
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-theme-text">Interactive Research Graph Builder</h3>
              <p className="text-xs text-theme-muted">
                Construct customised scientific visualizations of official observations.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg border border-theme-border bg-theme-bg text-xs">
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded ${chartType === 'line' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted'}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded ${chartType === 'bar' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted'}`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded ${chartType === 'area' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted'}`}
              >
                Area
              </button>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={observations.map((o) => ({
                  time: new Date(o.observationTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
                  val: o.measurement,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '0.75rem' }} />
                  <Line type="monotone" dataKey="val" stroke="var(--color-primary)" strokeWidth={2} name={`${selectedPollutant} Concentration`} />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={observations.map((o) => ({
                  time: new Date(o.observationTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
                  val: o.measurement,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '0.75rem' }} />
                  <Bar dataKey="val" fill="var(--color-primary)" name={`${selectedPollutant} Concentration`} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={observations.map((o) => ({
                  time: new Date(o.observationTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
                  val: o.measurement,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '0.75rem' }} />
                  <Area type="monotone" dataKey="val" stroke="var(--color-primary)" fill="var(--color-primary-light)" fillOpacity={0.6} name={`${selectedPollutant} Concentration`} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MODULE 7: SAVED RESEARCH PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <h3 className="text-base font-bold text-theme-text">Create New Saved Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Winter Particulate Trends in North India"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Description / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Diurnal inversion patterns across CAAQMS stations"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1">Field Notes</label>
              <textarea
                rows={3}
                placeholder="Methodology notes, citations, hypotheses..."
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveProject}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Research Analysis</span>
            </button>
          </div>

          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <h3 className="text-base font-bold text-theme-text">Your Saved Projects</h3>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-theme-text">{p.title}</h4>
                      <button
                        onClick={() => api.deleteProject(p.id).then(() => setProjects(projects.filter((x) => x.id !== p.id)))}
                        className="text-theme-muted hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-theme-muted">{p.description}</p>
                    {p.notes && <p className="text-[11px] italic text-theme-muted bg-theme-card p-2 rounded-lg">{p.notes}</p>}
                    <div className="text-[10px] text-theme-muted pt-2 border-t border-theme-border/60">
                      Saved on: {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-theme-muted">
                No saved research projects yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

