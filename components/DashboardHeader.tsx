// Dashboard Header component
// Shared across all dashboard pages (Owner, Company, Applicant)
// Contains logo, navigation, and user info

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = session?.user?.role;

  // Navigation links based on role
  const navLinks = (() => {
    switch (role) {
      case 'OWNER':
        return [
          { label: 'Dashboard', path: '/dashboard/owner' },
          { label: 'Users', path: '/dashboard/owner/users' },
          { label: 'Companies', path: '/dashboard/owner/companies' },
          { label: 'Subscriptions', path: '/dashboard/owner/subscriptions' },
          { label: 'Settings', path: '/dashboard/owner/settings' },
        ];
      case 'COMPANY':
        return [
          { label: 'Dashboard', path: '/dashboard/company' },
          { label: 'Profile', path: '/dashboard/company/profile' },
          { label: 'Internships', path: '/dashboard/company/internships' },
          { label: 'Applicants', path: '/dashboard/company/applicants' },
          { label: 'Tasks', path: '/dashboard/company/tasks' },
          { label: 'Announcements', path: '/dashboard/company/announcements' },
          { label: 'Billing', path: '/dashboard/company/billing' },
        ];
      case 'APPLICANT':
        return [
          { label: 'Dashboard', path: '/dashboard/applicant' },
          { label: 'Browse', path: '/dashboard/applicant/internships' },
          { label: 'Applications', path: '/dashboard/applicant/applications' },
          { label: 'Tasks', path: '/dashboard/applicant/tasks' },
          { label: 'Announcements', path: '/dashboard/applicant/announcements' },
        ];
      default:
        return [];
    }
  })();

  return (
    <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left side: Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo placeholder */}
          <button
            onClick={() => router.push(`/dashboard/${role?.toLowerCase()}`)}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">Internship Portal</span>
          </button>

          {/* Navigation links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-dark-800 text-white'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: User info + Sign out */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white font-medium leading-tight">{session?.user?.name}</p>
            <p className="text-xs text-dark-400">{role}</p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            className="px-3 py-1.5 bg-dark-800 text-dark-300 border border-dark-700 rounded-lg text-sm hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
