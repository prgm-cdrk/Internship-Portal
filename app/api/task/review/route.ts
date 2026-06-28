// Task review API — company manager reviews a completed task
// Accept: sets reviewedAt timestamp, task is done
// Return: resets status back to ONGOING so the intern can redo the work

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, action } = await req.json();

    if (!taskId || !action) {
      return Response.json({ error: 'Task ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'return'].includes(action)) {
      return Response.json({ error: 'Action must be "accept" or "return"' }, { status: 400 });
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

    // Verify ownership
    if (task.companyId !== company.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only review COMPLETED tasks
    if (task.status !== 'COMPLETED') {
      return Response.json({ error: 'Can only review completed tasks' }, { status: 400 });
    }

    if (action === 'accept') {
      // Accept — mark as reviewed
      if (task.reviewedAt) {
        return Response.json({ error: 'Task has already been reviewed' }, { status: 400 });
      }
      const updated = await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: { reviewedAt: new Date() }
      });
      return Response.json({ message: 'Task accepted', task: updated }, { status: 200 });
    } else {
      // Return — reset to ONGOING so intern can redo
      const updated = await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: { status: 'ONGOING' }
      });
      return Response.json({ message: 'Task returned to ongoing', task: updated }, { status: 200 });
    }
  } catch (error) {
    console.error('Error reviewing task:', error);
    return Response.json({ error: 'Failed to review task' }, { status: 500 });
  }
}
