# Phase 7 — PayMongo Billing Integration

## Overview
This phase implements payment processing using PayMongo, allowing companies to upgrade from the FREE plan to the PRO plan. Companies can view their current subscription, upgrade via PayMongo checkout, and have their subscription status updated automatically via webhooks.

## Current Progress

### 1. PayMongo Account Setup
- Created a PayMongo account
- Obtained test API keys from PayMongo dashboard

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

## What Will Be Built

### 1. Subscription/Billing Page
- Display current plan (FREE or PRO)
- Show plan features and pricing
- Upgrade button for FREE plan users

### 2. PayMongo Payment Integration
- Create PayMongo checkout session
- Redirect user to PayMongo payment page
- Handle payment success/failure

### 3. Webhook Handler
- Receive payment confirmation from PayMongo
- Verify webhook signature for security
- Update subscription status in database

### 4. Database Updates
- Subscription model already exists in Prisma schema:
  - `companyId` — Links to company
  - `plan` — FREE or PRO
  - `status` — ACTIVE or EXPIRED
  - `expiredAt` — Expiration date

## Database Schema (Already Created)
```prisma
enum Plan {
  FREE
  PRO
}

enum planStatus {
  ACTIVE
  EXPIRED
}

model Subscription {
  id        Int        @id @default(autoincrement())
  companyId Int        @unique
  company   Company    @relation(fields: [companyId], references: [id])
  plan      Plan
  status    planStatus
  expiredAt DateTime
  createdAt DateTime   @default(now())
}
```

## Files To Be Created
```
app/
├── dashboard/
│   └── company/
│       └── billing/
│           └── page.tsx               # Subscription/billing page
│
└── api/
    ├── subscription/
    │   ├── current/
    │   │   └── route.ts               # Get current subscription
    │   └── create/
    │       └── route.ts               # Create PayMongo checkout session
    └── webhook/
        └── paymongo/
            └── route.ts               # Handle PayMongo webhooks
```

## API Endpoints To Be Created
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscription/current` | GET | Get current subscription for company |
| `/api/subscription/create` | POST | Create PayMongo checkout session |
| `/api/webhook/paymongo` | POST | Receive PayMongo payment confirmation |

## PayMongo Integration Flow
```
1. Company clicks "Upgrade to PRO"
2. App creates PayMongo checkout session
3. User redirected to PayMongo payment page
4. User completes payment
5. PayMongo sends webhook to our API
6. Webhook updates subscription in database
7. User redirected back to billing page
```

## Security Notes
- ⚠️ **Never share or commit `.env` file to GitHub**
- `.gitignore` already contains `.env*` (line 34)
- PayMongo webhook signatures must be verified
- Test keys are safe for development (sk_test_ / pk_test_)
- Production keys (sk_live_ / pk_live_) must be kept secret

## Commands Used
```bash
# No new commands yet - pending implementation
```

## Next Steps
1. Build subscription/billing page
2. Create PayMongo checkout integration
3. Implement webhook handler
4. Test with PayMongo test mode
5. Commit and push

## References
- PayMongo Dashboard: https://dashboard.paymongo.com
- PayMongo Docs: https://developers.paymongo.com
