// This API route fetches all subscriptions for the Owner dashboard
// It returns subscriptions with company info, plan, status, and revenue data
// Only accessible by users with OWNER role

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/owner/subscriptions
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is OWNER or STAFF
    if (session.user?.role !== 'OWNER' && session.user?.role !== 'STAFF') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all subscriptions with company info
    const subscriptions = await prisma.subscription.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate revenue summary
    let totalRevenue = 0;
    let activeCount = 0;
    let basicCount = 0;
    let proCount = 0;

    subscriptions.forEach((sub) => {
      if (sub.status === 'ACTIVE') {
        activeCount++;
        if (sub.plan === 'BASIC') {
          totalRevenue += 299;
          basicCount++;
        }
        if (sub.plan === 'PRO') {
          totalRevenue += 499;
          proCount++;
        }
      }
    });

    // Return the subscriptions data with revenue summary
    return Response.json({
      subscriptions,
      summary: {
        total: subscriptions.length,
        active: activeCount,
        basic: basicCount,
        pro: proCount,
        totalRevenue
      }
    }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching subscriptions:', error);
    return Response.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
