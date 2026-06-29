// Public Internship Detail page
// Shows full internship details for a single posting
// No login required — "Apply" prompts sign up

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Internship = {
  id: number;
  title: string;
  description: string;
  slots: number;
  deadline: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
    website: string | null;
  };
  _count: {
    applications: number;
  };
};

export default function PublicInternshipDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id;
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    try {
      const response = await fetch(`/api/internship/browse/${id}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Internship not found');
        setLoading(false);
        return;
      }
      setInternship(data.internship);
      setLoading(false);
    } catch {
      setError('Failed to load internship');
      setLoading(false);
    }
  };

  const daysLeft = internship
    ? Math.max(0, Math.ceil((new Date(internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-arcana-bg text-arcana-text overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-arcana-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arcana-primary/20 border border-arcana-primary/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-arcana-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">InternsHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-arcana-primary text-white rounded-lg hover:bg-arcana-deep transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-arcana-light transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </Link>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-arcana-primary/30 border-t-arcana-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-dark-400">Loading internship details...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-dark-400 text-lg mb-4">{error}</p>
              <Link href="/browse" className="text-arcana-light hover:text-arcana-primary transition-colors text-sm">
                Browse all internships
              </Link>
            </div>
          )}

          {/* Internship details */}
          {!loading && internship && (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{internship.title}</h1>
                    <p className="text-dark-400">
                      {internship.company.name} &bull; {internship.company.industry}
                    </p>
                  </div>
                  {daysLeft <= 7 && daysLeft > 0 && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm font-medium shrink-0">
                      {daysLeft} days left
                    </span>
                  )}
                  {daysLeft === 0 && (
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium shrink-0">
                      Deadline passed
                    </span>
                  )}
                </div>

                {/* Meta stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-dark-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {internship.slots} slot{internship.slots !== 1 ? 's' : ''} available
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {internship._count.applications} applicant{internship._count.applications !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Deadline: {new Date(internship.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posted {new Date(internship.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-8">
                <h2 className="text-white font-semibold mb-4">Description</h2>
                <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">{internship.description}</p>
              </div>

              {/* Company info */}
              <div className="p-8 border-t border-white/5">
                <h2 className="text-white font-semibold mb-4">About the Company</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <p className="text-white font-medium text-lg mb-1">{internship.company.name}</p>
                  <p className="text-dark-400 text-sm mb-3">{internship.company.industry}</p>
                  {internship.company.website && (
                    <a
                      href={internship.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-arcana-light hover:text-arcana-primary transition-colors"
                    >
                      Visit Website
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Apply section */}
              <div className="p-8 border-t border-white/5">
                {session ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/dashboard/applicant/internships"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)]"
                    >
                      Apply Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <p className="text-dark-500 text-sm">You&apos;ll be redirected to your dashboard to complete the application.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-dark-400 mb-5">Interested in this internship? Create an account to apply.</p>
                    <div className="flex items-center justify-center gap-4">
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)]"
                      >
                        Sign Up to Apply
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <Link href="/login" className="text-sm text-dark-400 hover:text-arcana-light transition-colors">
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-dark-500 text-sm">&copy; 2026 Arcana Solution. All rights reserved.</p>
          <Link href="/" className="text-sm text-dark-400 hover:text-arcana-light transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
