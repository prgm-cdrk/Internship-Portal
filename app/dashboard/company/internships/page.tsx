// Internship Listings page - shows all internships posted by the company
// Fetches internships from /api/internship/get
// Displays each internship with title, slots, deadline, and applicant count

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
  _count: { applications: number };
};

export default function InternshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchInternships();
  }, [status]);

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internship/get');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load internships');
        setLoading(false);
        return;
      }
      setInternships(data.internships);
      setLoading(false);
    } catch (err) {
      setError('Failed to load internships');
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Internships</h1>
        <button onClick={() => router.push('/dashboard/company/internships/new')} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
          + New Internship
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {internships.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500 mb-4">No internships posted yet.</p>
          <button onClick={() => router.push('/dashboard/company/internships/new')} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
            Post Your First Internship
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {internships.map((internship) => (
            <div key={internship.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium text-sm">{internship.title}</h3>
                  <p className="text-neutral-500 text-xs mt-1 line-clamp-2">
                    {(() => { const t = internship.description.replace(/<[^>]*>/g, '').trim(); return t.length > 120 ? t.substring(0, 120) + '...' : t; })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 mt-3 text-xs text-neutral-500">
                <span><span className="text-neutral-600">Slots:</span> {internship.slots}</span>
                <span><span className="text-neutral-600">Applicants:</span> {internship._count.applications}</span>
                <span><span className="text-neutral-600">Deadline:</span> {new Date(internship.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
