// API route to fetch a single internship by ID for public browsing
// Returns internship details with company info and application count
// No authentication required

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const internshipId = parseInt(id);

    if (isNaN(internshipId)) {
      return Response.json({ error: 'Invalid internship ID' }, { status: 400 });
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!internship) {
      return Response.json({ error: 'Internship not found' }, { status: 404 });
    }

    return Response.json({ internship }, { status: 200 });
  } catch (error) {
    console.error('Error fetching internship:', error);
    return Response.json({ error: 'Failed to fetch internship' }, { status: 500 });
  }
}
