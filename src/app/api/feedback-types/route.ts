import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const types = await prisma.feedbackType.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const existing = await prisma.feedbackType.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ error: 'Already exists' }, { status: 400 });
  const type = await prisma.feedbackType.create({ data: { name } });
  return NextResponse.json(type);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.feedbackType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
