# Updates v2.0 — Landing Page, Contact Us & Navigation Fixes

## Overview
This document tracks all updates made after Phase 9 completion, focusing on the landing page, branding, navigation fixes, and UI polish.

---

## Landing Page (Full Marketing Page)

### Complete Rewrite of `app/page.tsx`
**Before:** Single hero section with minimal content
**After:** Full marketing landing page with 10+ sections

### Sections Added
| Section | Description |
|---------|-------------|
| **Header** | Arcana Solution logo + nav (Features, Pricing, How It Works, FAQ) + Sign In/Get Started |
| **Hero** | Two-column: left (headline + typing effect + CTAs), right (InternsHub logo in glass card) |
| **Stats Bar** | 500+ Interns Placed, 120+ Companies, 95% Satisfaction — counter animation, floating card straddling hero/features |
| **Features** | 6 cards with tilt-on-hover (Post Internships, Track Applications, Task Management, Intern Lifecycle, Smart Notifications, Billing) |
| **How It Works** | Two-column (For Companies 4 steps, For Applicants 4 steps) |
| **Pricing** | 3 tiers: FREE (₱0), BASIC (₱299), PRO (₱499 with "Most Popular" badge) |
| **Dashboard Preview** | Fake mockup with sidebar, stats, activity |
| **Testimonials** | 3 placeholder quotes |
| **FAQ** | 6 accordion items |
| **Contact Us** | Email/Phone/Location cards + contact form |
| **CTA** | Split layout (top half purple bg, bottom half with 3 value props) |
| **Footer** | Brand, Product, Company, Legal links + social icons |

### Hero Animations
- **Typing effect:** "The Modern Way to" types out on page load
- **Gradient text animation:** "Manage Internships" gradient shifts colors
- **Counter animation:** Stats count up from 0 when scrolled into view
- **Card tilt on hover:** 3D transform on feature cards
- **Staggered card entrance:** Sections fade in on scroll

### Background Effects
- 5 animated gradient orbs (drift, drift-reverse, float animations)
- Shimmer grid dots
- Mouse-follow glow (400px purple blur follows cursor)
- Parallax scrolling (background orbs move slower than content)

### Scroll Animations
- **Scroll progress bar:** Purple gradient bar at top of viewport
- **Scroll reveal:** IntersectionObserver on all sections
- **Counter animation:** Stats count up on scroll into view

---

## Contact Us Section

### Added to Landing Page
**File:** `app/page.tsx` (between FAQ and CTA sections)

### Features
- **3 contact cards:** Email, Phone, Location with hover effects
- **Contact form:** Name, Email, Subject, Message fields + Send button
- Cards use `bg-white/[0.03]` with `border-white/5` and `hover:border-arcana-primary/30`
- All styled with `reveal` animation class for scroll-triggered entrance

---

## Navigation Fixes

### Header Home Button
**File:** `components/DashboardHeader.tsx`

**Before:** `router.push('/')` — opened landing page in same tab, redirecting away from dashboard
**After:** `window.open('/', '_blank')` — opens landing page in a new tab, dashboard stays open

### Sidebar Dashboard Button
**File:** `components/DashboardSidebar.tsx`

**Before:** Labeled "Home" with `path: 'HOME'` (opened landing page)
**After:** Labeled "Dashboard" with `path: '/dashboard/{role}'` (navigates to role-specific dashboard)

### Landing Page Auth Redirect Removed
**File:** `app/page.tsx`

**Before:** `useEffect` redirected authenticated users to `/dashboard`
**After:** Removed — authenticated users can now view the landing page

**Reason:** Users clicking "Home" from the header need to see the landing page, not get bounced back to their dashboard.

---

## Branding & Fonts

### Product Name
- **InternsHub** — Product name (not "Internship Portal")
- **Arcana Solution** — Company name

### Two-Font System
| Font | Usage | Source |
|------|-------|--------|
| **Space Grotesk** | Landing page only | Google Fonts CDN (`<link>` in `layout.tsx`) |
| **Satoshi** | Rest of site (dashboard, login, register) | Fontshare CDN (`<link>` in `layout.tsx`) |

**Important:** Google Fonts `@import url(...)` must NOT be in `globals.css` — conflicts with Tailwind v4 PostCSS. Must use `<link>` tags in `layout.tsx`.

### Arcana Purple Palette (Landing Page)
| Token | Hex | Usage |
|-------|-----|-------|
| `arcana-primary` | `#7262F8` | Primary buttons, accents |
| `arcana-light` | `#8B7CFF` | Hover states, highlights |
| `arcana-indigo` | `#5E63E8` | Secondary elements |
| `arcana-deep` | `#5142D9` | Button hover states |
| `arcana-bg` | `#09090F` | Landing page background |
| `arcana-text` | `#F4F4F7` | Landing page text |

### Login Page Updates
**File:** `app/login/page.tsx`

- Added InternsHub logo (centered, 80x80px) with product name
- Arcana Solution logo fixed to **upper right corner of viewport** (not relative to container)
- Arcana logo is hyperlinked to landing page (`/`)
- "Login" heading removed
- "or" divider restored between form and register link

### Logo Files Added
- `public/Arcana-Logo.png` — Arcana Solution company logo
- `public/internsHub-logo.png` — InternsHub product logo
- `public/arcana-text.png` — Arcana text logo

---

## CSS & Theme Updates

### New Animations in `globals.css`
| Animation | Keyframes | Usage |
|-----------|-----------|-------|
| `drift` | Translates orb left/right across viewport | Background gradient orbs |
| `drift-reverse` | Translates orb right/left (opposite direction) | Alternating orb movement |
| `gradient-text` | Shifts `background-position` on gradient text | Hero headline animation |
| `logo-pulse` | Fades logo opacity in/out | Removed per user request |
| `shimmer` | Translates dots across background | Grid dot animation |

### New CSS Classes
| Class | Purpose |
|-------|---------|
| `.reveal` | IntersectionObserver target — initially hidden |
| `.revealed` | Applied when section enters viewport — fades in + slides up |
| `.typing-cursor` | Blinking cursor for typing effect |
| `.tilt-card` | 3D transform on hover (feature cards) |
| `.animate-gradient-text` | Gradient background shift animation |
| `.animate-shimmer` | Background dot shimmer |

### Overflow Fix
**Problem:** Background orbs caused horizontal scrollbar
**Fix:** Added `overflow-hidden` on root `<div>` wrapping landing page content

---

## Other Changes

### Documentation
- Created `docs/phase-9-ui-ux-polish.md` — Phase 9 documentation matching existing format
- Created `docs/updates_v1.0.md` — All fixes/features outside original plan
- Created `docs/updates_v2.0.md` — This document

### TypeScript Build
- Build compiles cleanly with zero TypeScript errors
- All type issues from v1.0 remain fixed

---

## Public Internship Browsing

### Public Browse Page (`/browse`)
**Files:**
- `app/browse/page.tsx` — Public browse page (no auth required)
- `app/browse/[id]/page.tsx` — Public internship detail page
- `app/api/internship/browse/[id]/route.ts` — Single internship API

**Design:** Matches landing page (arcana theme, Space Grotesk font, dark background)

**Features:**
- Search/filter by title, company, industry
- Expandable cards with full description
- Company info section
- Deadline countdown badges (days left / deadline passed)
- Stats bar (open positions, companies, total slots)
- **Logged out:** "Sign Up to Apply" prompt
- **Logged in:** "Apply Now" links to dashboard

### Landing Page Button Updated
**File:** `app/page.tsx`

**Before:** "Start Browsing Internships" → `/register`
**After:** "Start Browsing Internships" → `/browse`

---

## Email Verification System

### Schema Changes
**File:** `prisma/schema.prisma`

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| `User` | `emailVerified` | `DateTime?` | null = not verified; set on verification |
| `VerificationToken` | `token` | `String @unique` | Random 32-byte hex token |
| `VerificationToken` | `expiresAt` | `DateTime` | 7 days from creation |
| `VerificationToken` | `onDelete` | `Cascade` | Auto-deletes when user is deleted |

### Register Flow Updated
**File:** `app/api/auth/register/route.ts`

1. Create user (emailVerified = null)
2. Generate verification token (crypto.randomBytes)
3. Log verification URL to console (simulated email)
4. Return verifyUrl in response for dev convenience

### Verify Endpoint
**File:** `app/api/auth/verify/route.ts`

- `GET /api/auth/verify?token=xxx`
- Validates token, checks expiry, marks user as verified
- Deletes token after use (single-use)

### Verify Page
**File:** `app/verify/page.tsx`

- Shows "Verifying..." spinner while processing
- Success: green checkmark + "Go to Login" button
- Error: red X + "Register Again" link
- Wrapped in Suspense for searchParams access

### Cleanup Endpoint
**File:** `app/api/auth/cleanup/route.ts`

- `GET /api/auth/cleanup?secret=xxx`
- Deletes users where `emailVerified = null` AND `createdAt > 7 days`
- Also deletes associated records (applications, tasks, tokens)
- Protected by `CLEANUP_SECRET` env variable
- Can be triggered by external cron service (e.g., cron-job.org)

### Register Page Updated
**File:** `app/register/page.tsx`

- After registration, shows "Check Your Email" screen
- Displays verification URL for development convenience
- "Go to Login" button after registration

---

## Applicant Profile Limits

### Plan Limits
| Plan | Max Active Applicant Profiles |
|------|-------------------------------|
| FREE | 2 |
| BASIC | 10 |
| PRO | Unlimited |

### Applicant Count API
**File:** `app/api/company/applicant-count/route.ts`

- Returns `{ plan, activeCount, limit, remaining }`
- Counts applications that are NOT CANCELLED or COMPLETED

### Application Creation Limit Check
**File:** `app/api/application/create/route.ts`

- Before creating application, checks company's applicant count
- If count >= limit, returns 403 with plan limit message
- Prevents companies from exceeding their plan allowance

### Applicant Count Badge
**File:** `app/dashboard/company/applicants/page.tsx`

- Shows "X / Y profiles (PLAN)" badge next to page title
- Badge turns red when limit is reached

---

## Git Commits
```
feat: landing page, contact us, home button fix, auth & build fixes
feat: public internship browsing, email verification, applicant limits
```
**Commit:** `5735a3d` — Pushed to `origin/main`
