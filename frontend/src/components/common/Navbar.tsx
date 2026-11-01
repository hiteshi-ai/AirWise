import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wind, Shield, BookOpen, BarChart3, Users, LogIn, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout, isSuperAdminConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Wind },
    { to: '/citizen', label: t('nav.explore'), icon: Users },
    { to: '/researcher', label: t('nav.research'), icon: BarChart3 },
    { to: '/admin', label: t('nav.admin'), icon: Shield },
    { to: '/help', label: t('nav.help'), icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-theme-border bg-theme-card/90 backdrop-blur-md transition-colors">
      {!isSuperAdminConfigured && (
        <div className="bg-amber-500 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 mx-auto">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Platform Initial Setup: Super Admin account has not yet been configured.</span>
            <Link to="/setup-super-admin" className="underline font-bold hover:text-amber-100 ml-2">
              Run One-Time Setup Now &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-theme-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-theme-text flex items-center gap-1.5">
                <span>AIRWISE</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-theme-primary-light text-theme-primary">
                  IND-AQI
                </span>
              </div>
              <p className="text-[10px] text-theme-muted hidden sm:block font-medium -mt-1">
                India Air Quality Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-theme-primary text-white font-semibold shadow-xs'
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-primary-light'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeSelector />
            <LanguageToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-theme-border">
                <div className="text-right">
                  <div className="text-xs font-semibold text-theme-text truncate max-w-[120px]">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-theme-primary uppercase font-bold tracking-wider">
                    {user.role.replace('ROLE_', '')}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-theme-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-theme-border">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-theme-primary hover:bg-theme-primary-light rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold bg-theme-primary hover:bg-theme-primary-hover text-white rounded-lg shadow-xs transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-primary-light"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-theme-border bg-theme-card px-4 pt-3 pb-5 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-theme-border">
            <span className="text-xs font-semibold text-theme-muted">Theme & Display</span>
            <ThemeSelector />
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-theme-primary text-white font-semibold'
                    : 'text-theme-text hover:bg-theme-primary-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-theme-border">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-theme-text">{user.fullName}</div>
                  <div className="text-xs text-theme-muted">{user.email} · {user.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium border border-theme-border rounded-lg text-theme-text hover:bg-theme-primary-light"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-semibold bg-theme-primary text-white rounded-lg"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

