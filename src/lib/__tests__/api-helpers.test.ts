import { describe, it, expect } from 'vitest';
import {
  sanitizeUser,
  sanitizeUsers,
  successResponse,
  errorResponse,
} from '@/lib/api-helpers';

// ── sanitizeUser ─────────────────────────────────────────

describe('sanitizeUser', () => {
  it('strips the password field from a user object', () => {
    const user = { id: '1', name: 'Alice', email: 'a@b.com', password: 'secret' };
    const result = sanitizeUser(user);

    expect(result).not.toHaveProperty('password');
  });

  it('preserves all other fields', () => {
    const user = {
      id: '1',
      name: 'Alice',
      email: 'a@b.com',
      role: 'STUDENT',
      password: 'secret',
    };
    const result = sanitizeUser(user);

    expect(result).toEqual({
      id: '1',
      name: 'Alice',
      email: 'a@b.com',
      role: 'STUDENT',
    });
  });

  it('works when password is undefined', () => {
    const user = { id: '1', name: 'Alice', email: 'a@b.com' };
    const result = sanitizeUser(user);

    expect(result).not.toHaveProperty('password');
    expect(result).toEqual({ id: '1', name: 'Alice', email: 'a@b.com' });
  });

  it('returns a new object (does not mutate the original)', () => {
    const user = { id: '1', name: 'Alice', password: 'secret' };
    const result = sanitizeUser(user);

    expect(result).not.toBe(user);
    expect(user).toHaveProperty('password'); // original still has password
  });
});

// ── sanitizeUsers ────────────────────────────────────────

describe('sanitizeUsers', () => {
  it('strips passwords from an array of user objects', () => {
    const users = [
      { id: '1', name: 'Alice', password: 'pw1' },
      { id: '2', name: 'Bob', password: 'pw2' },
      { id: '3', name: 'Charlie', password: 'pw3' },
    ];

    const result = sanitizeUsers(users);

    expect(result).toHaveLength(3);
    for (const user of result) {
      expect(user).not.toHaveProperty('password');
    }
  });

  it('preserves all non-password fields for each user', () => {
    const users = [
      { id: '1', name: 'Alice', email: 'a@a.com', password: 'pw' },
      { id: '2', name: 'Bob', email: 'b@b.com', password: 'pw' },
    ];

    const result = sanitizeUsers(users);

    expect(result).toEqual([
      { id: '1', name: 'Alice', email: 'a@a.com' },
      { id: '2', name: 'Bob', email: 'b@b.com' },
    ]);
  });

  it('returns an empty array when given an empty array', () => {
    const result = sanitizeUsers([]);
    expect(result).toEqual([]);
  });
});

// ── successResponse ──────────────────────────────────────

describe('successResponse', () => {
  it('returns a response with status 200 by default', async () => {
    const res = successResponse({ ok: true });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('returns a response with a custom status code', async () => {
    const res = successResponse({ created: true }, 201);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ created: true });
  });

  it('handles array data', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    const res = successResponse(data);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(data);
  });
});

// ── errorResponse ────────────────────────────────────────

describe('errorResponse', () => {
  it('returns a response with status 400 by default', async () => {
    const res = errorResponse('Bad request');

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Bad request' });
  });

  it('returns a response with a custom status code', async () => {
    const res = errorResponse('Not found', 404);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Not found' });
  });

  it('wraps the message in an error object', async () => {
    const res = errorResponse('Something went wrong', 500);

    const body = await res.json();
    expect(body).toHaveProperty('error', 'Something went wrong');
    expect(Object.keys(body)).toEqual(['error']);
  });
});
