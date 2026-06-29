// Owner Companies Management API
// GET: List all companies with search and subscription info
// PUT: Suspend/activate a company (by deactivating the manager user)
// DELETE: Remove a company and its data

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/activity';

const prisma = new PrismaClient();

// GET /api/owner/companies — list all companies
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        subscriptions: { select: { plan: true, status: true, expiredAt: true }, take: 1 },
        _count: { select: { internships: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const userIds = companies.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, isActive: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    let result = companies.map(c => ({
      ...c,
      manager: userMap.get(c.userId) || null,
      subscription: c.subscriptions?.[0] || null,
      subscriptions: undefined,
    }));

    // Filter by plan after merge
    if (plan && plan !== 'ALL') {
      result = result.filter(c => c.subscription?.plan === plan);
    }

    return Response.json({ companies: result, total: result.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return Response.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

// PUT /api/owner/companies — suspend/activate a company
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { companyId, isActive } = await req.json();
    if (!companyId) return Response.json({ error: 'Company ID required' }, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return Response.json({ error: 'Company not found' }, { status: 404 });

    // Suspend/activate by toggling the manager user's isActive
    await prisma.user.update({
      where: { id: company.userId },
      data: { isActive },
    });

    await logAudit({
      userId: ownerId,
      action: isActive ? 'company.activate' : 'company.suspend',
      target: `company:${companyId}`,
      details: JSON.stringify({ name: company.name }),
    });

    return Response.json({ message: isActive ? 'Company activated' : 'Company suspended' }, { status: 200 });
  } catch (error) {
    console.error('Error updating company:', error);
    return Response.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// DELETE /api/owner/companies — delete a company
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(session.user.id);

    const { companyId } = await req.json();
    if (!companyId) return Response.json({ error: 'Company ID required' }, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return Response.json({ error: 'Company not found' }, { status: 404 });

    await prisma.company.delete({ where: { id: companyId } });

    await logAudit({
      userId: ownerId,
      action: 'company.delete',
      target: `company:${companyId}`,
      details: JSON.stringify({ name: company.name }),
    });

    return Response.json({ message: 'Company deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting company:', error);
    return Response.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
