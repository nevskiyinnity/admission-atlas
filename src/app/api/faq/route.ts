import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createFaqSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);
  const skip = (page - 1) * limit;

  const [faqs, total] = await Promise.all([
    prisma.fAQ.findMany({
      skip,
      take: limit,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    }),
    prisma.fAQ.count(),
  ]);

  return NextResponse.json({ faqs, total, page, limit });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createFaqSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { question, answer, category, order } = parsed.data;
  const faq = await prisma.fAQ.create({ data: { question, answer, category, order: order ?? 0 } });
  return NextResponse.json(faq);
}
