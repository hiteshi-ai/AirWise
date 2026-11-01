import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wind, Users, BarChart3, ShieldCheck, ArrowRight, Activity, MapPin,
  Clock, Database, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { NationalOverview } from '../../types';
import { AqiBadge } from '../common/AqiBadge';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<NationalOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    api.getOverview()
      .then((data) => setOverview(data))
      .catch((err) => console.error('Error fetching overview:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Soft decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-theme-primary/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-theme-border bg-theme-card text-xs font-semibold text-theme-primary mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India Air Quality Intelligence Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-theme-text max-w-4xl mx-auto leading-tight">
          {t('hero.title')}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-theme-muted max-w-2xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/citizen"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <span>{t('hero.exploreCta')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/researcher"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-primary-light text-theme-text text-sm font-semibold transition-all shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-theme-primary" />
            <span>{t('hero.researchCta')}</span>
          </Link>
        </div>

        <p className="mt-4 text-[11px] text-theme-muted max-w-xl mx-auto italic">
          {t('hero.disclaimer')}
        </p>
      </section>

      {/* National Overview Section (Real data from backend, no fake numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-theme-border bg-theme-card p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-theme-border gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-theme-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-theme-text">
                  {t('overview.title')}
                </h2>
              </div>
              <p className="text-xs text-theme-muted mt-1">
                {t('overview.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-theme-muted bg-theme-bg px-3 py-1.5 rounded-lg border border-theme-border self-start md:self-auto">
              <Clock className="w-3.5 h-3.5 text-theme-primary" />
              <span>
                {t('overview.lastSync')}:{' '}
                <strong className="text-theme-text">
                  {overview?.lastSuccessfulUpdate
                    ? new Date(overview.lastSuccessfulUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
                    : 'Awaiting sync'}
                </strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-theme-muted animate-pulse">
              Retrieving verified observation records from official Indian CAAQMS stations...
            </div>
          ) : overview ? (
            <div className="pt-6 space-y-6">
              {/* Key Counts Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border">
                  <div className="flex items-center gap-2 text-theme-muted text-xs">
                    <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                    <span>{t('overview.reportingStations')}</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-text mt-1">
                    {overview.reportingStations}
                    <span className="text-xs font-normal text-theme-muted ml-1.5">
                      / {overview.totalStationsConfigured} Total
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border">
                  <div className="flex items-center gap-2 text-theme-muted text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
                    <span>{t('overview.statesCovered')}</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-text mt-1">
                    {overview.statesCount}
                    <span className="text-xs font-normal text-theme-muted ml-1.5">Jurisdictions</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border">
                  <div className="flex items-center gap-2 text-theme-muted text-xs">
                    <Database className="w-3.5 h-3.5 text-theme-primary" />
                    <span>{t('overview.officialRecords')}</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-text mt-1">
                    {overview.totalOfficialAqiReadings}
                    <span className="text-xs font-normal text-theme-muted ml-1.5">Valid IND-AQI</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border">
                  <div className="flex items-center gap-2 text-theme-muted text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Data Standard</span>
                  </div>
                  <div className="text-base font-bold text-theme-text mt-1">
                    CPCB IND-AQI
                    <div className="text-[10px] font-normal text-theme-muted">
                      MoEFCC Guidelines
                    </div>
                  </div>
                </div>
              </div>

              {/* AQI Breakdown Pills */}
              <div>
                <h4 className="text-xs font-semibold text-theme-text mb-3">
                  {t('overview.distributionTitle')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {Object.entries(overview.categoryDistribution).map(([cat, count]) => (
                    <div
                      key={cat}
                      className="p-3 rounded-xl border border-theme-border bg-theme-bg flex items-center justify-between"
                    >
                      <AqiBadge category={cat} size="sm" showCategory={false} />
                      <div className="text-right">
                        <div className="text-xs font-semibold text-theme-text">{cat}</div>
                        <div className="text-xs text-theme-muted font-bold">{count} stations</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-theme-muted pt-2 border-t border-theme-border/60">
                <AlertCircle className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
                <span>{t('overview.noFakeDataNote')}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-theme-muted space-y-3">
              <p>Monitoring telemetry connecting. If the cloud backend was suspended for inactivity, it takes 30 seconds to wake up.</p>
              <button
                onClick={fetchOverview}
                className="px-4 py-2 rounded-xl bg-theme-primary text-white text-xs font-semibold shadow-xs hover:bg-theme-primary-hover transition-colors"
              >
                Retry Telemetry
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Three Audience Portals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-theme-text">
            {t('audiences.title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-theme-muted">
            {t('audiences.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citizen */}
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-theme-text">
                {t('audiences.citizensTitle')}
              </h3>
              <p className="text-xs leading-relaxed text-theme-muted">
                {t('audiences.citizensDesc')}
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-theme-border">
              <Link
                to="/citizen"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-hover transition-colors"
              >
                <span>{t('audiences.citizensBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Researcher */}
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-theme-text">
                {t('audiences.researchersTitle')}
              </h3>
              <p className="text-xs leading-relaxed text-theme-muted">
                {t('audiences.researchersDesc')}
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-theme-border">
              <Link
                to="/researcher"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-hover transition-colors"
              >
                <span>{t('audiences.researchersBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Admin */}
          <div className="rounded-2xl border border-theme-border bg-theme-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-theme-text">
                {t('audiences.adminsTitle')}
              </h3>
              <p className="text-xs leading-relaxed text-theme-muted">
                {t('audiences.adminsDesc')}
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-theme-border">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-hover transition-colors"
              >
                <span>{t('audiences.adminsBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Official Data Pipeline Info Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-theme-border bg-gradient-to-r from-theme-card to-theme-primary-light/40 p-6 sm:p-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary bg-theme-card px-2.5 py-1 rounded-md border border-theme-border shadow-xs">
              Scientific Integrity & Official Protocol
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-theme-text">
              Direct Ingestion from Official Government Sources
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              AIRWISE is programmed to strictly adhere to CPCB National Air Quality Index calculation rules.
              Sub-indices are computed using the official 2014/2015 piecewise linear breakpoints. An overall AQI
              is only reported when at least 3 parameters are active, including at least one particulate matter
              (PM2.5 or PM10). When parameters are unavailable, AIRWISE states &ldquo;Insufficient Data&rdquo; rather than fabricating numbers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

