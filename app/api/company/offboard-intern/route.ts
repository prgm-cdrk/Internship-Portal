// Offboard Intern API — company manager marks intern as completed
// Sets status to COMPLETED, records offboardedAt timestamp
// Application record kept for 30 days then auto-deleted on page load

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await req.json();

    if (!applicationId) {
      return Response.json({ error: 'Application ID is required' }, { status: 400 });
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

    // Can only offboard ACCEPTED internships with startDate set
    if (application.status !== 'ACCEPTED' || !application.startDate) {
      return Response.json({ error: 'Can only offboard active interns with a start date' }, { status: 400 });
    }

    // Update status to COMPLETED and record offboardedAt
    const updated = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status: 'COMPLETED', offboardedAt: new Date() }
    });

    return Response.json({ message: 'Intern offboarded successfully', application: updated }, { status: 200 });
  } catch (error) {
    console.error('Error offboarding intern:', error);
    return Response.json({ error: 'Failed to offboard intern' }, { status: 500 });
  }
}
