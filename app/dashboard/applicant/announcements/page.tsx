// This is the Announcements page - where applicants can see announcements from companies
// It displays announcements from companies they've applied to or have tasks from
// Each announcement shows the company name, title, content, and date

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for an announcement with company info
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
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);  // List of announcements
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch announcements when session is ready
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnnouncements();
    }
  }, [status]);

  // Fetch all announcements for this applicant
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcement/my');
      const data = await response.json();

      // If request failed, show error
      if (!response.ok) {
        setError(data.error || 'Failed to load announcements');
        setLoading(false);
        return;
      }

      // Set announcements data
      setAnnouncements(data.announcements);
      setLoading(false);
    } catch (err) {
      setError('Failed to load announcements');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Announcements</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show message if no announcements exist */}
      {announcements.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No announcements from your companies yet.</p>
        </div>
      ) : (
        /* Announcements list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{announcement.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    {announcement.company.name} • {announcement.company.industry}
                  </p>
                </div>
              </div>
              <p style={{ margin: '10px 0', color: '#333', lineHeight: '1.5' }}>
                {announcement.content}
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                Posted on {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
