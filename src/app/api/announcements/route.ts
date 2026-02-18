import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createAnnouncementSchema, parseBody } from '@/lib/validations';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createAnnouncementSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { title, content, target } = parsed.data;
  const announcement = await prisma.announcement.create({ data: { title, content, target: target || 'ALL' } });
  return NextResponse.json(announcement);
}
