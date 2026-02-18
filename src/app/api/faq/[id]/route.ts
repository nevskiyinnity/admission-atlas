import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();
  const faq = await prisma.fAQ.update({
    where: { id },
    data: {
      question: body.question,
      answer: body.answer,
      category: body.category,
      order: body.order,
    },
  });
  return NextResponse.json(faq);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  await prisma.fAQ.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
