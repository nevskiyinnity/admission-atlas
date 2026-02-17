import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } },
          attachments: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      files: {
        include: { uploader: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
      milestone: {
        include: { project: { select: { id: true, universityName: true } } },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { name, description, deadline } = body;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;

  const task = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(task);
}
