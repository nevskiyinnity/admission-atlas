import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ── Mocks ────────────────────────────────────────────────

const mockAuth = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

import { requireAuth, isAuthError } from '@/lib/api-auth';

// ── Helpers ──────────────────────────────────────────────

function makeClerkAuth(userId: string, role: 'STUDENT' | 'COUNSELOR' | 'ADMIN', email = 'test@example.com') {
  return {
    userId,
    sessionClaims: {
      metadata: { role },
      email,
    },
  };
}

// ── Tests ────────────────────────────────────────────────

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 NextResponse when there is no userId', async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

    const result = await requireAuth();

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 when user role is not in allowedRoles', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-1', 'STUDENT'));

    const result = await requireAuth(['ADMIN', 'COUNSELOR']);

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('returns user object when user has a correct role', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-1', 'ADMIN'));

    const result = await requireAuth(['ADMIN']);

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      user: { id: 'user-1', role: 'ADMIN', email: 'test@example.com' },
    });
  });

  it('returns user object when allowedRoles is undefined (no restriction)', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-1', 'STUDENT'));

    const result = await requireAuth();

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      user: { id: 'user-1', role: 'STUDENT', email: 'test@example.com' },
    });
  });

  it('returns user object when allowedRoles list contains the user role among others', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-1', 'COUNSELOR'));

    const result = await requireAuth(['STUDENT', 'COUNSELOR', 'ADMIN']);

    expect(result).toEqual({
      user: { id: 'user-1', role: 'COUNSELOR', email: 'test@example.com' },
    });
  });
});

describe('isAuthError', () => {
  it('returns true for a NextResponse instance', () => {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    expect(isAuthError(response)).toBe(true);
  });

  it('returns false for a user object', () => {
    const result = { user: { id: 'user-1', role: 'STUDENT', email: 'test@example.com' } };
    expect(isAuthError(result)).toBe(false);
  });
});
