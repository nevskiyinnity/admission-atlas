import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

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

    const { password: _, ...sanitizedUser } = user;
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
    const { password, tagIds, dateOfBirth, assignedCounselorId, ...rest } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data: any = { ...rest };

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
      data.tags = { set: tagIds.map((tid: string) => ({ id: tid })) };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        assignedCounselor: { select: { id: true, name: true } },
        tags: true,
      },
    });

    const { password: _, ...sanitizedUser } = updatedUser;
    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
