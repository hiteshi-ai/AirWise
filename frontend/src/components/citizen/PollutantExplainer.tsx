import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Info, AlertTriangle, ShieldAlert } from 'lucide-react';

export const PollutantExplainer: React.FC = () => {
  const [pollutants, setPollutants] = useState<Array<{ code: string; name: string; standard: string; source: string; health: string }>>([]);

  useEffect(() => {
    api.getPollutantsInfo().then(setPollutants).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-theme-border bg-theme-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-theme-primary" />
          <h3 className="text-base font-bold text-theme-text">Understanding Indian Air Pollutants</h3>
        </div>
        <p className="text-xs text-theme-muted leading-relaxed">
          The Central Pollution Control Board (CPCB) evaluates eight key atmospheric parameters under the National Ambient Air Quality Standards (NAAQS).
          Here is what each parameter measures, where it originates, and its health implications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {pollutants.map((p) => (
            <div key={p.code} className="p-4 rounded-xl border border-theme-border bg-theme-bg flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-theme-primary">{p.code}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-theme-card border border-theme-border text-theme-muted">
                    {p.standard}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-theme-text mt-1">{p.name}</h4>
                <div className="mt-2 text-[11px] text-theme-muted">
                  <strong className="text-theme-text">Sources:</strong> {p.source}
                </div>
              </div>

              <div className="pt-2 border-t border-theme-border/60 text-[11px] text-theme-muted">
                <strong className="text-theme-text">Health Impact:</strong> {p.health}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CPCB AQI Categories Guidance Card */}
      <div className="rounded-2xl border border-theme-border bg-theme-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-theme-primary" />
          <h3 className="text-base font-bold text-theme-text">Official Indian AQI Scale & Advisory</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#16a34a] text-white">0–50</span>
            <h5 className="font-bold text-xs text-emerald-950 mt-1">Good</h5>
            <p className="text-[10px] text-emerald-800 mt-1">Minimal impact. Ideal conditions for outdoor activities.</p>
          </div>

          <div className="p-3 rounded-xl border border-lime-200 bg-lime-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#65a30d] text-white">51–100</span>
            <h5 className="font-bold text-xs text-lime-950 mt-1">Satisfactory</h5>
            <p className="text-[10px] text-lime-800 mt-1">Minor breathing discomfort to sensitive people.</p>
          </div>

          <div className="p-3 rounded-xl border border-yellow-200 bg-yellow-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#ca8a04] text-white">101–200</span>
            <h5 className="font-bold text-xs text-yellow-950 mt-1">Moderate</h5>
            <p className="text-[10px] text-yellow-800 mt-1">Breathing discomfort to people with asthma and heart disease.</p>
          </div>

          <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#ea580c] text-white">201–300</span>
            <h5 className="font-bold text-xs text-orange-950 mt-1">Poor</h5>
            <p className="text-[10px] text-orange-800 mt-1">Breathing discomfort to most people on prolonged exposure.</p>
          </div>

          <div className="p-3 rounded-xl border border-red-200 bg-red-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#dc2626] text-white">301–400</span>
            <h5 className="font-bold text-xs text-red-950 mt-1">Very Poor</h5>
            <p className="text-[10px] text-red-800 mt-1">Respiratory illness on prolonged exposure. Limit outdoor exertion.</p>
          </div>

          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#7f1d1d] text-white">401–500</span>
            <h5 className="font-bold text-xs text-rose-950 mt-1">Severe</h5>
            <p className="text-[10px] text-rose-800 mt-1">Affects healthy people and seriously impacts those with existing diseases.</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-theme-bg border border-theme-border flex items-center gap-2 text-xs text-theme-muted">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> General scientific guidance provided above is for educational awareness.
            AIRWISE is an environmental intelligence platform and not a medical or health diagnostic service.
          </span>
        </div>
      </div>
    </div>
  );
};

