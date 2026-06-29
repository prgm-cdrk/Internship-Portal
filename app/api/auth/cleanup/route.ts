// Cleanup API endpoint for deleting unverified users
// Deletes users where emailVerified is null AND createdAt > 7 days ago
// Also deletes associated records (applications, tasks, verification tokens)
// Can be triggered by external cron service (e.g., cron-job.org) hitting this endpoint daily

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle GET requests to /api/auth/cleanup
// Protected by a simple secret key to prevent unauthorized access
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Simple protection — only allow cleanup with the correct secret
    if (secret !== process.env.CLEANUP_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate the cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Find unverified users older than 7 days
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
        createdAt: { lt: cutoffDate }
      },
      select: { id: true, email: true, createdAt: true }
    });

    if (unverifiedUsers.length === 0) {
      return Response.json({
        message: 'No unverified users to clean up.',
        deleted: 0
      }, { status: 200 });
    }

    const userIds = unverifiedUsers.map(u => u.id);

    // Delete associated records first (cascade won't delete Company subscriptions)
    await prisma.verificationToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.document.deleteMany({ where: { application: { userId: { in: userIds } } } });
    await prisma.application.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.task.deleteMany({ where: { assignedTo: { in: userIds } } });

    // Delete the unverified users
    const deleted = await prisma.user.deleteMany({
      where: {
        id: { in: userIds }
      }
    });

    console.log(`──────────────────────────────────────────`);
    console.log(`🧹 CLEANUP: Deleted ${deleted.count} unverified user(s)`);
    unverifiedUsers.forEach(u => {
      console.log(`   - ${u.email} (registered ${u.createdAt.toISOString()})`);
    });
    console.log(`──────────────────────────────────────────`);

    return Response.json({
      message: `Deleted ${deleted.count} unverified user(s).`,
      deleted: deleted.count,
      users: unverifiedUsers.map(u => u.email)
    }, { status: 200 });

  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
