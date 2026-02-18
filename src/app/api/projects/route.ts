import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const counselorId = searchParams.get('counselorId');

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (counselorId) where.counselorId = counselorId;

  const projects = await prisma.project.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, studentId: true } },
      counselor: { select: { id: true, name: true } },
      milestones: {
        include: {
          tasks: { select: { id: true, status: true, deadline: true, name: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { universityName, major, country, city, deadline, studentId, counselorId } = body;

  if (!universityName || !major || !studentId || !counselorId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      universityName,
      major,
      country: country || null,
      city: city || null,
      deadline: deadline ? new Date(deadline) : null,
      studentId,
      counselorId,
    },
    include: {
      milestones: true,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
