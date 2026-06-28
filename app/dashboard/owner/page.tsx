// Owner Dashboard page - only accessible by users with OWNER role
// Shows system-wide statistics: total users, companies, internships, revenue
// Provides quick action buttons to manage users, companies, and subscriptions

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalInternships: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchStats();
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/owner/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      } else {
        setError('Failed to load statistics');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark-300">Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== 'OWNER') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark-300">Access denied. Owner only.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Owner Dashboard</h1>
          <p className="text-dark-300 mt-1">Welcome back, {session.user?.name}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column - Stats (takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Revenue hero card */}
            <div className="bg-gradient-to-br from-accent-primary/20 via-dark-800 to-dark-800 border border-accent-primary/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-300 text-sm mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold text-white">₱{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-dark-400 text-sm mt-1">From all subscriptions</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Users', value: stats.totalUsers, color: 'text-accent-primary', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )},
                { label: 'Companies', value: stats.totalCompanies, color: 'text-success', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )},
                { label: 'Internships', value: stats.totalInternships, color: 'text-accent-light', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )},
                { label: 'Subscriptions', value: stats.activeSubscriptions, color: 'text-dark-300', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                )}
              ].map((stat) => (
                <div key={stat.label} className="bg-dark-800 border border-dark-700 rounded-xl p-4 transition-all duration-300 hover:border-dark-500 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-dark-400">{stat.icon}</div>
                    <span className="text-xs text-dark-400 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>

            {[
              { label: 'Manage Users', desc: 'View and manage all users', path: '/dashboard/owner/users', color: 'hover:border-accent-primary/50 hover:bg-accent-primary/5', icon: (
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )},
              { label: 'Manage Companies', desc: 'View company profiles', path: '/dashboard/owner/companies', color: 'hover:border-success/50 hover:bg-success/5', icon: (
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              )},
              { label: 'Subscriptions', desc: 'Revenue and plan data', path: '/dashboard/owner/subscriptions', color: 'hover:border-dark-500 hover:bg-dark-700/50', icon: (
                <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              )},
              { label: 'System Settings', desc: 'Portal configuration', path: '/dashboard/owner/settings', color: 'hover:border-dark-500 hover:bg-dark-700/50', icon: (
                <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className={`w-full bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 ${action.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center shrink-0">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{action.label}</p>
                  <p className="text-dark-400 text-xs">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-dark-500 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
