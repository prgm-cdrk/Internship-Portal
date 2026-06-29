// This API route handles company profile updates
// It receives updated company data (name, industry, website, location, description, logoUrl)
// It validates the user is authenticated, finds their company, and updates it

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(req: Request) {
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

    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        industry,
        website: website || null,
        location: location || null,
        description: description || null,
        logoUrl: logoUrl !== undefined ? (logoUrl || null) : company.logoUrl
      }
    });

    return Response.json(
      {
        message: 'Company updated successfully',
        company: updatedCompany
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Company update error:', error);
    return Response.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
