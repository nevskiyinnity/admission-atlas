import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
