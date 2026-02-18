import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { generateDisplayId } from '@/lib/utils';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { sanitizeUsers } from '@/lib/api-helpers';
import { createUserSchema, parseBody } from '@/lib/validations';
import { logger } from '@/lib/logger';

// GET /api/users - List users with optional filters, search, and pagination
export async function GET(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search')?.slice(0, 200) || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as Prisma.UserWhereInput["role"];
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedCounselor: {
            select: { id: true, name: true },
          },
          students: {
            select: { id: true },
          },
          tags: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const sanitizedUsers = sanitizeUsers(users);

    return NextResponse.json({
      users: sanitizedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error('GET /api/users error', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (admin-only, creates local DB record)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = parseBody(createUserSchema, body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email, name, role } = parsed.data;

    // Check for existing user with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Auto-generate studentId or counselorId
    let studentId: string | undefined;
    let counselorId: string | undefined;

    if (role === 'STUDENT') {
      const studentCount = await prisma.user.count({
        where: { role: 'STUDENT' },
      });
      studentId = generateDisplayId('STU', studentCount + 1);
    } else if (role === 'COUNSELOR') {
      const counselorCount = await prisma.user.count({
        where: { role: 'COUNSELOR' },
      });
      counselorId = generateDisplayId('COU', counselorCount + 1);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        studentId,
        counselorId,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error('POST /api/users error', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
