// Create Company page - where new company managers set up their company profile
// Only appears when a COMPANY user doesn't have a company yet (redirected from dashboard)
// The form collects company name, industry, and optional website
// After creation, the user is redirected back to the company dashboard

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCompanyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark-300">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !industry) {
      setError('Company name and industry are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, website })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create company');
        setLoading(false);
        return;
      }

      router.push('/dashboard/company');
    } catch (err) {
      setError('Failed to create company');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 mb-4">
            <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Company</h1>
          <p className="text-dark-300 mt-2">Welcome, {session?.user?.name}! Let&apos;s set up your company profile.</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your company name"
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-accent-primary transition-colors"
                required
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Website <span className="text-dark-400">(optional)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-primary text-white font-semibold rounded-xl hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
