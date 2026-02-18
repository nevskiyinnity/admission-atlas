import { describe, it, expect } from 'vitest';
import {
  createUserSchema,
  updateUserSchema,
  createProjectSchema,
  createTaskSchema,
  createMessageSchema,
  parseBody,
} from '@/lib/validations';

// ── createUserSchema ─────────────────────────────────────

describe('createUserSchema', () => {
  const validUser = {
    email: 'alice@example.com',
    password: 'Secret1!x',
    name: 'Alice',
    role: 'STUDENT' as const,
  };

  it('accepts valid input', () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validUser);
    }
  });

  it('rejects missing required fields', () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const { email, ...noEmail } = validUser;
    const result = createUserSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'Aa1!xyz' });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'secret1!' });
    expect(result.success).toBe(false);
  });

  it('rejects password without digit', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'Secret!x' });
    expect(result.success).toBe(false);
  });

  it('rejects password without special character', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'Secret1xx' });
    expect(result.success).toBe(false);
  });

  it('accepts password meeting all complexity requirements', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({ ...validUser, role: 'SUPERADMIN' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid roles', () => {
    for (const role of ['STUDENT', 'COUNSELOR', 'ADMIN']) {
      const result = createUserSchema.safeParse({ ...validUser, role });
      expect(result.success).toBe(true);
    }
  });
});

// ── updateUserSchema ─────────────────────────────────────

describe('updateUserSchema', () => {
  it('accepts partial updates (only name)', () => {
    const result = updateUserSchema.safeParse({ name: 'Bob' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (all fields optional)', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts nullable fields with null values', () => {
    const result = updateUserSchema.safeParse({ phone: null, gender: null });
    expect(result.success).toBe(true);
  });

  it('rejects invalid gender value', () => {
    const result = updateUserSchema.safeParse({ gender: 'NONBINARY' });
    expect(result.success).toBe(false);
  });

  it('accepts valid gender values', () => {
    for (const gender of ['MALE', 'FEMALE', 'OTHER']) {
      const result = updateUserSchema.safeParse({ gender });
      expect(result.success).toBe(true);
    }
  });

  it('rejects password shorter than 8 characters when provided', () => {
    const result = updateUserSchema.safeParse({ password: 'Aa1!x' });
    expect(result.success).toBe(false);
  });

  it('rejects password without complexity when provided', () => {
    const result = updateUserSchema.safeParse({ password: 'simplepwd' });
    expect(result.success).toBe(false);
  });
});

// ── createProjectSchema ──────────────────────────────────

describe('createProjectSchema', () => {
  const validProject = {
    universityName: 'MIT',
    major: 'Computer Science',
    studentId: 'stu-1',
    counselorId: 'cou-1',
  };

  it('accepts valid input', () => {
    const result = createProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject(validProject);
    }
  });

  it('accepts valid input with optional fields', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      country: 'USA',
      city: 'Cambridge',
      deadline: '2026-09-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = createProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing universityName', () => {
    const { universityName, ...rest } = validProject;
    const result = createProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing studentId', () => {
    const { studentId, ...rest } = validProject;
    const result = createProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ── createTaskSchema ─────────────────────────────────────

describe('createTaskSchema', () => {
  it('accepts valid input', () => {
    const result = createTaskSchema.safeParse({ name: 'Write essay', milestoneId: 'ms-1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = createTaskSchema.safeParse({ milestoneId: 'ms-1' });
    expect(result.success).toBe(false);
  });

  it('rejects missing milestoneId', () => {
    const result = createTaskSchema.safeParse({ name: 'Write essay' });
    expect(result.success).toBe(false);
  });
});

// ── createMessageSchema ──────────────────────────────────

describe('createMessageSchema', () => {
  it('accepts valid input', () => {
    const result = createMessageSchema.safeParse({
      content: 'Hello',
      senderId: 'u-1',
      taskId: 't-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createMessageSchema.safeParse({
      content: '',
      senderId: 'u-1',
      taskId: 't-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = createMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ── parseBody ────────────────────────────────────────────

describe('parseBody', () => {
  it('returns { data } on valid input', () => {
    const result = parseBody(createUserSchema, {
      email: 'a@b.com',
      password: 'Str0ng!P',
      name: 'A',
      role: 'STUDENT',
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({
      email: 'a@b.com',
      password: 'Str0ng!P',
      name: 'A',
      role: 'STUDENT',
    });
  });

  it('returns { error } string on invalid input', () => {
    const result = parseBody(createUserSchema, { email: 'bad' });

    expect(result.data).toBeUndefined();
    expect(typeof result.error).toBe('string');
    expect(result.error!.length).toBeGreaterThan(0);
  });

  it('includes field paths in error message', () => {
    const result = parseBody(createUserSchema, { email: 'not-email', password: '12' });

    expect(result.error).toBeDefined();
    // The error should reference the failing field paths
    expect(result.error).toContain('password');
  });

  it('joins multiple errors with semicolons', () => {
    const result = parseBody(createUserSchema, {});

    expect(result.error).toBeDefined();
    // Multiple missing fields should produce multiple errors joined by "; "
    expect(result.error).toContain('; ');
  });
});
