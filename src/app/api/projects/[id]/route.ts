import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, studentId: true, avatar: true, gender: true, serviceStatus: true } },
      counselor: { select: { id: true, name: true } },
      milestones: {
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      universityName: body.universityName,
      major: body.major,
      country: body.country,
      city: body.city,
      deadline: body.deadline ? new Date(body.deadline) : body.deadline,
      status: body.status,
      notes: body.notes,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const { id } = params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
