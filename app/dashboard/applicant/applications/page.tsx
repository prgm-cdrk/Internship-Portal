// This is the Track Applications page - where applicants can see all their internship applications
// It displays each application with the internship title, company name, and status
// Status options: APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for an application with internship and company info
type Application = {
  id: number;
  status: string;
  appliedAt: string;
  internship: {
    id: number;
    title: string;
    description: string;
    deadline: string;
    company: {
      id: number;
      name: string;
      industry: string;
    };
  };
};

// Color mapping for application statuses
const statusColors: { [key: string]: string } = {
  APPLIED: '#007bff',      // Blue - just applied
  REVIEWED: '#ffc107',     // Yellow - being reviewed
  INTERVIEW: '#17a2b8',    // Cyan - interview scheduled
  ACCEPTED: '#28a745',     // Green - accepted
  REJECTED: '#dc3545'      // Red - rejected
};

export default function TrackApplicationsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [applications, setApplications] = useState<Application[]>([]);  // List of applications
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch applications when session is ready
  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status]);

  // Fetch all applications for this applicant
  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/application/my');
      const data = await response.json();

      // If request failed, show error
      if (!response.ok) {
        setError(data.error || 'Failed to load applications');
        setLoading(false);
        return;
      }

      // Set applications data
      setApplications(data.applications);
      setLoading(false);
    } catch (err) {
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Applications</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show message if no applications exist */}
      {applications.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>You haven&apos;t applied to any internships yet.</p>
        </div>
      ) : (
        /* Applications list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {applications.map((application) => (
            <div
              key={application.id}
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{application.internship.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    {application.internship.company.name} • {application.internship.company.industry}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: statusColors[application.status] || '#6c757d',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {application.status}
                </span>
              </div>
              <p style={{ margin: '10px 0', color: '#333', lineHeight: '1.5' }}>
                {application.internship.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                  Applied: {new Date(application.appliedAt).toLocaleDateString()} | Deadline: {new Date(application.internship.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
