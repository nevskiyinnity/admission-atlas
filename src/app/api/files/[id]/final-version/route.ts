import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const updated = await prisma.file.update({
    where: { id },
    data: { isFinalVersion: !file.isFinalVersion },
  });

  return NextResponse.json(updated);
}
