# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts` (unit tests)
- Config: `vitest.integration.config.ts` (integration tests)
- Node environment (not browser)

**Assertion Library:**
- Vitest built-in `expect()` and matchers
- No additional assertion library needed

**Run Commands:**
```bash
npm test                    # Run all unit tests once
npm run test:watch         # Watch mode for unit tests
npm run test:coverage      # Generate coverage report
npm run test:integration   # Run only integration tests
```

## Test File Organization

**Location:**
- Unit tests: Co-located with source in `src/**/__tests__/` directories
  - Example: `src/lib/__tests__/validations.test.ts` for `src/lib/validations.ts`
  - Example: `src/app/api/__tests__/idor.test.ts` for API route tests

- Integration tests: Centralized in `src/__tests__/integration/`
  - Example: `src/__tests__/integration/users.integration.test.ts`

**Naming:**
- Unit tests: `{module}.test.ts` or `{aspect}.test.ts`
  - `validations.test.ts`, `api-helpers.test.ts`, `idor.test.ts`
- Integration tests: `{feature}.integration.test.ts`
  - `users.integration.test.ts`

**Structure:**
```
src/lib/                      # Source
├── validations.ts
└── __tests__/
    ├── validations.test.ts
    ├── api-helpers.test.ts
    └── ...

src/__tests__/
└── integration/
    └── users.integration.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  // Setup (optional)
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do X when condition Y', () => {
    // Arrange
    const input = { ... };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle error case', () => {
    // ...
  });
});

describe('Another Feature', () => {
  // ...
});
```

**Patterns:**
- Use `describe()` to group related tests by function/feature
- Use `it()` for individual test cases with clear descriptions
- Description format: "should [expected behavior] when [condition]"
- Arrange-Act-Assert pattern within test body
- Section dividers (`// ── Section ────`) to separate setup, mocks, helpers, tests

## Mocking

**Framework:** Vitest's `vi` object

**Patterns:**

### Hoisted Mocks (for dependency injection)
Use `vi.hoisted()` to hoist mock declarations before imports:
```typescript
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    project: { findUnique: vi.fn() },
    task: { findUnique: vi.fn() },
  },
}));

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));
```

### Module Mocks
Replace entire modules with `vi.mock()`:
```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
```

### Mock Reset
Clear mocks between tests:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Mock Configuration
Set return values for specific scenarios:
```typescript
mockAuth.mockResolvedValue(makeClerkAuth('user-a', 'STUDENT'));
mockPrisma.project.findUnique.mockResolvedValue(projectData);
mockPrisma.project.findUnique.mockResolvedValue(null);  // For not-found cases
```

**What to Mock:**
- External services (Clerk auth, Prisma database)
- Third-party APIs (@clerk/nextjs, @vercel/blob)
- File system operations
- Network requests

**What NOT to Mock:**
- Core utility functions (validation, sanitization, helpers)
- Zod schemas (test real validation logic)
- Logging calls (test that they're called, not implementations)

## Fixtures and Factories

**Test Data:**
Helper functions create consistent test objects:
```typescript
function makeClerkAuth(id: string, role: Role) {
  return {
    userId: id,
    sessionClaims: {
      metadata: { role },
      email: 'test@example.com',
    },
  };
}

function makeRequest(url: string, method = 'GET', body?: Record<string, unknown>) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  return new NextRequest(`http://localhost${url}`, init);
}
```

**Location:**
- Helper functions defined in test files themselves (not separate fixtures directory)
- Grouped in `// ── Helpers ──────────────────` section above tests

**Construction patterns:**
- Use explicit parameters for variability
- Defaults for common values (`email: 'test@example.com'`)
- Return complete objects matching expected interface

## Coverage

**Requirements:** Not enforced (no coverage threshold in vitest.config.ts)

**View Coverage:**
```bash
npm run test:coverage
# Generates coverage report in terminal and (typically) coverage/ directory
```

**Current approach:** Tests are extensive but no hard coverage gate

## Test Types

**Unit Tests:**
- Scope: Single function or module in isolation
- Location: `src/**/__tests__/{name}.test.ts`
- Approach:
  - Test input validation (Zod schemas)
  - Test utility functions (helpers, sanitizers)
  - Test pure logic (clamping, string arrays, analysis utils)
  - Mock external dependencies (Prisma, auth)

- Examples:
  - `validations.test.ts`: Tests Zod schema `.safeParse()` with various inputs
  - `api-helpers.test.ts`: Tests response builders and sanitizers
  - `analysis-utils.test.ts`: Tests pure utility functions with various edge cases

**Integration Tests:**
- Scope: Real database operations and full workflows
- Location: `src/__tests__/integration/{feature}.integration.test.ts`
- Approach:
  - Use real Prisma client against test database
  - Setup/teardown test data between tests
  - Test database constraints and relationships
  - Verify complete user flows

- Examples:
  - `users.integration.test.ts`: Tests user CRUD, constraints, counselor assignment

- Configuration:
  - Separate Vitest config: `vitest.integration.config.ts`
  - Run separately: `npm run test:integration`
  - Timeout increased: `testTimeout: 30000, hookTimeout: 30000`
  - Only includes: `'src/__tests__/integration/**/*.test.ts'`

**E2E Tests:**
- Not implemented in this codebase
- Would test full user journeys through UI (not currently in scope)

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// With mock resolution
mockAuth.mockResolvedValue(authData);
const result = await requireAuth();
expect(result).toEqual(expectedResult);
```

**Error Testing:**
```typescript
// Rejection/throws
await expect(asyncFunction()).rejects.toThrow();

// NextResponse errors
const result = await requireAuth();
expect(result).toBeInstanceOf(NextResponse);
const response = result as NextResponse;
expect(response.status).toBe(401);
const body = await response.json();
expect(body).toEqual({ error: 'Unauthorized' });
```

**Type Guard Testing:**
```typescript
// Testing type predicate function
const response = NextResponse.json({ error: 'Test' }, { status: 400 });
expect(isAuthError(response)).toBe(true);

const userObj = { user: { id: 'x', role: 'STUDENT' } };
expect(isAuthError(userObj)).toBe(false);
```

**Loop-based Testing (testing multiple enum values):**
```typescript
it('accepts all valid roles', () => {
  for (const role of ['STUDENT', 'COUNSELOR', 'ADMIN']) {
    const result = createUserSchema.safeParse({ ...validUser, role });
    expect(result.success).toBe(true);
  }
});
```

**State Management in Tests (module reload for state reset):**
```typescript
beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();  // Clear cached module state
  const mod = await import('@/lib/rate-limit');
  isRateLimited = mod.isRateLimited;
});

afterEach(() => {
  vi.useRealTimers();
});
```

**Object Mutation Testing:**
```typescript
// Verify function does not mutate original
const original = { id: '1', password: 'secret' };
const result = sanitizeUser(original);

expect(result).not.toBe(original);  // Different object
expect(original).toHaveProperty('password');  // Original unchanged
expect(result).not.toHaveProperty('password');  // Result sanitized
```

## Test Examples

### Validation Test Pattern
From `src/lib/__tests__/validations.test.ts`:
```typescript
describe('createUserSchema', () => {
  const validUser = {
    email: 'alice@example.com',
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

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});
```

### API Handler Mock Pattern
From `src/app/api/__tests__/idor.test.ts`:
```typescript
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    project: { findUnique: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('IDOR Prevention — Projects', () => {
  const projectOwnedByUserA = {
    id: 'proj-1',
    studentId: 'user-a',
    counselorId: 'counselor-1',
  };

  it('returns 403 when User B tries to access User A project', async () => {
    mockAuth.mockResolvedValue(makeClerkAuth('user-b', 'STUDENT'));
    mockPrisma.project.findUnique.mockResolvedValue(projectOwnedByUserA);

    const res = await getProject(
      makeRequest('/api/projects/proj-1'),
      { params: { id: 'proj-1' } },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });
});
```

### Utility Function Test Pattern
From `src/lib/__tests__/api-helpers.test.ts`:
```typescript
describe('sanitizeUser', () => {
  it('strips the password field from a user object', () => {
    const user = { id: '1', name: 'Alice', email: 'a@b.com', password: 'secret' };
    const result = sanitizeUser(user);

    expect(result).not.toHaveProperty('password');
  });

  it('returns a new object (does not mutate the original)', () => {
    const user = { id: '1', name: 'Alice', password: 'secret' };
    const result = sanitizeUser(user);

    expect(result).not.toBe(user);
    expect(user).toHaveProperty('password');  // original still has it
  });
});
```

### Rate Limiting Test Pattern (with fake timers)
From `src/lib/__tests__/rate-limit.test.ts`:
```typescript
beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const mod = await import('@/lib/rate-limit');
  isRateLimited = mod.isRateLimited;
});

describe('isRateLimited', () => {
  it('resets after the window expires (60 seconds)', async () => {
    const maxRequests = 2;
    expect(await isRateLimited('user-1', maxRequests)).toBe(false);
    expect(await isRateLimited('user-1', maxRequests)).toBe(false);
    expect(await isRateLimited('user-1', maxRequests)).toBe(true);

    vi.advanceTimersByTime(61_000);  // Advance past window

    expect(await isRateLimited('user-1', maxRequests)).toBe(false);
  });
});
```

---

*Testing analysis: 2026-02-27*
