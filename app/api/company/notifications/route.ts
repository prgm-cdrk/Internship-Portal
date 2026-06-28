// Company notification counts API
// Returns counts for pending reviews, new applications, and pending interns

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

    // New applications (APPLIED status)
    const newApplications = await prisma.application.count({
      where: {
        internshipId: { in: internshipIds },
        status: 'APPLIED'
      }
    });

    // Pending task reviews (COMPLETED but not reviewed)
    const pendingReviews = await prisma.task.count({
      where: {
        companyId: company.id,
        status: 'COMPLETED',
        reviewedAt: null
      }
    });

    // Pending interns (ACCEPTED but no start date set)
    const pendingInterns = await prisma.application.count({
      where: {
        internshipId: { in: internshipIds },
        status: 'ACCEPTED',
        startDate: null
      }
    });

    return Response.json({
      newApplications,
      pendingReviews,
      pendingInterns
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
