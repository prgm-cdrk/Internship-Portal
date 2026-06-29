// API route to count active applicant profiles for a company
// Returns the count and the limit based on subscription plan
// Used to enforce applicant profile limits per plan

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// Plan limits: max active applicant profiles per company
const PLAN_LIMITS: Record<string, number> = {
  FREE: 2,
  BASIC: 10,
  PRO: Infinity, // Unlimited
};

// Handle GET requests to /api/company/applicant-count
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the company for this user
    const company = await prisma.company.findUnique({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'Company not found' }, { status: 404 });
    }

    // Find the company's subscription to determine plan
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: company.id }
    });

    const plan = subscription?.plan || 'FREE';
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    // Count active applicant profiles
    // Active = applications that are NOT cancelled or completed
    const activeCount = await prisma.application.count({
      where: {
        internship: { companyId: company.id },
        status: { notIn: ['CANCELLED', 'COMPLETED'] }
      }
    });

    return Response.json({
      plan,
      activeCount,
      limit: limit === Infinity ? 'Unlimited' : limit,
      remaining: limit === Infinity ? 'Unlimited' : Math.max(0, limit - activeCount)
    }, { status: 200 });

  } catch (error) {
    console.error('Error counting applicants:', error);
    return Response.json({ error: 'Failed to count applicants' }, { status: 500 });
  }
}
