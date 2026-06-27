// This file wraps NextAuth's SessionProvider into a reusable component
// It must be a client component ('use client') because SessionProvider uses React context
// This is needed so that useSession() works in any client component throughout the app

'use client';

import { SessionProvider } from 'next-auth/react';

// AuthProvider wraps the app with SessionProvider to provide session data to all child components
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
