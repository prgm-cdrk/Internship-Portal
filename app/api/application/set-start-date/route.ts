// Set start date API for accepted applications
// Only works when application status is ACCEPTED
// Once set, the applicant appears in the Interns page

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, startDate } = await req.json();

    if (!applicationId || !startDate) {
      return Response.json({ error: 'Application ID and start date are required' }, { status: 400 });
    }

    // Find the company for this user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: { internship: { select: { companyId: true } } }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify ownership
    if (application.internship.companyId !== company.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only set start date if ACCEPTED
    if (application.status !== 'ACCEPTED') {
      return Response.json({ error: 'Start date can only be set for accepted applications' }, { status: 400 });
    }

    // Update the start date
    const updated = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { startDate: new Date(startDate) }
    });

    return Response.json({ message: 'Start date set', application: updated }, { status: 200 });
  } catch (error) {
    console.error('Error setting start date:', error);
    return Response.json({ error: 'Failed to set start date' }, { status: 500 });
  }
}
