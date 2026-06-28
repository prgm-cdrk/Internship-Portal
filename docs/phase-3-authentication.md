# Phase 3 — Authentication

## Overview
This phase implements the complete authentication system using NextAuth v5 with a credentials provider. Users can register with email/password, log in, and access protected routes. The system supports three user roles: Owner, Company Manager, and Applicant.

## What Was Done

### 1. NextAuth v5 Configuration (`lib/auth.ts`)
The main auth configuration using the NextAuth v5 beta pattern:

- **Credentials Provider** — Email/password login
- **JWT Strategy** — Session stored in JWT (not database sessions)
- **Session Callbacks** — Extends session with user ID, email, name, and role
- **JWT Callbacks** — Stores user ID and role in the JWT token

### 2. NextAuth API Route (`app/api/auth/[...nextauth]/route.ts`)
Single API route that handles all NextAuth endpoints:
- `GET /api/auth/session` — Get current session
- `POST /api/auth/signin` — Sign in
- `POST /api/auth/signout` — Sign out

### 3. Registration Page (`app/register/page.tsx`)
- Form with: name, email, password, role selection (COMPANY or APPLICANT)
- OWNER role removed from registration (created manually)
- Client-side validation
- Error messages for duplicate emails
- Auto-redirect to login on success

### 4. Registration API (`app/api/auth/register/route.ts`)
- POST endpoint at `/api/auth/register`
- Validates input (email, password, name, role)
- Hashes password with bcryptjs
- Creates User record in database
- Returns success/error response

### 5. Login Page (`app/login/page.tsx`)
- Email/password form
- Uses NextAuth's `signIn()` function
- Error handling for invalid credentials
- Loading state during authentication

### 6. Middleware (`middleware.ts`)
- Runs on every matched route before the page loads
- Checks if the user has a valid session
- Redirects unauthenticated users to `/login`
- Only active on `/dashboard/*` routes

### 7. Session Provider (`lib/SessionProvider.tsx`)
Client-side wrapper component that provides session context to the app.

### 8. Root Layout (`app/layout.tsx`)
Updated to wrap the app with `AuthProvider` so `useSession()` works in all client components.

## Files Created
```
lib/
├── auth.ts                    # NextAuth v5 configuration
├── SessionProvider.tsx        # Client-side session provider

app/
├── register/
│   └── page.tsx               # Registration form
├── login/
│   └── page.tsx               # Login form
├── layout.tsx                 # Root layout with AuthProvider
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts       # NextAuth API route

middleware.ts                  # Route protection
```

## API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth session/signin/signout |

## Test User
A test user was created directly in the database:
```
Email: test@test.com
Password: password123
Role: APPLICANT
```

## Commands Used
```bash
# Install NextAuth
npm install next-auth@5.0.0-beta.31

# Install bcryptjs for password hashing
npm install bcryptjs @types/bcryptjs
```

## Key Decisions
- **NextAuth v5 beta** — Uses the new `handlers` export pattern (`GET` and `POST` from `NextAuth`)
- **JWT sessions** — More scalable than database sessions, works with static hosting
- **No OAuth providers** — Only credentials-based authentication for this phase
- **OWNER role excluded from registration** — Created manually in database only

## NextAuth v5 Configuration Structure
```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // Find user by email
        // Compare password with bcrypt
        // Return user object or null
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Store user ID and role in JWT
    },
    session: async ({ session, token }) => {
      // Extend session with user ID and role
    }
  }
});
```

## Lessons Learned
- NextAuth v5 beta uses `handlers` (not `handler`) for the API route export
- Edge runtime cannot resolve custom Prisma output paths — use default `@prisma/client`
- The `auth()` function can be used in middleware and API routes to check session
- `useSession()` only works in client components (use `'use client'` directive)
- Cold start with PostgreSQL pooler takes ~5-10 seconds on first request
