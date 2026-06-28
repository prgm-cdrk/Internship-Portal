// Activity API - fetches recent activity for the company dashboard
// Combines recent applications, tasks, and announcements into a single feed

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Get company internship IDs
    const companyInternships = await prisma.internship.findMany({
      where: { companyId: company.id },
      select: { id: true }
    });
    const internshipIds = companyInternships.map(i => i.id);

    // Fetch recent applications (last 10)
    const recentApplications = await prisma.application.findMany({
      where: { internshipId: { in: internshipIds } },
      include: {
        user: { select: { name: true } },
        internship: { select: { title: true } }
      },
      orderBy: { appliedAt: 'desc' },
      take: 10
    });

    // Fetch recent tasks (last 10) — sorted by updatedAt to capture returned tasks
    const recentTasks = await prisma.task.findMany({
      where: { companyId: company.id },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    // Fetch recent announcements (last 5)
    const recentAnnouncements = await prisma.announcement.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Combine into activity feed
    const activities = [
      ...recentApplications.map(app => ({
        type: 'application' as const,
        message: `${app.user.name} applied to ${app.internship.title}`,
        detail: app.status,
        timestamp: app.appliedAt
      })),
      ...recentTasks.map(task => ({
        type: 'task' as const,
        message: task.status === 'ONGOING' && task.updatedAt > task.createdAt
          ? `Task "${task.title}" returned to ${task.user.name}`
          : `Task "${task.title}" assigned to ${task.user.name}`,
        detail: task.status,
        timestamp: task.status === 'ONGOING' && task.updatedAt > task.createdAt
          ? task.updatedAt
          : task.createdAt
      })),
      ...recentAnnouncements.map(ann => ({
        type: 'announcement' as const,
        message: `Announcement: ${ann.title}`,
        detail: ann.content.substring(0, 80),
        timestamp: ann.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 15);

    return Response.json({ activities }, { status: 200 });

  } catch (error) {
    console.error('Error fetching activity:', error);
    return Response.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
