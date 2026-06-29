// Owner User Management API
// GET: List all users with search
// PUT: Update user role, suspend/activate
// DELETE: Delete a user account

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { logActivity, logAudit } from '@/lib/activity';

const prisma = new PrismaClient();

// GET /api/owner/users — list all users with optional search
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, role: true, permissionLevel: true,
        isActive: true, createdBy: true, emailVerified: true, createdAt: true,
        _count: { select: { applications: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const total = await prisma.user.count({ where });

    return Response.json({ users, total }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT /api/owner/users — update user role or suspend/activate
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { userId, role, isActive } = await req.json();
    if (!userId) return Response.json({ error: 'User ID required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    if (user.role === 'OWNER') return Response.json({ error: 'Cannot modify owner accounts' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await logAudit({
      userId: ownerId,
      action: 'user.update',
      target: `user:${userId}`,
      details: JSON.stringify(updateData),
    });

    return Response.json({ message: 'User updated', user: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/owner/users — delete a user account
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { userId } = await req.json();
    if (!userId) return Response.json({ error: 'User ID required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    if (user.role === 'OWNER') return Response.json({ error: 'Cannot delete owner accounts' }, { status: 400 });

    await prisma.user.delete({ where: { id: userId } });

    await logAudit({
      userId: ownerId,
      action: 'user.delete',
      target: `user:${userId}`,
      details: JSON.stringify({ email: user.email, name: user.name }),
    });

    return Response.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
