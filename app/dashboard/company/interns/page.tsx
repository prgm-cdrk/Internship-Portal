// Interns page - shows active and recently offboarded interns
// Active: ACCEPTED with startDate - can Cancel or Offboard
// Offboarded: COMPLETED within 30 days - shown with badge, auto-deleted after 30 days

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
  startDate: string | null;
  resumeUrl: string | null;
  status: string;
  offboardedAt: string | null;
};

export default function InternsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'offboard'; intern: Intern } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleCancelIntern = async (applicationId: number) => {
    setProcessingId(applicationId);
    try {
      const response = await fetch('/api/company/cancel-intern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to cancel internship');
        setProcessingId(null);
        setConfirmAction(null);
        return;
      }
      setSuccessMessage('Internship cancelled successfully');
      setConfirmAction(null);
      fetchInterns();
    } catch {
      setError('Failed to cancel internship');
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const handleOffboardIntern = async (applicationId: number) => {
    setProcessingId(applicationId);
    try {
      const response = await fetch('/api/company/offboard-intern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to offboard intern');
        setProcessingId(null);
        setConfirmAction(null);
        return;
      }
      setSuccessMessage('Intern offboarded. Record will be kept for 30 days then auto-deleted.');
      setConfirmAction(null);
      fetchInterns();
    } catch {
      setError('Failed to offboard intern');
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const getDaysRemaining = (offboardedAt: string) => {
    const offboarded = new Date(offboardedAt);
    const now = new Date();
    const diff = offboarded.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - Math.floor((now.getTime() - offboarded.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const activeInterns = interns.filter(i => i.status === 'ACCEPTED');
  const offboardedInterns = interns.filter(i => i.status === 'COMPLETED');

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full animate-scan-line dashboard-grid">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Interns</h1>
          <p className="text-neutral-500 text-sm mt-1">Active and recently offboarded interns</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => setError('')} className="text-xs text-red-400/60 hover:text-red-400 mt-1">dismiss</button>
          </div>
        )}

        {successMessage && (
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-neutral-300">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-xs text-neutral-500 hover:text-neutral-300 mt-1">dismiss</button>
          </div>
        )}

        {/* Active Interns */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">Active Interns</h2>
            <span className="bg-white/10 text-neutral-400 text-xs px-2 py-0.5 rounded-full">{activeInterns.length}</span>
          </div>

          {activeInterns.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-12 text-center">
              <p className="text-neutral-500">No active interns.</p>
              <p className="text-neutral-600 text-xs mt-1">Accept an application and set a start date to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInterns.map((intern) => {
                const isExpanded = expandedId === intern.id;
                return (
                  <div
                    key={intern.applicationId}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-colors hover:bg-neutral-800/50"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : intern.applicationId)}
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
                          <span className="text-neutral-500 text-xs hidden sm:block">Started: {new Date(intern.startDate!).toLocaleDateString()}</span>
                          <span className="bg-white/10 text-neutral-300 text-xs px-2 py-0.5 rounded-full">Active</span>
                          <svg
                            className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

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
                              <p className="text-white text-sm"><span className="text-neutral-500">Start Date:</span> {new Date(intern.startDate!).toLocaleDateString()}</p>
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

                        {/* Action buttons */}
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => setConfirmAction({ type: 'offboard', intern })}
                            disabled={processingId === intern.applicationId}
                            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                          >
                            {processingId === intern.applicationId ? 'Processing...' : 'Offboard (Finished)'}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'cancel', intern })}
                            disabled={processingId === intern.applicationId}
                            className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
                          >
                            Cancel Internship
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Offboarded Interns (30-day retention) */}
        {offboardedInterns.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Recently Offboarded</h2>
              <span className="bg-neutral-800 text-neutral-500 text-xs px-2 py-0.5 rounded-full">{offboardedInterns.length}</span>
              <span className="text-neutral-600 text-xs">Auto-deleted after 30 days</span>
            </div>

            <div className="space-y-3">
              {offboardedInterns.map((intern) => {
                const isExpanded = expandedId === intern.applicationId;
                const daysRemaining = intern.offboardedAt ? getDaysRemaining(intern.offboardedAt) : 30;
                return (
                  <div
                    key={intern.applicationId}
                    className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl overflow-hidden transition-colors hover:bg-neutral-800/30"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : intern.applicationId)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm font-medium shrink-0">
                            {intern.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-neutral-400 text-sm font-medium">{intern.name}</p>
                            <p className="text-neutral-600 text-xs">{intern.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-neutral-600 text-xs hidden sm:block">{intern.internship}</span>
                          <span className="bg-neutral-800 text-neutral-500 text-xs px-2 py-0.5 rounded-full">
                            Offboarded · {daysRemaining}d left
                          </span>
                          <svg
                            className={`w-5 h-5 text-neutral-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-neutral-800/50">
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Intern Details</p>
                            <div className="bg-neutral-800/50 rounded-lg p-4 space-y-2">
                              <p className="text-neutral-400 text-sm"><span className="text-neutral-600">Name:</span> {intern.name}</p>
                              <p className="text-neutral-400 text-sm"><span className="text-neutral-600">Email:</span> {intern.email}</p>
                              <p className="text-neutral-400 text-sm"><span className="text-neutral-600">Internship:</span> {intern.internship}</p>
                              {intern.startDate && (
                                <p className="text-neutral-400 text-sm"><span className="text-neutral-600">Start Date:</span> {new Date(intern.startDate).toLocaleDateString()}</p>
                              )}
                              {intern.offboardedAt && (
                                <p className="text-neutral-400 text-sm"><span className="text-neutral-600">Offboarded:</span> {new Date(intern.offboardedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Resume</p>
                            <div className="bg-neutral-800/50 rounded-lg p-4">
                              {intern.resumeUrl ? (
                                <a
                                  href={intern.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-700/50 border border-neutral-700 rounded-lg text-sm text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Resume (PDF)
                                </a>
                              ) : (
                                <p className="text-neutral-600 text-sm">No resume</p>
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
          </div>
        )}

        {/* Confirmation modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white text-lg font-medium mb-2">
                {confirmAction.type === 'cancel' ? 'Cancel Internship' : 'Offboard Intern'}
              </h3>
              <p className="text-neutral-400 text-sm mb-6">
                {confirmAction.type === 'cancel' ? (
                  <>Are you sure you want to cancel <span className="text-white font-medium">{confirmAction.intern.name}</span>&apos;s internship? This action cannot be undone and they will be removed from the Interns page.</>
                ) : (
                  <>Are you sure you want to offboard <span className="text-white font-medium">{confirmAction.intern.name}</span>? Their record will be kept for 30 days, then automatically deleted from the system.</>
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'cancel') {
                      handleCancelIntern(confirmAction.intern.applicationId);
                    } else {
                      handleOffboardIntern(confirmAction.intern.applicationId);
                    }
                  }}
                  disabled={processingId !== null}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    confirmAction.type === 'cancel'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {processingId !== null ? 'Processing...' : confirmAction.type === 'cancel' ? 'Yes, Cancel' : 'Yes, Offboard'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
