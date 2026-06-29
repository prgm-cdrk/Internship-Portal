// Subscriptions Management page - only accessible by OWNER role
// Displays all subscriptions with company name, plan, status, and expiration
// Owners can see revenue summary and filter by plan or status

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Subscription = {
  id: number;
  plan: string;
  status: string;
  expiredAt: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
};

type Summary = {
  total: number;
  active: number;
  basic: number;
  pro: number;
  totalRevenue: number;
};

export default function OwnerSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, basic: 0, pro: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading') return;
    if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'STAFF') {
      router.push('/login');
      return;
    }
    fetchSubscriptions();
  }, [status, session, router]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/owner/subscriptions');
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data.subscriptions);
        setSummary(data.summary);
      } else {
        setError('Failed to load subscriptions');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load subscriptions');
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchPlan = filterPlan === 'ALL' || sub.plan === filterPlan;
    const matchStatus = filterStatus === 'ALL' || sub.status === filterStatus;
    return matchPlan && matchStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-300">Loading...</p>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'OWNER' && session.user?.role !== 'STAFF')) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-300">Access denied. Owner only.</p>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Revenue', value: `₱${summary.totalRevenue.toLocaleString()}`, color: 'text-success' },
    { label: 'Active Subscriptions', value: summary.active, color: 'text-accent-primary', sub: `of ${summary.total} total` },
    { label: 'BASIC Plans', value: summary.basic, color: 'text-accent-light', sub: '₱299/month each' },
    { label: 'PRO Plans', value: summary.pro, color: 'text-success', sub: '₱499/month each' }
  ];

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard/owner')} className="text-dark-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Subscriptions Management</h1>
          <p className="text-dark-300 mt-1">View all subscriptions and revenue from paid plans</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <span className="text-xs text-dark-400 uppercase tracking-wider">{card.label}</span>
              <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-dark-400 mt-1">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400 uppercase tracking-wider">Plan:</span>
            <div className="flex gap-1">
              {['ALL', 'FREE', 'BASIC', 'PRO'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => setFilterPlan(plan)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterPlan === plan
                      ? 'bg-accent-primary text-white'
                      : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400 uppercase tracking-wider">Status:</span>
            <div className="flex gap-1">
              {['ALL', 'ACTIVE', 'EXPIRED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? 'bg-accent-primary text-white'
                      : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="text-dark-400 text-sm mb-4">
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
        </p>

        {/* Table */}
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-10 text-center">
            <p className="text-dark-400">No subscriptions found.</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Company</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Industry</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Plan</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Price</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Status</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-4 text-white font-medium">{sub.company.name}</td>
                    <td className="px-5 py-4 text-dark-300">{sub.company.industry}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sub.plan === 'FREE'
                          ? 'bg-dark-700 text-dark-300 border border-dark-600'
                          : sub.plan === 'BASIC'
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                          : 'bg-success/20 text-success border border-success/30'
                      }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-300">
                      {sub.plan === 'FREE' ? '₱0' : sub.plan === 'BASIC' ? '₱299' : '₱499'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-400 text-sm">
                      {new Date(sub.expiredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
