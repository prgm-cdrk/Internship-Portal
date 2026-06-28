// Applicant Pipeline page - shows all applicants who applied to the company's internships
// Fetches applications from /api/application/get
// Displays applicant name, email, internship, and status

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Application = {
  id: number;
  status: string;
  appliedAt: string;
  user: { id: number; name: string; email: string };
  internship: { id: number; title: string };
};

const statusStyles: Record<string, string> = {
  APPLIED: 'bg-neutral-700 text-neutral-300 border border-neutral-600',
  REVIEWED: 'bg-neutral-700 text-neutral-300 border border-neutral-600',
  INTERVIEW: 'bg-neutral-700 text-white border border-neutral-500',
  ACCEPTED: 'bg-white text-black border border-white',
  REJECTED: 'bg-neutral-800 text-neutral-500 border border-neutral-700',
};

export default function ApplicantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchApplications();
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
    } catch (err) {
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-white mb-6">Applicants</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {['ALL', 'APPLIED', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500">{filter === 'ALL' ? 'No applications received yet.' : `No applications with status "${filter}".`}</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Applicant</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Internship</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white text-sm font-medium">{app.user.name}</p>
                    <p className="text-neutral-500 text-xs">{app.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-neutral-400 text-sm">{app.internship.title}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[app.status] || 'bg-neutral-700 text-neutral-400'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
