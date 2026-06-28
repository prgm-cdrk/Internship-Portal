// Dashboard layout - wraps all /dashboard/* pages
// Sidebar + Header + Main content area

import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-dark-950 flex flex-col">
      {/* Header spans full width */}
      <DashboardHeader />

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
