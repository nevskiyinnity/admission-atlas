import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ── Mocks ────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: { providers: [] },
}));

import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getServerSession } from 'next-auth';

const mockedGetServerSession = vi.mocked(getServerSession);

// ── Helpers ──────────────────────────────────────────────

function makeSession(role: 'STUDENT' | 'COUNSELOR' | 'ADMIN') {
  return {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role,
    },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

// ── Tests ────────────────────────────────────────────────

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 NextResponse when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const result = await requireAuth();

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 NextResponse when session exists but user is undefined', async () => {
    mockedGetServerSession.mockResolvedValue({ expires: '', user: undefined } as never);

    const result = await requireAuth();

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 403 when user role is not in allowedRoles', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession('STUDENT'));

    const result = await requireAuth(['ADMIN', 'COUNSELOR']);

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('returns the session when user has a correct role', async () => {
    const session = makeSession('ADMIN');
    mockedGetServerSession.mockResolvedValue(session);

    const result = await requireAuth(['ADMIN']);

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual(session);
  });

  it('returns the session when allowedRoles is undefined (no restriction)', async () => {
    const session = makeSession('STUDENT');
    mockedGetServerSession.mockResolvedValue(session);

    const result = await requireAuth();

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual(session);
  });

  it('returns the session when allowedRoles list contains the user role among others', async () => {
    const session = makeSession('COUNSELOR');
    mockedGetServerSession.mockResolvedValue(session);

    const result = await requireAuth(['STUDENT', 'COUNSELOR', 'ADMIN']);

    expect(result).toEqual(session);
  });
});

describe('isAuthError', () => {
  it('returns true for a NextResponse instance', () => {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    expect(isAuthError(response)).toBe(true);
  });

  it('returns false for a session object', () => {
    const session = makeSession('STUDENT');
    expect(isAuthError(session as Awaited<ReturnType<typeof requireAuth>>)).toBe(false);
  });
});
