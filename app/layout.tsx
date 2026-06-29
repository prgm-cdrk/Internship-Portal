// This is the root layout for the entire Next.js application
// Every page in the app goes through this layout
// It wraps all pages with the AuthProvider so session handling works everywhere

import type { Metadata } from "next";
import { AuthProvider } from "@/lib/SessionProvider";
import "./globals.css";

// Satoshi font from Fontshare CDN
const satoshiLink = "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap";

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
      <head>
        <link rel="stylesheet" href={satoshiLink} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="font-sans">
        {/* AuthProvider wraps children so useSession() works in any page */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
