// Announcements page - post updates for interns
// Displays all announcements with title, content, and date
// Company managers can create new announcements

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchAnnouncements();
  }, [status]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcement/get');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load announcements');
        setLoading(false);
        return;
      }
      setAnnouncements(data.announcements);
      setLoading(false);
    } catch (err) {
      setError('Failed to load announcements');
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!title || !content) {
      setError('Title and content are required');
      setSaving(false);
      return;
    }
    try {
      const response = await fetch('/api/announcement/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create announcement');
        setSaving(false);
        return;
      }
      setTitle('');
      setContent('');
      setShowForm(false);
      setSaving(false);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to create announcement');
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showForm ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'bg-white text-black hover:bg-neutral-200'}`}>
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Create Announcement Form */}
      {showForm && (
        <form onSubmit={handleCreateAnnouncement} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Office Holiday Schedule" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement here..." rows={6} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none" />
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50">
            {saving ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <h3 className="text-white font-medium text-sm">{announcement.title}</h3>
              <p className="text-neutral-400 text-xs mt-2 leading-relaxed">{announcement.content}</p>
              <p className="text-neutral-600 text-xs mt-3">{new Date(announcement.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
