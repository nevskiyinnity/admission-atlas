import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createFeedbackTypeSchema, parseBody } from '@/lib/validations';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const types = await prisma.feedbackType.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createFeedbackTypeSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name } = parsed.data;
  const existing = await prisma.feedbackType.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ error: 'Already exists' }, { status: 400 });
  const type = await prisma.feedbackType.create({ data: { name } });
  return NextResponse.json(type);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.feedbackType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
