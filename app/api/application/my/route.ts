// This API route fetches all applications for the logged-in applicant
// It returns applications with internship and company info
// Each application shows its current status (APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED)

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/application/my
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all applications for this user with internship and company info
    const applications = await prisma.application.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    // Return the applications data
    return Response.json({ applications }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching applications:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
