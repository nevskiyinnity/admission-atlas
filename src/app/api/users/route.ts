import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateDisplayId } from '@/lib/utils';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { sanitizeUser, sanitizeUsers } from '@/lib/api-helpers';
import { createUserSchema, parseBody } from '@/lib/validations';

// GET /api/users - List users with optional filters, search, and pagination
export async function GET(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
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

    // Strip passwords from response
    const sanitizedUsers = sanitizeUsers(users);

    return NextResponse.json({
      users: sanitizedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = parseBody(createUserSchema, body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email, password, name, role } = parsed.data;

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
        password: hashedPassword,
        name,
        role,
        studentId,
        counselorId,
      },
    });

    // Strip password from response
    const sanitizedUser = sanitizeUser(user);

    return NextResponse.json(sanitizedUser, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
