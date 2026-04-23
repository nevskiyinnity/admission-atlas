import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = params;

  // Users can only change their own password
  if (auth.user.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Look up the Clerk ID from DB
    const dbUser = await prisma.user.findUnique({
      where: { id },
      select: { clerkId: true },
    });

    if (!dbUser?.clerkId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clerk = await clerkClient();
    await clerk.users.updateUser(dbUser.clerkId, {
      password: parsed.data.newPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('PUT /api/users/[id]/password error', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
