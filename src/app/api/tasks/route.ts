import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { name, description, deadline, milestoneId } = body;

  if (!name || !milestoneId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      name,
      description: description || null,
      deadline: deadline ? new Date(deadline) : null,
      milestoneId,
    },
  });

  // Update milestone status to IN_PROGRESS if it was PENDING
  await prisma.milestone.updateMany({
    where: { id: milestoneId, status: 'PENDING' },
    data: { status: 'IN_PROGRESS' },
  });

  return NextResponse.json(task, { status: 201 });
}
