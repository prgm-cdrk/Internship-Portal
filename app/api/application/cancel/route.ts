// Cancel API for applicant applications
// Allows applicants to withdraw their application if status is still APPLIED
// Deletes the application record and the uploaded resume file

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
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

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only the owner can cancel
    if (application.userId !== parseInt(session.user.id)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only cancel if status is APPLIED
    if (application.status !== 'APPLIED') {
      return Response.json({ error: 'Cannot cancel application that has already been reviewed' }, { status: 400 });
    }

    // Delete the resume file if it exists
    if (application.resumeUrl) {
      try {
        const filepath = join(process.cwd(), 'public', application.resumeUrl);
        await unlink(filepath);
      } catch {
        // File may not exist, continue anyway
      }
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: parseInt(applicationId) }
    });

    return Response.json({ message: 'Application cancelled successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error cancelling application:', error);
    return Response.json({ error: 'Failed to cancel application' }, { status: 500 });
  }
}
