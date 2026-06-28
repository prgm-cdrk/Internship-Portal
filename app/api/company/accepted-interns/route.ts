// API to fetch accepted applicants for the logged-in company
// Returns users who have an application with status ACCEPTED

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Get all internship IDs for this company
    const internships = await prisma.internship.findMany({
      where: { companyId: company.id },
      select: { id: true }
    });
    const internshipIds = internships.map(i => i.id);

    // Get unique users with ACCEPTED applications
    const acceptedApplications = await prisma.application.findMany({
      where: {
        internshipId: { in: internshipIds },
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        internship: {
          select: { id: true, title: true }
        }
      }
    });

    // Deduplicate users (same user might have multiple accepted applications)
    const seen = new Set<number>();
    const interns = acceptedApplications
      .filter(app => {
        if (seen.has(app.user.id)) return false;
        seen.add(app.user.id);
        return true;
      })
      .map(app => ({
        id: app.user.id,
        name: app.user.name,
        email: app.user.email,
        internship: app.internship.title
      }));

    return Response.json({ interns }, { status: 200 });
  } catch (error) {
    console.error('Error fetching accepted interns:', error);
    return Response.json({ error: 'Failed to fetch accepted interns' }, { status: 500 });
  }
}
