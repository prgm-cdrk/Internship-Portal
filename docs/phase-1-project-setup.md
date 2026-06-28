# Phase 1 — Project Setup

## Overview
This phase covers the initial project setup, including the Next.js project initialization, dependency installation, and first configurations.

## What Was Done

### 1. Project Initialization
The project was moved into a dedicated folder structure:
```
C:\Users\Cedrick\Downloads\LegionSpace\Download\internship-portal-nextjs
```

### 2. Dependencies Installed
```bash
npm install next@16.2.9 react@19.2.4 react-dom@19.2.4
npm install next-auth@5.0.0-beta.31
npm install bcryptjs @types/bcryptjs
npm install prisma@5.22.0 @prisma/client@5.22.0
npm install dotenv pg
```

### 3. Dev Dependencies
```bash
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D tailwindcss @tailwindcss/postcss
npm install -D eslint eslint-config-next
```

### 4. Project Scripts
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### 5. Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.ts` | Next.js configuration |
| `.env` | Environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL) |
| `middleware.ts` | Route protection for unauthenticated users |

### 6. Initial Folder Structure
```
internship-portal-nextjs/
├── app/                    # App Router pages and API routes
│   ├── api/                # Backend API endpoints
│   ├── dashboard/          # Protected dashboard pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (default Next.js starter)
│   └── globals.css         # Global styles
├── lib/                    # Helper libraries (auth.ts)
├── prisma/                 # Database schema
├── public/                 # Static assets
├── middleware.ts           # Route protection
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## Commands Used
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on port 3000 |
| `npm install <package>` | Install new dependency |
| `npm install -D <package>` | Install development dependency |

## Notes
- The project uses **Next.js App Router** (not Pages Router)
- TypeScript is configured by default
- Tailwind CSS 4 is set up with PostCSS plugin
- `NEXTAUTH_URL` must match the running dev server (`http://localhost:3000`)
- `NEXTAUTH_SECRET` can be generated with `openssl rand -hex 32`
