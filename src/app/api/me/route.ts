import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  return NextResponse.json({
    id: auth.user.id,
    role: auth.user.role,
    email: auth.user.email,
  });
}
