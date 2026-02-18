import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { sanitizeUser } from '@/lib/api-helpers';

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

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    // Explicit field whitelist — never spread raw request body
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.avatar !== undefined) data.avatar = body.avatar;
    if (body.nationality !== undefined) data.nationality = body.nationality;
    if (body.address !== undefined) data.address = body.address;
    if (body.serviceStatus !== undefined) data.serviceStatus = body.serviceStatus;
    if (body.role !== undefined) data.role = body.role;
    if (body.accountStatus !== undefined) data.accountStatus = body.accountStatus;

    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    if (body.assignedCounselorId !== undefined) {
      data.assignedCounselorId = body.assignedCounselorId || null;
    }
    if (body.tagIds !== undefined) {
      data.tags = { set: body.tagIds.map((tid: string) => ({ id: tid })) };
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
