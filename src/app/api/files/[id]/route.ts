import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
  const { id } = params;
  const file = await prisma.file.findUnique({ where: { id } });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Delete physical file
  try {
    const fullPath = path.join(process.cwd(), 'public', file.path);
    await unlink(fullPath);
  } catch {
    // File may not exist on disk
  }

  await prisma.file.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
