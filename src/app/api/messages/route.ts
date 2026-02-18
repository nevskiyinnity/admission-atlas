import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createMessageSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  const where: Prisma.MessageWhereInput = {};
  if (taskId) where.taskId = taskId;

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      task: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: { createdAt: taskId ? 'asc' : 'desc' },
    take: taskId ? undefined : 200,
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createMessageSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { content, senderId, taskId } = parsed.data;

  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      taskId,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      attachments: true,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
