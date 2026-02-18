import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createProjectSchema, parseBody } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const counselorId = searchParams.get('counselorId');

  const where: Prisma.ProjectWhereInput = {};
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
  const parsed = parseBody(createProjectSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { universityName, major, country, city, deadline, studentId, counselorId } = parsed.data;

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
