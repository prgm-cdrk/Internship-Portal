// This API route fetches all internships for applicants to browse
// It returns internships with company info and application counts
// No authentication required - internships are public

import { PrismaClient } from '@prisma/client';    // Prisma client to query database

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/internship/browse
export async function GET(req: Request) {
  try {
    // Fetch all internships with company name and application count
    const internships = await prisma.internship.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            logoUrl: true,
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Return the internships data
    return Response.json({ internships }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching internships:', error);
    return Response.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}
