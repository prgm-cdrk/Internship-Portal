// This is the Announcements page - where company managers post updates for their interns
// It displays all announcements with title, content, and date
// Company managers can create new announcements using a form

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data and form, useEffect for fetching

// Type definition for an announcement
type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);  // List of announcements
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [showForm, setShowForm] = useState(false);  // Toggle create announcement form

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Fetch all announcements for this company
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcement/get');
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

  // Handle creating a new announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();     // Prevent page reload
    setError('');           // Clear previous errors
    setSaving(true);        // Show saving state

    // Validate required fields
    if (!title || !content) {
      setError('Title and content are required');
      setSaving(false);
      return;
    }

    try {
      // Send announcement data to the API endpoint
      const response = await fetch('/api/announcement/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();

      // If the server returned an error, display it
      if (!response.ok) {
        setError(data.error || 'Failed to create announcement');
        setSaving(false);
        return;
      }

      // Clear form, hide form, and refresh announcements list
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

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Announcements</h1>
        <button
          onClick={() => setShowForm(!showForm)}   // Toggle the create announcement form
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: showForm ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create Announcement Form - shown when showForm is true */}
      {showForm && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Post New Announcement</h3>
          <form onSubmit={handleCreateAnnouncement}>
            {/* Announcement title */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Title:</strong></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="e.g. Office Holiday Schedule"
              />
            </div>

            {/* Announcement content */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Content:</strong></label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '150px' }}
                placeholder="Write your announcement here..."
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              {saving ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Show message if no announcements exist */}
      {announcements.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No announcements yet.</p>
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
                <h3 style={{ margin: '0 0 10px 0' }}>{announcement.title}</h3>
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#333', lineHeight: '1.5' }}>
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
