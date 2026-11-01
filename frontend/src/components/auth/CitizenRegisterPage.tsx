import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wind, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CitizenRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerCitizen({ fullName, email, password });
      login(res.token, {
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        status: res.status,
      });
      navigate('/citizen');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
          <h2 className="text-xl font-bold text-theme-text">Create Citizen Account</h2>
          <p className="text-xs text-theme-muted">
            Track air quality in your city, save watchlists, and configure alerts
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
            <label className="block text-xs font-semibold text-theme-text mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="ananya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-theme-border text-center text-xs text-theme-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-theme-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

