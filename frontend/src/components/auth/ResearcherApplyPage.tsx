import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ResearcherApplyPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [researchField, setResearchField] = useState('Atmospheric Modeling');
  const [justification, setJustification] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.registerResearcher({
        fullName,
        email,
        password,
        institution,
        researchField,
        justification,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-theme-text">Application Submitted Successfully</h2>
        <p className="text-xs text-theme-muted leading-relaxed">
          Your credentials and justification have been recorded. A platform administrator will review your affiliation before activating your research capabilities.
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover shadow-xs"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-theme-text">Apply for Researcher Access</h2>
          <p className="text-xs text-theme-muted">
            For environmental researchers, students, and institutional analysts
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
              placeholder="e.g. Prof. Rajiv Nair"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Institutional Email Address</label>
            <input
              type="email"
              required
              placeholder="rajiv@iitb.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1">Institution / University</label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Delhi / TERI"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1">Research Field</label>
              <select
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none"
              >
                <option value="Atmospheric Modeling">Atmospheric Modeling</option>
                <option value="Environmental Epidemiology">Environmental Epidemiology</option>
                <option value="Urban Air Quality">Urban Air Quality</option>
                <option value="Policy & Standards">Policy & Standards</option>
                <option value="Aerosol Chemistry">Aerosol Chemistry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1">
              Research Justification & Purpose
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain how you will use official CAAQMS data and your research objectives..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full text-xs rounded-xl border border-theme-border bg-theme-bg p-2.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Submitting Application...' : 'Submit Application for Admin Review'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-theme-border text-center text-xs text-theme-muted">
          Already approved?{' '}
          <Link to="/login" className="font-semibold text-theme-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

