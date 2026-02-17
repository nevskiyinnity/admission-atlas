import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/users/[id]/assign-counselor - Assign or switch a counselor for a student
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { counselorId } = body;

    if (!counselorId) {
      return NextResponse.json(
        { error: 'Missing required field: counselorId' },
        { status: 400 }
      );
    }

    // Verify the student exists
    const student = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can be assigned a counselor' },
        { status: 400 }
      );
    }

    // Verify the counselor exists and has the COUNSELOR role
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId },
      select: { id: true, role: true },
    });

    if (!counselor) {
      return NextResponse.json(
        { error: 'Counselor not found' },
        { status: 404 }
      );
    }

    if (counselor.role !== 'COUNSELOR') {
      return NextResponse.json(
        { error: 'The specified user is not a counselor' },
        { status: 400 }
      );
    }

    // Update the student's assigned counselor
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { assignedCounselorId: counselorId },
      include: {
        assignedCounselor: {
          select: { id: true, name: true, email: true, counselorId: true },
        },
      },
    });

    // Strip password from response
    const { password: _, ...sanitizedUser } = updatedUser;

    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('POST /api/users/[id]/assign-counselor error:', error);
    return NextResponse.json(
      { error: 'Failed to assign counselor' },
      { status: 500 }
    );
  }
}
