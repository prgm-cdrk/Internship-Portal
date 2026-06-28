// This API route fetches all internships for the logged-in company manager
// It checks if the user is authenticated, finds their company
// Then returns all internships linked to that company

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/internship/get
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

    // Fetch all internships for this company, ordered by creation date (newest first)
    const internships = await prisma.internship.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }   // Count how many applicants each internship has
        }
      }
    });

    // Return the internships data
    return Response.json({ internships }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching internships:', error);
    return Response.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}
