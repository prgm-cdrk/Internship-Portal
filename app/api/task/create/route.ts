// This API route handles task creation for company managers
// It receives task data (title, description, deadline, assignedTo)
// It validates the user is authenticated and has a company
// Then creates the Task record linked to the company and assigned user

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/task/create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse task data from the request body
    const { title, description, deadline, assignedTo } = await req.json();

    // Validate that all required fields are provided
    if (!title || !description || !deadline || !assignedTo) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find the company linked to the logged-in user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If no company found, user must have a company first
    if (!company) {
      return Response.json(
        { error: 'You must have a company first' },
        { status: 400 }
      );
    }

    // Verify the assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: parseInt(assignedTo) }
    });

    if (!assignedUser) {
      return Response.json(
        { error: 'Assigned user not found' },
        { status: 404 }
      );
    }

    // Create the task record in the database
    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),       // Convert string date to Date object
        status: 'ONGOING',                  // Default status for new tasks
        assignedTo: parseInt(assignedTo),    // Link to the assigned user
        companyId: company.id               // Link to the company
      }
    });

    // Return success response with the created task data (status 201 = Created)
    return Response.json(
      {
        message: 'Task created successfully',
        task
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Task creation error:', error);
    return Response.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
