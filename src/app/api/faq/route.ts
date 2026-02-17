import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const faqs = await prisma.fAQ.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, answer, category, order } = body;
  const faq = await prisma.fAQ.create({ data: { question, answer, category, order: order || 0 } });
  return NextResponse.json(faq);
}
