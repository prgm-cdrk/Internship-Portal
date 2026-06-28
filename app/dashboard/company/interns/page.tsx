// Interns page - shows all hired interns with start dates
// Displays intern name, email, internship, start date, and resume

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Intern = {
  id: number;
  applicationId: number;
  name: string;
  email: string;
  internship: string;
  startDate: string;
  resumeUrl: string | null;
};

export default function InternsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchInterns();
  }, [status]);

  const fetchInterns = async () => {
    try {
      const response = await fetch('/api/company/accepted-interns');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load interns');
        setLoading(false);
        return;
      }
      setInterns(data.interns);
      setLoading(false);
    } catch {
      setError('Failed to load interns');
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full animate-scan-line dashboard-grid">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Interns</h1>
          <p className="text-neutral-500 text-sm mt-1">Hired applicants with assigned start dates</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {interns.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No interns yet.</p>
            <p className="text-neutral-600 text-xs mt-1">Interns appear here once you accept their application and set a start date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interns.map((intern) => {
              const isExpanded = expandedId === intern.id;
              return (
                <div
                  key={intern.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-colors hover:bg-neutral-800/50"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : intern.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-medium shrink-0">
                          {intern.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium">{intern.name}</p>
                          <p className="text-neutral-500 text-xs">{intern.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-neutral-500 text-xs hidden sm:block">{intern.internship}</span>
                        <span className="text-neutral-500 text-xs hidden sm:block">Starts: {new Date(intern.startDate).toLocaleDateString()}</span>
                        <svg
                          className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-neutral-800">
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Intern details */}
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Intern Details</p>
                          <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
                            <p className="text-white text-sm"><span className="text-neutral-500">Name:</span> {intern.name}</p>
                            <p className="text-white text-sm"><span className="text-neutral-500">Email:</span> {intern.email}</p>
                            <p className="text-white text-sm"><span className="text-neutral-500">Internship:</span> {intern.internship}</p>
                            <p className="text-white text-sm"><span className="text-neutral-500">Start Date:</span> {new Date(intern.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Resume */}
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Resume</p>
                          <div className="bg-neutral-800 rounded-lg p-4">
                            {intern.resumeUrl ? (
                              <div className="space-y-3">
                                <a
                                  href={intern.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-300 hover:bg-neutral-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Resume (PDF)
                                </a>
                                <iframe
                                  src={intern.resumeUrl}
                                  className="w-full h-64 rounded-lg border border-neutral-700 bg-white"
                                  title={`${intern.name} Resume`}
                                />
                              </div>
                            ) : (
                              <p className="text-neutral-500 text-sm">No resume uploaded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
