import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');

  const where: any = {};
  if (userId) where.userId = userId;
  if (search) {
    where.user = { name: { contains: search, mode: 'insensitive' } };
  }

  const logs = await prisma.uploadLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json(logs);
}
