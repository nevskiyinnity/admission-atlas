import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { feedbackReplySchema, parseBody } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();
  const parsed = parseBody(feedbackReplySchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { content, userId } = parsed.data;

  try {
    const feedback = await prisma.feedback.findUnique({ where: { id } });
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Only the feedback author, ADMINs, or COUNSELORs may reply
    if (
      feedback.userId !== auth.user.id &&
      auth.user.role !== 'ADMIN' &&
      auth.user.role !== 'COUNSELOR'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reply = await prisma.feedbackReply.create({
      data: { content, feedbackId: id, userId },
    });

    await prisma.feedback.update({
      where: { id },
      data: { status: 'REPLIED' },
    });

    return NextResponse.json(reply);
  } catch (error) {
    logger.error('POST /api/feedback/[id]/reply error', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
