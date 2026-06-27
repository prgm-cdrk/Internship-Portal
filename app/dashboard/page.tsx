// This is the dashboard page that users see after logging in
// It displays the logged-in user's information (name, email, role)
// It redirects to login if the user is not authenticated
// It has a logout button that signs the user out

'use client';

import { useSession, signOut } from 'next-auth/react';   // useSession gets current user, signOut logs out
import { useRouter } from 'next/navigation';              // useRouter for programmatic navigation
import { useEffect } from 'react';                       // useEffect for running code on status change

export default function DashboardPage() {
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

  // Fallback if no session exists
  if (!session) {
    return <p>Not authenticated</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>       {/* Display user's name from session */}
      <p>Email: {session.user?.email}</p>          {/* Display user's email from session */}
      <p>Role: {session.user?.role}</p>            {/* Display user's role (OWNER, COMPANY, APPLICANT) */}

      <button
        onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}   {/* Sign out and redirect to login */}
        style={{ padding: '10px', cursor: 'pointer', marginTop: '20px' }}
      >
        Logout
      </button>
    </div>
  );
}
