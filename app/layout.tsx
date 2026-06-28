// This is the root layout for the entire Next.js application
// Every page in the app goes through this layout
// It wraps all pages with the AuthProvider so session handling works everywhere

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/SessionProvider";
import "./globals.css";

// Plus Jakarta Sans font from Google Fonts
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

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
      <body className={jakarta.className}>
        {/* AuthProvider wraps children so useSession() works in any page */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
