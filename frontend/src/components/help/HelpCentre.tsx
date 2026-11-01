import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, Users, BarChart3, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HelpArticle } from '../../types';

export const HelpCentre: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CITIZEN' | 'RESEARCHER' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    api.getHelpArticles('ALL').then(setArticles).catch(console.error);
  }, []);

  const filteredArticles = articles.filter((art) => {
    if (activeTab !== 'ALL' && art.targetRole !== activeTab && art.targetRole !== 'GENERAL') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (language === 'hi' ? art.titleHi : art.titleEn).toLowerCase();
      const content = (language === 'hi' ? art.contentHi : art.contentEn).toLowerCase();
      return title.includes(q) || content.includes(q);
    }
    return true;
  });

  const faqs = filteredArticles.filter((a) => a.faq);
  const guides = filteredArticles.filter((a) => !a.faq);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-theme-border bg-theme-card text-xs font-semibold text-theme-primary shadow-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge & Guidance Base</span>
        </div>
        <h1 className="text-3xl font-bold text-theme-text">{t('help.title')}</h1>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          {t('help.subtitle')}
        </p>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('help.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl border border-theme-border bg-theme-card pl-10 pr-4 py-3 text-theme-text shadow-xs focus:outline-none focus:ring-1 focus:ring-theme-primary placeholder:text-theme-muted"
          />
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-theme-card border border-theme-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'ALL' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            All Guides
          </button>
          <button
            onClick={() => setActiveTab('CITIZEN')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'CITIZEN' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('help.citizenTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('RESEARCHER')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'RESEARCHER' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('help.researcherTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ADMIN' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('help.adminTab')}</span>
          </button>
        </div>
      </div>

      {/* Main Guides Accordion */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-theme-muted">
          Step-by-Step Instructions & Documentation
        </h3>

        {guides.length > 0 ? (
          <div className="space-y-3">
            {guides.map((art) => {
              const isExpanded = expandedId === art.id;
              const title = language === 'hi' ? art.titleHi : art.titleEn;
              const content = language === 'hi' ? art.contentHi : art.contentEn;

              return (
                <div
                  key={art.id}
                  className="rounded-2xl border border-theme-border bg-theme-card transition-shadow hover:shadow-xs"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : art.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-theme-primary-light text-theme-primary">
                        {art.targetRole}
                      </span>
                      <h4 className="text-sm font-bold text-theme-text">{title}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-theme-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-theme-muted" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 text-xs text-theme-muted leading-relaxed border-t border-theme-border/60 pt-4">
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-theme-muted bg-theme-card rounded-2xl border border-theme-border">
            No documentation matching your criteria.
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      {faqs.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-theme-border">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-theme-primary" />
            <h3 className="text-base font-bold text-theme-text">{t('help.faqsTitle')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-5 rounded-2xl border border-theme-border bg-theme-card space-y-2">
                <h5 className="text-xs font-bold text-theme-text">
                  {language === 'hi' ? faq.titleHi : faq.titleEn}
                </h5>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {language === 'hi' ? faq.contentHi : faq.contentEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

