// API route for getting and updating a single internship
// GET: Fetches internship by ID (must belong to the logged-in user's company)
// PUT: Updates internship title, description, slots, and deadline

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/internship/[id] — fetch a single internship
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    const internship = await prisma.internship.findFirst({
      where: { id: parseInt(id), companyId: company.id }
    });

    if (!internship) {
      return Response.json({ error: 'Internship not found' }, { status: 404 });
    }

    return Response.json({ internship }, { status: 200 });
  } catch (error) {
    console.error('Error fetching internship:', error);
    return Response.json({ error: 'Failed to fetch internship' }, { status: 500 });
  }
}

// PUT /api/internship/[id] — update an internship
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, slots, deadline } = await req.json();

    if (!title || !description || !slots || !deadline) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Verify the internship belongs to this company
    const existing = await prisma.internship.findFirst({
      where: { id: parseInt(id), companyId: company.id }
    });

    if (!existing) {
      return Response.json({ error: 'Internship not found' }, { status: 404 });
    }

    const internship = await prisma.internship.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        slots: parseInt(slots),
        deadline: new Date(deadline)
      }
    });

    return Response.json({ message: 'Internship updated successfully', internship }, { status: 200 });
  } catch (error) {
    console.error('Error updating internship:', error);
    return Response.json({ error: 'Failed to update internship' }, { status: 500 });
  }
}
