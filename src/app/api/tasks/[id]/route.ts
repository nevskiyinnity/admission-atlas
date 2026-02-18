import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { updateTaskSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } },
          attachments: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      files: {
        include: { uploader: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
      milestone: {
        include: { project: { select: { id: true, universityName: true } } },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();
  const parsed = parseBody(updateTaskSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { deadline, name, description, status, assignedTo } = parsed.data;
  const data: Prisma.TaskUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (status !== undefined) data.status = status;
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;

  const task = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(task);
}
