// This API route fetches the company data for the logged-in user
// It checks if the user is authenticated, then looks up their company in the database
// Returns the company data if found, or an error if not found

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/company/get
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

    // If no company found, return 404 error
    if (!company) {
      return Response.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Return the company data
    return Response.json({ company }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching company:', error);
    return Response.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
