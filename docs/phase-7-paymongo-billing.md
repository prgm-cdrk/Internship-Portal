# Phase 7 — PayMongo Billing Integration

## Overview
This phase implements payment processing using PayMongo, allowing companies to upgrade from the FREE plan to BASIC or PRO plans. Companies can view their current subscription, upgrade via PayMongo checkout, and have their subscription status updated automatically via webhooks.

## What Was Done

### 1. PayMongo Account Setup
- Created a PayMongo account
- Obtained test API keys from PayMongo dashboard
- Keys stored in `.env` (never committed to GitHub)

### 2. Environment Variables Configured
Added to `.env`:
```
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_SECRET_KEY=sk_test_...
```

### 3. Security Verification
- Verified `.gitignore` contains `.env*` on line 34
- This covers `.env`, `.env.local`, and `.env.*.local`
- PayMongo keys will NOT be committed to GitHub
- GitHub push protection confirmed working (blocked a commit that accidentally contained keys)

### 4. Billing Page Created
**File:** `app/dashboard/company/billing/page.tsx`

Features:
- Displays current plan (FREE, BASIC, or PRO)
- Shows 3-column pricing comparison grid
- Upgrade buttons that redirect to PayMongo checkout
- Loading states and error handling
- 14-day free trial banner

### 5. Subscription GET API
**File:** `app/api/subscription/get/route.ts`

- Fetches current subscription for the logged-in company
- Returns FREE plan as default if no subscription exists
- Returns plan, status, and expiration date

### 6. Payment Checkout API
**File:** `app/api/payment/create-checkout/route.ts`

- Creates PayMongo checkout session
- Supports BASIC (₱299) and PRO (₱499) plan upgrades
- Sends request to PayMongo API with:
  - Line items with correct pricing in centavos
  - Payment methods: GCash, PayMaya, Card
  - Success/cancel redirect URLs
  - Reference number for tracking
- Returns checkout URL for frontend redirect

### 7. Webhook Handler
**File:** `app/api/webhook/paymongo/route.ts`

- Receives PayMongo payment notifications
- Handles events:
  - `payment.paid` — Upgrades company subscription to the paid plan
  - `payment.failed` — Logs failure
  - `checkout_session.completed` — Logs completion
- Parses reference number to extract company ID
- Uses `upsert` to create or update subscription record
- Returns 200 OK to acknowledge receipt

## Subscription Plans

| Plan | Price | Postings | Applicants | Features |
|------|-------|----------|------------|----------|
| FREE | ₱0/month | 1 | 3 | Basic features |
| BASIC | ₱299/month | 10 | 10 | + Task management |
| PRO | ₱499/month | Unlimited | Unlimited | + Priority support |

## Files Created
```
app/
├── dashboard/
│   └── company/
│       └── billing/
│           └── page.tsx               # Billing page with 3 plan cards
│
└── api/
    ├── subscription/
    │   └── get/
    │       └── route.ts               # Get current subscription
    ├── payment/
    │   └── create-checkout/
    │       └── route.ts               # Create PayMongo checkout session
    └── webhook/
        └── paymongo/
            └── route.ts               # Handle PayMongo webhooks
```

## API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscription/get` | GET | Get current subscription for company |
| `/api/payment/create-checkout` | POST | Create PayMongo checkout session |
| `/api/webhook/paymongo` | POST | Receive PayMongo payment confirmation |

## PayMongo Integration Flow
```
1. Company clicks "Upgrade to BASIC/PRO"
2. App creates PayMongo checkout session via API
3. User redirected to PayMongo payment page
4. User completes payment (GCash/PayMaya/Card)
5. PayMongo sends webhook to /api/webhook/paymongo
6. Webhook updates subscription in database
7. User redirected back to billing page with success=true
```

## Security Notes
- ⚠️ **Never share or commit `.env` file to GitHub**
- `.gitignore` already contains `.env*` (line 34)
- GitHub push protection is active and will block commits containing secrets
- PayMongo webhook signatures should be verified in production
- Test keys are safe for development (sk_test_ / pk_test_)
- Production keys (sk_live_ / pk_live_) must be kept secret

## Test Results
| Endpoint | Test | Result |
|----------|------|--------|
| `GET /api/subscription/get` | No auth | ✅ Returns "Unauthorized" |
| `POST /api/payment/create-checkout` | No auth | ✅ Returns "Unauthorized" |
| `POST /api/webhook/paymongo` | payment.paid event | ✅ Returns "received: true" |

## Git Commits
```
3350a41 Phase 7: Billing page - subscription display with FREE/PRO plans and upgrade button
13f49bd Phase 7: Add comments to billing page
3c88db0 Phase 7: Subscription GET API - fetches current plan for company
9d0e950 Phase 7: PayMongo checkout API - creates payment session for PRO upgrade
05e1003 Phase 7: PayMongo webhook handler - processes payment confirmation and upgrades subscription
a0ca199 Phase 7: Updated plans - FREE (₱0/3 applicants), BASIC (₱299/10 postings), PRO (₱499/unlimited)
```

## References
- PayMongo Dashboard: https://dashboard.paymongo.com
- PayMongo Docs: https://developers.paymongo.com

---

# Phase 8 — Owner Dashboard (Analytics)

## Overview
Phase 8 will build the Owner Dashboard with analytics and admin features. The Owner is the portal administrator who can manage all users, companies, and view platform-wide statistics.

## Planned Features

### 1. Owner Dashboard Home
- Total users count (by role)
- Total companies count
- Total internships posted
- Total applications submitted
- Revenue summary (PRO subscriptions)

### 2. User Management
- View all registered users
- Filter by role (Owner, Company, Applicant)
- Search users by name or email
- View user details
- Delete or disable users (if needed)

### 3. Company Management
- View all registered companies
- See company subscription status (FREE/BASIC/PRO)
- View company details and internships
- Manage company accounts

### 4. Platform Analytics
- Registration trends (daily/weekly/monthly)
- Application trends
- Popular industries
- Subscription conversion rates

## Files To Be Created
```
app/
├── dashboard/
│   └── owner/
│       ├── page.tsx               # Owner dashboard home with stats
│       ├── users/
│       │   └── page.tsx           # User management
│       └── companies/
│           └── page.tsx           # Company management
│
└── api/
    └── admin/
        ├── stats/
        │   └── route.ts           # Get platform statistics
        ├── users/
        │   └── route.ts           # Get all users
        └── companies/
            └── route.ts           # Get all companies
```

## API Endpoints To Be Created
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Get platform-wide statistics |
| `/api/admin/users` | GET | Get all users with filtering |
| `/api/admin/companies` | GET | Get all companies with subscription info |

## Key Decisions
- Only OWNER role can access admin endpoints
- All admin APIs will check session for OWNER role
- Statistics will be calculated from database aggregates
- No external analytics service needed (all data from PostgreSQL)

## Next Steps
1. Build owner dashboard home page with stats
2. Create user management page
3. Create company management page
4. Implement admin API endpoints
5. Test and commit
