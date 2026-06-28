// This API route handles announcement creation for company managers
// It receives title and content from the form
// It validates the user is authenticated and has a company
// Then creates the Announcement record linked to their company

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/announcement/create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse announcement data from the request body
    const { title, content } = await req.json();

    // Validate that all required fields are provided
    if (!title || !content) {
      return Response.json(
        { error: 'Title and content are required' },
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

    // Create the announcement record in the database
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        companyId: company.id    // Link announcement to the company
      }
    });

    // Return success response with the created announcement data (status 201 = Created)
    return Response.json(
      {
        message: 'Announcement posted successfully',
        announcement
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Announcement creation error:', error);
    return Response.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
