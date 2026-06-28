// This API route handles company creation for COMPANY role users
// It receives company name, industry, and optional website from the create company form
// It validates the user is authenticated, checks they don't already have a company
// Then creates the Company record linked to the user

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/company/create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse company data from the request body
    const { name, industry, website } = await req.json();

    // Validate that required fields are provided
    if (!name || !industry) {
      return Response.json(
        { error: 'Company name and industry are required' },
        { status: 400 }
      );
    }

    // Check if user already has a company — prevent creating multiple companies
    const existingCompany = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If company exists, return an error
    if (existingCompany) {
      return Response.json(
        { error: 'You already have a company' },
        { status: 400 }
      );
    }

    // Create the company record in the database, linked to the user
    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website: website || null,        // Website is optional, save as null if empty
        userId: parseInt(session.user.id) // Link company to the logged-in user
      }
    });

    // Return success response with the created company data (status 201 = Created)
    return Response.json(
      {
        message: 'Company created successfully',
        company
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Company creation error:', error);
    return Response.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
