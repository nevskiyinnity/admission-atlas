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
    data: body,
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
