// Interns page - shows all hired/accepted applicants
// Displays intern name, email, internship, and applied date

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Intern = {
  id: number;
  name: string;
  email: string;
  internship: string;
};

export default function InternsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <p className="text-neutral-500 text-sm mt-1">Hired applicants managing their tasks</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {interns.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No hired interns yet.</p>
            <p className="text-neutral-600 text-xs mt-1">Interns will appear here once you accept their application.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Intern</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Internship</th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => (
                  <tr key={intern.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 text-sm font-medium shrink-0">
                          {intern.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white text-sm font-medium">{intern.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{intern.email}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{intern.internship}</td>
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
