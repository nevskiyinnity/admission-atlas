import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { createTagSchema, parseBody } from '@/lib/validations';

// GET /api/tags - List all tags with optional search
export async function GET(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('GET /api/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = parseBody(createTagSchema, body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name } = parsed.data;

    // Check for duplicate tag name
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('POST /api/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags?id=xxx - Delete a tag by id
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(['ADMIN']);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    // Verify tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
