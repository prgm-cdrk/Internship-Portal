// This API route fetches all tasks assigned to the logged-in applicant
// It returns tasks with company info and deadline
// Each task shows its status (ACCEPTED, ONGOING, COMPLETED)

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/task/my
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all tasks assigned to this user with company info
    const tasks = await prisma.task.findMany({
      where: { assignedTo: parseInt(session.user.id) },
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
