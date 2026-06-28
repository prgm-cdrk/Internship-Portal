// Companies Management page - only accessible by OWNER role
// Displays all registered companies with name, industry, plan, status, and manager
// Owners can filter companies by subscription plan (ALL, FREE, BASIC, PRO)

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CompaniesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading') return;
    if (session?.user?.role !== 'OWNER') {
      router.push('/login');
      return;
    }
    fetchCompanies();
  }, [status, session, router]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/owner/companies');
      const data = await response.json();
      if (response.ok) {
        setCompanies(data.companies);
      } else {
        setError('Failed to load companies');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load companies');
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-300">Loading...</p>
      </div>
    );
  }

  const filteredCompanies =
    filterPlan === 'ALL'
      ? companies
      : companies.filter((c) => c.subscription?.plan === filterPlan);

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard/owner')} className="text-dark-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Companies Management</h1>
          <p className="text-dark-300 mt-1">View and manage all registered companies</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'FREE', 'BASIC', 'PRO'].map((plan) => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterPlan === plan
                  ? 'bg-accent-primary text-white'
                  : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500'
              }`}
            >
              {plan}
            </button>
          ))}
        </div>

        {/* Companies count */}
        <p className="text-dark-400 text-sm mb-4">
          Showing {filteredCompanies.length} companies
        </p>

        {/* Companies table */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Company</th>
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Industry</th>
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Plan</th>
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Manager</th>
                <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-dark-400">
                    No companies found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-4 text-white font-medium">{company.name}</td>
                    <td className="px-5 py-4 text-dark-300">{company.industry}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        company.subscription?.plan === 'FREE'
                          ? 'bg-dark-700 text-dark-300 border border-dark-600'
                          : company.subscription?.plan === 'BASIC'
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                          : 'bg-success/20 text-success border border-success/30'
                      }`}>
                        {company.subscription?.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        company.subscription?.status === 'ACTIVE'
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {company.subscription?.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-300">{company.user?.name}</td>
                    <td className="px-5 py-4 text-dark-400 text-sm">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
