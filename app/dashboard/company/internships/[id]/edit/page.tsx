// Edit Internship page - allows company manager to update an existing internship
// Fetches current data from /api/internship/[id] and pre-fills the form
// On save, sends PUT request to /api/internship/[id]

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditInternshipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && id) fetchInternship();
  }, [status, id]);

  const fetchInternship = async () => {
    try {
      const response = await fetch(`/api/internship/${id}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load internship');
        setFetching(false);
        return;
      }
      setTitle(data.internship.title);
      setDescription(data.internship.description);
      setSlots(String(data.internship.slots));
      setDeadline(new Date(data.internship.deadline).toISOString().split('T')[0]);
      setFetching(false);
    } catch {
      setError('Failed to load internship');
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const descText = description.replace(/<[^>]*>/g, '').trim();
    if (!title || !descText || !slots || !deadline) {
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
      const response = await fetch(`/api/internship/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, slots: parseInt(slots), deadline })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update internship');
        setLoading(false);
        return;
      }
      router.push('/dashboard/company/internships');
    } catch {
      setError('Failed to update internship');
      setLoading(false);
    }
  };

  if (status === 'loading' || fetching) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full dashboard-grid">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/company/internships')}
            className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Edit Internship</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Update the internship listing details</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">

            {/* Title section */}
            <div className="p-6 border-b border-neutral-800">
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Internship Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software Engineering Intern"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            {/* Description section */}
            <div className="p-6 border-b border-neutral-800">
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Description</label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe the role, responsibilities, requirements, and what the intern will learn..."
              />
              <p className="text-neutral-600 text-xs mt-2">Use the toolbar for formatting — bold, headings, bullet lists, etc.</p>
            </div>

            {/* Slots and Deadline section */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Available Slots</label>
                  <input
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    min="1"
                    placeholder="Number of positions"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/company/internships')}
              className="px-6 py-3 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-xl hover:bg-neutral-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
