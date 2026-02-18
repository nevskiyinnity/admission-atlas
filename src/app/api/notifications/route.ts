import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const where: any = { userId };
  if (type && type !== 'ALL') where.type = type;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { type, title, content, userId, link } = body;

  const notification = await prisma.notification.create({
    data: { type, title, content, userId, link },
  });

  return NextResponse.json(notification);
}
