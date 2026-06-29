// Owner Internships Overview — view all internships across all companies
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
  company: { id: number; name: string; industry: string };
  _count: { applications: number };
};

export default function OwnerInternshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { if (status === 'authenticated') fetchInternships(); }, [status]);

  const fetchInternships = async () => {
    const res = await fetch(`/api/owner/internships?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setInternships(data.internships || []);
    setLoading(false);
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">All Internships</h1>
          <p className="text-neutral-500 text-sm mt-1">View every internship listing across all companies</p>
        </div>

        <div className="relative max-w-sm mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInternships()}
            placeholder="Search by title or company..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600" />
        </div>

        {internships.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center"><p className="text-neutral-500">No internships found.</p></div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-neutral-800">
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Slots</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Applicants</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Deadline</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Created</th>
              </tr></thead>
              <tbody>
                {internships.map((i) => (
                  <tr key={i.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{i.title}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{i.company.name}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{i.slots}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{i._count.applications}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{new Date(i.deadline).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
