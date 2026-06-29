// Owner Activity Feed API
// GET: Fetch recent platform activities with filters

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    // Fetch user names for activities that have userId
    const userIds = activities.filter(a => a.userId).map(a => a.userId!) as number[];
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
      select: { id: true, name: true },
    }) : [];
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const enriched = activities.map(a => ({
      ...a,
      userName: a.userId ? userMap.get(a.userId) || 'Unknown' : 'System',
    }));

    return Response.json({ activities: enriched }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return Response.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
