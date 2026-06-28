// This API route fetches the current subscription for the logged-in company
// It returns the subscription plan (FREE/PRO) and status (ACTIVE/EXPIRED)
// If no subscription exists, it returns FREE plan as default

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/subscription/get
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the company linked to the logged-in user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If no company found, return error
    if (!company) {
      return Response.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Fetch subscription for this company
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: company.id }
    });

    // If no subscription exists, return FREE plan as default
    if (!subscription) {
      return Response.json({
        subscription: {
          plan: 'FREE',
          status: 'ACTIVE',
          expiredAt: null
        }
      }, { status: 200 });
    }

    // Return the subscription data
    return Response.json({ subscription }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching subscription:', error);
    return Response.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
