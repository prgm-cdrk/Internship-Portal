// This API route fetches platform-wide statistics for the Owner dashboard
// It returns total users, companies, internships, active subscriptions, and revenue
// Only accessible by users with OWNER role

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/owner/stats
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is OWNER — only owners can access admin stats
    if (session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all platform statistics in parallel for better performance
    const [
      totalUsers,
      totalCompanies,
      totalInternships,
      activeSubscriptions
    ] = await Promise.all([
      // Count all users in the database
      prisma.user.count(),

      // Count all companies in the database
      prisma.company.count(),

      // Count all internships in the database
      prisma.internship.count(),

      // Count active subscriptions (BASIC or PRO plan)
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true }
      })
    ]);

    // Calculate total revenue from active subscriptions
    // BASIC = ₱299, PRO = ₱499 per month
    let totalRevenue = 0;
    activeSubscriptions.forEach((sub) => {
      if (sub.plan === 'BASIC') totalRevenue += 299;
      if (sub.plan === 'PRO') totalRevenue += 499;
    });

    // Return the statistics data
    return Response.json({
      stats: {
        totalUsers,
        totalCompanies,
        totalInternships,
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue
      }
    }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching owner stats:', error);
    return Response.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
