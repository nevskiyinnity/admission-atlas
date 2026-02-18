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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAuthError(result: any): result is NextResponse {
  return result instanceof NextResponse;
}

/* ─── Resource ownership helpers ──────────────────────────────── */

/** Returns true if the user is ADMIN, the student owner, or the assigned counselor. */
export function canAccessProject(
  userId: string,
  role: string,
  project: { studentId: string; counselorId: string | null },
): boolean {
  if (role === 'ADMIN') return true;
  if (project.studentId === userId) return true;
  if (project.counselorId === userId) return true;
  return false;
}

/** Delegates to canAccessProject via the task's milestone → project chain. */
export function canAccessTask(
  userId: string,
  role: string,
  task: { milestone: { project: { studentId: string; counselorId: string | null } } },
): boolean {
  return canAccessProject(userId, role, task.milestone.project);
}

/** Returns true if the user is the uploader, can access the linked project, or is ADMIN. */
export function canAccessFile(
  userId: string,
  role: string,
  file: {
    uploaderId: string;
    project?: { studentId: string; counselorId: string | null } | null;
  },
): boolean {
  if (role === 'ADMIN') return true;
  if (file.uploaderId === userId) return true;
  if (file.project) return canAccessProject(userId, role, file.project);
  return false;
}
