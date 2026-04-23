import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const [
    totalStudents,
    totalCounselors,
    activeProjects,
    completedProjects,
    cancelledProjects,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    totalTasks,
    upcomingDeadlines,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'COUNSELOR' } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.project.count({ where: { status: 'CANCELLED' } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count(),
    prisma.task.findMany({
      where: {
        status: { not: 'COMPLETED' },
        deadline: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, name: true, deadline: true, milestone: { select: { project: { select: { universityName: true } } } } },
      orderBy: { deadline: 'asc' },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    totalStudents,
    totalCounselors,
    activeProjects,
    completedProjects,
    cancelledProjects,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    totalTasks,
    upcomingDeadlines,
  });
}
