import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create date-based directory
  const now = new Date();
  const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', yearMonth);
  await mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const fileType = getFileType(file.type);
  const relativePath = `/uploads/${yearMonth}/${filename}`;

  const fileRecord = await prisma.file.create({
    data: {
      filename,
      originalName: file.name,
      path: relativePath,
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
      filename,
      originalName: file.name,
      size: file.size,
      fileType,
      userId: uploaderId,
    },
  });

  return NextResponse.json(fileRecord, { status: 201 });
}
