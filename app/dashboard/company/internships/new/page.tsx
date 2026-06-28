// Internship Posting form page - create new internship listings
// Collects title, description, available slots, and application deadline
// On submit, sends data to API which saves to database

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NewInternshipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !description || !slots || !deadline) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (parseInt(slots) < 1) {
      setError('Slots must be at least 1');
      setLoading(false);
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be a future date');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/internship/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, slots: parseInt(slots), deadline })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create internship');
        setLoading(false);
        return;
      }
      router.push('/dashboard/company/internships');
    } catch (err) {
      setError('Failed to create internship');
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold text-white mb-6">Post New Internship</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Software Engineering Intern" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and requirements..." rows={6} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Available Slots</label>
              <input type="number" value={slots} onChange={(e) => setSlots(e.target.value)} min="1" placeholder="Number of positions" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Application Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50">
              {loading ? 'Posting...' : 'Post Internship'}
            </button>
            <button type="button" onClick={() => router.push('/dashboard/company/internships')} className="px-4 py-2 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-lg hover:bg-neutral-700 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
