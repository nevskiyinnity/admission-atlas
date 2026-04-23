import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createNotificationSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  // Admins can query any user's notifications; others only see their own
  const userId = auth.user.role === 'ADMIN'
    ? (searchParams.get('userId') || auth.user.id)
    : auth.user.id;

  const where: Prisma.NotificationWhereInput = { userId };
  if (type && type !== 'ALL') where.type = type as Prisma.EnumNotificationTypeFilter;

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
  const parsed = parseBody(createNotificationSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: parsed.data,
  });

  return NextResponse.json(notification);
}
