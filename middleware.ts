// This middleware runs on every matched route before the page loads
// It checks if the user is authenticated before allowing access to protected routes
// If not authenticated, it redirects the user to the login page
// Protected routes are listed in the matcher config below

import { auth } from "@/lib/auth";                                   // Import auth function to check session
import { NextRequest, NextResponse } from "next/server";            // Next.js request/response types

export async function middleware(request: NextRequest) {
  const session = await auth();   // Get the current session (returns null if not logged in)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];

  // Check if current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to continue if authenticated or on a public route
  return NextResponse.next();
}

// Only run this middleware on dashboard routes
export const config = {
  matcher: ['/dashboard/:path*']
};
