// This is the Owner Dashboard page - only accessible by users with OWNER role
// It shows an admin overview with stats (companies, users, internships, revenue)
// It provides quick action buttons to manage the platform
// Unauthorized users (non-owners) see an "Access denied" message

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for redirecting
import { useEffect } from 'react';                       // useEffect for checking auth status

export default function OwnerDashboard() {
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

  // Block access if not authenticated or not an OWNER
  if (!session || session.user?.role !== 'OWNER') {
    return <p>Access denied. Owner only.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Owner Dashboard</h1>
      <p>Welcome, {session.user?.name}! 👑</p>

      {/* Admin overview section with stats cards */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Admin Overview</h2>
        
        {/* Stats grid - 4 columns showing key metrics (placeholder values until connected to DB) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Total Companies</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will fetch from database later */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will fetch from database later */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Total Internships</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>   {/* Will fetch from database later */}
          </div>
          
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₱0</p>  {/* Will connect to Stripe later */}
          </div>
        </div>

        {/* Quick action buttons for admin tasks */}
        <div style={{ marginTop: '20px' }}>
          <h3>Quick Actions</h3>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            Manage Users       {/* Will link to user management page */}
          </button>
          <button style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>
            View Subscriptions  {/* Will link to subscription overview */}
          </button>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
            View Analytics      {/* Will link to analytics page */}
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
