// This API route fetches all companies for the Owner dashboard
// It returns companies with their subscription info and manager name
// Only accessible by users with OWNER role

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/owner/companies
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is OWNER — only owners can access company management
    if (session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all companies with subscription info
    const companies = await prisma.company.findMany({
      include: {
        subscriptions: {
          select: {
            plan: true,
            status: true,
            expiredAt: true
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch manager info for each company (no Prisma relation — query separately)
    const userIds = companies.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Merge manager info into companies
    const companiesWithManagers = companies.map(c => ({
      ...c,
      manager: userMap.get(c.userId) || null,
      subscription: c.subscriptions?.[0] || null,
      subscriptions: undefined
    }));

    // Return the companies data
    return Response.json({ companies: companiesWithManagers }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching companies:', error);
    return Response.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
