# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Next.js 14 App Router with role-based multi-tenant architecture

**Key Characteristics:**
- Server Components (RSC) as default with selective use of Client Components
- API routes organized by resource domain (Projects, Tasks, Users, etc.)
- Middleware-driven authentication and role-based access control
- Database-centric design using Prisma ORM with PostgreSQL
- Multi-role system (STUDENT, COUNSELOR, ADMIN) with granular access control
- Internationalization (i18n) with support for English and Chinese

## Layers

**Presentation (Pages & Components):**
- Purpose: Render UI for authenticated users, handle client interactions
- Location: `src/app/[locale]/(student)`, `src/app/[locale]/(counselor)`, `src/app/[locale]/(admin)`, `src/components/`
- Contains: Page components (Server Components), layout wrappers, UI components (Button, Card, Badge, etc.), shared layout components (Sidebar, TopBar, PortalLayout)
- Depends on: API layer via `fetch()` calls, i18n via `next-intl`, routing via custom Link component
- Used by: End users accessing the web application

**API Layer:**
- Purpose: Handle HTTP requests, validate data, apply business logic, coordinate with database
- Location: `src/app/api/` with subdirectories by resource (projects, tasks, users, etc.)
- Contains: Route handlers (route.ts files) that implement GET, POST, PUT, DELETE operations
- Depends on: Prisma client, authentication middleware (Clerk), validation schemas, rate limiting/CSRF checks
- Used by: Frontend components via `fetch()`, external webhooks (Clerk, Svix)

**Business Logic & Utilities:**
- Purpose: Provide reusable logic for validation, authentication, analysis, API helpers
- Location: `src/lib/` with co-located tests in `src/lib/__tests__/`
- Contains: Validation schemas (validations.ts), auth helpers (api-auth.ts), rate limiting (rate-limit.ts), CSRF validation (csrf.ts), database client (prisma.ts), logger (logger.ts), utilities (utils.ts, analysis-utils.ts, prompts.ts)
- Depends on: Prisma, Zod for validation, Clerk for auth
- Used by: API routes, page components, integration tests

**Data Layer:**
- Purpose: Define domain models, manage database connections, seed data
- Location: `prisma/` for schema and migrations, `src/lib/prisma.ts` for client
- Contains: Prisma schema defining 16+ models (User, Project, Milestone, Task, Message, File, Notification, etc.)
- Depends on: PostgreSQL database
- Used by: All layers via Prisma client

**Security & Cross-Cutting:**
- Purpose: Enforce authentication, authorization, CSRF protection, rate limiting, security headers
- Location: `src/middleware.ts` (request processing), `src/lib/api-auth.ts`, `src/lib/csrf.ts`, `src/lib/rate-limit.ts`
- Contains: Middleware for auth flows, role-based route guards, API mutation validation
- Used by: All incoming requests via Next.js middleware

## Data Flow

**Authentication & Authorization Flow:**

1. User accesses app → Middleware (`src/middleware.ts`) intercepts request
2. Middleware validates route against public/protected pages
3. Clerk authentication checked via `auth()` from @clerk/nextjs
4. Role extracted from Clerk sessionClaims metadata
5. Role-based redirect applied if needed (e.g., authenticated user on login page → redirect to dashboard)
6. Request proceeds to page/API route if authorized

**Project Management Data Flow (Primary Use Case):**

1. Student/Counselor page component fetches projects: `GET /api/projects?studentId={userId}`
2. API route in `src/app/api/projects/route.ts`:
   - Calls `requireAuth()` to validate user and role
   - Builds Prisma query with pagination and includes (student, counselor, milestones + tasks)
   - Returns paginated JSON response
3. Component receives data, sets state, renders project cards
4. User clicks project → navigates to `/student/projects/[projectId]`
5. Detail page fetches related milestones, tasks, files
6. User updates task status → POST to `/api/tasks/[id]/complete`
7. API validates ownership via `canAccessTask()`, updates database, returns new state

**Message & Communication Flow:**

1. User sends message on task detail page → POST to `/api/messages`
2. API validates task access, creates Message record with attachments
3. Notification created for task assignee (Counselor/Student)
4. Message appears in chat interface via re-fetch or optimistic update
5. Recipient sees notification in `/student/notifications` or `/counselor/notifications`

**File Upload Flow:**

1. Component renders FileUpload widget
2. File selected → validated by file type/size checks
3. Uploaded to Vercel Blob (via `@vercel/blob`)
4. File metadata stored in Prisma (File model) with reference to Project/Milestone/Task/Message
5. File appears in file history panel
6. Download link generated from blob storage

**State Management:**

- **Client State:** React hooks (useState, useEffect) for local UI state (loading, modals, form inputs)
- **Server State:** Fetched via API routes, cached in component state, re-fetched on mutations
- **User State:** Stored in Clerk (authentication context), accessible via `useAuth()` and `auth()` from @clerk/nextjs
- **Database State:** Single source of truth in PostgreSQL via Prisma models
- **Session State:** Clerk sessionClaims contain user role and ID, passed to API via Authorization header

## Key Abstractions

**requireAuth() & canAccessX() Functions:**
- Purpose: Enforce authentication and ownership-based authorization
- Examples: `src/lib/api-auth.ts`
- Pattern: Middleware functions that validate user context and resource ownership before allowing operations
- Example: `canAccessProject()` returns true if user is ADMIN, project student, or assigned counselor

**Validation Schemas (Zod):**
- Purpose: Validate request payloads before database operations
- Examples: `src/lib/validations.ts` with schemas like `createProjectSchema`, `updateProjectSchema`, `createTaskSchema`
- Pattern: Zod object definitions that match Prisma model shapes, used in API routes via `parseBody()` helper
- Usage: `parseBody(createProjectSchema, body)` returns `{ ok: true, data }` or `{ ok: false, error }`

**PortalLayout Component:**
- Purpose: Shared layout wrapper for authenticated pages (Student/Counselor/Admin dashboards)
- Examples: `src/components/layout/portal-layout.tsx` wrapping Student/Counselor layouts
- Pattern: Higher-order layout component that provides sidebar, top bar, navigation structure
- Contains: Sidebar with role-specific navigation, top bar with user menu, language switcher

**Prisma Query Patterns:**
- Purpose: Structured database access with type safety
- Examples: `src/app/api/projects/route.ts` shows `prisma.project.findMany()` with includes and pagination
- Pattern: Always include related data needed by consumers (includes: { student, counselor, milestones }), use orderBy and pagination
- Key pattern: Parallel queries for data + count using `Promise.all()`

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All requests to the application
- Responsibilities: Pass-through layout (required by Next.js) that prevents auto-generation of conflicting html/body tags

**Locale Layout:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: All requests with [locale] parameter (en, zh)
- Responsibilities: Validate locale, load internationalization messages, wrap with ClerkProvider and NextIntlClientProvider, include TawkToWidget for customer support

**Role-Specific Layouts:**
- Location: `src/app/[locale]/(student)/layout.tsx`, `src/app/[locale]/(counselor)/layout.tsx`
- Triggers: Navigation to /student/* or /counselor/* routes
- Responsibilities: Define sidebar items with role-specific menu, render PortalLayout wrapper

**Page Components:**
- Location: `src/app/[locale]/(student)/student/dashboard/page.tsx` and similar
- Triggers: Direct navigation or route push from links
- Responsibilities: Fetch data from API, render content, handle user interactions (marked with 'use client')

**API Route Handlers:**
- Location: `src/app/api/{resource}/route.ts` (e.g., `/api/projects/route.ts`)
- Triggers: HTTP requests to /api/* endpoints
- Responsibilities: Validate auth, parse request body, call Prisma, return JSON response
- Pattern: GET for reads with pagination, POST for creation, PUT/PATCH for updates, DELETE for removal

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every HTTP request (including static files, redirects through matcher config)
- Responsibilities: Enforce security headers, CSRF validation, rate limiting, intl routing, authentication redirects, role-based access control

**Webhooks:**
- Location: `src/app/api/webhooks/` (Clerk auth events, Svix message queue)
- Triggers: External service callbacks (user created/updated, message events)
- Responsibilities: Validate webhook signature, process async events, update database state

## Error Handling

**Strategy:** Error responses returned as JSON with status codes, complemented by error boundary component

**Patterns:**

- **API Routes:** `NextResponse.json({ error: message }, { status })` with specific HTTP status codes (400, 401, 403, 404, 429, 500)
- **Example from middleware:** CSRF validation failure returns 403, rate limit hit returns 429, unauthorized returns 401
- **Example from API:** `parseBody()` returns error when schema validation fails, route returns 400 with error message
- **Frontend:** Pages use try-catch with loading/error state, ErrorBoundary component in `src/components/shared/error-boundary.tsx` catches unhandled errors
- **Logging:** Winston-based logger in `src/lib/logger.ts` captures errors for debugging

**Common Status Codes Used:**
- 200: Success
- 201: Created (POST)
- 400: Bad Request (validation failure)
- 401: Unauthorized (no auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Server Error

## Cross-Cutting Concerns

**Logging:**
- Framework: Winston logger in `src/lib/logger.ts`
- Patterns: Console logging in middleware for debugging (e.g., '[MW] pathname:'), application logs can be extended for API routes and background tasks

**Validation:**
- Framework: Zod schemas in `src/lib/validations.ts`
- Patterns: All request bodies validated via `parseBody()` helper before use; Prisma models define constraints; frontend uses TypeScript interfaces for type safety

**Authentication:**
- Framework: Clerk (@clerk/nextjs)
- Patterns: `auth()` in server context returns { userId, sessionClaims }, sessionClaims.metadata contains role; `useAuth()` hook in client context; Clerk webhooks sync user creation to database

**Authorization:**
- Pattern: Role-based access control in middleware (route guards) and API layer (resource ownership checks via `canAccessProject()`, `canAccessTask()`, `canAccessFile()`)
- Three roles: STUDENT (access own data), COUNSELOR (access assigned students), ADMIN (access all)

**Rate Limiting:**
- Framework: Upstash Redis (@upstash/ratelimit, @upstash/redis)
- Patterns: Applied in middleware for all `/api` routes, different limits for GET (100) vs mutations (20) per time window, IP-based

**CSRF Protection:**
- Patterns: Origin validation in middleware for all POST/PUT/DELETE/PATCH to `/api`, custom header check via `validateOrigin()` in `src/lib/csrf.ts`

**Security Headers:**
- Applied by middleware in response headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Strict-Transport-Security

---

*Architecture analysis: 2026-02-27*
