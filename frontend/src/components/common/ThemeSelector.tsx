import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeType } from '../../types';

export const ThemeSelector: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const themes: Array<{ id: ThemeType; labelKey: string; color: string; border: string }> = [
    { id: 'lavender', labelKey: 'themes.lavender', color: '#7C5CFC', border: '#E8E2F5' },
    { id: 'skyblue', labelKey: 'themes.skyblue', color: '#258BF5', border: '#DDEBF8' },
    { id: 'mint', labelKey: 'themes.mint', color: '#109A5E', border: '#D8F2E3' },
    { id: 'peach', labelKey: 'themes.peach', color: '#E8683B', border: '#FCE6DA' },
    { id: 'neutral', labelKey: 'themes.neutral', color: '#4B5563', border: '#E5E7EB' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-theme-border bg-theme-card hover:bg-theme-primary-light transition-colors text-theme-text"
        title={t('nav.selectTheme')}
      >
        <Palette className="w-3.5 h-3.5 text-theme-primary" />
        <span className="hidden sm:inline">{t('nav.selectTheme')}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 py-1.5 bg-theme-card border border-theme-border rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-xs font-semibold text-theme-muted uppercase tracking-wider">
            {t('nav.selectTheme')}
          </div>
          {themes.map((th) => (
            <button
              key={th.id}
              onClick={() => {
                setTheme(th.id);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-theme-primary-light ${
                theme === th.id ? 'font-semibold text-theme-primary' : 'text-theme-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: th.color, border: `1px solid ${th.border}` }}
                />
                <span>{t(th.labelKey)}</span>
              </div>
              {theme === th.id && <Check className="w-3.5 h-3.5 text-theme-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

