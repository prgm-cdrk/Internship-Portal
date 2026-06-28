// Cancel Intern API — company manager cancels an intern for any reason
// Sets status to CANCELLED, removes from Interns page
// Available at any time for ACCEPTED applications with startDate set

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

    // Can only cancel ACCEPTED internships
    if (application.status !== 'ACCEPTED') {
      return Response.json({ error: 'Can only cancel accepted internships' }, { status: 400 });
    }

    // Delete the resume file if it exists
    if (application.resumeUrl) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', application.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update status to CANCELLED and clear startDate
    const updated = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status: 'CANCELLED', startDate: null }
    });

    return Response.json({ message: 'Internship cancelled', application: updated }, { status: 200 });
  } catch (error) {
    console.error('Error cancelling intern:', error);
    return Response.json({ error: 'Failed to cancel internship' }, { status: 500 });
  }
}
