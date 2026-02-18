import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mocks ───────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    project: { findUnique: vi.fn() },
    task: { findUnique: vi.fn() },
    file: { findUnique: vi.fn() },
    user: { update: vi.fn() },
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

vi.mock('@vercel/blob', () => ({
  del: vi.fn(),
}));

// ── Imports (after mocks) ───────────────────────────────

import { GET as getProject } from '@/app/api/projects/[id]/route';
import { GET as getTask } from '@/app/api/tasks/[id]/route';
import { GET as getFile } from '@/app/api/files/[id]/route';
import { PUT as putSettings } from '@/app/api/users/[id]/settings/route';

// ── Helpers ─────────────────────────────────────────────

type Role = 'STUDENT' | 'COUNSELOR' | 'ADMIN';

function makeSession(id: string, role: Role) {
  return {
    user: { id, name: 'Test', email: 'test@example.com', role },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

function makeRequest(url: string, method = 'GET', body?: Record<string, unknown>) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  return new NextRequest(`http://localhost${url}`, init);
}

// ── Tests ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('IDOR Prevention — Projects', () => {
  const projectOwnedByUserA = {
    id: 'proj-1',
    studentId: 'user-a',
    counselorId: 'counselor-1',
    student: { id: 'user-a', name: 'A', studentId: 'STU001', avatar: null, gender: null, serviceStatus: 'IN_SERVICE' },
    counselor: { id: 'counselor-1', name: 'Counselor' },
    milestones: [],
  };

  it('returns 403 when User B tries to access User A project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-b', 'STUDENT'));
    mockPrisma.project.findUnique.mockResolvedValue(projectOwnedByUserA);

    const res = await getProject(
      makeRequest('/api/projects/proj-1'),
      { params: { id: 'proj-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('allows the project owner (student) to access their own project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.project.findUnique.mockResolvedValue(projectOwnedByUserA);

    const res = await getProject(
      makeRequest('/api/projects/proj-1'),
      { params: { id: 'proj-1' } },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('proj-1');
  });

  it('allows the assigned counselor to access the student project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.project.findUnique.mockResolvedValue(projectOwnedByUserA);

    const res = await getProject(
      makeRequest('/api/projects/proj-1'),
      { params: { id: 'proj-1' } },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('proj-1');
  });

  it('allows an admin to access any project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.project.findUnique.mockResolvedValue(projectOwnedByUserA);

    const res = await getProject(
      makeRequest('/api/projects/proj-1'),
      { params: { id: 'proj-1' } },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('proj-1');
  });

  it('returns 404 when project does not exist', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const res = await getProject(
      makeRequest('/api/projects/nonexistent'),
      { params: { id: 'nonexistent' } },
    );

    expect(res.status).toBe(404);
  });
});

describe('IDOR Prevention — Tasks', () => {
  const taskOwnedByUserA = {
    id: 'task-1',
    messages: [],
    files: [],
    milestone: {
      project: {
        id: 'proj-1',
        universityName: 'MIT',
        studentId: 'user-a',
        counselorId: 'counselor-1',
      },
    },
  };

  it('returns 403 when User B tries to access a task belonging to User A project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-b', 'STUDENT'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByUserA);

    const res = await getTask(
      makeRequest('/api/tasks/task-1'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('allows the project student to access the task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByUserA);

    const res = await getTask(
      makeRequest('/api/tasks/task-1'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows an admin to access any task', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.task.findUnique.mockResolvedValue(taskOwnedByUserA);

    const res = await getTask(
      makeRequest('/api/tasks/task-1'),
      { params: { id: 'task-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('returns 404 when task does not exist', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await getTask(
      makeRequest('/api/tasks/nonexistent'),
      { params: { id: 'nonexistent' } },
    );

    expect(res.status).toBe(404);
  });
});

describe('IDOR Prevention — Files', () => {
  const fileOwnedByUserA = {
    id: 'file-1',
    uploaderId: 'user-a',
    uploader: { id: 'user-a', name: 'A', role: 'STUDENT' },
    project: { studentId: 'user-a', counselorId: 'counselor-1' },
  };

  it('returns 403 when User B tries to access a file uploaded by User A', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-b', 'STUDENT'));
    mockPrisma.file.findUnique.mockResolvedValue(fileOwnedByUserA);

    const res = await getFile(
      makeRequest('/api/files/file-1'),
      { params: { id: 'file-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('allows the uploader to access their own file', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.file.findUnique.mockResolvedValue(fileOwnedByUserA);

    const res = await getFile(
      makeRequest('/api/files/file-1'),
      { params: { id: 'file-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows the assigned counselor to access a file in their project', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('counselor-1', 'COUNSELOR'));
    mockPrisma.file.findUnique.mockResolvedValue(fileOwnedByUserA);

    const res = await getFile(
      makeRequest('/api/files/file-1'),
      { params: { id: 'file-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows an admin to access any file', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.file.findUnique.mockResolvedValue(fileOwnedByUserA);

    const res = await getFile(
      makeRequest('/api/files/file-1'),
      { params: { id: 'file-1' } },
    );

    expect(res.status).toBe(200);
  });

  it('returns 403 for a file with no project when user is not the uploader', async () => {
    const orphanFile = {
      id: 'file-2',
      uploaderId: 'user-a',
      uploader: { id: 'user-a', name: 'A', role: 'STUDENT' },
      project: null,
    };
    mockGetServerSession.mockResolvedValue(makeSession('user-b', 'STUDENT'));
    mockPrisma.file.findUnique.mockResolvedValue(orphanFile);

    const res = await getFile(
      makeRequest('/api/files/file-2'),
      { params: { id: 'file-2' } },
    );

    expect(res.status).toBe(403);
  });
});

describe('IDOR Prevention — User Settings', () => {
  it('returns 403 when a user tries to update another user settings', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));

    const res = await putSettings(
      makeRequest('/api/users/user-b/settings', 'PUT', { webNotifications: true }),
      { params: { id: 'user-b' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('allows a user to update their own settings', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('user-a', 'STUDENT'));
    mockPrisma.user.update.mockResolvedValue({
      id: 'user-a',
      webNotifications: true,
    });

    const res = await putSettings(
      makeRequest('/api/users/user-a/settings', 'PUT', { webNotifications: true }),
      { params: { id: 'user-a' } },
    );

    expect(res.status).toBe(200);
  });

  it('allows an admin to update any user settings', async () => {
    mockGetServerSession.mockResolvedValue(makeSession('admin-1', 'ADMIN'));
    mockPrisma.user.update.mockResolvedValue({
      id: 'user-b',
      webNotifications: false,
    });

    const res = await putSettings(
      makeRequest('/api/users/user-b/settings', 'PUT', { webNotifications: false }),
      { params: { id: 'user-b' } },
    );

    expect(res.status).toBe(200);
  });
});
