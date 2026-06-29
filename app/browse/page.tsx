// Public Browse Internships page
// accessible without login — shows all available internship listings
// clicking "Apply" prompts user to sign up or log in
// linked from landing page "Start Browsing Internships" button

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    location: string | null;
    logoUrl: string | null;
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
    <div className="min-h-screen bg-arcana-bg text-arcana-text overflow-hidden relative" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ─── FLOATING BACKGROUND ORBS ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-arcana-primary/10 rounded-full blur-[120px] animate-drift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-arcana-indigo/8 rounded-full blur-[100px] animate-drift-reverse" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-arcana-light/5 rounded-full blur-[80px] animate-float" />
      </div>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-arcana-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/Arcana-Logo.png" alt="Arcana Solution" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold tracking-wide">ARCANA SOLUTION</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse" className="text-sm text-arcana-light font-medium">Browse</Link>
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

          {/* Page header with InternsHub logo */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src="/internsHub-logo.png" alt="InternsHub" className="h-14 w-auto" />
            </div>
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Opportunities</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Browse Internships</h1>
            <p className="text-dark-300 max-w-xl mx-auto">
              Explore available positions from registered companies. Sign up to apply.
            </p>
          </div>

          {/* Stats bar */}
          {!loading && internships.length > 0 && (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center hover:border-arcana-primary/20 hover:bg-white/[0.05] transition-all duration-300" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.2s both' }}>
                <p className="text-2xl font-bold text-white">{internships.length}</p>
                <p className="text-xs text-dark-500 mt-1">Open Positions</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center hover:border-arcana-primary/20 hover:bg-white/[0.05] transition-all duration-300" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.35s both' }}>
                <p className="text-2xl font-bold text-white">{new Set(internships.map((i) => i.company.id)).size}</p>
                <p className="text-xs text-dark-500 mt-1">Companies</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center hover:border-arcana-primary/20 hover:bg-white/[0.05] transition-all duration-300" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.5s both' }}>
                <p className="text-2xl font-bold text-white">{internships.reduce((sum, i) => sum + i.slots, 0)}</p>
                <p className="text-xs text-dark-500 mt-1">Total Slots</p>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative group/search">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within/search:text-arcana-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, company, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 focus:shadow-[0_0_20px_rgba(114,98,248,0.1)] transition-all duration-300"
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
              {filtered.map((internship, index) => {
                const isSelected = selectedId === internship.id;
                const daysLeft = Math.max(0, Math.ceil((new Date(internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={internship.id}
                    className={`group bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(114,98,248,0.06)] ${
                      isSelected ? 'border-arcana-primary/40 shadow-[0_0_30px_rgba(114,98,248,0.1)]' : 'border-white/5 hover:border-white/15'
                    }`}
                    style={{ animation: `fadeSlideUp 0.5s ease-out ${0.1 + index * 0.08}s both` }}
                  >
                    {/* Card header — always visible, clickable to expand */}
                    <button
                      onClick={() => setSelectedId(isSelected ? null : internship.id)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-start gap-4">
                        {/* Company logo */}
                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          {internship.company.logoUrl ? (
                            <img src={internship.company.logoUrl} alt={internship.company.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>

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
                          <p className="text-dark-400 text-sm mb-1">
                            {internship.company.name} &bull; {internship.company.industry}
                          </p>
                          {internship.company.location && (
                            <p className="text-dark-500 text-xs flex items-center gap-1 mb-3">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {internship.company.location}
                            </p>
                          )}
                          {!isSelected && (() => {
                            const plainText = internship.description.replace(/<[^>]*>/g, '').trim();
                            return (
                              <p className="text-dark-500 text-sm line-clamp-2">
                                {plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText}
                              </p>
                            );
                          })()}
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
                          {/* Full description rendered as HTML */}
                          <div
                            className="text-dark-300 text-sm leading-relaxed mb-6 prose prose-invert prose-sm max-w-none
                              [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-2
                              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-2
                              [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mb-1
                              [&_p]:mb-2
                              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
                              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
                              [&_li]:mb-1"
                            dangerouslySetInnerHTML={{ __html: internship.description }}
                          />

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
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/Arcana-Logo.png" alt="Arcana Solution" width={32} height={32} className="rounded-lg" />
                <span className="font-bold text-white">ARCANA SOLUTION</span>
              </div>
              <p className="text-dark-400 text-sm leading-relaxed">
                InternsHub — the modern internship management platform by Arcana Solution.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Product</p>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'How It Works', 'Dashboard'].map((l) => (
                  <li key={l}>
                    <Link href={l === 'Dashboard' ? '/browse' : `/#${l.toLowerCase().replace(/ /g, '-')}`} className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Company</p>
              <ul className="space-y-2.5">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Legal</p>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-400 text-sm">
              &copy; {new Date().getFullYear()} Arcana Solution. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {/* GitHub */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
