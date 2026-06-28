// This is the Company Manager Dashboard - only accessible by users with COMPANY role
// On load, it checks if the user already has a company profile
// If NO company → redirects to /dashboard/company/create to set up their company
// If YES company → shows the full company dashboard with profile, internships, etc.

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
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
    <div style={{ padding: '20px' }}>
      <h1>Company Manager Dashboard</h1>
      <p>Welcome, {session.user?.name}! 🏢</p>
      <p>Company: {company.name}</p>
    </div>
  );
}
