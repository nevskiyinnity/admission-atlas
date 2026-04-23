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
    adherenceRows,
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
    prisma.task.findMany({
      where: { status: 'COMPLETED', deadline: { not: null } },
      select: { deadline: true, updatedAt: true },
    }),
  ]);

  // Completed on-time / total completed with a deadline. updatedAt stands in for completedAt.
  const onTime = adherenceRows.filter((r) => r.deadline && r.updatedAt <= r.deadline).length;
  const avgDeadlineAdherenceRate = adherenceRows.length === 0
    ? null
    : Math.round((onTime / adherenceRows.length) * 100);

  // Backing data not yet modeled: top-3 university acceptance per student, per-engagement satisfaction ratings.
  const avgTop3AcceptanceRate: number | null = null;
  const serviceSatisfaction: { average: number; count: number; distribution: number[] } | null = null;

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
    avgDeadlineAdherenceRate,
    avgTop3AcceptanceRate,
    serviceSatisfaction,
  });
}
