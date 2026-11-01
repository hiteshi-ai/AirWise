import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wind, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-theme-border bg-theme-card transition-colors text-theme-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-theme-primary flex items-center justify-center text-white">
                <Wind className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-theme-text tracking-tight">AIRWISE</span>
            </div>
            <p className="text-xs leading-relaxed text-theme-muted">
              {t('footer.aboutText')}
            </p>
            <div className="text-[11px] font-semibold text-theme-primary">
              Understand Pollution · Discover Patterns · Make Informed Decisions
            </div>
          </div>

          {/* Official Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
              <span>{t('footer.sourcesTitle')}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://app.cpcbccr.com/AQIIndia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-primary flex items-center gap-1 transition-colors"
                >
                  <span>CPCB All India AQI Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://airquality.cpcb.gov.in/AQI_India/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-primary flex items-center gap-1 transition-colors"
                >
                  <span>CPCB CAAQMS Protocol</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.data.gov.in/catalog/real-time-air-quality-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-primary flex items-center gap-1 transition-colors"
                >
                  <span>Open Government Data (OGD)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/citizen" className="hover:text-theme-primary transition-colors">
                  Citizen / Public Portal
                </Link>
              </li>
              <li>
                <Link to="/researcher" className="hover:text-theme-primary transition-colors">
                  Researcher & Analyst Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-theme-primary transition-colors">
                  Hierarchical Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-theme-primary flex items-center gap-1 transition-colors">
                  <HelpCircle className="w-3 h-3" />
                  <span>{t('nav.help')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution & Legal Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
              {t('footer.limitationsTitle')}
            </h4>
            <p className="text-[11px] leading-relaxed text-theme-muted">
              {t('footer.limitationsText')}
            </p>
            <div className="text-[11px] text-theme-muted pt-2 border-t border-theme-border/60">
              Disclaimer: AIRWISE is an independent non-governmental environmental research platform.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between text-xs text-theme-muted gap-4">
          <div>
            &copy; {new Date().getFullYear()} AIRWISE. {t('footer.rights')}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/help" className="hover:text-theme-primary transition-colors">
              {t('footer.privacy')}
            </Link>
            <span>·</span>
            <Link to="/help" className="hover:text-theme-primary transition-colors">
              {t('footer.terms')}
            </Link>
            <span>·</span>
            <Link to="/help" className="hover:text-theme-primary transition-colors">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

