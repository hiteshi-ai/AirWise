import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const InitialSuperAdminSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isSuperAdminConfigured, checkSuperAdminStatus } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alreadyConfigured, setAlreadyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSetupStatus()
      .then((res) => {
        if (res.superAdminConfigured) {
          setAlreadyConfigured(true);
        }
      })
      .catch((err: any) => {
        // Backend is not reachable — show the form and display the error
        // so the user knows to start the backend before submitting.
        setError(
          err.message ||
          'Could not reach the AIRWISE backend. Please start the backend (mvn spring-boot:run) and refresh this page.'
        );
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Admin password must be at least 8 characters for security.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.setupSuperAdmin({ fullName, email, password });
      login(res.token, {
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        status: res.status,
      });
      await checkSuperAdminStatus();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please check parameters.');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyConfigured) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-theme-text">Initial Setup Already Completed</h2>
        <p className="text-xs text-theme-muted leading-relaxed">
          The initial Super Admin account for AIRWISE has already been provisioned. This setup endpoint is permanently disabled for platform security.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Initial Super Admin Provisioning</h2>
          <p className="text-xs text-theme-muted">
            One-time secure initialization for the AIRWISE platform owner
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
          <strong>Security Notice:</strong> AIRWISE enforces zero hardcoded credentials. You must provide your own name, administrative email, and strong password. This setup form is permanently disabled immediately upon creation.
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Super Admin Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Platform Engineer"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Administrator Email</label>
            <input
              type="email"
              required
              placeholder="superadmin@airwise.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Master Password (min 8 characters)</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Confirm Master Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-purple-700 hover:bg-purple-800 text-white transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Initializing Super Admin...' : 'Establish Super Admin Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

