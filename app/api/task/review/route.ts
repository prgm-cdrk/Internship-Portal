// Task review API — company manager accepts a completed task
// Only available for tasks with status COMPLETED and no reviewedAt
// Sets reviewedAt timestamp to confirm the work is accepted

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Find the company for this user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    if (!company) {
      return Response.json({ error: 'No company found' }, { status: 404 });
    }

    // Find the task
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) }
    });

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify ownership — task must belong to this company
    if (task.companyId !== company.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only review COMPLETED tasks that haven't been reviewed yet
    if (task.status !== 'COMPLETED') {
      return Response.json({ error: 'Can only review completed tasks' }, { status: 400 });
    }

    if (task.reviewedAt) {
      return Response.json({ error: 'Task has already been reviewed' }, { status: 400 });
    }

    // Set reviewedAt
    const updated = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { reviewedAt: new Date() }
    });

    return Response.json({ message: 'Task accepted', task: updated }, { status: 200 });
  } catch (error) {
    console.error('Error reviewing task:', error);
    return Response.json({ error: 'Failed to review task' }, { status: 500 });
  }
}
