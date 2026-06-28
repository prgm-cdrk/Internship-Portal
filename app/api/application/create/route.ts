// This API route handles internship application creation
// It receives the internship ID from the request body
// It validates the user is authenticated and hasn't already applied
// Then creates the Application record linked to the user and internship

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/application/create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the internship ID from the request body
    const { internshipId } = await req.json();

    // Validate that internship ID is provided
    if (!internshipId) {
      return Response.json(
        { error: 'Internship ID is required' },
        { status: 400 }
      );
    }

    // Check if the internship exists
    const internship = await prisma.internship.findUnique({
      where: { id: parseInt(internshipId) }
    });

    if (!internship) {
      return Response.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Check if the user has already applied to this internship
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_internshipId: {
          userId: parseInt(session.user.id),
          internshipId: parseInt(internshipId)
        }
      }
    });

    if (existingApplication) {
      return Response.json(
        { error: 'You have already applied to this internship' },
        { status: 400 }
      );
    }

    // Create the application record in the database
    const application = await prisma.application.create({
      data: {
        userId: parseInt(session.user.id),
        internshipId: parseInt(internshipId),
        status: 'APPLIED'    // Default status when applying
      }
    });

    // Return success response with the created application data (status 201 = Created)
    return Response.json(
      {
        message: 'Application submitted successfully',
        application
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Application creation error:', error);
    return Response.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
