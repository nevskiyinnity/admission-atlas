import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError, canAccessFile } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const file = await prisma.file.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
      project: { select: { studentId: true, counselorId: true } },
    },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  if (!canAccessFile(auth.user.id, auth.user.role, file)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(file);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;

  try {
    const file = await prisma.file.findUnique({
      where: { id },
      include: { project: { select: { studentId: true, counselorId: true } } },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (!canAccessFile(auth.user.id, auth.user.role, file)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from Vercel Blob
    try {
      await del(file.path);
    } catch {
      // Blob may not exist
    }

    await prisma.file.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/files/[id] error', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
