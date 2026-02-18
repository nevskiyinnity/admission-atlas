import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { sanitizeUser } from '@/lib/api-helpers';
import { updateUserSchema, parseBody } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignedCounselor: {
          select: { id: true, name: true, email: true, counselorId: true },
        },
        students: {
          select: { id: true, name: true, email: true, studentId: true },
        },
        tags: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sanitizedUser = sanitizeUser(user);
    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = params;
    const body = await request.json();
    const parsed = parseBody(updateUserSchema, body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { tagIds, password, dateOfBirth, assignedCounselorId, ...fields } = parsed.data;
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) data[key] = value;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (dateOfBirth !== undefined) {
      data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (assignedCounselorId !== undefined) {
      data.assignedCounselorId = assignedCounselorId || null;
    }
    if (tagIds !== undefined) {
      data.tags = { set: tagIds.map((tid) => ({ id: tid })) };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        assignedCounselor: { select: { id: true, name: true } },
        tags: true,
      },
    });

    const sanitizedUser = sanitizeUser(updatedUser);
    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
