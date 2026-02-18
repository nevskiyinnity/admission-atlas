import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mocks (available before vi.mock factories run) ──

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

// ── Mocks ────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: { providers: [] },
}));

vi.mock('openai', () => ({
  OpenAI: class MockOpenAI {
    chat = { completions: { create: mockCreate } };
  },
}));

import { getServerSession } from 'next-auth';
import { POST } from '@/app/api/analyze/route';

const mockedGetServerSession = vi.mocked(getServerSession);

// ── Helpers ─────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

function makeSession() {
  return {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'STUDENT',
    },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  name: 'Jordan Smith',
  university: 'MIT',
  major: 'Computer Science',
  gpa: '3.9',
  question6: '$50,000 per year',
};

// ── Tests ────────────────────────────────────────────────

describe('POST /api/analyze', () => {
  it('returns 401 when not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when required fields are missing', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());

    const response = await POST(makeRequest({ name: 'Jordan' }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when no academic metric is provided', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());

    const response = await POST(
      makeRequest({
        name: 'Jordan',
        university: 'MIT',
        major: 'CS',
        question6: '$50k',
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns a mock response when no OPENAI_API_KEY is set', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const response = await POST(makeRequest(validBody));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('institution', 'MIT');
      expect(body).toHaveProperty('targetMatchPercent');
      expect(body).toHaveProperty('summary');
      expect(body).toHaveProperty('strengths');
      expect(body).toHaveProperty('alternatives');
    } finally {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    }
  });

  it('returns a mock response when OPENAI_API_KEY is placeholder', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';

    try {
      const response = await POST(makeRequest(validBody));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('institution', 'MIT');
    } finally {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  });

  it('calls OpenAI and returns normalized response when API key is real', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-test-real-key';

    const mockAIResponse = {
      institution: 'Massachusetts Institute of Technology',
      userTyped: 'MIT',
      targetMatchPercent: 85,
      summary: 'Strong candidate.',
      strengths: ['High GPA'],
      concerns: ['Selective school'],
      nextSteps: ['Apply early'],
      categoryScores: [{ label: 'Academics', score: 90 }],
      alternatives: [
        { name: 'Stanford', country: 'USA', matchPercent: 80, why: 'Similar' },
      ],
      logs: ['Processing...'],
    };

    mockCreate.mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify(mockAIResponse) } },
      ],
    });

    try {
      const response = await POST(makeRequest(validBody));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.institution).toBe('Massachusetts Institute of Technology');
      expect(body.targetMatchPercent).toBe(85);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    } finally {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  });

  it('returns 500 when OpenAI call fails', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-test-real-key';

    mockCreate.mockRejectedValue(new Error('API error'));

    try {
      const response = await POST(makeRequest(validBody));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: 'Analysis failed. Please try again.' });
    } finally {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  });

  it('returns 400 when a field exceeds 1000 characters', async () => {
    mockedGetServerSession.mockResolvedValue(makeSession());

    const response = await POST(
      makeRequest({
        ...validBody,
        name: 'a'.repeat(1001),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
