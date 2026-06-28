// Update application status API
// Allows company managers to update the status of an application
// Valid statuses: APPLIED, REVIEWED, INTERVIEW, ACCEPTED, REJECTED

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

const validStatuses = ['APPLIED', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, status: newStatus } = await req.json();

    if (!applicationId || !newStatus) {
      return Response.json({ error: 'Application ID and status are required' }, { status: 400 });
    }

    if (!validStatuses.includes(newStatus)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Find the company for this user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Find the application and verify it belongs to this company's internship
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: { internship: { select: { companyId: true } } }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.internship.companyId !== company.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the status
    const updated = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status: newStatus }
    });

    return Response.json({ message: 'Status updated', application: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating application status:', error);
    return Response.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
