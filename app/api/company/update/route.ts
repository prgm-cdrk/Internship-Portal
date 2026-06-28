// This API route handles company profile updates
// It receives updated company data (name, industry, website) from the profile page
// It validates the user is authenticated, finds their company, and updates it

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle PUT requests to /api/company/update
export async function PUT(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse updated company data from the request body
    const { name, industry, website } = await req.json();

    // Validate that required fields are provided
    if (!name || !industry) {
      return Response.json(
        { error: 'Company name and industry are required' },
        { status: 400 }
      );
    }

    // Find the company linked to the logged-in user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If no company found, return 404 error
    if (!company) {
      return Response.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Update the company record with new data
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        industry,
        website: website || null   // Website is optional, save as null if empty
      }
    });

    // Return success response with updated company data
    return Response.json(
      {
        message: 'Company updated successfully',
        company: updatedCompany
      },
      { status: 200 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Company update error:', error);
    return Response.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
