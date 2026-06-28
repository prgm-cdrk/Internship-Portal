// Browse Internships page - applicants can view all available internships
// Uses monotone dark theme matching company manager pages

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

type AppliedIds = {
  [key: number]: boolean;
};

export default function BrowseInternshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedIds, setAppliedIds] = useState<AppliedIds>({});
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInternships();
    }
  }, [status]);

  const handleApply = async (internshipId: number) => {
    setError('');
    setApplyingId(internshipId);
    try {
      const response = await fetch('/api/application/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to apply');
        setApplyingId(null);
        return;
      }
      setAppliedIds(prev => ({ ...prev, [internshipId]: true }));
      setApplyingId(null);
    } catch {
      setError('Failed to apply');
      setApplyingId(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-white tracking-wide">Browse Internships</h1>
          <p className="text-neutral-500 text-sm mt-1">Find and apply to opportunities</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {internships.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No internships available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium">{internship.title}</h3>
                    <p className="text-neutral-500 text-sm mt-0.5">
                      {internship.company.name} &bull; {internship.company.industry}
                    </p>
                    <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{internship.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-neutral-500 text-xs">Slots: {internship.slots}</span>
                      <span className="text-neutral-500 text-xs">Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                      <span className="text-neutral-600 text-xs">{internship._count.applications} applicant(s)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(internship.id)}
                    disabled={appliedIds[internship.id] || applyingId === internship.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                      appliedIds[internship.id]
                        ? 'bg-neutral-800 text-neutral-500 cursor-default'
                        : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                    }`}
                  >
                    {appliedIds[internship.id] ? 'Applied' : applyingId === internship.id ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
