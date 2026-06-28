// This API route fetches all tasks for the logged-in company
// It checks if the user is authenticated, finds their company
// Then returns all tasks linked to that company with assigned user details

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/task/get
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

    // Fetch all tasks for this company with assigned user details
    const tasks = await prisma.task.findMany({
      where: { companyId: company.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }   // Most recent tasks first
    });

    // Return the tasks data
    return Response.json({ tasks }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching tasks:', error);
    return Response.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
