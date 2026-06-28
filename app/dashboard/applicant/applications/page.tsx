// Track Applications page - applicants can see all their internship applications
// Shows a progress bar: Applied → Reviewed → Interview → Hired
// Uses monotone dark theme matching company manager pages

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Application = {
  id: number;
  status: string;
  appliedAt: string;
  internship: {
    id: number;
    title: string;
    description: string;
    deadline: string;
    company: {
      id: number;
      name: string;
      industry: string;
    };
  };
};

// Progress steps — each status maps to a step index (0-based)
const steps = ['Applied', 'Reviewed', 'Interview', 'Hired'];
const statusToStep: Record<string, number> = {
  APPLIED: 0,
  REVIEWED: 1,
  INTERVIEW: 2,
  ACCEPTED: 3,
};

export default function TrackApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/application/my');
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full dashboard-grid">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">My Applications</h1>
          <p className="text-neutral-500 text-sm mt-1">Track your application status</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">You haven&apos;t applied to any internships yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const isRejected = application.status === 'REJECTED';
              const currentStep = isRejected ? -1 : (statusToStep[application.status] ?? 0);

              return (
                <div
                  key={application.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium">{application.internship.title}</h3>
                      <p className="text-neutral-500 text-sm mt-0.5">
                        {application.internship.company.name} &bull; {application.internship.company.industry}
                      </p>
                    </div>
                    {isRejected ? (
                      <span className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/30 shrink-0">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700 shrink-0">
                        {steps[currentStep]}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => {
                        const isCompleted = !isRejected && index <= currentStep;
                        const isCurrent = !isRejected && index === currentStep;

                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            {/* Step dot + label */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full border-2 transition-all ${
                                  isCompleted
                                    ? 'bg-white border-white'
                                    : 'bg-transparent border-neutral-700'
                                } ${isCurrent ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-neutral-900' : ''}`}
                              />
                              <span className={`text-xs mt-1.5 whitespace-nowrap ${
                                isCompleted ? 'text-white' : 'text-neutral-600'
                              }`}>
                                {step}
                              </span>
                            </div>
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                              <div className="flex-1 mx-2 mt-[-18px]">
                                <div className={`h-0.5 rounded-full ${
                                  !isRejected && index < currentStep
                                    ? 'bg-white'
                                    : 'bg-neutral-800'
                                }`} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center gap-4 pt-3 border-t border-neutral-800/50">
                    <span className="text-neutral-500 text-xs">Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    <span className="text-neutral-500 text-xs">Deadline: {new Date(application.internship.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
