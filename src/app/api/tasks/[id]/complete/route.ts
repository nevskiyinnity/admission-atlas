import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;

  const task = await prisma.task.update({
    where: { id },
    data: { status: 'COMPLETED' },
    include: { milestone: { include: { tasks: true } } },
  });

  // Check if all tasks in milestone are completed
  const allCompleted = task.milestone.tasks.every((t) => t.status === 'COMPLETED');
  if (allCompleted) {
    await prisma.milestone.update({
      where: { id: task.milestoneId },
      data: { status: 'COMPLETED' },
    });
  }

  return NextResponse.json(task);
}
