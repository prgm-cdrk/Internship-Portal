// Public Browse Internships page
// accessible without login — shows all available internship listings
// clicking "Apply" prompts user to sign up or log in
// linked from landing page "Start Browsing Internships" button

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  };
  _count: {
    applications: number;
  };
};

export default function PublicBrowsePage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internship/browse');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load internships');
        setLoading(false);
        return;
      }
      setInternships(data.internships);
      setLoading(false);
    } catch {
      setError('Failed to load internships');
      setLoading(false);
    }
  };

  const filtered = internships.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.company.name.toLowerCase().includes(q) ||
      i.company.industry.toLowerCase().includes(q)
    );
  });

  const selected = internships.find((i) => i.id === selectedId);

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
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-12">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Opportunities</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Browse Internships</h1>
            <p className="text-dark-300 max-w-xl mx-auto">
              Explore available positions from registered companies. Sign up to apply.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, company, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 transition"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 mb-8">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-arcana-primary/30 border-t-arcana-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-dark-400">Loading internships...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && !error && (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
              <svg className="w-12 h-12 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-dark-400 text-lg font-medium mb-2">No internships found</p>
              <p className="text-dark-500 text-sm">{search ? 'Try a different search term' : 'No internships available at the moment.'}</p>
            </div>
          )}

          {/* Internship cards */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((internship) => {
                const isSelected = selectedId === internship.id;
                const daysLeft = Math.max(0, Math.ceil((new Date(internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={internship.id}
                    className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isSelected ? 'border-arcana-primary/40 shadow-[0_0_30px_rgba(114,98,248,0.1)]' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Card header — always visible, clickable to expand */}
                    <button
                      onClick={() => setSelectedId(isSelected ? null : internship.id)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{internship.title}</h3>
                            {daysLeft <= 7 && daysLeft > 0 && (
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-xs font-medium">
                                {daysLeft}d left
                              </span>
                            )}
                            {daysLeft === 0 && (
                              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs font-medium">
                                Deadline passed
                              </span>
                            )}
                          </div>
                          <p className="text-dark-400 text-sm mb-3">
                            {internship.company.name} &bull; {internship.company.industry}
                          </p>
                          <p className="text-dark-500 text-sm line-clamp-2">
                            {internship.description.length > 160
                              ? internship.description.substring(0, 160) + '...'
                              : internship.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-dark-500 shrink-0 mt-2 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-5 mt-4 text-xs text-dark-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {internship.slots} slot{internship.slots !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {internship._count.applications} applicant{internship._count.applications !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Deadline: {new Date(internship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isSelected && (
                      <div className="px-6 pb-6 border-t border-white/5">
                        <div className="pt-5">
                          {/* Full description */}
                          <p className="text-dark-300 text-sm leading-relaxed mb-6">{internship.description}</p>

                          {/* Company info */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6">
                            <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">About the Company</p>
                            <p className="text-white font-medium">{internship.company.name}</p>
                            <p className="text-dark-400 text-sm">{internship.company.industry}</p>
                          </div>

                          {/* Apply prompt */}
                          {session ? (
                            <Link
                              href="/dashboard/applicant/internships"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)]"
                            >
                              Apply Now
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-4">
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
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats bar */}
          {!loading && internships.length > 0 && (
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{internships.length}</p>
                <p className="text-xs text-dark-500 mt-1">Open Positions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{new Set(internships.map((i) => i.company.id)).size}</p>
                <p className="text-xs text-dark-500 mt-1">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{internships.reduce((sum, i) => sum + i.slots, 0)}</p>
                <p className="text-xs text-dark-500 mt-1">Total Slots</p>
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
