// Owner Analytics page — platform stats, charts, trends
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Analytics = {
  summary: { totalUsers: number; totalCompanies: number; totalInternships: number; totalApplications: number; activeSubscriptions: number };
  trends: { signups: { date: string; count: number }[]; applications: { date: string; count: number }[] };
  distribution: { roles: { role: string; count: number }[]; plans: { plan: string; count: number }[]; statuses: { status: string; count: number }[] };
  weekly: { signups: { thisWeek: number; lastWeek: number }; applications: { thisWeek: number; lastWeek: number } };
};

const COLORS = ['#7262F8', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

function BarChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">{label}</p>
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-arcana-primary/80 rounded-t-sm transition-all" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }} />
            <span className="text-[9px] text-neutral-600">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, label }: { data: { name: string; count: number }[]; label: string }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">{label}</p>
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {data.reduce((acc, d, i) => {
              const pct = (d.count / total) * 100;
              acc.elements.push(
                <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={COLORS[i % COLORS.length]}
                  strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={acc.offset}
                  className="transition-all duration-500" />
              );
              acc.offset -= pct;
              return acc;
            }, { elements: [] as React.ReactNode[], offset: 25 }).elements}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">{total}</div>
        </div>
        <div className="space-y-1.5">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-neutral-400">{d.name}</span>
              <span className="text-white font-medium ml-auto">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { if (status === 'authenticated') fetchAnalytics(); }, [status]);

  const fetchAnalytics = async () => {
    const res = await fetch('/api/owner/analytics');
    const data = await res.json();
    if (res.ok) {
      setAnalytics(data);
    } else {
      console.error('Analytics fetch error:', data.error);
      setError(data.error || 'Failed to load analytics');
    }
    setLoading(false);
  };

  const pctChange = (thisWeek: number, lastWeek: number) => {
    if (lastWeek === 0) return thisWeek > 0 ? '+100%' : '0%';
    const pct = ((thisWeek - lastWeek) / lastWeek * 100).toFixed(0);
    return pct.startsWith('-') ? `${pct}%` : `+${pct}%`;
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  if (error || !analytics) {
    return <div className="flex items-center justify-center py-20"><p className="text-red-400">{error || 'Failed to load analytics'}</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Platform Analytics</h1>
          <p className="text-neutral-500 text-sm mt-1">Insights and trends across your platform</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Users', value: analytics.summary.totalUsers, change: pctChange(analytics.weekly.signups.thisWeek, analytics.weekly.signups.lastWeek) },
            { label: 'Companies', value: analytics.summary.totalCompanies },
            { label: 'Internships', value: analytics.summary.totalInternships },
            { label: 'Applications', value: analytics.summary.totalApplications, change: pctChange(analytics.weekly.applications.thisWeek, analytics.weekly.applications.lastWeek) },
            { label: 'Active Subs', value: analytics.summary.activeSubscriptions },
          ].map((card, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
              {card.change && <p className="text-xs text-green-400 mt-1">{card.change} this week</p>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <BarChart data={analytics.trends.signups} label="User Signups (30 days)" />
          <BarChart data={analytics.trends.applications} label="Applications (30 days)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DonutChart data={analytics.distribution.roles.map(r => ({ name: r.role, count: r.count }))} label="User Roles" />
          <DonutChart data={analytics.distribution.plans.map(p => ({ name: p.plan, count: p.count }))} label="Subscription Plans" />
          <DonutChart data={analytics.distribution.statuses.map(s => ({ name: s.status, count: s.count }))} label="Application Status" />
        </div>
      </div>
    </div>
  );
}
