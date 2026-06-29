// Owner Audit Logs API — track owner/staff actions
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
    const action = searchParams.get('action') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    const userIds = [...new Set(logs.map(l => l.userId))];
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    }) : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    const enriched = logs.map(l => ({
      ...l,
      user: userMap.get(l.userId) || null,
    }));

    return Response.json({ logs: enriched }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return Response.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
