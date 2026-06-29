// Applicant Pipeline page - shows all applicants who applied to the company's internships
// Accepted applicants with a start date show a "View Intern" button
// Accepted applicants without a start date show a date picker to set it

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Application = {
  id: number;
  status: string;
  appliedAt: string;
  resumeUrl: string | null;
  startDate: string | null;
  user: { id: number; name: string; email: string };
  internship: { id: number; title: string };
};

const allStatuses = ['APPLIED', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
// Statuses the company manager can manually set from the Applicants page
// CANCELLED and COMPLETED are only managed from the Interns page
const updateableStatuses = ['APPLIED', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];

const statusStyles: Record<string, string> = {
  APPLIED: 'bg-neutral-700 text-neutral-300 border border-neutral-600',
  REVIEWED: 'bg-neutral-700 text-neutral-300 border border-neutral-600',
  INTERVIEW: 'bg-neutral-700 text-white border border-neutral-500',
  ACCEPTED: 'bg-white text-black border border-white',
  REJECTED: 'bg-neutral-800 text-neutral-500 border border-neutral-700',
  CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  COMPLETED: 'bg-white/10 text-neutral-300 border border-white/10',
};

export default function ApplicantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [settingDateId, setSettingDateId] = useState<number | null>(null);
  const [startDateValue, setStartDateValue] = useState('');
  const [applicantInfo, setApplicantInfo] = useState<{ activeCount: number; limit: string | number; plan: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications();
      fetchApplicantCount();
    }
  }, [status]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/application/get');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load applications');
        setLoading(false);
        return;
      }
      setApplications(data.applications);
      setLoading(false);
    } catch {
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const fetchApplicantCount = async () => {
    try {
      const response = await fetch('/api/company/applicant-count');
      const data = await response.json();
      if (response.ok) {
        setApplicantInfo(data);
      }
    } catch {
      // Silently fail — count display is optional
    }
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    setError('');
    setUpdatingId(applicationId);
    try {
      const response = await fetch('/api/application/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update status');
        setUpdatingId(null);
        return;
      }
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
      setUpdatingId(null);
      // Refetch to get fresh data including startDate
      fetchApplications();
    } catch {
      setError('Failed to update status');
      setUpdatingId(null);
    }
  };

  const handleSetStartDate = async (applicationId: number) => {
    setError('');
    if (!startDateValue) {
      setError('Please select a start date');
      return;
    }
    setSettingDateId(applicationId);
    try {
      const response = await fetch('/api/application/set-start-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, startDate: startDateValue })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to set start date');
        setSettingDateId(null);
        return;
      }
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, startDate: startDateValue } : app)
      );
      setSettingDateId(null);
      setStartDateValue('');
    } catch {
      setError('Failed to set start date');
      setSettingDateId(null);
    }
  };

  const filteredApplications = filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full animate-scan-line dashboard-grid">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-wide">Applicants</h1>
            {applicantInfo && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                applicantInfo.limit !== 'Unlimited' && applicantInfo.activeCount >= (applicantInfo.limit as number)
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
              }`}>
                {applicantInfo.activeCount} / {applicantInfo.limit} profiles ({applicantInfo.plan})
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm mt-1">Review applications and update status</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {['ALL', ...allStatuses].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <p className="text-neutral-500">{filter === 'ALL' ? 'No applications received yet.' : `No applications with status "${filter}".`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const isExpanded = expandedId === app.id;
              const isUpdating = updatingId === app.id;
              const isAcceptedWithDate = app.status === 'ACCEPTED' && app.startDate;
              const isAcceptedNoDate = app.status === 'ACCEPTED' && !app.startDate;

              // Accepted with start date — compact row with View Intern button
              if (isAcceptedWithDate) {
                return (
                  <div
                    key={app.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between gap-4 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-medium shrink-0">
                        {app.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">{app.user.name}</p>
                        <p className="text-neutral-500 text-xs">{app.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-neutral-500 text-xs hidden sm:block">{app.internship.title}</span>
                      <span className="text-neutral-500 text-xs hidden sm:block">Starts: {app.startDate ? new Date(app.startDate).toLocaleDateString() : '—'}</span>
                      <button
                        onClick={() => router.push('/dashboard/company/interns')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
                      >
                        View Intern
                      </button>
                    </div>
                  </div>
                );
              }

              // Regular or accepted without date — expandable card
              return (
                <div
                  key={app.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-colors hover:bg-neutral-800/50"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 text-sm font-medium shrink-0">
                            {app.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{app.user.name}</p>
                            <p className="text-neutral-500 text-xs">{app.user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-neutral-500 text-xs hidden sm:block">{app.internship.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[app.status] || 'bg-neutral-700 text-neutral-400'}`}>
                          {app.status}
                        </span>
                        <svg
                          className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-xs mt-2 ml-11">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-neutral-800">
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left column: Applicant info + Status updater + Start date */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Applicant Details</p>
                            <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
                              <p className="text-white text-sm"><span className="text-neutral-500">Name:</span> {app.user.name}</p>
                              <p className="text-white text-sm"><span className="text-neutral-500">Email:</span> {app.user.email}</p>
                              <p className="text-white text-sm"><span className="text-neutral-500">Internship:</span> {app.internship.title}</p>
                              <p className="text-white text-sm"><span className="text-neutral-500">Applied:</span> {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Update Status</p>
                            <div className="bg-neutral-800 rounded-lg p-4">
                              <div className="flex gap-2 flex-wrap">
                                {updateableStatuses.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusUpdate(app.id, s)}
                                    disabled={app.status === s || isUpdating}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                      app.status === s
                                        ? 'bg-white text-black cursor-default'
                                        : isUpdating
                                          ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                          : 'bg-neutral-700 text-neutral-400 border border-neutral-600 hover:bg-neutral-600 hover:text-white'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Set Start Date — only for ACCEPTED without startDate */}
                          {isAcceptedNoDate && (
                            <div>
                              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Set Start Date</p>
                              <div className="bg-neutral-800 rounded-lg p-4 flex items-center gap-3">
                                <input
                                  type="date"
                                  value={startDateValue}
                                  onChange={(e) => setStartDateValue(e.target.value)}
                                  className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                                />
                                <button
                                  onClick={() => handleSetStartDate(app.id)}
                                  disabled={!startDateValue || settingDateId === app.id}
                                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
                                >
                                  {settingDateId === app.id ? 'Setting...' : 'Set'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right column: Resume */}
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Resume</p>
                          <div className="bg-neutral-800 rounded-lg p-4">
                            {app.resumeUrl ? (
                              <div className="space-y-3">
                                <a
                                  href={app.resumeUrl}
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
                                  src={app.resumeUrl}
                                  className="w-full h-64 rounded-lg border border-neutral-700 bg-white"
                                  title={`${app.user.name} Resume`}
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
