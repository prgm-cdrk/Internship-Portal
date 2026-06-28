# Phase 5 — Company Features

## Overview
This phase implements all company manager features: company profile creation, internship posting, applicant pipeline, task management, and announcements. Each feature includes a frontend page and backend API endpoint.

## What Was Done

### 1. Company Profile Creation
Company managers can create their company profile after registration.

**Files Created:**
- `app/dashboard/company/create/page.tsx` — Company creation form
- `app/api/company/create/route.ts` — Create company API
- `app/api/company/get/route.ts` — Get company API
- `app/api/company/update/route.ts` — Update company API

**Flow:**
1. New company user logs in → redirected to `/dashboard/company`
2. No company found → redirected to `/dashboard/company/create`
3. User fills out form (name, industry, website)
4. Company record created in database linked to user
5. User redirected to company profile page

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Company Name | text | Yes |
| Industry | text | Yes |
| Website | url | No |

### 2. Company Profile Page with Edit
**Files Created:**
- `app/dashboard/company/profile/page.tsx` — View and edit company profile

**Features:**
- Display current company information
- Edit company name, industry, website
- Save changes via update API
- Links to all company features

### 3. Internship Posting
Company managers can post new internships.

**Files Created:**
- `app/dashboard/company/internships/new/page.tsx` — Internship creation form
- `app/api/internship/create/route.ts` — Create internship API

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Title | text | Yes |
| Description | textarea | Yes |
| Slots | number | Yes |
| Deadline | datetime | Yes |

**Flow:**
1. User fills out internship form
2. API creates Internship record linked to company
3. User redirected to internships listing page

### 4. Internship Listings
Company managers can view all their posted internships.

**Files Created:**
- `app/dashboard/company/internships/page.tsx` — Internship listings page
- `app/api/internship/get/route.ts` — Get internships API

**Features:**
- List all internships for the company
- Show number of applicants per internship
- Link to post new internships
- Link to view applicants

### 5. Applicant Pipeline
Company managers can view all applicants across their internships.

**Files Created:**
- `app/dashboard/company/applicants/page.tsx` — Applicant pipeline page
- `app/api/application/get/route.ts` — Get applications API

**Features:**
- List all applications for the company's internships
- Filter by status (APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED)
- Show applicant name, email, and applied internship
- Display application status badges

### 6. Task Management
Company managers can create and assign tasks to applicants.

**Files Created:**
- `app/dashboard/company/tasks/page.tsx` — Task management page
- `app/api/task/create/route.ts` — Create task API
- `app/api/task/get/route.ts` — Get tasks API

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Title | text | Yes |
| Description | textarea | Yes |
| Deadline | datetime | Yes |
| Assigned To | user ID | Yes |
| Status | ACCEPTED/ONGOING/COMPLETED | Yes |

**Features:**
- List all tasks for the company
- Create new tasks
- Filter tasks by status

### 7. Announcements
Company managers can post announcements for their interns.

**Files Created:**
- `app/dashboard/company/announcements/page.tsx` — Announcements page
- `app/api/announcement/create/route.ts` — Create announcement API
- `app/api/announcement/get/route.ts` — Get announcements API

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Title | text | Yes |
| Content | textarea | Yes |

**Features:**
- List all announcements (newest first)
- Create new announcements
- Show post date

## Files Created Summary
```
app/
├── dashboard/
│   └── company/
│       ├── create/
│       │   └── page.tsx           # Company creation form
│       ├── profile/
│       │   └── page.tsx           # Company profile with edit
│       ├── internships/
│       │   ├── page.tsx           # Internship listings
│       │   └── new/
│       │       └── page.tsx       # Post new internship form
│       ├── applicants/
│       │   └── page.tsx           # Applicant pipeline
│       ├── tasks/
│       │   └── page.tsx           # Task management
│       └── announcements/
│           └── page.tsx           # Announcements page
│
└── api/
    ├── company/
    │   ├── create/route.ts        # Create company API
    │   ├── get/route.ts           # Get company API
    │   └── update/route.ts        # Update company API
    ├── internship/
    │   ├── create/route.ts        # Create internship API
    │   └── get/route.ts           # Get internships API
    ├── application/
    │   └── get/route.ts           # Get applications API
    ├── task/
    │   ├── create/route.ts        # Create task API
    │   └── get/route.ts           # Get tasks API
    └── announcement/
        ├── create/route.ts        # Create announcement API
        └── get/route.ts           # Get announcements API
```

## API Endpoints Summary
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/company/create` | POST | Create company profile |
| `/api/company/get` | GET | Get company by user |
| `/api/company/update` | PUT | Update company profile |
| `/api/internship/create` | POST | Create internship posting |
| `/api/internship/get` | GET | Get internships for company |
| `/api/application/get` | GET | Get applications for company |
| `/api/task/create` | POST | Create task |
| `/api/task/get` | GET | Get tasks for company |
| `/api/announcement/create` | POST | Create announcement |
| `/api/announcement/get` | GET | Get announcements for company |

## Company Dashboard Navigation
```
/dashboard/company
├── View Profile → /dashboard/company/profile
├── Post Internship → /dashboard/company/internships/new
├── View Internships → /dashboard/company/internships
├── View Applicants → /dashboard/company/applicants
├── Manage Tasks → /dashboard/company/tasks
└── Post Announcement → /dashboard/company/announcements
```

## Commands Used
No special commands — all file creation and API development.

## Key Decisions
- **Company profile check** — Dashboard redirects to create page if no company exists
- **All APIs authenticated** — Every API endpoint checks session before processing
- **Company-scoped data** — All queries filter by `companyId` to ensure data isolation
- **Simple forms** — Plain HTML forms with React state management (no form library)

## Git Commits
```
aecc648 Phase 5: Company profile creation flow
9035d8a Phase 5: Company profile page with edit functionality
96f04de Phase 5: Internship posting form and create API
8906279 Phase 5: Internship listings page
42e0d93 Phase 5: Applicant pipeline
b9c6f5f Phase 5: Task management
dc30b7a Phase 5: Announcements system
```

## Next Steps
- Phase 6: Applicant Features (browse internships, apply, track applications)
- Phase 7: Stripe subscription/billing
