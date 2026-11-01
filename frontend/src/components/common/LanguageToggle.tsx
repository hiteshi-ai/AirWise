import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-theme-border bg-theme-card p-0.5 text-xs font-medium">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          language === 'en'
            ? 'bg-theme-primary text-white font-semibold shadow-xs'
            : 'text-theme-muted hover:text-theme-text'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-md transition-all font-devanagari ${
          language === 'hi'
            ? 'bg-theme-primary text-white font-semibold shadow-xs'
            : 'text-theme-muted hover:text-theme-text'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};

