// This API route fetches all applications for the logged-in company's internships
// It checks if the user is authenticated, finds their company
// Then returns all applications across all their internships with applicant and internship details

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/application/get
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

    // Fetch all internships for this company
    const companyInternships = await prisma.internship.findMany({
      where: { companyId: company.id },
      select: { id: true }   // Only need the IDs
    });

    // Get all internship IDs
    const internshipIds = companyInternships.map(i => i.id);

    // Fetch all applications for these internships, with applicant and internship details
    const applications = await prisma.application.findMany({
      where: {
        internshipId: { in: internshipIds }   // Applications for any of the company's internships
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true
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
