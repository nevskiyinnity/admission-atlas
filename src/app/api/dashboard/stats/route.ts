import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [totalStudents, totalCounselors, activeProjects, pendingTasks] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'COUNSELOR' } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({ totalStudents, totalCounselors, activeProjects, pendingTasks });
}
