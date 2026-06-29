# Updates v3.0 — Owner Dashboard Overhaul & Platform Features

**Date:** June 29, 2026 (7:00 PM onwards)

---

## Table of Contents
1. [Company Logo Fixes](#1-company-logo-fixes)
2. [Browse Page Fixes & Effects](#2-browse-page-fixes--effects)
3. [Rich Text Editor for Internship Descriptions](#3-rich-text-editor-for-internship-descriptions)
4. [Internship Edit Functionality](#4-internship-edit-functionality)
5. [Owner Dashboard Overhaul (10 Phases)](#5-owner-dashboard-overhaul)
6. [Staff Login Fix](#6-staff-login-fix)

---

## 1. Company Logo Fixes

### Bigger Logo on Company Dashboard
- **File:** `app/dashboard/company/page.tsx`
- Increased company logo from `w-12 h-12` to `w-16 h-16` (48px → 64px)
- Changed border radius from `rounded-xl` to `rounded-2xl`
- Added `gap-5` spacing between logo and text

### Logo Upload Fix
- **File:** `app/api/upload/logo/route.ts`
- Changed from `NextRequest`/`NextResponse` to plain `Request`/`Response` (matching the working resume upload pattern)
- Removed `path` import, switched to `join` from `path`
- Added detailed error logging with `details` field in error response
- Created `public/uploads/logos/` directory

### Profile Page Upload Improvements
- **File:** `app/dashboard/company/profile/page.tsx`
- Added error detail logging in `uploadLogo()` function
- Console logs upload failure status and error details
- Updated error message to "Check the browser console (F12) for details"

---

## 2. Browse Page Fixes & Effects

### Description Display Fix
- **File:** `app/browse/page.tsx`
- **Problem:** When expanding a card, both truncated and full descriptions were visible simultaneously
- **Fix:** Wrapped truncated description in `{!isSelected && (...)}` conditional — hidden when expanded

### HTML Description Support
- **File:** `app/browse/page.tsx`
- Truncated preview now strips HTML tags before truncating: `internship.description.replace(/<[^>]*>/g, '').trim()`
- Expanded view renders full HTML using `dangerouslySetInnerHTML` with prose styling classes
- **File:** `app/browse/[id]/page.tsx`
- Detail page description also renders as HTML with `dangerouslySetInnerHTML`

### Browse Page Effects
- **File:** `app/browse/page.tsx`
  - **Floating background orbs:** 3 gradient blurs (purple, indigo, light) with `animate-drift`, `animate-drift-reverse`, `animate-float`
  - **Staggered card entrance:** Stats cards and internship cards use `fadeSlideUp` animation with incremental delays
  - **Card hover glow:** `hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(114,98,248,0.06)]`
  - **Stats hover:** `hover:border-arcana-primary/20 hover:bg-white/[0.05]`
  - **Search bar glow:** Focus state adds purple shadow ring and icon color change
- **File:** `app/globals.css`
  - Added `@keyframes fadeSlideUp` for staggered card entrance animation

---

## 3. Rich Text Editor for Internship Descriptions

### New Component
- **File:** `components/RichTextEditor.tsx`
- Rich text editor using `contentEditable` with toolbar
- **Toolbar buttons:** Bold (B), Italic (I), Underline (U)
- **Block buttons:** H1, H2, H3, Paragraph, Bullet List, Numbered List
- Uses `document.execCommand` for formatting
- Styled with prose classes for consistent rendering
- Placeholder text when empty

### Post Internship Form Updated
- **File:** `app/dashboard/company/internships/new/page.tsx`
- Replaced `<textarea>` with `<RichTextEditor>` component
- Validation updated to strip HTML tags before checking emptiness: `description.replace(/<[^>]*>/g, '').trim()`
- Updated helper text: "Use the toolbar for formatting — bold, headings, bullet lists, etc."

### Company Internships List Updated
- **File:** `app/dashboard/company/internships/page.tsx`
- Truncated preview strips HTML tags for clean plain text display

### HTML Rendering on Browse Pages
- Browse page expanded view and detail page render HTML with consistent prose styling:
  ```css
  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white
  [&_h2]:text-base [&_h2]:font-semibold
  [&_ul]:list-disc [&_ul]:pl-6
  [&_ol]:list-decimal [&_ol]:pl-6
  ```

---

## 4. Internship Edit Functionality

### API Route
- **File:** `app/api/internship/[id]/route.ts`
- **GET:** Fetch single internship by ID (must belong to user's company)
- **PUT:** Update title, description, slots, deadline
- Both methods verify company ownership before allowing access

### Edit Page
- **File:** `app/dashboard/company/internships/[id]/edit/page.tsx`
- Same layout as the post form (max-w-4xl, sectioned, back button)
- Pre-fills form with current internship data from API
- Uses `RichTextEditor` for description editing
- Validates all fields before submission
- Redirects to internships list on success

### Internships List Updated
- **File:** `app/dashboard/company/internships/page.tsx`
- Added "Edit" button on each internship card with pencil icon
- Navigates to `/dashboard/company/internships/[id]/edit`

---

## 5. Owner Dashboard Overhaul

### Schema Additions
- **File:** `prisma/schema.prisma`
- **`STAFF` added to `Role` enum**
- **`User.isActive`** field (default `true`) — for suspend/ban
- **`Staff` model:** userId (unique), role, permissions (JSON string), isSuspended, createdBy, lastLoginAt
- **`Activity` model:** type, action, entity, entityId, details, userId
- **`AuditLog` model:** userId, action, target, details, ipAddress
- **`PlatformSettings` model:** key (unique), value

### Phase 1: Staff Management
- **API:** `app/api/owner/staff/route.ts`
  - GET: List all staff with permissions metadata
  - POST: Create staff account (generates temp password, hashes with bcryptjs)
  - PUT: Update role, permissions, suspend/activate
  - DELETE: Remove staff account (cascades to User)
  - 15 granular permissions: `users.view`, `users.edit`, `users.delete`, `companies.view`, `companies.edit`, `companies.delete`, `internships.view`, `applications.view`, `analytics.view`, `subscriptions.view`, `staff.view`, `staff.manage`, `settings.edit`, `activity.view`, `audit.view`
  - Default permission sets per role: ADMIN (all), MODERATOR (view-only + basic), VIEWER (minimal)
- **Page:** `app/dashboard/owner/staff/page.tsx`
  - Create modal with name, email, role, temp password, permission grid
  - Staff list with role badges, permission tags, edit/suspend/remove actions
  - Edit modal for changing role and permissions
  - Temp password displayed on creation for sharing

### Phase 2: User Management Actions
- **API:** `app/api/owner/users/route.ts`
  - GET: List users with search and role filter
  - PUT: Update user role or suspend/activate (protects OWNER accounts)
  - DELETE: Delete user account (protects OWNER accounts)
- **Page:** `app/dashboard/owner/users/page.tsx`
  - Search bar (name/email)
  - Role filter buttons: ALL, OWNER, COMPANY, APPLICANT, STAFF
  - Table with Name, Email, Role, Status, Joined, Actions
  - Edit role modal, suspend/activate toggle, delete with confirmation

### Phase 3: Company Management Actions
- **API:** `app/api/owner/companies/route.ts`
  - GET: List companies with search and plan filter
  - PUT: Suspend/activate company (toggles manager user's isActive)
  - DELETE: Delete company and its data
- **Page:** `app/dashboard/owner/companies/page.tsx`
  - Search bar, plan filter buttons
  - Company cards with manager info, plan badge, status
  - Expandable details (internships count, plan, status, expiry, website, joined)
  - Suspend/activate and delete actions

### Phase 4: Platform Activity Feed
- **API:** `app/api/owner/activity/route.ts`
  - GET: Fetch recent activities with type filter
  - Enriches with user names from User table
- **Page:** `app/dashboard/owner/activity/page.tsx`
  - Type filter buttons: ALL, signup, application, payment, task, announcement, system, staff
  - Color-coded type badges with icons
  - Time-ago display
  - User name, action, entity, details

### Phase 5: Internship & Application Overview
- **API:** `app/api/owner/internships/route.ts`
  - GET: All internships across all companies with search
  - Includes company info and application count
- **Page:** `app/dashboard/owner/internships/page.tsx`
  - Search by title or company
  - Table: Title, Company, Slots, Applicants, Deadline, Created

### Phase 6: Platform Analytics
- **API:** `app/api/owner/analytics/route.ts`
  - GET: Comprehensive analytics data
  - Raw SQL queries for 30-day trend data (signups, applications by day)
  - GroupBy queries for role, plan, status distributions
  - Weekly comparison (this week vs last week)
- **Page:** `app/dashboard/owner/analytics/page.tsx`
  - Summary cards: Users, Companies, Internships, Applications, Active Subs
  - Weekly change percentages
  - Bar charts: User Signups (30 days), Applications (30 days)
  - Donut charts: User Roles, Subscription Plans, Application Status
  - Custom SVG-based charts (no external chart library)

### Phase 7: Revenue Dashboard
- Existing subscriptions page already shows revenue summary, plan breakdown, and status filters (from Phase 9)

### Phase 8: Search & Pagination
- All owner pages now include search bars and filter buttons
- API routes support query parameters for search and filtering
- Results limited to `take: 100` to prevent overload

### Phase 9: Audit Logs
- **API:** `app/api/owner/audit/route.ts`
  - GET: Fetch audit logs with action filter
  - Enriches with user names
- **Page:** `app/dashboard/owner/audit/page.tsx`
  - Action filter buttons: All, staff, user, company, settings
  - Color-coded action badges
  - User name, target, details, time-ago

### Phase 10: Persistent Settings
- **API:** `app/api/owner/settings/route.ts`
  - GET: Fetch settings from database (falls back to defaults)
  - PUT: Upsert settings, logs audit trail
  - Default settings: portalName, trialDays, freePlanPostings, freePlanApplicants, basicPlanPrice, proPlanPrice, allowRegistrations, maintenanceMode
- **Page:** `app/dashboard/owner/settings/page.tsx`
  - Portal settings: Name, Trial Period
  - Free Plan limits: Max Postings, Max Applicants
  - Pricing: Basic, Pro (₱/month)
  - Feature toggles: Allow Registrations, Maintenance Mode (toggle switches)
  - System info: Version, Framework, Database, Payments, ORM, Runtime

### Activity Logger Utility
- **File:** `lib/activity.ts`
  - `logActivity()` — records platform events to Activity table
  - `logAudit()` — records owner/staff actions to AuditLog table
  - Used by staff, user, company, and settings APIs

### Sidebar Updates
- **File:** `components/DashboardSidebar.tsx`
- Owner sidebar now has 11 items: Dashboard, Analytics, Users, Companies, Internships, Subscriptions, Staff, Activity, Audit Logs, Settings
- Each with appropriate SVG icons

---

## 6. Staff Login Fix

### Problem
- Staff accounts created by Owner had `role: 'STAFF'` but no dashboard page or sidebar items
- `/dashboard/page.tsx` only handled OWNER, COMPANY, APPLICANT roles
- Staff dashboard called `/api/owner/staff` which requires OWNER role — staff couldn't access it

### Fixes
- **File:** `app/dashboard/page.tsx`
  - Added `STAFF` case: `router.push('/dashboard/staff')`
- **File:** `app/dashboard/staff/page.tsx` (new)
  - Staff dashboard showing accessible pages as cards
  - Fetches permissions from `/api/staff/me`
  - Filters page list based on assigned permissions
  - Shows "No access granted" if no permissions assigned
- **File:** `app/api/staff/me/route.ts` (new)
  - Self-service endpoint for STAFF users
  - Returns current staff member's role and permissions
  - Checks `isSuspended` flag
- **File:** `components/DashboardSidebar.tsx`
  - Added `STAFF` case to navItems switch
  - Fetches permissions from `/api/staff/me`
  - Dynamically shows only permitted pages in sidebar
  - Each nav item mapped to a permission key

---

## New Files Created
| File | Purpose |
|------|---------|
| `components/RichTextEditor.tsx` | Rich text editor with formatting toolbar |
| `app/api/internship/[id]/route.ts` | GET/PUT single internship |
| `app/dashboard/company/internships/[id]/edit/page.tsx` | Edit internship page |
| `lib/activity.ts` | Activity and audit log utilities |
| `app/api/owner/staff/route.ts` | Staff CRUD API |
| `app/api/owner/users/route.ts` | User management API |
| `app/api/owner/companies/route.ts` | Company management API |
| `app/api/owner/activity/route.ts` | Activity feed API |
| `app/api/owner/internships/route.ts` | Internships overview API |
| `app/api/owner/analytics/route.ts` | Analytics API |
| `app/api/owner/audit/route.ts` | Audit logs API |
| `app/api/owner/settings/route.ts` | Persistent settings API |
| `app/api/staff/me/route.ts` | Staff self-service API |
| `app/dashboard/owner/staff/page.tsx` | Staff management page |
| `app/dashboard/owner/activity/page.tsx` | Activity feed page |
| `app/dashboard/owner/internships/page.tsx` | Internships overview page |
| `app/dashboard/owner/analytics/page.tsx` | Analytics page with charts |
| `app/dashboard/owner/audit/page.tsx` | Audit logs page |
| `app/dashboard/staff/page.tsx` | Staff dashboard page |

## Modified Files
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added STAFF role, Staff/Activity/AuditLog/PlatformSettings models, User.isActive |
| `app/dashboard/company/page.tsx` | Bigger logo (w-12 → w-16) |
| `app/api/upload/logo/route.ts` | Fixed to use Request/Response pattern |
| `app/dashboard/company/profile/page.tsx` | Added upload error logging |
| `app/browse/page.tsx` | Description fix, floating orbs, staggered animations, hover glow |
| `app/browse/[id]/page.tsx` | HTML description rendering |
| `app/dashboard/company/internships/new/page.tsx` | RichTextEditor integration |
| `app/dashboard/company/internships/page.tsx` | Edit button, HTML-stripped preview |
| `app/api/owner/users/route.ts` | Added PUT/DELETE handlers |
| `app/api/owner/companies/route.ts` | Added PUT/DELETE handlers, search |
| `app/dashboard/owner/users/page.tsx` | Full rewrite with actions |
| `app/dashboard/owner/companies/page.tsx` | Full rewrite with actions |
| `app/dashboard/owner/settings/page.tsx` | Full rewrite with persistent API |
| `components/DashboardSidebar.tsx` | Added STAFF case, Activity/Audit/Internships/Analytics links for OWNER |
| `app/dashboard/page.tsx` | Added STAFF redirect |
| `app/globals.css` | Added `fadeSlideUp` keyframe |
