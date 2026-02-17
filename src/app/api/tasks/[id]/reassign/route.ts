import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const newAssignee = task.assignedTo === 'STUDENT' ? 'COUNSELOR' : 'STUDENT';

  const updated = await prisma.task.update({
    where: { id },
    data: { assignedTo: newAssignee, status: 'REASSIGNED' },
  });

  return NextResponse.json(updated);
}
