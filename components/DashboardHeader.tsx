// Dashboard Header component
// Top bar with logo, external links, notifications, and user info
// Navigation is now handled by the sidebar

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const role = session?.user?.role;

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 h-12 flex items-center px-4 shrink-0 z-50">
      <div className="flex items-center justify-between w-full">
        {/* Left side: Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push(`/dashboard/${role?.toLowerCase()}`)}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block">Internship Portal</span>
          </button>
        </div>

        {/* Right side: External links + Notifications + User info + Sign out */}
        <div className="flex items-center gap-2">
          {/* Support */}
          <button
            onClick={() => router.push('/support')}
            className="px-2.5 py-1.5 text-neutral-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors rounded-md hover:bg-neutral-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">Support</span>
          </button>

          {/* Home */}
          <button
            onClick={() => router.push('/')}
            className="px-2.5 py-1.5 text-neutral-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors rounded-md hover:bg-neutral-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden md:inline">Home</span>
          </button>

          {/* Products */}
          <button
            onClick={() => router.push('/products')}
            className="px-2.5 py-1.5 text-neutral-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors rounded-md hover:bg-neutral-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="hidden md:inline">Products</span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-800 mx-1"></div>

          {/* Notifications */}
          <button className="relative px-2 py-1.5 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-neutral-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full hidden"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-800 mx-1"></div>

          {/* User info */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white font-medium leading-tight">{session?.user?.name}</p>
            <p className="text-[10px] text-neutral-600 leading-tight">{role}</p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            className="px-2.5 py-1 text-neutral-600 hover:text-red-400 text-xs transition-colors rounded-md hover:bg-neutral-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
