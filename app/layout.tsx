// This is the root layout for the entire Next.js application
// Every page in the app goes through this layout
// It wraps all pages with the AuthProvider so session handling works everywhere

import type { Metadata } from "next";
import { AuthProvider } from "@/lib/SessionProvider";

// Metadata for the app - shows in the browser tab title
export const metadata: Metadata = {
  title: "Internship Portal",
};

// RootLayout is the main wrapper for all pages
// children = the page content being rendered (e.g., /login, /register, /dashboard)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider wraps children so useSession() works in any page */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
