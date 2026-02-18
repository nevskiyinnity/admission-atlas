import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
