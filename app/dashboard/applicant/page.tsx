// This is the Applicant Dashboard page - only accessible by users with APPLICANT role
// It shows the applicant's application and task stats
// It provides quick action buttons to browse internships, view applications, and manage tasks
// Unauthorized users (non-applicants) see an "Access denied" message

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for redirecting
import { useEffect } from 'react';                       // useEffect for checking auth status

export default function ApplicantDashboard() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while session is being fetched
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // Block access if not authenticated or not an APPLICANT
  if (!session || session.user?.role !== 'APPLICANT') {
    return <p>Access denied. Applicants only.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Applicant Dashboard</h1>
      <p>Welcome, {session.user?.name}! 👤</p>

      {/* Quick Actions - navigation buttons to all applicant features */}
      <div style={{ marginTop: '30px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {/* Browse Internships button */}
          <button
            onClick={() => router.push('/dashboard/applicant/internships')}
            style={{
              padding: '20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>🔍 Browse Internships</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Find and apply to jobs</p>
          </button>

          {/* My Applications button */}
          <button
            onClick={() => router.push('/dashboard/applicant/applications')}
            style={{
              padding: '20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>📋 My Applications</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Track application status</p>
          </button>

          {/* My Tasks button */}
          <button
            onClick={() => router.push('/dashboard/applicant/tasks')}
            style={{
              padding: '20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>✅ My Tasks</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>View assigned tasks</p>
          </button>

          {/* Announcements button */}
          <button
            onClick={() => router.push('/dashboard/applicant/announcements')}
            style={{
              padding: '20px',
              backgroundColor: '#e91e63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>📢 Announcements</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>See company updates</p>
          </button>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
        style={{
          marginTop: '40px',
          padding: '10px 20px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}
