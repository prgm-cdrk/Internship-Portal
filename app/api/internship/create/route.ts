// This API route handles internship creation for company managers
// It receives internship data from the posting form
// It validates the user is authenticated and has a company
// Then creates the Internship record linked to their company

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/internship/create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse internship data from the request body
    const { title, description, slots, deadline } = await req.json();

    // Validate that all required fields are provided
    if (!title || !description || !slots || !deadline) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find the company linked to the logged-in user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If no company found, user must create one first
    if (!company) {
      return Response.json(
        { error: 'You must create a company first' },
        { status: 400 }
      );
    }

    // Create the internship record in the database, linked to the company
    const internship = await prisma.internship.create({
      data: {
        title,
        description,
        slots: parseInt(slots),
        deadline: new Date(deadline),   // Convert string date to Date object
        companyId: company.id           // Link internship to the company
      }
    });

    // Return success response with the created internship data (status 201 = Created)
    return Response.json(
      {
        message: 'Internship posted successfully',
        internship
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Internship creation error:', error);
    return Response.json(
      { error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}
