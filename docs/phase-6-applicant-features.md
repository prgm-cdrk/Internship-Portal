# Phase 6 — Applicant Features

## Overview
This phase implements all applicant-side features: browsing internships, applying to them, tracking application status, viewing assigned tasks, and reading announcements from companies.

## What Was Done

### 1. Browse Internships
Applicants can browse all available internships from all companies.

**Files Created:**
- `app/api/internship/browse/route.ts` — Public API fetching all internships with company info and application count
- `app/dashboard/applicant/internships/page.tsx` — Page listing all internships

**Features:**
- View all internships from all companies
- See company name, industry, description, slots, and deadline
- See number of applicants per internship
- Apply button directly on each listing

### 2. Apply for Internship
Applicants can apply to internships with one click.

**Files Created:**
- `app/api/application/create/route.ts` — Creates application with duplicate prevention

**Features:**
- Click "Apply" button on any internship
- Prevents duplicate applications (unique constraint on userId + internshipId)
- Button shows "Applying..." while processing
- Button changes to "Applied" after successful application
- Error message if already applied

### 3. Track Applications
Applicants can view all their applications and current status.

**Files Created:**
- `app/api/application/my/route.ts` — Fetches all applications for the logged-in applicant
- `app/dashboard/applicant/applications/page.tsx` — Page showing all applications

**Features:**
- View all applications with internship title and company name
- Color-coded status badges:
  - **APPLIED** (Blue) — Just applied
  - **REVIEWED** (Yellow) — Being reviewed
  - **INTERVIEW** (Cyan) — Interview scheduled
  - **ACCEPTED** (Green) — Accepted
  - **REJECTED** (Red) — Rejected
- Shows application date and internship deadline

### 4. View Assigned Tasks
Applicants can view tasks assigned to them by companies.

**Files Created:**
- `app/api/task/my/route.ts` — Fetches all tasks assigned to the logged-in applicant
- `app/dashboard/applicant/tasks/page.tsx` — Page showing all assigned tasks

**Features:**
- View all tasks with company name, title, and description
- Color-coded status badges:
  - **ACCEPTED** (Blue) — Task accepted
  - **ONGOING** (Yellow) — In progress
  - **COMPLETED** (Green) — Done
- Shows task deadline

### 5. View Announcements
Applicants can view announcements from companies they're associated with.

**Files Created:**
- `app/api/announcement/my/route.ts` — Fetches announcements from companies the applicant has applied to or has tasks from
- `app/dashboard/applicant/announcements/page.tsx` — Page showing all announcements

**Features:**
- View announcements from relevant companies only
- Shows company name, industry, title, content, and date
- Automatically filters companies based on applications and tasks

## Files Created Summary
```
app/
├── dashboard/
│   └── applicant/
│       ├── internships/
│       │   └── page.tsx           # Browse all internships
│       ├── applications/
│       │   └── page.tsx           # Track application status
│       ├── tasks/
│       │   └── page.tsx           # View assigned tasks
│       └── announcements/
│           └── page.tsx           # View company announcements
│
└── api/
    ├── internship/
    │   └── browse/
    │       └── route.ts           # Get all internships (public)
    ├── application/
    │   ├── create/
    │   │   └── route.ts           # Apply to internship
    │   └── my/
    │       └── route.ts           # Get my applications
    ├── task/
    │   └── my/
    │       └── route.ts           # Get my tasks
    └── announcement/
        └── my/
            └── route.ts           # Get my announcements
```

## API Endpoints Summary
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/internship/browse` | GET | Get all internships (public) |
| `/api/application/create` | POST | Apply to an internship |
| `/api/application/my` | GET | Get all my applications |
| `/api/task/my` | GET | Get all my assigned tasks |
| `/api/announcement/my` | GET | Get announcements from my companies |

## Applicant Dashboard Navigation
```
/dashboard/applicant
├── Browse Internships → /dashboard/applicant/internships
├── My Applications → /dashboard/applicant/applications
├── My Tasks → /dashboard/applicant/tasks
└── Announcements → /dashboard/applicant/announcements
```

## Key Features
| Feature | Description |
|---------|-------------|
| **Browse** | View all internships from all companies |
| **Apply** | One-click apply with duplicate prevention |
| **Track** | Color-coded status for each application |
| **Tasks** | View tasks assigned by companies |
| **Announcements** | See updates from companies you're associated with |

## Git Commits
```
ba7eb41 Phase 6: Browse internships page + API for applicants
4612c8f Phase 6: Apply to internships - API + Apply button on browse page
8691a1d Phase 6: Track applications page - applicants can view all their applications and status
04ab0fb Phase 6: My Tasks page - applicants can view tasks assigned by companies
28aff4c Phase 6: Announcements page - applicants can view announcements from companies they're associated with
```

## Next Steps
- Phase 7: Stripe Subscription & Billing
- Phase 8: Owner Dashboard Features
