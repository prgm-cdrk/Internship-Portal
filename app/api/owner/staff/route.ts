// Owner Staff Management API
// GET: List all staff accounts
// POST: Create a new staff account (generates temp password, hashes it)
// PUT: Update staff role, permissions, suspend/activate
// DELETE: Remove a staff account

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { logActivity, logAudit } from '@/lib/activity';

const prisma = new PrismaClient();

// Available permissions that can be assigned to staff
export const STAFF_PERMISSIONS = [
  { key: 'users.view', label: 'View Users' },
  { key: 'users.edit', label: 'Edit Users' },
  { key: 'users.delete', label: 'Suspend/Delete Users' },
  { key: 'companies.view', label: 'View Companies' },
  { key: 'companies.edit', label: 'Edit Companies' },
  { key: 'companies.delete', label: 'Suspend/Delete Companies' },
  { key: 'internships.view', label: 'View Internships' },
  { key: 'applications.view', label: 'View Applications' },
  { key: 'analytics.view', label: 'View Analytics' },
  { key: 'subscriptions.view', label: 'View Subscriptions' },
  { key: 'staff.view', label: 'View Staff' },
  { key: 'staff.manage', label: 'Manage Staff' },
  { key: 'settings.edit', label: 'Edit Settings' },
  { key: 'activity.view', label: 'View Activity Feed' },
  { key: 'audit.view', label: 'View Audit Logs' },
] as const;

// Default permissions per role
const ROLE_DEFAULTS: Record<string, string[]> = {
  ADMIN: STAFF_PERMISSIONS.map(p => p.key),
  MODERATOR: ['users.view', 'companies.view', 'internships.view', 'applications.view', 'activity.view'],
  VIEWER: ['users.view', 'companies.view', 'internships.view'],
};

// GET /api/owner/staff — list all staff
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const staff = await prisma.staff.findMany({
      include: { user: { select: { id: true, email: true, name: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({ staff, permissions: STAFF_PERMISSIONS }, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return Response.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST /api/owner/staff — create a new staff account
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ownerId = parseInt(session.user.id);

    const { email, name, role, permissions, tempPassword } = await req.json();

    if (!email || !name || !role) {
      return Response.json({ error: 'Email, name, and role are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Use provided temp password or generate one
    const password = tempPassword || generateTempPassword();
    const hashedPassword = await hash(password, 12);

    // Create the User record with STAFF role
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STAFF',
        permissionLevel: role === 'ADMIN' ? 'ADMIN' : role === 'MODERATOR' ? 'MODERATOR' : 'VIEWER',
        createdBy: ownerId,
        emailVerified: new Date(), // Staff accounts are pre-verified
      }
    });

    // Create the Staff record with permissions
    const staffPermissions = permissions || ROLE_DEFAULTS[role] || ROLE_DEFAULTS.VIEWER;
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        role,
        permissions: JSON.stringify(staffPermissions),
        createdBy: ownerId,
      }
    });

    // Log the activity
    await logActivity({
      type: 'staff',
      action: 'created',
      entity: 'staff',
      entityId: staff.id,
      details: JSON.stringify({ email, name, role }),
      userId: ownerId,
    });

    await logAudit({
      userId: ownerId,
      action: 'staff.create',
      target: `staff:${staff.id}`,
      details: JSON.stringify({ email, name, role, permissions: staffPermissions }),
    });

    return Response.json({
      message: 'Staff account created',
      staff: { ...staff, user: { email, name } },
      tempPassword: password, // Return temp password so owner can share it
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating staff:', error);
    return Response.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

// PUT /api/owner/staff — update staff role, permissions, suspend/activate
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { staffId, role, permissions, isSuspended } = await req.json();

    if (!staffId) {
      return Response.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      return Response.json({ error: 'Staff not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = JSON.stringify(permissions);
    if (typeof isSuspended === 'boolean') updateData.isSuspended = isSuspended;

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
      include: { user: { select: { id: true, email: true, name: true, createdAt: true } } },
    });

    // Also update the user's permissionLevel if role changed
    if (role) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: { permissionLevel: role === 'ADMIN' ? 'ADMIN' : role === 'MODERATOR' ? 'MODERATOR' : 'VIEWER' }
      });
    }

    await logAudit({
      userId: ownerId,
      action: 'staff.update',
      target: `staff:${staffId}`,
      details: JSON.stringify(updateData),
    });

    return Response.json({ message: 'Staff updated', staff: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating staff:', error);
    return Response.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE /api/owner/staff — remove a staff account
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { staffId } = await req.json();

    if (!staffId) {
      return Response.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      return Response.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Delete staff record, then user record
    await prisma.staff.delete({ where: { id: staffId } });
    await prisma.user.delete({ where: { id: staff.userId } });

    await logAudit({
      userId: ownerId,
      action: 'staff.delete',
      target: `staff:${staffId}`,
    });

    return Response.json({ message: 'Staff removed' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return Response.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
