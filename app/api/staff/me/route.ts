// Staff self-service API — returns the current staff member's permissions
// Accessible by any STAFF user (not just OWNER)

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STAFF') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: parseInt(session.user.id) },
      select: { role: true, permissions: true, isSuspended: true },
    });

    if (!staff) {
      return Response.json({ error: 'Staff record not found' }, { status: 404 });
    }

    if (staff.isSuspended) {
      return Response.json({ error: 'Account suspended' }, { status: 403 });
    }

    return Response.json({
      role: staff.role,
      permissions: JSON.parse(staff.permissions),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff info:', error);
    return Response.json({ error: 'Failed to fetch staff info' }, { status: 500 });
  }
}
