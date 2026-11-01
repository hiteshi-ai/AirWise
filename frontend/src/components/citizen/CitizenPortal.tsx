import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Star, Bell, Clock, RefreshCw, BarChart2, Layers, AlertCircle, Info, Check, Trash2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';
import { MonitoringStation, OfficialAqiRecord, PollutantObservation, WatchlistItem, AlertSubscription } from '../../types';
import { AqiBadge, getAqiColor } from '../common/AqiBadge';
import { IndiaAirMap } from './IndiaAirMap';
import { CityComparison } from './CityComparison';
import { PollutantExplainer } from './PollutantExplainer';
import { useAuth } from '../../context/AuthContext';

export const CitizenPortal: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);

  const [stationPollutants, setStationPollutants] = useState<PollutantObservation[]>([]);
  const [historicalAqi, setHistoricalAqi] = useState<OfficialAqiRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'details' | 'compare' | 'explainer' | 'watchlist'>('map');

  // Watchlist & Alerts
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<AlertSubscription[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertCategory, setAlertCategory] = useState('Poor');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);

    const [stationsRes, statesRes, citiesRes] = await Promise.allSettled([
      api.getStations(),
      api.getStates(),
      api.getCities(),
    ]);

    let loadedStations: MonitoringStation[] = [];
    if (stationsRes.status === 'fulfilled' && Array.isArray(stationsRes.value)) {
      loadedStations = stationsRes.value;
      setStations(loadedStations);
      if (loadedStations.length > 0) {
        setSelectedStation(loadedStations[0]);
      }
    }

    if (statesRes.status === 'fulfilled' && Array.isArray(statesRes.value) && statesRes.value.length > 0) {
      setStates(statesRes.value);
    } else if (loadedStations.length > 0) {
      const uniqueStates = Array.from(new Set(loadedStations.map((s) => s.state))).sort();
      setStates(uniqueStates);
    }

    if (citiesRes.status === 'fulfilled' && Array.isArray(citiesRes.value) && citiesRes.value.length > 0) {
      setCities(citiesRes.value);
    } else if (loadedStations.length > 0) {
      const uniqueCities = Array.from(new Set(loadedStations.map((s) => s.city))).sort();
      setCities(uniqueCities);
    }

    if (loadedStations.length === 0) {
      setLoadError('Connecting to live telemetry. The cloud backend may be initializing from cold start.');
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Filter cities when state changes
  useEffect(() => {
    if (selectedState) {
      api.getCities(selectedState)
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setCities(res);
          } else {
            const fallbackCities = Array.from(
              new Set(stations.filter((s) => s.state.toLowerCase() === selectedState.toLowerCase()).map((s) => s.city))
            ).sort();
            setCities(fallbackCities);
          }
        })
        .catch(() => {
          const fallbackCities = Array.from(
            new Set(stations.filter((s) => s.state.toLowerCase() === selectedState.toLowerCase()).map((s) => s.city))
          ).sort();
          setCities(fallbackCities);
        });
    } else {
      api.getCities()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setCities(res);
          } else {
            setCities(Array.from(new Set(stations.map((s) => s.city))).sort());
          }
        })
        .catch(() => {
          setCities(Array.from(new Set(stations.map((s) => s.city))).sort());
        });
    }
  }, [selectedState, stations]);

  // Load details & history when station changes
  useEffect(() => {
    if (selectedStation) {
      api.getStationDetails(selectedStation.id).then((res) => {
        setStationPollutants(res.pollutants);
      }).catch(console.error);

      api.getHistoricalAqi(selectedStation.id, 168).then((res) => {
        setHistoricalAqi(res);
      }).catch(console.error);
    }
  }, [selectedStation]);

  // Load user watchlist & alerts if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getWatchlist().then(setWatchlist).catch(console.error);
      api.getAlerts().then(setAlerts).catch(console.error);
    }
  }, [isAuthenticated]);

  const filteredStations = stations.filter((s) => {
    if (selectedState && s.state.toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedCity && s.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    return true;
  });

  const isStationInWatchlist = selectedStation && watchlist.some((w) => w.stationId === selectedStation.id);

  const toggleWatchlist = async () => {
    if (!isAuthenticated || !selectedStation) return;
    try {
      if (isStationInWatchlist) {
        await api.removeFromWatchlist(selectedStation.id);
        setWatchlist(watchlist.filter((w) => w.stationId !== selectedStation.id));
      } else {
        const item = await api.addToWatchlist(selectedStation.id);
        setWatchlist([item, ...watchlist]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedStation) return;
    try {
      const aqiMap: Record<string, number> = {
        Moderate: 101,
        Poor: 201,
        'Very Poor': 301,
        Severe: 401,
      };
      const newAlert = await api.createAlert({
        stationId: selectedStation.id,
        cityName: selectedStation.city,
        thresholdCategory: alertCategory,
        thresholdAqiValue: aqiMap[alertCategory] || 201,
        active: true,
      });
      setAlerts([newAlert, ...alerts]);
      setIsAlertModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formattedChartData = historicalAqi.map((r) => ({
    time: new Date(r.observationTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
    aqi: r.aqiValue,
    category: r.aqiCategory,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-theme-border gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text flex items-center gap-2">
            <span>{t('citizen.dashboardTitle')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Official Feeds
            </span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            {t('citizen.selectStationPrompt')}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-theme-card border border-theme-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'map' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            {t('citizen.mapView')}
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'details' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            {t('citizen.detailView')}
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'compare' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            {t('citizen.comparisonView')}
          </button>
          <button
            onClick={() => setActiveTab('explainer')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'explainer' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            Pollutants & AQI Scale
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'watchlist' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Watchlist ({watchlist.length})
            </button>
          )}
        </div>
      </div>

      {/* Cold start recovery banner */}
      {loadError && stations.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Global State & City Filters */}
      <div className="p-4 rounded-xl border border-theme-border bg-theme-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1">State / UT</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('');
            }}
            className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          >
            <option value="">{t('citizen.filterState')}</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          >
            <option value="">{t('citizen.filterCity')}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1">Station</label>
          <select
            value={selectedStation?.id || ''}
            onChange={(e) => {
              const found = stations.find((s) => s.id === Number(e.target.value));
              if (found) setSelectedStation(found);
            }}
            className="w-full text-xs rounded-lg border border-theme-border bg-theme-bg p-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary font-medium"
          >
            {filteredStations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.city} - {st.stationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE MAP */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <IndiaAirMap
            stations={filteredStations}
            selectedStationId={selectedStation?.id}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setActiveTab('details');
            }}
          />

          {/* Quick Station Bar */}
          {selectedStation && (
            <div className="p-4 rounded-xl border border-theme-border bg-theme-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary">
                  Selected Station
                </span>
                <h4 className="text-sm font-bold text-theme-text">{selectedStation.stationName}</h4>
                <p className="text-xs text-theme-muted">{selectedStation.city}, {selectedStation.state} · Code: {selectedStation.stationCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <AqiBadge value={selectedStation.aqiValue} category={selectedStation.aqiCategory} size="lg" />
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-theme-primary text-white hover:bg-theme-primary-hover transition-colors"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATION DETAILS */}
      {activeTab === 'details' && selectedStation && (
        <div className="space-y-6">
          {/* Hero Station Card */}
          <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-theme-primary-light text-theme-primary mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedStation.city}, {selectedStation.state}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
                  {selectedStation.stationName}
                </h2>
                <p className="text-xs text-theme-muted mt-1">
                  Station Code: <span className="font-mono">{selectedStation.stationCode}</span> · Agency: {selectedStation.agency} · Type: Continuous CAAQMS
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <>
                    <button
                      onClick={toggleWatchlist}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        isStationInWatchlist
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-theme-border bg-theme-bg text-theme-text hover:bg-theme-primary-light'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isStationInWatchlist ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{isStationInWatchlist ? t('citizen.removeFromWatchlist') : t('citizen.addToWatchlist')}</span>
                    </button>

                    <button
                      onClick={() => setIsAlertModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-theme-border bg-theme-bg text-theme-text hover:bg-theme-primary-light transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-theme-primary" />
                      <span>{t('citizen.createAlert')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* AQI Big Display */}
            <div className="mt-6 p-6 rounded-xl bg-theme-bg/60 border border-theme-border grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div>
                <span className="text-xs text-theme-muted font-medium">Official CPCB IND-AQI</span>
                <div className="text-5xl font-extrabold text-theme-text mt-1">
                  {selectedStation.aqiValue ?? '—'}
                </div>
                <div className="mt-2">
                  <AqiBadge value={selectedStation.aqiValue} category={selectedStation.aqiCategory} size="md" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-theme-muted">
                  <span className="font-semibold text-theme-text">Prominent Pollutant:</span>{' '}
                  {selectedStation.prominentPollutant ? (
                    <strong className="text-theme-primary px-1.5 py-0.5 rounded bg-theme-card border border-theme-border">
                      {selectedStation.prominentPollutant}
                    </strong>
                  ) : (
                    'N/A'
                  )}
                </div>
                <div className="text-theme-muted">
                  <span className="font-semibold text-theme-text">Freshness:</span>{' '}
                  <span className="text-emerald-600 font-semibold">Continuous Live Feed</span>
                </div>
                <div className="text-theme-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-theme-primary" />
                  <span>
                    Observation: {selectedStation.observationTime ? new Date(selectedStation.observationTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-theme-card border border-theme-border text-[11px] text-theme-muted leading-relaxed">
                <div className="font-bold text-theme-text mb-0.5">Advisory Notice</div>
                Follow general outdoor precaution guidelines when AQI exceeds Moderate (100).
                Sensitive groups with cardiopulmonary conditions should minimize strenuous exertion.
              </div>
            </div>
          </div>

          {/* Monitored Pollutant Cards */}
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-theme-text">
                {t('citizen.pollutantBreakdown')}
              </h3>
              <span className="text-xs text-theme-muted font-medium">
                Standard Units: µg/m³ (CO in mg/m³)
              </span>
            </div>

            {stationPollutants.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stationPollutants.map((obs) => (
                  <div key={obs.id} className="p-3.5 rounded-xl border border-theme-border bg-theme-bg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-theme-primary">{obs.pollutantCode}</span>
                      <span className="text-[10px] text-theme-muted font-medium">{obs.unit}</span>
                    </div>
                    <div className="text-2xl font-bold text-theme-text mt-1.5">
                      {obs.measurement}
                    </div>
                    <div className="mt-1 text-[10px] text-theme-muted">
                      Sub-Index:{' '}
                      <strong className="text-theme-text">{obs.subIndex ?? '—'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-theme-muted">
                No active pollutant sensor observations reported for this station currently.
              </div>
            )}
          </div>

          {/* Historical Trend Chart (Recharts) */}
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-theme-text">
                  {t('citizen.historicalTrends')}
                </h3>
                <p className="text-xs text-theme-muted">
                  Official historical observations reported at 4-hour intervals.
                </p>
              </div>
              <div className="text-xs font-semibold text-theme-primary bg-theme-primary-light px-2.5 py-1 rounded-md">
                IND-AQI Scale
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} domain={[0, 450]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aqiGrad)"
                    name="Official AQI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CITY COMPARISON */}
      {activeTab === 'compare' && (
        <CityComparison stations={stations} />
      )}

      {/* TAB 4: POLLUTANTS & AQI EXPLAINER */}
      {activeTab === 'explainer' && (
        <PollutantExplainer />
      )}

      {/* TAB 5: WATCHLIST & ALERTS */}
      {activeTab === 'watchlist' && isAuthenticated && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <h3 className="text-base font-bold text-theme-text">{t('citizen.watchlistTitle')}</h3>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-theme-text">{item.stationName}</h4>
                      <p className="text-xs text-theme-muted">{item.cityName}</p>
                    </div>
                    <button
                      onClick={() => api.removeFromWatchlist(item.stationId).then(() => setWatchlist(watchlist.filter((w) => w.id !== item.id)))}
                      className="p-1.5 text-theme-muted hover:text-red-500 rounded-lg hover:bg-red-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-theme-muted">
                Your watchlist is empty. Click &ldquo;Add to Watchlist&rdquo; on any monitoring station.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
            <h3 className="text-base font-bold text-theme-text">{t('citizen.alertsTitle')}</h3>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alt) => (
                  <div key={alt.id} className="p-4 rounded-xl border border-theme-border bg-theme-bg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-theme-text">
                        Alert if AQI exceeds: <span className="font-bold text-theme-primary">{alt.thresholdCategory} ({alt.thresholdAqiValue}+)</span>
                      </div>
                      <p className="text-[11px] text-theme-muted">Location: {alt.cityName || 'Any configured station'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-1.5 text-theme-muted hover:text-red-500 rounded-lg hover:bg-red-50"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-theme-muted">
                No active threshold alerts configured yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Configuration Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-theme-card border border-theme-border p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-theme-primary" />
              <h3 className="text-base font-bold text-theme-text">Configure Air Pollution Alert</h3>
            </div>
            <p className="text-xs text-theme-muted">
              Receive alert notifications when observations at <strong>{selectedStation?.stationName}</strong> exceed your chosen threshold.
            </p>

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1">
                Threshold Category
              </label>
              <select
                value={alertCategory}
                onChange={(e) => setAlertCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
              >
                <option value="Moderate">Moderate (AQI &gt; 100)</option>
                <option value="Poor">Poor (AQI &gt; 200)</option>
                <option value="Very Poor">Very Poor (AQI &gt; 300)</option>
                <option value="Severe">Severe (AQI &gt; 400)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-border">
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-theme-muted hover:text-theme-text rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 text-xs font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-xs"
              >
                Save Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

