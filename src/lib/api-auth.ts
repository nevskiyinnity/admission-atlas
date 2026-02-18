import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Role = 'STUDENT' | 'COUNSELOR' | 'ADMIN';

/**
 * Require authentication (and optionally specific roles) for an API route.
 * Returns the session on success, or a NextResponse error on failure.
 */
export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return session;
}

/** Type guard: true when requireAuth returned an error response instead of a session. */
export function isAuthError(
  result: Awaited<ReturnType<typeof requireAuth>>,
): result is NextResponse {
  return result instanceof NextResponse;
}
