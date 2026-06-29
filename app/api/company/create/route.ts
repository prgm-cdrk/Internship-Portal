// This API route handles company creation for COMPANY role users
// It receives company name, industry, website, location, description, and optional logo
// It validates the user is authenticated, checks they don't already have a company
// Then creates the Company record linked to the user

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, industry, website, location, description, logoUrl } = await req.json();

    if (!name || !industry) {
      return Response.json(
        { error: 'Company name and industry are required' },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (existingCompany) {
      return Response.json(
        { error: 'You already have a company' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website: website || null,
        location: location || null,
        description: description || null,
        logoUrl: logoUrl || null,
        userId: parseInt(session.user.id)
      }
    });

    return Response.json(
      {
        message: 'Company created successfully',
        company
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Company creation error:', error);
    return Response.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
