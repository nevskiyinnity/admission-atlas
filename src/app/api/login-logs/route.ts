import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');

  const where: any = {};
  if (userId) where.userId = userId;
  if (search) {
    where.user = { name: { contains: search, mode: 'insensitive' } };
  }

  const logs = await prisma.loginLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json(logs);
}
