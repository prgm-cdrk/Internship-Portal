// Public Internship Detail page
// Shows full internship details for a single posting
// No login required — "Apply" prompts sign up

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    location: string | null;
    description: string | null;
    logoUrl: string | null;
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
        <div className="max-w-3xl mx-auto">

          {/* InternsHub logo + Back link */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-arcana-light transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Browse
            </Link>
            <img src="/internsHub-logo.png" alt="InternsHub" className="h-8 w-auto opacity-60" />
          </div>

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
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    {internship.company.logoUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/[0.05]">
                        <img src={internship.company.logoUrl} alt={internship.company.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg mb-1">{internship.company.name}</p>
                      <p className="text-dark-400 text-sm mb-1">{internship.company.industry}</p>
                      {internship.company.location && (
                        <p className="text-dark-500 text-sm flex items-center gap-1.5 mb-3">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {internship.company.location}
                        </p>
                      )}
                      {internship.company.description && (
                        <p className="text-dark-300 text-sm leading-relaxed mb-3">{internship.company.description}</p>
                      )}
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
