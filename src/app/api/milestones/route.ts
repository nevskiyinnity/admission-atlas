import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createMilestoneSchema, parseBody } from '@/lib/validations';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'COUNSELOR']);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = parseBody(createMilestoneSchema, body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name, description, projectId } = parsed.data;

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
