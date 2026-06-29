// Staff Dashboard — shows what the staff member has access to based on their permissions
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type StaffInfo = {
  role: string;
  permissions: string[];
};

const ALL_PAGES = [
  { key: 'users.view', label: 'Users', desc: 'View and manage users', path: '/dashboard/owner/users', icon: '👥' },
  { key: 'companies.view', label: 'Companies', desc: 'View and manage companies', path: '/dashboard/owner/companies', icon: '🏢' },
  { key: 'internships.view', label: 'Internships', desc: 'View all internships', path: '/dashboard/owner/internships', icon: '💼' },
  { key: 'subscriptions.view', label: 'Subscriptions', desc: 'View subscription data', path: '/dashboard/owner/subscriptions', icon: '💳' },
  { key: 'analytics.view', label: 'Analytics', desc: 'Platform analytics and charts', path: '/dashboard/owner/analytics', icon: '📊' },
  { key: 'staff.view', label: 'Staff', desc: 'View staff members', path: '/dashboard/owner/staff', icon: '🛡️' },
  { key: 'activity.view', label: 'Activity', desc: 'Platform activity feed', path: '/dashboard/owner/activity', icon: '⚡' },
  { key: 'audit.view', label: 'Audit Logs', desc: 'Track admin actions', path: '/dashboard/owner/audit', icon: '📋' },
  { key: 'settings.edit', label: 'Settings', desc: 'Platform configuration', path: '/dashboard/owner/settings', icon: '⚙️' },
];

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchStaffInfo();
  }, [status]);

  const fetchStaffInfo = async () => {
    try {
      const res = await fetch('/api/owner/staff');
      const data = await res.json();
      // Find the staff record matching the current user
      const myStaff = data.staff?.find((s: { userId: number }) => s.userId === parseInt(session?.user?.id || '0'));
      if (myStaff) {
        setStaffInfo({
          role: myStaff.role,
          permissions: JSON.parse(myStaff.permissions),
        });
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const accessiblePages = ALL_PAGES.filter(p => staffInfo?.permissions.includes(p.key));

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Staff Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Welcome back, {session?.user?.name}
            {staffInfo && <span className="ml-2 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-semibold">{staffInfo.role}</span>}
          </p>
        </div>

        {accessiblePages.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-neutral-400 text-lg font-medium mb-2">No access granted</p>
            <p className="text-neutral-600 text-sm">Contact the owner to get permissions assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accessiblePages.map((page) => (
              <button key={page.key} onClick={() => router.push(page.path)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-left hover:bg-neutral-800 hover:border-neutral-700 transition-all group">
                <div className="text-2xl mb-3">{page.icon}</div>
                <p className="text-white font-medium text-sm group-hover:text-arcana-light transition-colors">{page.label}</p>
                <p className="text-neutral-500 text-xs mt-1">{page.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
