// Owner Internships Overview API — all internships across all companies
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
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const internships = await prisma.internship.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return Response.json({ internships }, { status: 200 });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return Response.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}
