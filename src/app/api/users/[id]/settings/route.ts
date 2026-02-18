import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { updateSettingsSchema, parseBody } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();
  const parsed = parseBody(updateSettingsSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(user);
}
