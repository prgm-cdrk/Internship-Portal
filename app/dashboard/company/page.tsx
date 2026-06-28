// Company Manager Dashboard - only accessible by users with COMPANY role
// On load, checks if the user already has a company profile
// If NO company → redirects to /dashboard/company/create
// If YES company → shows the company dashboard with actions and recent activity

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Activity = {
  type: 'application' | 'task' | 'announcement';
  message: string;
  detail: string;
  timestamp: string;
};

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [notifications, setNotifications] = useState({ newApplications: 0, pendingReviews: 0, pendingInterns: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'COMPANY') {
      router.push('/login');
      return;
    }
    checkUserCompany();
  }, [session, status, router]);

  const checkUserCompany = async () => {
    try {
      const response = await fetch('/api/company/get');
      const data = await response.json();
      if (!response.ok) {
        setCompany(null);
        setLoading(false);
        return;
      }
      setCompany(data.company);
      setLoading(false);
      fetchActivity();
      fetchNotifications();
    } catch (error) {
      console.error('Error checking company:', error);
      setCompany(null);
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/company/activity');
      const data = await response.json();
      if (response.ok) {
        setActivities(data.activities);
      }
      setActivityLoading(false);
    } catch (error) {
      setActivityLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/company/notifications');
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      }
    } catch {
      // silent
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!company) {
    router.push('/dashboard/company/create');
    return <p className="text-neutral-500 text-center py-20">Redirecting to create company...</p>;
  }

  const actions = [
    { label: 'View Profile', desc: 'View and edit company info', path: '/dashboard/company/profile', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { label: 'Post Internship', desc: 'Create new job posting', path: '/dashboard/company/internships/new', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
    )},
    { label: 'View Internships', desc: 'See all posted internships', path: '/dashboard/company/internships', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )},
    { label: 'View Applicants', desc: 'Review application pipeline', path: '/dashboard/company/applicants', badge: notifications.newApplications, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    { label: 'View Interns', desc: 'See hired interns', path: '/dashboard/company/interns', badge: notifications.pendingInterns, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { label: 'Manage Tasks', desc: 'Create and assign tasks', path: '/dashboard/company/tasks', badge: notifications.pendingReviews, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    )},
    { label: 'Announcements', desc: 'Post updates for interns', path: '/dashboard/company/announcements', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    )},
    { label: 'Billing', desc: 'Manage subscription plan', path: '/dashboard/company/billing', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    )}
  ];

  const activityIcons: Record<string, JSX.Element> = {
    application: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ),
    task: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4" /></svg>
    ),
    announcement: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    )
  };

  const activityColors: Record<string, string> = {
    application: 'text-neutral-400',
    task: 'text-neutral-400',
    announcement: 'text-neutral-400'
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full animate-scan-line dashboard-grid relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Company Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1 tracking-wider">{company.name}</p>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center gap-4 text-left transition-all duration-200 hover:bg-neutral-800 hover:border-neutral-700 group relative"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-neutral-700 transition-colors shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{action.label}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{action.desc}</p>
              </div>
              {action.badge > 0 && (
                <span className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Recent Activity Board */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            </div>
            <button onClick={() => router.push('/dashboard/company/applicants')} className="text-xs text-neutral-500 hover:text-white transition-colors">
              View all
            </button>
          </div>

          <div className="divide-y divide-neutral-800/50">
            {activityLoading ? (
              <div className="px-5 py-8 text-center">
                <p className="text-neutral-500 text-sm">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-neutral-500 text-sm">No recent activity yet.</p>
                <p className="text-neutral-600 text-xs mt-1">Activity will appear here when applicants apply or tasks are created.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="px-5 py-3 flex items-start gap-3 hover:bg-neutral-800/30 transition-colors">
                  <div className={`mt-0.5 shrink-0 ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-neutral-500 text-xs mt-0.5 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-neutral-600 text-xs shrink-0 mt-0.5">{timeAgo(activity.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
