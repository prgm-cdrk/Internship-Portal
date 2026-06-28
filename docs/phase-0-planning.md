# Phase 0 — Planning

## Overview
This phase covers the initial planning and analysis of the Internship Portal project. No code was written — this was purely about understanding the project structure, reviewing the roadmap, and setting expectations for the work ahead.

## What Was Done

### 1. Project Structure Review
- Accessed the project directory at `C:\Users\Cedrick\Downloads\LegionSpace\Download\internship-portal-nextjs`
- Identified it as a **Next.js 16** project using the App Router
- Noted existing files and folder structure:
  ```
  app/           → Next.js App Router pages
  lib/           → Library/helper files
  public/        → Static assets
  .next/         → Build output
  node_modules/  → Dependencies
  ```

### 2. Reviewed Existing Code
- Checked `lib/auth.ts` — had only imports (no configuration yet)
- Checked `app/page.tsx` — default Next.js starter page
- Checked `app/login/page.tsx` — empty initially, then populated

### 3. Roadmap Analysis
The 12-phase roadmap was reviewed in detail:

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 0 | Planning | 3-5 days |
| Phase 1 | Project Setup | 2-3 days |
| Phase 2 | Database Design & Setup | 3-5 days |
| Phase 3 | Authentication | 4-6 days |
| Phase 4 | Role-Based Dashboards | 3-4 days |
| Phase 5 | Company Features | 6-8 days |
| Phase 6 | Applicant Features | 7-10 days |
| Phase 7 | Subscription & Billing | 6-8 days |
| Phase 8 | Owner Dashboard | 4-5 days |
| Phase 9 | Polish & UI | 5-7 days |
| Phase 10 | Testing | 4-6 days |
| Phase 11 | Deployment | 2-3 days |
| Phase 12 | Final Documentation | 3-4 days |

### 4. Tech Stack Identified
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL (Supabase initially, later switched to Railway)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Payments:** Stripe (planned for Phase 7)

## Key Decisions
- Using **Next.js App Router** (not Pages Router)
- Using **NextAuth v5** (not v4) for the credentials provider pattern
- Three user roles: **Owner**, **Company Manager**, **Applicant**
- OWNER role removed from public registration (created manually)

## Files Created/Modified
None — this was a planning-only phase.

## Lessons Learned
- Planning before coding saves significant refactoring time
- Understanding the full roadmap helps prioritize tasks
- The auth.ts file had unused imports that caused warnings — a sign of incomplete setup
