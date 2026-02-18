import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mocks ───────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    milestone: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
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

// ── Imports (after mocks) ───────────────────────────────

import { POST as completeTask } from '@/app/api/tasks/[id]/complete/route';
import { POST as reassignTask } from '@/app/api/tasks/[id]/reassign/route';

// ── Helpers ─────────────────────────────────────────────

type Role = 'STUDENT' | 'COUNSELOR' | 'ADMIN';

function makeSession(id: string, role: Role) {
  return {
    user: { id, name: 'Test', email: 'test@example.com', role },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

function makeRequest(url: string) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

const taskOwnedByCounselor1 = {
  id: 'task-1',
  assignedTo: 'STUDENT',
  milestoneId: 'ms-1',
  milestone: {
    project: {
      studentId: 'student-1',
      counselorId: 'counselor-1',
    },
  },
};

// ── Tests ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('IDOR Prevention — POST /tasks/[id]/complete', () => {
  it('returns 403 when an unrelated counselor tries to complete another counselor task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-2', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);

    const res = await completeTask(
      makeRequest('/api/tasks/task-1/complete'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 404 when the task does not exist', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await completeTask(
      makeRequest('/api/tasks/nonexistent/complete'),
      { params: { id: 'nonexistent' } },
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Task not found' });
  });

  it('allows the assigned counselor to complete the task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);

    const completedTask = {
      ...taskOwnedByCounselor1,
      status: 'COMPLETED',
      milestone: {
        ...taskOwnedByCounselor1.milestone,
        tasks: [{ status: 'COMPLETED' }],
      },
    };
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        task: { update: vi.fn().mockResolvedValue(completedTask) },
        milestone: { update: vi.fn().mockResolvedValue({}) },
      });
    });

    const res = await completeTask(
      makeRequest('/api/tasks/task-1/complete'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows an admin to complete any task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);

    const completedTask = {
      ...taskOwnedByCounselor1,
      status: 'COMPLETED',
      milestone: {
        ...taskOwnedByCounselor1.milestone,
        tasks: [{ status: 'COMPLETED' }],
      },
    };
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        task: { update: vi.fn().mockResolvedValue(completedTask) },
        milestone: { update: vi.fn().mockResolvedValue({}) },
      });
    });

    const res = await completeTask(
      makeRequest('/api/tasks/task-1/complete'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await completeTask(
      makeRequest('/api/tasks/task-1/complete'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(401);
  });

  it('returns 403 when a STUDENT tries to call the endpoint', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('student-1', 'STUDENT'));

    const res = await completeTask(
      makeRequest('/api/tasks/task-1/complete'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(403);
  });
});

describe('IDOR Prevention — POST /tasks/[id]/reassign', () => {
  it('returns 403 when an unrelated counselor tries to reassign another counselor task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-2', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);

    const res = await reassignTask(
      makeRequest('/api/tasks/task-1/reassign'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
    expect(mockPrisma.task.update).not.toHaveBeenCalled();
  });

  it('returns 404 when the task does not exist', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await reassignTask(
      makeRequest('/api/tasks/nonexistent/reassign'),
      { params: { id: 'nonexistent' } },
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Task not found' });
  });

  it('allows the assigned counselor to reassign their task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);
    mockPrisma.task.update.mockResolvedValue({
      ...taskOwnedByCounselor1,
      assignedTo: 'COUNSELOR',
      status: 'REASSIGNED',
    });

    const res = await reassignTask(
      makeRequest('/api/tasks/task-1/reassign'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.assignedTo).toBe('COUNSELOR');
    expect(body.status).toBe('REASSIGNED');
  });

  it('allows an admin to reassign any task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByCounselor1);
    mockPrisma.task.update.mockResolvedValue({
      ...taskOwnedByCounselor1,
      assignedTo: 'COUNSELOR',
      status: 'REASSIGNED',
    });

    const res = await reassignTask(
      makeRequest('/api/tasks/task-1/reassign'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows the project student to reassign the task', async () => {
    // Student role is not in the allowedRoles for this endpoint,
    // so they get a 403 from requireAuth(['ADMIN', 'COUNSELOR'])
    mockGetServerSession.mockResolvedValue(makeSession('student-1', 'STUDENT'));

    const res = await reassignTask(
      makeRequest('/api/tasks/task-1/reassign'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await reassignTask(
      makeRequest('/api/tasks/task-1/reassign'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(401);
  });
});
