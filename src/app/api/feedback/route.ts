import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;

  const feedbacks = await prisma.feedback.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, role: true } },
      replies: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(feedbacks);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { type, description, userId } = body;

  const feedback = await prisma.feedback.create({
    data: { type, description, userId },
  });

  return NextResponse.json(feedback);
}
