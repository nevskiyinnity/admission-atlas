# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- API routes use Next.js naming: `route.ts` in `[resource]/` directories
  - Example: `src/app/api/projects/[id]/route.ts`
- Test files use `__tests__/` directories with `.test.ts` suffix
  - Example: `src/lib/__tests__/validations.test.ts`
- Configuration files use kebab-case: `vitest.config.ts`, `vitest.integration.config.ts`
- Utility modules use camelCase: `api-helpers.ts`, `api-auth.ts`, `analysis-utils.ts`

**Functions:**
- camelCase for all function names: `requireAuth()`, `canAccessProject()`, `sanitizeUser()`
- Prefix boolean-returning functions with `is` or `can`: `isAuthError()`, `canAccessTask()`
- Prefix mocking functions with `make`: `makeClerkAuth()`, `makeRequest()`
- Helper functions in tests prefixed with `make` or uppercase DESCRIBE section names: `makeClerkAuth`, `makeRequest`

**Variables:**
- camelCase for all variable names: `userId`, `sessionClaims`, `projectOwnedByUserA`
- Type/interface names use PascalCase: `Role`, `LogLevel`, `LogEntry`, `AnalysisResult`
- Enum values use UPPERCASE: `STUDENT`, `COUNSELOR`, `ADMIN` (matching Prisma enums)
- Boolean variables often prefixed with `is` or `has`: `isRateLimited`, `isProduction`, `hasGlobalExamSignals`

**Types:**
- Interfaces use PascalCase: `LogEntry`, `CategoryScore`, `Alternative`, `AnalysisResult`
- Type aliases use PascalCase: `Role`, `LogLevel`
- Zod schemas use camelCase: `createUserSchema`, `updateProjectSchema`, `parseBody`
- Union type enums are capitalized: `Role`, `Gender`, `ServiceStatus`, `AccountStatus`

## Code Style

**Formatting:**
- No Prettier config detected; relies on ESLint with Next.js defaults
- Indentation: 2 spaces (inferred from source files)
- Line length: appears to follow standard (~100-120 characters)
- Quotes: single quotes throughout (`'use client'`, `'vitest'`)

**Linting:**
- ESLint config: `"extends": "next/core-web-vitals"` in `.eslintrc.json`
- Ignores console calls with `// eslint-disable-next-line no-console`
- No custom ESLint rules beyond Next.js defaults

**Section Dividers:**
- Uses ASCII divider comments for organizing code sections:
  ```
  // ── Section Name ────────────────────────────────
  ```
- Pattern: `// ── [Name] [dashes]` (typically 60-70 characters total)
- Appears in tests and library files for logical grouping

## Import Organization

**Order:**
1. Third-party React/Next imports (`import React`, `import { useEffect }`)
2. Other third-party libraries (`import { z } from 'zod'`, `import { auth } from '@clerk/nextjs'`)
3. Type imports (`import type { AnalysisPayload }`)
4. Relative/alias imports (`import { prisma } from '@/lib/prisma'`)
5. Component imports (`import { Card } from '@/components/ui/card'`)

**Path Aliases:**
- Single alias configured: `@/*` maps to `./src/*`
- Used throughout: `@/lib/prisma`, `@/lib/validations`, `@/components/ui/card`
- Enables shorter, more maintainable import paths

**Example structure:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { AnalysisPayload } from '@/lib/prompts';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
```

## Error Handling

**Patterns:**
- API routes: Return `NextResponse.json({ error: string }, { status })` for errors
  - 401 for Unauthorized (no userId)
  - 403 for Forbidden (wrong role or no permission)
  - 404 for not found
  - 400 for validation errors
  - 500 for server errors with context logged

- Zod validation: Use `.safeParse()` to avoid throwing, check `result.success` boolean
  - Success: `{ success: true, data }`
  - Failure: `{ success: false, error }`

- Helper: `parseBody(schema, data)` returns `{ data?, error?: string }` (not Zod format)
  - `error` is a formatted string joining all field errors with `"; "`

- Type guards: Use `isAuthError()` to distinguish NextResponse from successful auth result
  - Returns true if `result instanceof NextResponse`

**Example flow:**
```typescript
const auth = await requireAuth(['ADMIN']);
if (isAuthError(auth)) return auth;  // Early return on error

const parsed = parseBody(updateSchema, body);
if (!parsed.ok) {
  return errorResponse(parsed.error, 400);
}

try {
  const result = await prisma.model.update(...);
  return successResponse(result);
} catch (error) {
  logger.error('PUT /api/route error', error);
  return errorResponse('Failed to update', 500);
}
```

## Logging

**Framework:** Custom `logger` object (not Winston/Pino)
- File: `src/lib/logger.ts`

**Methods:**
- `logger.debug(message, context?)`
- `logger.info(message, context?)`
- `logger.warn(message, context?)`
- `logger.error(message, error?, context?)`

**Output:**
- Production: JSON format (one-line, machine-readable)
- Development: Human-readable with timestamp, level, message, context, stack traces
- Timestamp: ISO 8601 format

**Patterns:**
- Log errors at catch blocks: `logger.error('PUT /api/projects/[id] error', error)`
- Include context object for structured logging when needed
- Always log errors before returning 500 responses

**Example:**
```typescript
try {
  const result = await operation();
} catch (error) {
  logger.error('Operation failed', error, { userId: auth.user.id });
  return errorResponse('Something went wrong', 500);
}
```

## Comments

**When to Comment:**
- Section dividers: Use ASCII dividers above logical groups
- JSDoc for exported functions (especially in lib files)
- Inline comments only for non-obvious logic

**JSDoc/TSDoc:**
- Used for public API functions in `src/lib/` files
- Single-line format typical:
  ```typescript
  /** Returns true if the user is ADMIN, the student owner, or the assigned counselor. */
  export function canAccessProject(...): boolean
  ```
- Multi-line for more complex functions with parameters

**Example from codebase:**
```typescript
/**
 * Require authentication (and optionally specific roles) for an API route.
 * Returns a user object on success, or a NextResponse error on failure.
 *
 * The return shape preserves `{ user: { id, role, email } }` to keep
 * all existing API route code working without changes.
 */
export async function requireAuth(allowedRoles?: Role[])
```

## Function Design

**Size:**
- Most functions 5-30 lines
- Route handlers may be longer (up to 60+ lines with full CRUD)
- Library utilities kept concise

**Parameters:**
- Prefer explicit parameters over config objects
- Use overloads for optional role restrictions: `requireAuth()` vs `requireAuth(['ADMIN'])`
- Type parameters explicitly where needed: `sanitizeUser<T extends Record<string, unknown>>`

**Return Values:**
- API handlers: Return `NextResponse` (success or error)
- Utility functions: Return typed values or union types
- Auth checks: Return either error response or object with user data
  - Pattern: `{ user: { id, role, email } } | NextResponse`
- Type guards use return type predicates: `result is NextResponse`

**Example pattern:**
```typescript
export async function requireAuth(allowedRoles?: Role[]) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: { id: userId, role, email } };
}

export function isAuthError(result: /* union type */): result is NextResponse {
  return result instanceof NextResponse;
}
```

## Module Design

**Exports:**
- Mix of named exports and default exports (case-by-case)
- Prefer named exports for utilities: `export const logger = { ... }`
- Default exports for pages: `export default function Page() { ... }`
- API routes use named exports: `export async function GET()`, `export async function POST()`

**Barrel Files:**
- Not heavily used in this codebase
- Types generally imported directly from source files

**Organization:**
- Group related functions together with section dividers
- Separate concerns clearly: auth logic, access control, sanitization

---

*Convention analysis: 2026-02-27*
