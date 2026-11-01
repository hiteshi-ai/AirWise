import React, { useState } from 'react';
import { MonitoringStation } from '../../types';
import { AqiBadge } from '../common/AqiBadge';
import { ArrowLeftRight, Clock, AlertCircle } from 'lucide-react';

interface CityComparisonProps {
  stations: MonitoringStation[];
}

export const CityComparison: React.FC<CityComparisonProps> = ({ stations }) => {
  const [station1Id, setStation1Id] = useState<number>(stations[0]?.id || 1);
  const [station2Id, setStation2Id] = useState<number>(stations[1]?.id || (stations[0]?.id || 2));

  const station1 = stations.find((s) => s.id === Number(station1Id));
  const station2 = stations.find((s) => s.id === Number(station2Id));

  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-theme-border">
        <ArrowLeftRight className="w-5 h-5 text-theme-primary" />
        <div>
          <h3 className="text-base font-bold text-theme-text">City & Station Comparison</h3>
          <p className="text-xs text-theme-muted">
            Compare official continuous air-quality readings across monitoring locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector 1 */}
        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1">
            First Station
          </label>
          <select
            value={station1Id}
            onChange={(e) => setStation1Id(Number(e.target.value))}
            className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          >
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.city} - {st.stationName} ({st.state})
              </option>
            ))}
          </select>
        </div>

        {/* Selector 2 */}
        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1">
            Second Station
          </label>
          <select
            value={station2Id}
            onChange={(e) => setStation2Id(Number(e.target.value))}
            className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          >
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.city} - {st.stationName} ({st.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        {station1 && (
          <div className="rounded-xl border border-theme-border bg-theme-bg/60 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary">
                {station1.city}, {station1.state}
              </span>
              <h4 className="text-base font-bold text-theme-text mt-0.5">{station1.stationName}</h4>
              <p className="text-[11px] text-theme-muted">Code: {station1.stationCode} · Agency: {station1.agency}</p>
            </div>

            <div className="p-4 rounded-xl bg-theme-card border border-theme-border flex items-center justify-between">
              <div>
                <div className="text-xs text-theme-muted font-medium">Official AQI</div>
                <div className="text-3xl font-extrabold text-theme-text mt-0.5">
                  {station1.aqiValue ?? '—'}
                </div>
              </div>
              <AqiBadge value={station1.aqiValue} category={station1.aqiCategory} size="lg" />
            </div>

            <div className="space-y-1.5 text-xs text-theme-muted">
              <div className="flex justify-between py-1 border-b border-theme-border/60">
                <span>Prominent Pollutant</span>
                <span className="font-semibold text-theme-text">{station1.prominentPollutant || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border/60">
                <span>Station Status</span>
                <span className="font-semibold text-emerald-600">{station1.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-theme-primary" />
                  <span>Observation Time</span>
                </span>
                <span className="font-medium text-theme-text">
                  {station1.observationTime ? new Date(station1.observationTime).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2 */}
        {station2 && (
          <div className="rounded-xl border border-theme-border bg-theme-bg/60 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary">
                {station2.city}, {station2.state}
              </span>
              <h4 className="text-base font-bold text-theme-text mt-0.5">{station2.stationName}</h4>
              <p className="text-[11px] text-theme-muted">Code: {station2.stationCode} · Agency: {station2.agency}</p>
            </div>

            <div className="p-4 rounded-xl bg-theme-card border border-theme-border flex items-center justify-between">
              <div>
                <div className="text-xs text-theme-muted font-medium">Official AQI</div>
                <div className="text-3xl font-extrabold text-theme-text mt-0.5">
                  {station2.aqiValue ?? '—'}
                </div>
              </div>
              <AqiBadge value={station2.aqiValue} category={station2.aqiCategory} size="lg" />
            </div>

            <div className="space-y-1.5 text-xs text-theme-muted">
              <div className="flex justify-between py-1 border-b border-theme-border/60">
                <span>Prominent Pollutant</span>
                <span className="font-semibold text-theme-text">{station2.prominentPollutant || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border/60">
                <span>Station Status</span>
                <span className="font-semibold text-emerald-600">{station2.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-theme-primary" />
                  <span>Observation Time</span>
                </span>
                <span className="font-medium text-theme-text">
                  {station2.observationTime ? new Date(station2.observationTime).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-theme-primary-light/40 border border-theme-border flex items-start gap-2 text-xs text-theme-muted">
        <AlertCircle className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
        <span>
          Note on comparability: Differences in local micro-climate, monitoring elevation, and reporting timestamps
          should be considered when directly comparing city AQI figures.
        </span>
      </div>
    </div>
  );
};

