import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { updateAnnouncementSchema, parseBody } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();
  const parsed = parseBody(updateAnnouncementSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const announcement = await prisma.announcement.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(announcement);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
