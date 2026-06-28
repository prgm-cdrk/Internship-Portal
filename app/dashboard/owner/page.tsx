// This is the Owner Dashboard page - only accessible by users with OWNER role
// It shows system-wide statistics: total users, companies, internships, revenue
// It provides quick action buttons to manage users, companies, and subscriptions
// Unauthorized users (non-owners) see an "Access denied" message

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for redirecting
import { useState, useEffect } from 'react';              // useState for data, useEffect for fetching

export default function OwnerDashboard() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State for platform statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalInternships: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages

  // Redirect to login if user is not authenticated or not OWNER
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Wait until session is loaded
    if (status === 'loading') return;

    // Block access if not OWNER
    if (session?.user?.role !== 'OWNER') {
      router.push('/login');
      return;
    }

    // Fetch platform statistics when session is ready
    fetchStats();
  }, [status, session, router]);

  // Fetch platform-wide statistics from the admin API
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/owner/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      } else {
        setError('Failed to load statistics');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
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

      {/* Display error message if any */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {/* System Overview Stats - shows key platform metrics */}
      <div style={{ marginTop: '30px' }}>
        <h2>System Overview</h2>
        
        {/* Stats grid - responsive columns showing key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {/* Total Users card */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{stats.totalUsers}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>Applicants + Companies</p>
          </div>
          
          {/* Total Companies card */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>Total Companies</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.totalCompanies}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>Registered employers</p>
          </div>
          
          {/* Total Internships card */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>Total Internships</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>{stats.totalInternships}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>Job postings</p>
          </div>
          
          {/* Active Subscriptions card */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>Active Subscriptions</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>{stats.activeSubscriptions}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>Paid plans</p>
          </div>

          {/* Total Revenue card */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>₱{stats.totalRevenue.toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>From subscriptions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - navigation buttons to management pages */}
      <div style={{ marginTop: '40px' }}>
        <h2>Management</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }}>
          {/* Manage Users button */}
          <button
            onClick={() => router.push('/dashboard/owner/users')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 Manage Users
          </button>

          {/* Manage Companies button */}
          <button
            onClick={() => router.push('/dashboard/owner/companies')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🏢 Manage Companies
          </button>

          {/* Subscriptions button */}
          <button
            onClick={() => router.push('/dashboard/owner/subscriptions')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💳 Subscriptions
          </button>

          {/* System Settings button */}
          <button
            onClick={() => router.push('/dashboard/owner/settings')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⚙️ System Settings
          </button>
        </div>
      </div>

      {/* Logout button - signs user out and redirects to login */}
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
