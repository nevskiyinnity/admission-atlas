import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const { content, userId } = await req.json();

  const reply = await prisma.feedbackReply.create({
    data: { content, feedbackId: id, userId },
  });

  await prisma.feedback.update({
    where: { id },
    data: { status: 'REPLIED' },
  });

  return NextResponse.json(reply);
}
