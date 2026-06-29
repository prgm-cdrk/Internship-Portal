# Phase 9 — UI/UX Polish (Dark Theme & Notification System)

## Overview
This phase focuses on the complete UI/UX overhaul of the Internship Portal. It introduces a dark theme with two variants (dark-* palette for owner/general, neutral-* monotone for company/applicant), animated backgrounds, collapsible sidebar navigation, notification badge system on the applicant dashboard, and various fixes to ensure a polished, production-ready interface.

## What Was Done

### 1. Dark Theme System
**File:** `app/globals.css`

- Defined custom Tailwind v4 theme tokens using `@theme` directive
- Two color palettes:
  - `dark-*` (#0F0F0F to #333333): Used by Owner dashboard and general pages
  - `neutral-*`: Used by Company and Applicant pages for a monotone look
- Accent color: #FF6B35 (orange) with light/dark variants
- Success (#10B981) and danger (#EF4444) utility colors
- Custom CSS variables for background/foreground

### 2. Animated Backgrounds
**File:** `app/globals.css`

- `animate-float`: Floating vertical oscillation (6s loop)
- `animate-pulse_slow`: Slow opacity pulse (4s loop)
- `animate-rotate_slow`: Slow rotation (20s loop)
- `animate-gradient-shift`: Dark gradient background shift (10s loop)
- `animate-border-glow`: Rotating conic-gradient border with orange accent
- `animate-border-rotate`: Subtle rotating border on cards
- `animate-scan-line`: Horizontal scan-line effect (6s loop) with `overflow: clip` to prevent scrollbar flicker
- `dashboard-grid`: Grid pattern background with fade-out mask for dashboard pages

### 3. Landing Page
**File:** `app/page.tsx`

- Dark theme with animated background elements
- Hero section with call-to-action buttons
- Feature highlights for each role (Owner, Company, Applicant)
- Toned-down animated borders on feature cards

### 4. Login Page
**File:** `app/login/page.tsx`

- Dark theme with animated background (gradient shift + floating elements)
- Centered card with rotating border glow effect
- Email/password form with error handling
- Link to registration page

### 5. Registration Page
**File:** `app/register/page.tsx`

- Horizontal layout (form on left, info on right)
- Role selection (COMPANY or APPLICANT)
- Animated background matching login page
- Password confirmation validation

### 6. Dashboard Layout
**File:** `app/dashboard/layout.tsx`

- Sidebar + header + main content layout
- Sidebar and header are fixed, main content scrolls

### 7. Dashboard Sidebar
**File:** `components/DashboardSidebar.tsx`

- Collapsible sidebar (expanded/collapsed states)
- Role-based navigation items:
  - OWNER: Dashboard, Users, Companies, Subscriptions, Settings
  - COMPANY: Dashboard, Profile, Internships, Applicants, Interns, Tasks, Announcements, Billing
  - APPLICANT: Dashboard, Browse Internships, My Applications, My Tasks, Announcements
- Active route highlighting
- Notification badge support on nav items
- Logout button

### 8. Dashboard Header
**File:** `components/DashboardHeader.tsx`

- Slim top bar (h-12)
- User info display (name, role)
- Sidebar toggle button
- Logout button

### 9. Owner Dashboard
**File:** `app/dashboard/owner/page.tsx`

- Two-column layout: stats on left, quick actions on right
- 5 stat cards: Total Users, Companies, Internships, Active Subscriptions, Revenue
- Management navigation cards
- Uses `dark-*` palette

### 10. Company Dashboard
**File:** `app/dashboard/company/page.tsx`

- Notification badges on action cards (View Applicants, View Interns, Manage Tasks)
- Badge counts fetched from `/api/company/notifications`
- Recent activity board sorted by `updatedAt` for tasks (shows "returned" messages)
- Monotone `neutral-*` theme
- Action cards with notification count indicators

### 11. Applicant Dashboard
**File:** `app/dashboard/applicant/page.tsx`

- Stats row: Applications, Tasks, Announcements counts
- 4-column action grid with notification badges:
  - My Tasks badge: Uses `lastVisit` timestamp comparison (updatedAt > lastVisit)
  - My Applications badge: Uses `readApps` localStorage tracking with status change detection
  - Announcements badge: Uses `readAnnouncements` localStorage
- Recent activity board (top 5 items sorted by timestamp)
- Activity click handlers that mark items as read and redirect

### 12. Applicant Tasks Page
**File:** `app/dashboard/applicant/tasks/page.tsx`

- Start/Finish/Done flow: ACCEPTED → ONGOING → COMPLETED
- Task counter: total, completed, remaining
- Updates `lastVisit` on load to clear dashboard badge
- Monotone dark theme

### 13. Applicant Applications Page
**File:** `app/dashboard/applicant/applications/page.tsx`

- Progress bar: Applied → Reviewed → Interview → Hired
- Terminal states (REJECTED, CANCELLED, COMPLETED) with badges and messages
- Cancel button for APPLIED status only
- Marks all apps as read on load to clear dashboard badge
- Stores current statuses for change detection

### 14. Applicant Announcements Page
**File:** `app/dashboard/applicant/announcements/page.tsx`

- Lists announcements from companies
- Marks all announcements as read on load to clear dashboard badge

### 15. Company Applicants Page
**File:** `app/dashboard/company/applicants/page.tsx`

- Expandable applicant cards with resume viewer
- Status updater (APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED)
- Start date picker (moves applicant to Interns page)
- CANCELLED/COMPLETED filter options with terminal state handling
- Compact "View Intern" rows for accepted applicants

### 16. Company Interns Page
**File:** `app/dashboard/company/interns/page.tsx`

- Active interns with Cancel and Offboard buttons
- Cancel: Sets CANCELLED status, clears startDate, deletes resume
- Offboard: Sets COMPLETED status, records offboardedAt timestamp
- "Recently Offboarded" section with 30-day retention and auto-delete on page load

### 17. Company Tasks Page
**File:** `app/dashboard/company/tasks/page.tsx`

- Search/filter by task name and department
- Status filter buttons: ALL, ACCEPTED, ONGOING, COMPLETED
- Department column from applicant's application
- Review flow: Accept (sets reviewedAt) and Return (resets to ONGOING) buttons for COMPLETED tasks
- Pending review badge indicator

### 18. Notification Badge System
**Files:** `app/dashboard/applicant/page.tsx`, sub-pages (tasks, applications, announcements)

- **Tasks badge**: Compares `updatedAt` of each task against `lastVisit` timestamp in localStorage. Updated when user navigates to tasks page (via sidebar or activity click).
- **Applications badge**: Tracks read app IDs in `readApps` localStorage. Detects status changes by comparing current status against stored `appStatuses`. Cleared when user views applications page.
- **Announcements badge**: Tracks read announcement IDs in `readAnnouncements` localStorage. Cleared when user views announcements page.

localStorage keys used:
| Key | Purpose |
|-----|---------|
| `lastVisit` | ISO timestamp of last tasks page visit |
| `readApps` | JSON array of read application IDs |
| `appStatuses` | JSON object mapping application IDs to their last-seen status |
| `readAnnouncements` | JSON array of read announcement IDs |

### 19. Company Notification API
**File:** `app/api/company/notifications/route.ts`

- Returns counts for badge display on company dashboard
- Counts: new applications (APPLIED status), pending reviews (COMPLETED tasks without reviewedAt), pending interns (ACCEPTED applications without startDate)

### 20. Type Fixes & Build Cleanup
**Files:** `next-auth.d.ts`, `lib/auth.ts`, various page files

- Created `next-auth.d.ts` for session type augmentation (id, role)
- Fixed `JSX.Element` → `React.JSX.Element` with React imports
- Added type annotations to `useState(null)` calls across all dashboard pages
- Fixed nullable `startDate` handling in company applicants page
- Typed `subscription` state in billing page
- Fixed `renewalDate` → `expiredAt` in billing page
- Typed `credentials` parameter in auth.ts authorize function
- Cast token/session fields in auth.ts callbacks

## Files Created
```
next-auth.d.ts                         # NextAuth type augmentation

app/
├── globals.css                        # Tailwind v4 theme + animations
├── layout.tsx                         # Root layout (AuthProvider, Plus Jakarta Sans font)
├── page.tsx                           # Landing page
├── login/page.tsx                     # Login page
├── register/page.tsx                  # Registration page
│
├── dashboard/
│   ├── layout.tsx                     # Sidebar + header + main layout
│   │
│   ├── owner/
│   │   └── page.tsx                   # Owner dashboard (two-column)
│   │
│   ├── company/
│   │   ├── page.tsx                   # Company dashboard with badges
│   │   ├── profile/page.tsx           # Company profile
│   │   ├── internships/page.tsx       # Internship listings
│   │   ├── internships/new/page.tsx   # Create internship
│   │   ├── applicants/page.tsx        # Applicant pipeline
│   │   ├── interns/page.tsx           # Intern management
│   │   ├── tasks/page.tsx             # Task management
│   │   ├── announcements/page.tsx     # Announcements
│   │   └── billing/page.tsx           # Billing/subscription
│   │
│   └── applicant/
│       ├── page.tsx                   # Applicant dashboard with badges
│       ├── internships/page.tsx       # Browse internships
│       ├── applications/page.tsx      # Track applications
│       ├── tasks/page.tsx             # View tasks
│       └── announcements/page.tsx     # View announcements
│
├── components/
│   ├── DashboardHeader.tsx            # Slim top bar (h-12)
│   └── DashboardSidebar.tsx           # Collapsible sidebar nav
│
└── api/
    └── company/
        ├── notifications/route.ts     # Badge counts
        └── activity/route.ts          # Activity feed (updatedAt sort)
```

## API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/company/notifications` | GET | Badge counts for company dashboard |
| `/api/company/activity` | GET | Activity feed sorted by updatedAt |

## Navigation Structure
```
/dashboard
├── /dashboard/owner
│   ├── /dashboard/owner/users
│   ├── /dashboard/owner/companies
│   ├── /dashboard/owner/subscriptions
│   └── /dashboard/owner/settings
│
├── /dashboard/company
│   ├── /dashboard/company/profile
│   ├── /dashboard/company/internships
│   ├── /dashboard/company/internships/new
│   ├── /dashboard/company/applicants
│   ├── /dashboard/company/interns
│   ├── /dashboard/company/tasks
│   ├── /dashboard/company/announcements
│   └── /dashboard/company/billing
│
└── /dashboard/applicant
    ├── /dashboard/applicant/internships
    ├── /dashboard/applicant/applications
    ├── /dashboard/applicant/tasks
    └── /dashboard/applicant/announcements
```

## Theme Reference
| Token | Hex | Usage |
|-------|-----|-------|
| `dark-950` | `#0F0F0F` | Owner/general page background |
| `dark-900` | `#1A1A1A` | Owner/general card backgrounds |
| `dark-800` | `#242424` | Owner/general elevated surfaces |
| `dark-700` | `#333333` | Owner/general borders |
| `dark-400` | `#666666` | Muted text |
| `dark-300` | `#B0B0B0` | Secondary text |
| `accent-primary` | `#FF6B35` | Orange accent (buttons, highlights) |
| `accent-light` | `#FF8C54` | Light accent (hover states) |
| `accent-dark` | `#E55A2B` | Dark accent (active states) |
| `success` | `#10B981` | Success states |
| `danger` | `#EF4444` | Error/danger states |

Company and Applicant pages use `neutral-*` Tailwind palette for a monotone dark look.

## Key Decisions
- **`overflow: clip`** on `.animate-scan-line` instead of `overflow: hidden` — prevents scrollbar flicker without clipping expanded card content
- **`@updatedAt`** on Task model — changed from `@default(now())` so Prisma auto-updates the field when records change
- **localStorage for notifications** — chosen over server-side read tracking for simplicity and reduced DB queries
- **lastVisit timestamp** for task badge — catches both new tasks and returned tasks by comparing `updatedAt` against last visit time
- **readApps status tracking** — detects status changes on previously seen applications by storing last-known status

## Known Limitations
- localStorage must be cleared manually to reset notification tracking (F12 → Application → Local Storage)
- Resume storage is file-system based on Railway (`public/uploads/resumes/`), will migrate to cloud storage later
- `middleware.ts` uses deprecated convention (Next.js 16 prefers `proxy`)
- Prisma client fails to regenerate on Windows (EPERM on DLL) — must `Stop-Process -Name "node"` first

## Next Steps
- Phase 10: Testing
- Phase 11: Deploy to Vercel
- Phase 12: Final Documentation
