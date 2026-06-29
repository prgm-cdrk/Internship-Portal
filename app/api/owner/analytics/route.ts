// Owner Analytics API — platform-wide statistics and trends
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User signups over last 30 days (grouped by day)
    const signups = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count FROM "User" WHERE "createdAt" >= $1 GROUP BY DATE("createdAt") ORDER BY date`,
      thirtyDaysAgo
    );

    // Applications over last 30 days
    const applications = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("appliedAt") as date, COUNT(*) as count FROM "Application" WHERE "appliedAt" >= $1 GROUP BY DATE("appliedAt") ORDER BY date`,
      thirtyDaysAgo
    );

    // Role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    // Plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: { id: true },
      where: { status: 'ACTIVE' },
    });

    // Application status distribution
    const statusDistribution = await prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Summary stats
    const totalUsers = await prisma.user.count();
    const totalCompanies = await prisma.company.count();
    const totalInternships = await prisma.internship.count();
    const totalApplications = await prisma.application.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });

    // New signups this week vs last week
    const thisWeekSignups = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
    const lastWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekSignups = await prisma.user.count({ where: { createdAt: { gte: lastWeekStart, lt: sevenDaysAgo } } });

    // New applications this week
    const thisWeekApps = await prisma.application.count({ where: { appliedAt: { gte: sevenDaysAgo } } });
    const lastWeekApps = await prisma.application.count({ where: { appliedAt: { gte: lastWeekStart, lt: sevenDaysAgo } } });

    return Response.json({
      summary: { totalUsers, totalCompanies, totalInternships, totalApplications, activeSubscriptions },
      trends: {
        signups: signups.map(s => ({ date: String(s.date), count: Number(s.count) })),
        applications: applications.map(a => ({ date: String(a.date), count: Number(a.count) })),
      },
      distribution: {
        roles: roleDistribution.map(r => ({ role: r.role, count: r._count.id })),
        plans: planDistribution.map(p => ({ plan: p.plan, count: p._count.id })),
        statuses: statusDistribution.map(s => ({ status: s.status, count: s._count.id })),
      },
      weekly: {
        signups: { thisWeek: thisWeekSignups, lastWeek: lastWeekSignups },
        applications: { thisWeek: thisWeekApps, lastWeek: lastWeekApps },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
