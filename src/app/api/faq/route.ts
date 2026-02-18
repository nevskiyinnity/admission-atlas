import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createFaqSchema, parseBody } from '@/lib/validations';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const faqs = await prisma.fAQ.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createFaqSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { question, answer, category, order } = parsed.data;
  const faq = await prisma.fAQ.create({ data: { question, answer, category, order: order ?? 0 } });
  return NextResponse.json(faq);
}
