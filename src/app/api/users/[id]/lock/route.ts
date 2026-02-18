import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// POST /api/users/[id]/lock - Toggle lock/unlock a user account
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = params;

    // Fetch current user
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, accountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Toggle between ACTIVE and LOCKED
    const newStatus = user.accountStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { accountStatus: newStatus },
    });

    // Strip password from response
    const { password: _, ...sanitizedUser } = updatedUser;

    return NextResponse.json(sanitizedUser);
  } catch (error) {
    logger.error('POST /api/users/[id]/lock error', error);
    return NextResponse.json(
      { error: 'Failed to toggle user lock status' },
      { status: 500 }
    );
  }
}
