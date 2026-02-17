import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getFileType } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const uploaderId = formData.get('uploaderId') as string;
  const projectId = formData.get('projectId') as string | null;
  const milestoneId = formData.get('milestoneId') as string | null;
  const taskId = formData.get('taskId') as string | null;
  const messageId = formData.get('messageId') as string | null;

  if (!file || !uploaderId) {
    return NextResponse.json({ error: 'File and uploaderId required' }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, { access: 'public' });

  const fileType = getFileType(file.type);

  const fileRecord = await prisma.file.create({
    data: {
      filename: blob.pathname,
      originalName: file.name,
      path: blob.url,
      size: file.size,
      mimeType: file.type,
      fileType,
      uploaderId,
      projectId: projectId || undefined,
      milestoneId: milestoneId || undefined,
      taskId: taskId || undefined,
      messageId: messageId || undefined,
    },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
    },
  });

  // Create upload log
  await prisma.uploadLog.create({
    data: {
      filename: blob.pathname,
      originalName: file.name,
      size: file.size,
      fileType,
      userId: uploaderId,
    },
  });

  return NextResponse.json(fileRecord, { status: 201 });
}
