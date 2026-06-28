// Track Applications page - applicants can see all their internship applications
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

const statusLabels: Record<string, string> = {
  APPLIED: 'Applied',
  REVIEWED: 'Reviewed',
  INTERVIEW: 'Interview',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
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
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
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
          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium">{application.internship.title}</h3>
                    <p className="text-neutral-500 text-sm mt-0.5">
                      {application.internship.company.name} &bull; {application.internship.company.industry}
                    </p>
                    <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{application.internship.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-neutral-500 text-xs">Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                      <span className="text-neutral-500 text-xs">Deadline: {new Date(application.internship.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700 shrink-0">
                    {statusLabels[application.status] || application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
