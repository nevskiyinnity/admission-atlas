import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createMessageSchema, parseBody } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
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
  } catch (error) {
    logger.error('GET /api/messages error', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = parseBody(createMessageSchema, body);
    if (!parsed.ok) {
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
  } catch (error) {
    logger.error('POST /api/messages error', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
