// This is the Browse Internships page - where applicants can view all available internships
// It displays internship listings from all companies
// Users can see title, company, description, slots, and deadline for each internship

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for an internship with company info
type Internship = {
  id: number;
  title: string;
  description: string;
  slots: number;
  deadline: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
  _count: {
    applications: number;
  };
};

export default function BrowseInternshipsPage() {
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

  // Fetch all internships from the browse API
  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internship/browse');
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
      <h1>Browse Internships</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show message if no internships exist */}
      {internships.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No internships available at the moment.</p>
        </div>
      ) : (
        /* Internships list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {internships.map((internship) => (
            <div
              key={internship.id}
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{internship.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    {internship.company.name} • {internship.company.industry}
                  </p>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#e9ecef',
                  fontSize: '12px'
                }}>
                  {internship._count.applications} applicant(s)
                </span>
              </div>
              <p style={{ margin: '10px 0', color: '#333', lineHeight: '1.5' }}>
                {internship.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                  Slots: {internship.slots} | Deadline: {new Date(internship.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
