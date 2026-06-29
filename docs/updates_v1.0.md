# Updates v1.0 — Fixes & Improvements Outside Initial Plan

## Overview
This document tracks all updates, micro-fixes, migrations, and improvements made during development that were not part of the original 12-phase roadmap. These were reactive changes prompted by bugs, environment issues, user feedback, or discovered edge cases.

---

## Infrastructure & Environment

### Prisma 7 → Prisma 5 Downgrade
**Reason:** Prisma 7 caused engine hangs on Windows with PostgreSQL poolers. Prisma 5.22 was chosen as stable.
- Pinned `@prisma/client` and `prisma` to ^5.22.0 in `package.json`

### Supabase → Railway Migration
**Reason:** Supabase had IPv6 routing issues from local development environment.
- Switched to Railway PostgreSQL (`thomas.proxy.rlwy.net:33477`)
- Updated `DATABASE_URL` in `.env`

### GitHub Push Protection
**Reason:** `.env` files with live credentials were accidentally staged for commit.
- Added `.env*` pattern to `.gitignore` (line 34)
- Added `/public/uploads/resumes/*.pdf` to `.gitignore`
- Verified no secrets in commit history

### Resume Storage (File System)
**Reason:** No cloud storage configured yet; file system chosen for speed.
- Resumes saved to `public/uploads/resumes/` on Railway
- Max file size: 5MB, PDF only
- API route: `/api/upload/resume`
- **Planned:** Migrate to cloud storage (S3, Cloudflare R2) later

---

## Database Schema Changes

### Status Enum Expansion
**Original:** `APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED`
**Updated:** Added `CANCELLED` and `COMPLETED`

- `CANCELLED` — Intern was cancelled by the company (e.g., performance issues)
- `COMPLETED` — Intern finished their required hours (offboarded)

### Application Model Additions
| Field | Type | Purpose |
|-------|------|---------|
| `startDate` | `DateTime?` | When intern officially starts (triggers move to Interns page) |
| `offboardedAt` | `DateTime?` | When intern was offboarded (triggers 30-day retention) |

### Task Model Additions
| Field | Type | Purpose |
|-------|------|---------|
| `reviewedAt` | `DateTime?` | When manager accepted/reviewed a completed task |

### Task `updatedAt` Behavior Change
**Before:** `@default(now())` — only set on creation
**After:** `@updatedAt` — Prisma auto-updates on every record change
**Reason:** Needed for `lastVisit` timestamp comparison in notification badge system

### Company `userId` Unique Constraint
**Before:** `userId Int` (no constraint)
**After:** `userId Int @unique` (one company per user account)
**Reason:** Enforced 1:1 relationship between company and user without Prisma relation (avoids FK issues with orphaned test data)

---

## Notification Badge System (Applicant Dashboard)

### Approach: localStorage-Based Tracking
**Reason:** Chosen over server-side read tracking for simplicity and reduced DB queries.

| localStorage Key | Type | Purpose |
|-----------------|------|---------|
| `lastVisit` | ISO timestamp | Last time user visited tasks page |
| `readApps` | JSON array of IDs | Application IDs the user has seen |
| `appStatuses` | JSON object `{id: status}` | Last-known status of each application |
| `readAnnouncements` | JSON array of IDs | Announcement IDs the user has seen |

### Task Badge Logic
- Compares `task.updatedAt` against `lastVisit` timestamp
- Catches both **new tasks** and **returned tasks** (manager sent back for redo)
- Badge clears when user navigates to tasks page (sidebar or activity click)

### Application Badge Logic
- Tracks read IDs in `readApps`
- Detects **status changes** by comparing current status against stored `appStatuses`
- Badge clears when user navigates to applications page

### Announcement Badge Logic
- Tracks read IDs in `readAnnouncements`
- Badge clears when user navigates to announcements page

### Sub-Pages Clear Badges on Load
- **Tasks page** — Updates `lastVisit` to current time after fetching tasks
- **Applications page** — Marks all app IDs as read, stores current statuses
- **Announcements page** — Marks all announcement IDs as read
**Reason:** Users navigating via sidebar (not from dashboard cards) weren't clearing badges

---

## Company Dashboard Updates

### Notification Badges on Action Cards
- `/api/company/notifications` returns counts:
  - New applications (status = APPLIED)
  - Pending reviews (COMPLETED tasks without `reviewedAt`)
  - Pending interns (ACCEPTED applications without `startDate`)
- Badges displayed on View Applicants, View Interns, Manage Tasks cards

### Activity Feed Improvements
- Sorted by `updatedAt` instead of `createdAt`
- Shows "returned" messages for tasks sent back by manager
- Timestamps reflect last activity, not creation time

### Applicants Page Enhancements
- Expandable cards with inline resume viewer
- Status updater (APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED)
- Start date picker — setting a date on ACCEPTED applications moves applicant to Interns page
- CANCELLED/COMPLETED filter options for terminal states
- Compact "View Intern" rows for accepted applicants with start dates

### Interns Page Enhancements
- **Cancel button** — Sets CANCELLED status, clears `startDate`, deletes resume file
- **Offboard button** — Sets COMPLETED status, records `offboardedAt` timestamp
- **Recently Offboarded section** — Shows offboarded interns with 30-day countdown
- **Auto-delete** — On page load, interns offboarded > 30 days ago are permanently deleted from DB

### Tasks Page Enhancements
- Search/filter by task name and department
- Status filter buttons: ALL, ACCEPTED, ONGOING, COMPLETED
- Department column populated from applicant's application record
- **Review flow** for completed tasks:
  - **Accept** — Sets `reviewedAt` timestamp, task stays COMPLETED
  - **Return** — Resets status to ONGOING, clears `reviewedAt`, task reappears in intern's queue
- Pending review badge indicator

---

## Applicant Dashboard Updates

### Dashboard Layout
- Stats row: Applications, Tasks, Announcements counts
- 4-column action grid with notification badges
- Recent activity board (top 5 items sorted by timestamp, click-to-navigate)

### Tasks Page
- **Start/Finish/Done workflow:** ACCEPTED → ONGOING → COMPLETED
- Task counter: total, completed, remaining
- "Done" label shown for completed tasks (no action)

### Applications Page
- Progress bar: Applied → Reviewed → Interview → Hired
- Terminal states (REJECTED, CANCELLED, COMPLETED) with colored badges
- Cancel button only shown for APPLIED status
- Resume viewer link in expanded card

### Activity Board
- Top 5 recent activities (applications, tasks, announcements) sorted by timestamp
- Click to navigate to relevant page
- Clicking marks item as read and clears notification badge

## Company Features

### Company Create Company
**File:** `app/dashboard/company/create/page.tsx`

- Initial company setup flow for COMPANY role users
- Form to enter company name, industry, website
- Creates company record linked to user account
- Redirects to company dashboard after creation

### Company Announcements
**Files:**
- `app/dashboard/company/announcements/page.tsx`
- `app/api/announcement/create/route.ts`
- `app/api/announcement/get/route.ts`
- `app/api/announcement/my/route.ts`

Features:
- Create announcements with title and content
- View all announcements posted by the company
- Announcements visible to applicants who applied to the company's internships

### Company Billing (PayMongo Integration)
**Files:**
- `app/dashboard/company/billing/page.tsx`
- `/api/subscription/get/route.ts`
- `/api/payment/create-checkout/route.ts`
- `/api/webhook/paymongo/route.ts`

Features:
- View current subscription plan (FREE, BASIC, PRO)
- Pricing tiers: FREE (₱0), BASIC (₱299), PRO (₱499)
- Upgrade button redirects to PayMongo checkout
- Webhook handler for payment confirmation
- Expiration date display

## Applicant Features

### Applicant Browse Internships
**Files:**
- `app/dashboard/applicant/internships/page.tsx`
- `/api/internship/browse/route.ts`
- `/api/upload/resume/route.ts`
- `/api/application/create/route.ts`

Features:
- Browse all available internships from registered companies
- Search/filter by company, title
- PDF resume upload (max 5MB) before applying
- Apply button with confirmation
- Prevents duplicate applications
- Shows deadline, slots, company info

## Owner Features

### Owner Management Pages
**Files:**
- `app/dashboard/owner/users/page.tsx` — View/filter all users by role
- `app/dashboard/owner/companies/page.tsx` — View/filter all companies by plan
- `app/dashboard/owner/subscriptions/page.tsx` — Revenue summary, subscription table
- `app/dashboard/owner/settings/page.tsx` — Portal config, pricing, feature toggles

---

## CSS & Theme Fixes

### `overflow: clip` on Scan-Line Animation
**Problem:** `overflow: hidden` on `.animate-scan-line` caused scrollbar flicker on pages with expanded cards.
**Fix:** Changed to `overflow: clip` — prevents scrollbar without clipping expanded content.

### Animated Border Toning
**Problem:** Rotating conic-gradient border was too visually intense.
**Fix:** Toned down opacity and animation speed on `.animate-border-glow` and `.animate-border-rotate`.

### Two-Tier Color Palette
- **Owner/General pages:** `dark-*` palette (#0F0F0F to #333333) with orange accent
- **Company/Applicant pages:** `neutral-*` monotone palette for a clean, focused look

---

## Authentication Fixes

### NextAuth v5 Type Augmentation
**Problem:** `session.user.role` and `session.user.id` caused TypeScript errors (not typed by default).
**Fix:** Created `next-auth.d.ts` augmenting Session and JWT types.

### Credentials Provider Type Fix
**Problem:** `credentials.email` typed as `{}` in NextAuth v5 beta.
**Fix:** Typed `credentials` parameter as `Record<string, unknown> | undefined`, cast to `string`.

### Token/Session Callback Casts
**Problem:** `user.role` not on `User | AdapterUser` type, `token.id` typed as `unknown`.
**Fix:** Cast with `as any` for role, `as string` for id in jwt/session callbacks.

### OWNER Role Excluded from Registration
**Reason:** OWNER is a platform admin — should not be self-registered.
- Created manually in database
- Registration page only shows COMPANY and APPLICANT roles

---

## TypeScript Build Fixes

| File | Issue | Fix |
|------|-------|-----|
| `app/dashboard/applicant/page.tsx` | `JSX.Element` namespace not found | Added `import React`, changed to `React.JSX.Element` |
| `app/dashboard/company/page.tsx` | `JSX.Element` namespace not found | Added `import React`, changed to `React.JSX.Element` |
| `app/dashboard/company/page.tsx` | `useState(null)` → `never` type | Typed as `{ id: number; name: string; ... } \| null` |
| `app/dashboard/company/profile/page.tsx` | `useState(null)` → `never` type | Typed with company shape |
| `app/dashboard/company/applicants/page.tsx` | `new Date(app.startDate)` — null not assignable | Added null check: `app.startDate ? new Date(...) : '—'` |
| `app/dashboard/company/billing/page.tsx` | `useState(null)` → `never` type | Typed subscription state with plan/status/expiredAt |
| `app/dashboard/company/billing/page.tsx` | `subscription.renewalDate` doesn't exist | Changed to `subscription.expiredAt` |
| `app/dashboard/owner/companies/page.tsx` | `useState([])` untyped | Typed with company array shape |
| `app/api/owner/companies/route.ts` | `include: { user }` — no Prisma relation | Replaced with separate `prisma.user.findMany` query |
| `lib/auth.ts` | `credentials.email` typed as `{}` | Typed parameter, cast to string |
| `lib/auth.ts` | `user.role` not on AdapterUser type | Cast with `as any` |
| `lib/auth.ts` | `token.id` typed as `unknown` | Cast with `as string` |

---

## Schema Relationship Fixes

### Company ↔ User Relation
**Problem:** `Company.userId` existed but no Prisma `@relation` — caused type errors in owner companies API.
**Attempted:** Added `user User @relation(...)` with `@unique` on `userId`.
**Result:** FK constraint failed due to orphaned company records (userId 5, 7 with no matching User).
**Final fix:** Kept `@unique` constraint, replaced Prisma `include` with separate user query in API.

---

## Other Changes

### Font
- Set to **Plus Jakarta Sans** (Google Fonts) in `app/layout.tsx`

### Dashboard Navigation
- Moved from top-nav to **sidebar + header layout**
- Sidebar is collapsible with role-based nav items

### Prisma Client Regeneration (Windows)
**Problem:** `npx prisma generate` fails on Windows with EPERM on DLL files.
**Workaround:** `Stop-Process -Name "node"` before regenerating.

### Middleware Warning
**Known:** `middleware.ts` uses deprecated convention in Next.js 16 (prefers `proxy`). Not blocking — warning only.

---

## Git Commits (Phase 9 Related)
```
Phase 9: Dark theme system with Tailwind v4 @theme tokens
Phase 9: Animated backgrounds (login, register, landing)
Phase 9: Dashboard layout with collapsible sidebar + slim header
Phase 9: Owner dashboard two-column layout
Phase 9: Company dashboard with notification badges and activity feed
Phase 9: Applicant dashboard with notification badges and action grid
Phase 9: Applicant notification system (localStorage-based)
Phase 9: Company applicants page - expandable cards, resume viewer, status updater
Phase 9: Company interns page - cancel/offboard with 30-day retention
Phase 9: Company tasks page - search/filter, review flow (accept/return)
Phase 9: Applicant tasks page - start/finish/done flow
Phase 9: Applicant applications page - progress bar, terminal states
Phase 9: Type fixes - NextAuth types, JSX.Element, useState(null)
Phase 9: Schema updates - CANCELLED/COMPLETED, startDate, offboardedAt, reviewedAt
Phase 9: Company notifications API endpoint
Phase 9: Sub-pages clear notification badges on load
```
