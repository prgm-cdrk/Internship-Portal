// This is the Internship Listings page - shows all internships posted by the company
// It fetches internships from /api/internship/get
// Displays each internship with title, slots, deadline, and applicant count
// Company managers can view, edit, or delete their listings

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for an internship
type Internship = {
  id: number;
  title: string;
  description: string;
  slots: number;
  deadline: string;
  createdAt: string;
  _count: {
    applications: number;   // Number of applicants for this internship
  };
};

export default function InternshipsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [internships, setInternships] = useState<Internship[]>([]);  // List of internships
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch internships when session is ready
  useEffect(() => {
    if (status === 'authenticated') {
      fetchInternships();
    }
  }, [status]);

  // Fetch all internships for this company
  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internship/get');
      const data = await response.json();

      // If request failed, show error
      if (!response.ok) {
        setError(data.error || 'Failed to load internships');
        setLoading(false);
        return;
      }

      // Set internships data
      setInternships(data.internships);
      setLoading(false);
    } catch (err) {
      setError('Failed to load internships');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Internship Listings</h1>
        <button
          onClick={() => router.push('/dashboard/company/internships/new')}   // Go to create new internship
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          + Post New Internship
        </button>
      </div>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show message if no internships exist */}
      {internships.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No internships posted yet.</p>
          <button
            onClick={() => router.push('/dashboard/company/internships/new')}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              marginTop: '10px',
            }}
          >
            Post Your First Internship
          </button>
        </div>
      ) : (
        /* List of internship cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {internships.map((internship) => (
            <div
              key={internship.id}
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{internship.title}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    {internship.description.length > 100
                      ? internship.description.substring(0, 100) + '...'   // Truncate long descriptions
                      : internship.description}
                  </p>
                </div>
              </div>

              {/* Internship stats */}
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#555' }}>
                <span><strong>Slots:</strong> {internship.slots}</span>
                <span><strong>Applicants:</strong> {internship._count.applications}</span>
                <span>
                  <strong>Deadline:</strong>{' '}
                  {new Date(internship.deadline).toLocaleDateString()}   {/* Format deadline date */}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
