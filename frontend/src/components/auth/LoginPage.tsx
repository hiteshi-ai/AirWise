import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wind, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      login(res.token, {
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        stateScope: res.stateScope,
        status: res.status,
      });

      if (res.preferredTheme) setTheme(res.preferredTheme);
      if (res.preferredLanguage) setLanguage(res.preferredLanguage);

      if (res.role === 'ROLE_SUPER_ADMIN' || res.role === 'ROLE_CENTRAL_ADMIN' || res.role === 'ROLE_STATE_ADMIN') {
        navigate('/admin');
      } else if (res.role === 'ROLE_RESEARCHER') {
        navigate('/researcher');
      } else {
        navigate('/citizen');
      }
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('pending')) {
        setError('Your researcher application is still under review. You will be able to log in once an administrator approves your credentials.');
      } else if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('inactive')) {
        setError('Your account is not active. Please contact the platform administrator.');
      } else {
        setError(msg || 'Login failed. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-theme-primary flex items-center justify-center text-white mx-auto shadow-xs">
            <Wind className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Sign In to AIRWISE</h2>
          <p className="text-xs text-theme-muted">
            Access Citizen dashboard, Researcher analytics, or Administration portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg pl-9 pr-3 py-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg pl-9 pr-3 py-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-theme-border space-y-2 text-center text-xs text-theme-muted">
          <div>
            Are you a citizen?{' '}
            <Link to="/register" className="font-semibold text-theme-primary hover:underline">
              Create an account
            </Link>
          </div>
          <div>
            Are you an environmental analyst?{' '}
            <Link to="/apply-researcher" className="font-semibold text-theme-primary hover:underline">
              Apply for research access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

