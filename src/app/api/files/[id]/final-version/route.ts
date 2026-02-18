import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;

  try {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { isFinalVersion: !file.isFinalVersion },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('POST /api/files/[id]/final-version error', error);
    return NextResponse.json({ error: 'Failed to toggle final version' }, { status: 500 });
  }
}
