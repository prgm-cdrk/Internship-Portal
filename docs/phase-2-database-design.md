# Phase 2 — Database Design & Setup

## Overview
This phase covers the database design, Prisma ORM setup, and PostgreSQL connection to Railway. It includes designing the complete database schema and connecting it to the production database.

## What Was Done

### 1. PostgreSQL Database Setup (Railway)
The project initially tried Supabase but had network issues. Switched to **Railway PostgreSQL**.

**Connection URL:**
```
postgresql://postgres:NLdpJJNEVYtVRyIEzTuxmjeIGDDJZwyF@thomas.proxy.rlwy.net:33477/railway
```

### 2. Prisma Configuration

**Installed Prisma:**
```bash
npm install prisma@5.22.0 @prisma/client@5.22.0
```

**Note:** Prisma 7 was attempted but caused engine hangs on Windows when connecting to PostgreSQL poolers. Prisma 5 was chosen as the stable alternative.

**Schema Generator Config:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Database Schema Design

The schema defines all models and their relationships:

#### Models Created

| Model | Purpose |
|-------|---------|
| **User** | Stores all user accounts with role-based access |
| **Company** | Company profiles linked to user accounts |
| **Internship** | Internship postings created by companies |
| **Application** | Applications submitted by applicants to internships |
| **Document** | Uploaded documents tied to applications |
| **Task** | Tasks assigned to applicants by companies |
| **Announcement** | Company announcements for interns |
| **Subscription** | Stripe subscription/billing (planned for Phase 7) |

#### Enums Created

| Enum | Values | Purpose |
|------|--------|---------|
| **Role** | OWNER, COMPANY, APPLICANT | User roles |
| **PermissionLevel** | ADMIN, MODERATOR, VIEWER | Company member permissions |
| **Status** | APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED | Application status |
| **taskStatus** | ACCEPTED, ONGOING, COMPLETED | Task progress tracking |
| **Plan** | FREE, BASIC, PRO | Subscription plans |
| **planStatus** | ACTIVE, EXPIRED | Subscription status |

#### Relationships
```
User ─1:N─ Company
User ─1:N─ Application
User ─1:N─ Task
Company ─1:N─ Internship
Company ─1:N─ Task
Company ─1:N─ Announcement
Company ─1:N─ Subscription
Internship ─1:N─ Application
Application ─1:N─ Document

Application: @@unique([userId, internshipId])  // prevents duplicate applications
```

### 4. Push Schema to Database
```bash
npx prisma db push
```

**Note:** `prisma generate` alone was causing engine hangs. `prisma db push` handles both generation and syncing.

### 5. .env Configuration
```env
DATABASE_URL="postgresql://postgres:NLdpJJNEVYtVRyIEzTuxmjeIGDDJZwyF@thomas.proxy.rlwy.net:33477/railway"
```

## Files Created/Modified
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete database schema with all models and enums |
| `.env` | DATABASE_URL connection string |

## Commands Used
| Command | Purpose |
|---------|---------|
| `npx prisma init` | Initialize Prisma in the project |
| `npx prisma db push` | Push schema to database and generate client |
| `npx prisma studio` | Open Prisma Studio to view database |

## Schema File Location
```
prisma/schema.prisma
```

## Key Decisions
- **Prisma 5 over Prisma 7** — Prisma 7 engine hangs on Windows when connecting to PostgreSQL poolers
- **Railway over Supabase** — Supabase DNS resolves to IPv6 only, machine can't route; Railway works
- **`prisma-client-js` generator** — Edge runtime (middleware) can't resolve custom Prisma output paths; using default `@prisma/client` import
- **Default schema URL** — Removed `prisma.config.ts` (Prisma 7 artifact), added `url = env("DATABASE_URL")` back in schema

## Lessons Learned
- Prisma 7 has a different configuration approach (`prisma.config.ts`) that can conflict with the standard `.env` setup
- Supabase IPv6 issue requires network configuration changes that may not work on all machines
- Railway provides a simpler connection through its proxy system
- `prisma db push` is more reliable than `prisma generate` + `prisma migrate dev` for initial setup
