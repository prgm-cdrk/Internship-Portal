// Landing page for the Internship Portal
// Redirects logged-in users to dashboard, shows CTA for guests

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-6">
      {/* Hero section */}
      <div className="text-center max-w-2xl">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Internship Portal</span>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Connect. Learn. <span className="text-accent-primary">Grow.</span>
        </h1>

        <p className="text-lg text-dark-300 mb-10 leading-relaxed">
          A platform bridging students with companies for meaningful internship experiences.
          Manage applications, track progress, and launch your career.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-accent-primary text-white font-semibold rounded-xl hover:bg-accent-secondary transition-colors text-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-dark-800 text-white font-semibold rounded-xl border border-dark-600 hover:border-dark-400 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 text-sm text-dark-400">
        Internship Portal &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
