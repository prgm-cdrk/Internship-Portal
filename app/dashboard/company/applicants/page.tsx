// This is the Applicant Pipeline page - shows all applicants who applied to the company's internships
// It fetches applications from /api/application/get
// Displays applicant name, email, which internship they applied to, and their status
// Company managers can see the pipeline and update application status

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for an application
type Application = {
  id: number;
  status: string;          // APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED
  appliedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  internship: {
    id: number;
    title: string;
  };
};

// Status colors for visual indicators
const statusColors: Record<string, string> = {
  APPLIED: '#17a2b8',      // Blue
  REVIEWED: '#ffc107',     // Yellow
  INTERVIEW: '#fd7e14',    // Orange
  ACCEPTED: '#28a745',     // Green
  REJECTED: '#dc3545',     // Red
};

export default function ApplicantsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [applications, setApplications] = useState<Application[]>([]);  // List of applications
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [filter, setFilter] = useState('ALL');      // Filter by status

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

  // Fetch all applications for this company's internships
  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/application/get');
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

  // Filter applications based on selected status
  const filteredApplications = filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Applicant Pipeline</h1>
      <p>Manage applicants who applied to your internships.</p>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Status filter buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'APPLIED', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((statusOption) => (
          <button
            key={statusOption}
            onClick={() => setFilter(statusOption)}   // Set filter to selected status
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: filter === statusOption ? '#007bff' : '#e9ecef',
              color: filter === statusOption ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              fontSize: '14px',
            }}
          >
            {statusOption}
          </button>
        ))}
      </div>

      {/* Show message if no applications exist */}
      {filteredApplications.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>{filter === 'ALL' ? 'No applications received yet.' : `No applications with status "${filter}".`}</p>
        </div>
      ) : (
        /* Applications table */
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Applicant</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Internship</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Applied</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  {/* Applicant name and email */}
                  <td style={{ padding: '12px' }}>
                    <strong>{application.user.name}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#666' }}>{application.user.email}</span>
                  </td>

                  {/* Internship title */}
                  <td style={{ padding: '12px' }}>{application.internship.title}</td>

                  {/* Status badge */}
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: statusColors[application.status] || '#6c757d',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {application.status}
                    </span>
                  </td>

                  {/* Application date */}
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
