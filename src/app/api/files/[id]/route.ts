import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const file = await prisma.file.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true, role: true } } },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const file = await prisma.file.findUnique({ where: { id } });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Delete from Vercel Blob
  try {
    await del(file.path);
  } catch {
    // Blob may not exist
  }

  await prisma.file.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
