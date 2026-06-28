// API to fetch hired interns for the logged-in company
// Returns ACCEPTED interns with startDate set (active interns)
// Also returns COMPLETED interns within 30 days (offboarded interns)
// Auto-deletes COMPLETED records older than 30 days on each load

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

    const internships = await prisma.internship.findMany({
      where: { companyId: company.id },
      select: { id: true }
    });
    const internshipIds = internships.map(i => i.id);

    // Auto-delete COMPLETED records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredRecords = await prisma.application.findMany({
      where: {
        internshipId: { in: internshipIds },
        status: 'COMPLETED',
        offboardedAt: { lt: thirtyDaysAgo }
      }
    });

    // Delete resume files for expired records before deleting them
    if (expiredRecords.length > 0) {
      const fs = await import('fs');
      const path = await import('path');

      for (const record of expiredRecords) {
        if (record.resumeUrl) {
          const filePath = path.join(process.cwd(), 'public', record.resumeUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      // Delete the expired Application records
      const expiredIds = expiredRecords.map(r => r.id);
      await prisma.application.deleteMany({
        where: { id: { in: expiredIds } }
      });
    }

    // Fetch both active (ACCEPTED + startDate) and recently offboarded (COMPLETED within 30 days)
    const applications = await prisma.application.findMany({
      where: {
        internshipId: { in: internshipIds },
        OR: [
          { status: 'ACCEPTED', startDate: { not: null } },
          { status: 'COMPLETED', offboardedAt: { gte: thirtyDaysAgo } }
        ]
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

    const seen = new Set<number>();
    const interns = applications
      .filter(app => {
        if (seen.has(app.user.id)) return false;
        seen.add(app.user.id);
        return true;
      })
      .map(app => ({
        id: app.user.id,
        applicationId: app.id,
        name: app.user.name,
        email: app.user.email,
        internship: app.internship.title,
        startDate: app.startDate,
        resumeUrl: app.resumeUrl,
        status: app.status,
        offboardedAt: app.offboardedAt
      }));

    return Response.json({ interns }, { status: 200 });
  } catch (error) {
    console.error('Error fetching accepted interns:', error);
    return Response.json({ error: 'Failed to fetch accepted interns' }, { status: 500 });
  }
}
