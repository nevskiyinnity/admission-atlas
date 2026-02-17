import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, projectId } = body;

  if (!name || !projectId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const count = await prisma.milestone.count({ where: { projectId } });

  const milestone = await prisma.milestone.create({
    data: {
      name,
      description: description || null,
      projectId,
      order: count + 1,
    },
    include: { tasks: true },
  });

  return NextResponse.json(milestone, { status: 201 });
}
