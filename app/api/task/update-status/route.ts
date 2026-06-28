// Task status update API — allows the assigned intern to mark a task as COMPLETED
// Only the assigned user can update the task status

import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, status: newStatus } = await req.json();

    if (!taskId || !newStatus) {
      return Response.json({ error: 'Task ID and status are required' }, { status: 400 });
    }

    const validStatuses = ['ACCEPTED', 'ONGOING', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Find the task
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) }
    });

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // Only the assigned user can update the task
    if (task.assignedTo !== parseInt(session.user.id)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the task status
    const updated = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status: newStatus }
    });

    return Response.json({ message: 'Task updated', task: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return Response.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
