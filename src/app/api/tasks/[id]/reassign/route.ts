import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError, canAccessTask } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { milestone: { include: { project: { select: { studentId: true, counselorId: true } } } } },
    });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (!canAccessTask(auth.user.id, auth.user.role, task)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newAssignee = task.assignedTo === 'STUDENT' ? 'COUNSELOR' : 'STUDENT';

    const updated = await prisma.task.update({
      where: { id },
      data: { assignedTo: newAssignee, status: 'REASSIGNED' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('POST /api/tasks/[id]/reassign error', error);
    return NextResponse.json({ error: 'Failed to reassign task' }, { status: 500 });
  }
}
