# Phase 4 — Role-Based Dashboards

## Overview
This phase implements role-based dashboards that redirect users to the appropriate dashboard based on their role. Each role (Owner, Company Manager, Applicant) gets a dedicated dashboard with role-specific content.

## What Was Done

### 1. Role-Based Router (`app/dashboard/page.tsx`)
The main dashboard page acts as a router that:
- Checks the user's session for their role
- Redirects them to the appropriate dashboard page
- Shows a loading state while fetching the session

### 2. Owner Dashboard (`app/dashboard/owner/page.tsx`)
- Displays owner-specific content
- Includes links to manage users, view reports, and manage companies
- Placeholder content showing the portal overview

### 3. Company Dashboard (`app/dashboard/company/page.tsx`)
- Checks if the company has a profile created
- If no profile exists → redirects to company creation page
- If profile exists → shows company management options:
  - Post internships
  - View applicants
  - Manage tasks
  - Post announcements
- Links to sub-pages for each feature

### 4. Applicant Dashboard (`app/dashboard/applicant/page.tsx`)
- Displays applicant-specific content
- Shows available internships
- Shows application history
- Placeholder content for upcoming features

## Files Created
```
app/
└── dashboard/
    ├── page.tsx               # Role-based router
    ├── owner/
    │   └── page.tsx           # Owner dashboard
    ├── company/
    │   └── page.tsx           # Company dashboard (checks for company profile)
    └── applicant/
        └── page.tsx           # Applicant dashboard
```

## Dashboard Structure
```
/dashboard
├── page.tsx          → Routes to /dashboard/{role}
├── owner/
│   └── page.tsx      → Owner dashboard (manage users, companies, reports)
├── company/
│   └── page.tsx      → Company dashboard (manage internships, applicants, tasks)
└── applicant/
    └── page.tsx      → Applicant dashboard (browse internships, track applications)
```

## Key Features
| Dashboard | Features |
|-----------|----------|
| **Owner** | Manage users, view all companies, portal analytics |
| **Company** | Post internships, view applicants, manage tasks, post announcements |
| **Applicant** | Browse internships, apply, track application status |

## Routing Logic
```typescript
// app/dashboard/page.tsx
const { data: session } = useSession();

// Route based on user role
if (session?.user?.role === 'OWNER') {
  router.push('/dashboard/owner');
} else if (session?.user?.role === 'COMPANY') {
  router.push('/dashboard/company');
} else if (session?.user?.role === 'APPLICANT') {
  router.push('/dashboard/applicant');
}
```

## Middleware Integration
The `middleware.ts` protects all `/dashboard/*` routes:
- Unauthenticated users are redirected to `/login`
- Authenticated users can access their role's dashboard

## Commands Used
No special commands — just file creation and route logic.

## Key Decisions
- **Single router page** — `/dashboard/page.tsx` handles all role routing in one place
- **Company profile check** — Company dashboard redirects to `/dashboard/company/create` if no profile exists
- **Separate pages per role** — Each role has its own directory and page for clean separation

## Next Steps
- Company dashboard sub-pages will be added in Phase 5
- Applicant features will be added in Phase 6
- Owner dashboard features will be added in Phase 8
