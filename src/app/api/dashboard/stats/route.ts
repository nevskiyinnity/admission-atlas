import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const [totalStudents, totalCounselors, activeProjects, pendingTasks] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'COUNSELOR' } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({ totalStudents, totalCounselors, activeProjects, pendingTasks });
}
