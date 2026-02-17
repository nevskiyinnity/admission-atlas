import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
