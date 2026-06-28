// Dashboard layout - wraps all /dashboard/* pages
// Adds the shared header and wraps with SessionProvider

import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardHeader />
      {children}
    </div>
  );
}
