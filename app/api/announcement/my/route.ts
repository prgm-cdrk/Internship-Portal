// This API route fetches all announcements for the logged-in applicant
// It returns announcements from companies the applicant has applied to or has tasks from
// Each announcement shows title, content, company name, and date

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle GET requests to /api/announcement/my
export async function GET(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Find companies the applicant is associated with (applied to internships or has tasks)
    const companyIds = new Set<number>();

    // Get companies from applications
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        internship: {
          select: { companyId: true }
        }
      }
    });
    applications.forEach(app => companyIds.add(app.internship.companyId));

    // Get companies from tasks
    const tasks = await prisma.task.findMany({
      where: { assignedTo: userId },
      select: { companyId: true }
    });
    tasks.forEach(task => companyIds.add(task.companyId));

    // Fetch announcements from all associated companies
    const announcements = await prisma.announcement.findMany({
      where: {
        companyId: { in: Array.from(companyIds) }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Return the announcements data
    return Response.json({ announcements }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Error fetching announcements:', error);
    return Response.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
