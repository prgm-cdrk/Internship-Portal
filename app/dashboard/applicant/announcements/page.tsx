// Announcements page - applicants can see announcements from companies
// Uses monotone dark theme matching company manager pages

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
};

export default function MyAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnnouncements();
    }
  }, [status]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcement/my');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load announcements');
        setLoading(false);
        return;
      }
      setAnnouncements(data.announcements);
      setLoading(false);
    } catch {
      setError('Failed to load announcements');
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Announcements</h1>
          <p className="text-neutral-500 text-sm mt-1">See company updates</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No announcements from your companies yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium">{announcement.title}</h3>
                    <p className="text-neutral-500 text-sm mt-0.5">
                      {announcement.company.name} &bull; {announcement.company.industry}
                    </p>
                    <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{announcement.content}</p>
                    <p className="text-neutral-600 text-xs mt-3">Posted on {new Date(announcement.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
