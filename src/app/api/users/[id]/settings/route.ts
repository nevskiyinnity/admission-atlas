import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      webNotifications: body.webNotifications,
      smsNotifications: body.smsNotifications,
      emailNotifications: body.emailNotifications,
    },
  });

  return NextResponse.json(user);
}
