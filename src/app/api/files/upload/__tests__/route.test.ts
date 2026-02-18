import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mocks ───────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    file: { create: vi.fn() },
    uploadLog: { create: vi.fn() },
  },
}));

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

const { mockPut } = vi.hoisted(() => ({
  mockPut: vi.fn(),
}));

// ── Mocks ───────────────────────────────────────────────

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@vercel/blob', () => ({
  put: mockPut,
}));

vi.mock('@/lib/utils', () => ({
  getFileType: vi.fn().mockReturnValue('DOCUMENT'),
}));

// ── Imports (after mocks) ───────────────────────────────

import { POST } from '@/app/api/files/upload/route';

// ── Helpers ─────────────────────────────────────────────

function makeClerkAuth() {
  return {
    userId: 'user-1',
    sessionClaims: {
      metadata: { role: 'STUDENT' },
      email: 'test@example.com',
    },
  };
}

function buildFormDataRequest(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): NextRequest {
  const content = new Uint8Array(Math.min(sizeBytes, 64));
  const file = new File([content], fileName, { type: mimeType });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploaderId', 'user-1');

  return new NextRequest('http://localhost/api/files/upload', {
    method: 'POST',
    body: formData,
  });
}

/** Build a request whose formData() returns a fake File with an arbitrary size. */
function buildFakeSizeRequest(
  fileName: string,
  mimeType: string,
  fakeSize: number,
): NextRequest {
  const fakeFile = {
    name: fileName,
    type: mimeType,
    size: fakeSize,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    stream: () => new ReadableStream(),
    text: () => Promise.resolve(''),
    slice: () => new Blob(),
  } as unknown as File;

  const fakeFormData = new Map<string, unknown>([
    ['file', fakeFile],
    ['uploaderId', 'user-1'],
  ]);

  const req = new NextRequest('http://localhost/api/files/upload', {
    method: 'POST',
  });

  // Override formData() to return our fake form data
  vi.spyOn(req, 'formData').mockResolvedValue({
    get: (key: string) => fakeFormData.get(key) ?? null,
    getAll: (key: string) => {
      const val = fakeFormData.get(key);
      return val ? [val] : [];
    },
    has: (key: string) => fakeFormData.has(key),
    entries: () => fakeFormData.entries(),
    keys: () => fakeFormData.keys(),
    values: () => fakeFormData.values(),
    forEach: (cb: (value: FormDataEntryValue, key: string, parent: FormData) => void) =>
      fakeFormData.forEach((v, k) => cb(v as FormDataEntryValue, k, {} as FormData)),
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    [Symbol.iterator]: () => fakeFormData.entries(),
  } as unknown as FormData);

  return req;
}

// ── Tests ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(makeClerkAuth());
  mockPut.mockResolvedValue({ pathname: 'test-file.pdf', url: 'https://blob.example.com/test-file.pdf' });
  mockPrisma.file.create.mockResolvedValue({
    id: 'file-1',
    filename: 'test-file.pdf',
    originalName: 'test.pdf',
    path: 'https://blob.example.com/test-file.pdf',
    size: 1024,
    mimeType: 'application/pdf',
    fileType: 'DOCUMENT',
    uploaderId: 'user-1',
    uploader: { id: 'user-1', name: 'Test', role: 'STUDENT' },
  });
  mockPrisma.uploadLog.create.mockResolvedValue({});
});

describe('File Upload — MIME type validation', () => {
  const allowedTypes = [
    { name: 'test.pdf', mime: 'application/pdf' },
    { name: 'test.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'test.doc', mime: 'application/msword' },
    { name: 'test.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { name: 'test.png', mime: 'image/png' },
    { name: 'test.jpg', mime: 'image/jpeg' },
    { name: 'test.gif', mime: 'image/gif' },
  ];

  for (const { name, mime } of allowedTypes) {
    it(`accepts ${mime} (${name})`, async () => {
      const req = buildFormDataRequest(name, mime, 1024);
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  }

  const disallowedTypes = [
    { name: 'malicious.html', mime: 'text/html' },
    { name: 'script.js', mime: 'application/javascript' },
    { name: 'payload.exe', mime: 'application/x-msdownload' },
    { name: 'data.json', mime: 'application/json' },
    { name: 'style.css', mime: 'text/css' },
    { name: 'shell.sh', mime: 'application/x-sh' },
    { name: 'archive.zip', mime: 'application/zip' },
    { name: 'image.svg', mime: 'image/svg+xml' },
  ];

  for (const { name, mime } of disallowedTypes) {
    it(`rejects ${mime} (${name}) with 400`, async () => {
      const req = buildFormDataRequest(name, mime, 1024);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('type not allowed');
    });
  }
});

describe('File Upload — Size limit', () => {
  it('accepts a file at exactly 50MB', async () => {
    const fiftyMB = 50 * 1024 * 1024;
    const req = buildFakeSizeRequest('big.pdf', 'application/pdf', fiftyMB);
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('rejects a file exceeding 50MB with 413', async () => {
    const overLimit = 50 * 1024 * 1024 + 1;
    const req = buildFakeSizeRequest('huge.pdf', 'application/pdf', overLimit);
    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toContain('50MB');
  });
});

describe('File Upload — Missing fields', () => {
  it('returns 400 when no file is provided', async () => {
    const formData = new FormData();
    formData.append('uploaderId', 'user-1');

    const req = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

    const req = buildFormDataRequest('test.pdf', 'application/pdf', 1024);
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
