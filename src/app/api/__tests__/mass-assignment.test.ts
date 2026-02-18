import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mocks ───────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { mockGetServerSession } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
}));

// ── Mocks ───────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: { providers: [] },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-pw') },
}));

// ── Imports (after mocks) ───────────────────────────────

import { PUT as putUser } from '@/app/api/users/[id]/route';

// ── Helpers ─────────────────────────────────────────────

function makeSession(id: string, role: 'STUDENT' | 'COUNSELOR' | 'ADMIN') {
  return {
    user: { id, name: 'Test', email: 'test@example.com', role },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

function makeRequest(url: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const existingUser = {
  id: 'user-1',
  name: 'Original',
  email: 'original@example.com',
  role: 'STUDENT',
  accountStatus: 'ACTIVE',
};

// ── Tests ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findUnique.mockResolvedValue(existingUser);
});

describe('Mass-Assignment Prevention — PUT /api/users/[id]', () => {
  // The PUT handler requires ADMIN role. A non-admin cannot even reach the
  // mass-assignment logic because requireAuth(['ADMIN']) blocks them first.
  // This confirms the defense-in-depth: role-based access control prevents
  // non-admin users from calling the endpoint at all.

  it('rejects a STUDENT trying to call the endpoint (403 from role check)', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-1', 'STUDENT'));

    const res = await putUser(
      makeRequest('/api/users/user-1', { role: 'ADMIN' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a COUNSELOR trying to change role (403 from role check)', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));

    const res = await putUser(
      makeRequest('/api/users/user-1', { role: 'ADMIN', accountStatus: 'LOCKED' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('ADMIN can update role and accountStatus', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.user.update.mockResolvedValue({
      ...existingUser,
      role: 'COUNSELOR',
      accountStatus: 'LOCKED',
    });

    const res = await putUser(
      makeRequest('/api/users/user-1', { role: 'COUNSELOR', accountStatus: 'LOCKED' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(200);

    // Verify the data passed to prisma.user.update includes role + accountStatus
    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.role).toBe('COUNSELOR');
    expect(updateCall.data.accountStatus).toBe('LOCKED');
  });

  it('ADMIN can update regular fields (name, email, phone)', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.user.update.mockResolvedValue({
      ...existingUser,
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+1234567890',
    });

    const res = await putUser(
      makeRequest('/api/users/user-1', {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+1234567890',
      }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(200);
    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.name).toBe('Updated Name');
    expect(updateCall.data.email).toBe('updated@example.com');
    expect(updateCall.data.phone).toBe('+1234567890');
  });

  it('ADMIN update without role/accountStatus does not set them', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.user.update.mockResolvedValue({
      ...existingUser,
      name: 'Just Name',
    });

    const res = await putUser(
      makeRequest('/api/users/user-1', { name: 'Just Name' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(200);
    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.role).toBeUndefined();
    expect(updateCall.data.accountStatus).toBeUndefined();
  });
});
