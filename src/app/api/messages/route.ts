import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  const where: any = {};
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
  const { content, senderId, taskId } = body;

  if (!content || !senderId || !taskId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

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
