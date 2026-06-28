// This is the Company Manager Dashboard - only accessible by users with COMPANY role
// On load, it checks if the user already has a company profile
// If NO company → redirects to /dashboard/company/create to set up their company
// If YES company → shows the full company dashboard with profile, internships, etc.

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useEffect, useState } from 'react';         // useEffect for auth check, useState for company data

export default function CompanyDashboard() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();
  const [company, setCompany] = useState(null);     // Stores the user's company data (null if none)
  const [loading, setLoading] = useState(true);     // Loading state while checking company

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Wait until session is loaded
    if (status === 'loading') return;

    // Block access if not a COMPANY user
    if (!session || session.user?.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    // Check if user has a company profile
    checkUserCompany();
  }, [session, status, router]);

  // Check if the current user has a company in the database
  const checkUserCompany = async () => {
    try {
      const response = await fetch('/api/company/get');
      const data = await response.json();

      if (!response.ok) {
        // No company found, user needs to create one
        setCompany(null);
        setLoading(false);
        return;
      }

      // Company found, set it
      setCompany(data.company);
      setLoading(false);
    } catch (error) {
      console.error('Error checking company:', error);
      setCompany(null);
      setLoading(false);
    }
  };

  // Show loading while session or company check is in progress
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // If user doesn't have a company, redirect to create company page
  if (!company) {
    router.push('/dashboard/company/create');
    return <p>Redirecting to create company...</p>;
  }

  // If they have a company, show the company dashboard
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Company Manager Dashboard</h1>
      <p>Welcome, {session.user?.name}! 🏢</p>
      <p style={{ color: '#666' }}>Company: {company.name}</p>

      {/* Quick Actions - navigation buttons to all company features */}
      <div style={{ marginTop: '30px' }}>
        <h2>Management</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {/* View Profile button */}
          <button
            onClick={() => router.push('/dashboard/company/profile')}
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
            <h3 style={{ margin: '0 0 5px 0' }}>📋 View Profile</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>View and edit company info</p>
          </button>

          {/* Post Internship button */}
          <button
            onClick={() => router.push('/dashboard/company/internships/new')}
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
            <h3 style={{ margin: '0 0 5px 0' }}>➕ Post Internship</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Create new job posting</p>
          </button>

          {/* View Internships button */}
          <button
            onClick={() => router.push('/dashboard/company/internships')}
            style={{
              padding: '20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>💼 View Internships</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>See all posted internships</p>
          </button>

          {/* View Applicants button */}
          <button
            onClick={() => router.push('/dashboard/company/applicants')}
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
            <h3 style={{ margin: '0 0 5px 0' }}>👥 View Applicants</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Review application pipeline</p>
          </button>

          {/* Manage Tasks button */}
          <button
            onClick={() => router.push('/dashboard/company/tasks')}
            style={{
              padding: '20px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>✅ Manage Tasks</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Create and assign tasks</p>
          </button>

          {/* Post Announcement button */}
          <button
            onClick={() => router.push('/dashboard/company/announcements')}
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
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Post updates for interns</p>
          </button>

          {/* Billing button */}
          <button
            onClick={() => router.push('/dashboard/company/billing')}
            style={{
              padding: '20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>💳 Billing</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Manage subscription plan</p>
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
