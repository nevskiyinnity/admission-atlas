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

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

// ── Mocks ───────────────────────────────────────────────

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// ── Imports (after mocks) ───────────────────────────────

import { PUT as putUser } from '@/app/api/users/[id]/route';

// ── Helpers ─────────────────────────────────────────────

function makeClerkAuth(id: string, role: 'STUDENT' | 'COUNSELOR' | 'ADMIN') {
  return {
    userId: id,
    sessionClaims: {
      metadata: { role },
      email: 'test@example.com',
    },
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
  it('rejects a STUDENT trying to call the endpoint (403 from role check)', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-1', 'STUDENT'));

    const res = await putUser(
      makeRequest('/api/users/user-1', { role: 'ADMIN' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a COUNSELOR trying to change role (403 from role check)', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('counselor-1', 'COUNSELOR'));

    const res = await putUser(
      makeRequest('/api/users/user-1', { role: 'ADMIN', accountStatus: 'LOCKED' }),
      { params: { id: 'user-1' } },
    );

    expect(res.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('ADMIN can update role and accountStatus', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('admin-1', 'ADMIN'));
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

    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.role).toBe('COUNSELOR');
    expect(updateCall.data.accountStatus).toBe('LOCKED');
  });

  it('ADMIN can update regular fields (name, email, phone)', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('admin-1', 'ADMIN'));
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
    mockAuth.mockResolvedValue(makeClerkAuth('admin-1', 'ADMIN'));
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
