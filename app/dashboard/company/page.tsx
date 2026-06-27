// This is the Company Manager Dashboard page - only accessible by users with COMPANY role
// It shows a company overview with stats (internships, applicants, tasks, subscription)
// It provides quick action buttons for managing internships, applicants, and tasks
// Unauthorized users (non-company) see an "Access denied" message

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for redirecting
import { useEffect } from 'react';                       // useEffect for checking auth status

export default function CompanyDashboard() {
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

  // Block access if not authenticated or not a COMPANY manager
  if (!session || session.user?.role !== 'COMPANY') {
    return <p>Access denied. Company managers only.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Company Manager Dashboard</h1>
      <p>Welcome, {session.user?.name}! 🏢</p>

      {/* Company overview section with stats cards */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Your Company Overview</h2>
        
        {/* Stats grid - 4 columns showing company-specific metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Active Internships</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will count from Internship model */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Total Applicants</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will count from Application model */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Pending Tasks</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will count from Task model */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Subscription</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Free</p>  {/* Will fetch from Subscription model */}
          </div>
        </div>

        {/* Quick action buttons for company management tasks */}
        <div style={{ marginTop: '20px' }}>
          <h3>Quick Actions</h3>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            Post New Internship    {/* Will open internship posting form */}
          </button>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            View Applicants        {/* Will link to applicant pipeline */}
          </button>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            Manage Tasks           {/* Will link to task assignment page */}
          </button>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Post Announcement      {/* Will open announcement form */}
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
