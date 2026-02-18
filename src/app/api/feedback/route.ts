import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createFeedbackSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.FeedbackWhereInput = {};
  if (userId) where.userId = userId;
  if (status) where.status = status as Prisma.EnumFeedbackStatusFilter;

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
        replies: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({ feedbacks, total, page, limit });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createFeedbackSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { type, description } = parsed.data;

  const feedback = await prisma.feedback.create({
    data: { type, description, userId: auth.user.id },
  });

  return NextResponse.json(feedback);
}
