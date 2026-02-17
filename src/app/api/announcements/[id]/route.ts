import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const announcement = await prisma.announcement.update({ where: { id }, data: body });
  return NextResponse.json(announcement);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
