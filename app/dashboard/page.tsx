//This page just checks the role and redirects. 
// Users never actually see this page — it's just a router.

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Route based on user role
    const userRole = session.user?.role;
    if (userRole === 'OWNER') {
      router.push('/dashboard/owner');
    } else if (userRole === 'COMPANY') {
      router.push('/dashboard/company');
    } else if (userRole === 'APPLICANT') {
      router.push('/dashboard/applicant');
    } else if (userRole === 'STAFF') {
      router.push('/dashboard/staff');
    }
  }, [session, status, router]);

  return <p>Redirecting to your dashboard...</p>;
}