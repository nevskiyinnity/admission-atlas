import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inquirySchema } from '@/lib/inquiry-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot — silently succeed to not reveal to bot
    if (parsed.data.honeypot) {
      return NextResponse.json({ success: true, message: 'Your responses have been submitted successfully. Check your email for next steps.' });
    }

    const { honeypot, ...data } = parsed.data;

    await prisma.inquirySubmission.create({
      data: {
        studentFullName: data.studentFullName,
        parentWeChatId: data.parentWeChatId || null,
        parentPhone: data.parentPhone || null,
        parentEmail: data.parentEmail,
        studentSchool: data.studentSchool || null,
        studentGrade: data.studentGrade || null,
        graduationYear: data.graduationYear || null,
        grades: data.grades || null,
        intendedMajors: data.intendedMajors || null,
        targetCountries: data.targetCountries || null,
        budgetRange: data.budgetRange || null,
        supportNeeded: data.supportNeeded || null,
        neuralEngineReport: data.neuralEngineReport || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your responses have been submitted successfully. Check your email for next steps.',
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
