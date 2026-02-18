import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const projectId = searchParams.get('projectId');
  const milestoneId = searchParams.get('milestoneId');
  const uploaderId = searchParams.get('uploaderId');
  const fileType = searchParams.get('fileType');
  const finalOnly = searchParams.get('finalOnly') === 'true';
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const where: any = {};
  if (taskId) where.taskId = taskId;
  if (projectId) where.projectId = projectId;
  if (milestoneId) where.milestoneId = milestoneId;
  if (uploaderId) where.uploaderId = uploaderId;
  if (fileType) where.fileType = fileType;
  if (finalOnly) where.isFinalVersion = true;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const files = await prisma.file.findMany({
    where,
    include: {
      uploader: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(files);
}
