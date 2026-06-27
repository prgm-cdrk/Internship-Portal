// This is the NextAuth catch-all API route
// It handles all authentication-related requests (sign in, sign out, session, etc.)
// It uses the handlers exported from lib/auth.ts which contains the NextAuth configuration

import { handlers } from "@/lib/auth";

// Export GET and POST handlers from NextAuth
// GET - handles requests like fetching session, CSRF token, provider list
// POST - handles sign in, sign out, and other mutations
export const { GET, POST } = handlers;
