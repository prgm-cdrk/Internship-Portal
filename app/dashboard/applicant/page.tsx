// This is the Applicant Dashboard page - only accessible by users with APPLICANT role
// It shows the applicant's application and task stats
// It provides quick action buttons to browse internships, view applications, and manage tasks
// Unauthorized users (non-applicants) see an "Access denied" message

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for redirecting
import { useEffect } from 'react';                       // useEffect for checking auth status

export default function ApplicantDashboard() {
  // Get the current session and loading status
  const { data: session, status } = useSession();
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
    <div style={{ padding: '20px' }}>
      <h1>Applicant Dashboard</h1>
      <p>Welcome, {session.user?.name}! 👤</p>

      {/* Applications and tasks overview section with stats cards */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Your Applications & Tasks</h2>
        
        {/* Stats grid - 3 columns showing applicant-specific metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Applications</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>        {/* Will count from Application model */}
            <p style={{ fontSize: '12px', color: '#666' }}>Submitted</p>
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Pending Tasks</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>        {/* Will count from Task model */}
            <p style={{ fontSize: '12px', color: '#666' }}>To Complete</p>
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Accepted</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>        {/* Will count applications with ACCEPTED status */}
            <p style={{ fontSize: '12px', color: '#666' }}>Offers</p>
          </div>
        </div>

        {/* Quick action buttons for applicant tasks */}
        <div style={{ marginTop: '20px' }}>
          <h3>Quick Actions</h3>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            Browse Internships     {/* Will link to public job board */}
          </button>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            My Applications        {/* Will link to application tracker */}
          </button>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            My Tasks               {/* Will link to assigned tasks */}
          </button>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Announcements          {/* Will link to announcements view */}
          </button>
        </div>
      </div>

      {/* Logout button - signs user out and redirects to login */}
      <button
        onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white' }}
      >
        Logout
      </button>
    </div>
  );
}
