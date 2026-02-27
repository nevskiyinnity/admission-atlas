# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**Authentication & User Management:**
- Clerk - User authentication, sign-up, login, role management
  - SDK: `@clerk/nextjs` 6.37.5
  - Auth: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - Webhook verification: `CLERK_WEBHOOK_SECRET`
  - Webhook endpoint: `POST /api/webhooks/clerk` (in `src/app/api/webhooks/clerk/route.ts`)
  - Events handled: `user.created`, `user.updated`, `user.deleted`
  - Verification: Svix library for signature validation

**AI & Analysis:**
- OpenAI (GPT-4o-mini) - University admissions profile analysis
  - SDK: `openai` 6.22.0
  - Auth: `OPENAI_API_KEY` (optional - returns mock response if not set)
  - Endpoint: `POST /api/analyze` (in `src/app/api/analyze/route.ts`)
  - Model: `gpt-4o-mini` with JSON response format
  - Fallback behavior: Mock analysis response if no API key configured
  - System prompt: `src/lib/prompts.ts`

## Data Storage

**Databases:**
- PostgreSQL 16
  - Connection: `DATABASE_URL` environment variable
  - Format: `postgresql://user:password@host:port/database?schema=public`
  - Client: Prisma ORM
  - Local development: `postgresql://postgres:postgres@localhost:5432/admission_atlas?schema=public`
  - Docker: `postgres:16-alpine` service in `docker-compose.yml`

**File Storage:**
- Vercel Blob (serverless object storage)
  - Auth: `BLOB_READ_WRITE_TOKEN` environment variable
  - SDK: `@vercel/blob` 2.2.0
  - Upload endpoint: `POST /api/files/upload` (in `src/app/api/files/upload/route.ts`)
  - Supported file types: PDF, Word docs, Excel, images (PNG, JPEG, GIF)
  - Max file size: 50MB
  - Access: Public URL via `blob.url`
  - Used for: Documents, essays, project files, attachments

**Caching & Rate Limiting:**
- Upstash Redis (serverless Redis)
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - SDK: `@upstash/redis` 1.36.2, `@upstash/ratelimit` 2.0.8
  - Rate limit: 100 requests per 60 seconds (sliding window)
  - Fallback: In-memory rate limiter if Upstash not configured
  - Applied to: All API routes (different limits for GET vs POST/PUT/DELETE)
  - Implementation: `src/lib/rate-limit.ts`

## Authentication & Identity

**Auth Provider:**
- Clerk
  - Implementation: Clerk middleware in `src/middleware.ts`
  - Session claims contain role metadata (STUDENT, COUNSELOR, ADMIN)
  - User sync: Webhook at `POST /api/webhooks/clerk`
  - Database sync: Upsert logic in `src/app/api/webhooks/clerk/route.ts`
  - Protected routes: Role-based access control enforced in middleware

**Authorization:**
- Role-based access control (RBAC)
  - Roles: STUDENT, COUNSELOR, ADMIN
  - Enforcement: `src/lib/api-auth.ts`
  - Functions: `requireAuth()`, `canAccessProject()`, `canAccessTask()`, `canAccessFile()`
  - Route protection: Middleware applies role-based redirects

## Monitoring & Observability

**Error Tracking:**
- Sentry
  - SDK: `@sentry/nextjs` 10.39.0
  - Server DSN: `SENTRY_DSN`
  - Client DSN: `NEXT_PUBLIC_SENTRY_DSN`
  - Org/Project: `SENTRY_ORG`, `SENTRY_PROJECT` environment variables
  - Configuration: `src/instrumentation.ts` (server), `src/instrumentation-client.ts` (client)
  - Sample rate: 10% (0.1)
  - Replay on error: 100% sample rate
  - Disabled in dev if missing DSN

**Logging:**
- Console logging via custom logger
  - Implementation: `src/lib/logger.ts`
  - Used in API routes for error tracking
  - Sentry integration configured via instrumentation

## CI/CD & Deployment

**Hosting:**
- Vercel (configured via `.vercel/` directory)
  - Next.js API routes deployed to serverless functions
  - Edge middleware supported
  - Environment variables managed in Vercel dashboard

**Docker Support:**
- Multi-stage Dockerfile in `Dockerfile`
- Base image: `node:20-alpine`
- Build stages: deps → builder → runner
- Standalone output mode for optimized deployment
- Health check: HTTP GET to `/` every 30s
- Docker Compose: `docker-compose.yml` for local development (includes PostgreSQL)

**Build Output:**
- Next.js standalone: Self-contained application without node_modules
- Prisma client generated during build
- Static exports handled by Next.js

## Environment Configuration

**Required env vars for full functionality:**
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk frontend key
- `CLERK_SECRET_KEY` - Clerk backend key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook validation
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `UPSTASH_REDIS_REST_URL` - Upstash Redis endpoint (optional - falls back to in-memory)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token (optional)
- `OPENAI_API_KEY` - OpenAI API key (optional - returns mock response)
- `SENTRY_DSN` - Sentry server-side endpoint (optional)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry client-side endpoint (optional)
- `SENTRY_ORG` - Sentry organization (optional)
- `SENTRY_PROJECT` - Sentry project (optional)

**Secrets location:**
- `.env` file (local development) - NOT committed
- Vercel dashboard (production)
- Docker environment variables in `docker-compose.yml` (template)

## Webhooks & Callbacks

**Incoming Webhooks:**
- Clerk user events: `POST /api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`
  - Verification: Svix signature validation
  - Payload processing in `src/app/api/webhooks/clerk/route.ts`
  - Syncs to Prisma database User model

**Outgoing Webhooks:**
- Not detected - application receives webhooks but doesn't send them

## API Routes Overview

**User Management:**
- `GET/POST /api/users` - List/create users
- `GET/PUT/DELETE /api/users/[id]` - User operations
- `PUT /api/users/[id]/assign-counselor` - Assign counselor to student
- `PUT /api/users/[id]/settings` - Update user settings
- `PUT /api/users/[id]/lock` - Account lock/unlock

**Projects & Tasks:**
- `GET/POST /api/projects` - Project operations
- `GET/PUT /api/projects/[id]` - Individual project
- `GET/POST /api/milestones` - Milestone CRUD
- `GET/POST /api/tasks` - Task CRUD
- `PUT /api/tasks/[id]` - Update task
- `PUT /api/tasks/[id]/complete` - Mark task complete
- `PUT /api/tasks/[id]/reassign` - Reassign task

**Files & Storage:**
- `POST /api/files/upload` - Upload to Vercel Blob
- `GET/DELETE /api/files/[id]` - File operations
- `PUT /api/files/[id]/final-version` - Mark final version
- `GET/POST /api/upload-logs` - Upload audit trail

**Communication:**
- `GET/POST /api/messages` - Message CRUD
- `GET/POST /api/feedback` - User feedback
- `PUT /api/feedback/[id]/reply` - Reply to feedback
- `GET/POST /api/notifications` - Notification management
- `PUT /api/notifications/mark-all-read` - Mark all read

**Analysis & Content:**
- `POST /api/analyze` - OpenAI profile analysis
- `GET/POST /api/announcements` - Announcement CRUD
- `GET/POST /api/faq` - FAQ management
- `GET/POST /api/feedback-types` - Feedback type definitions

**Admin/Analytics:**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/tags` - Counselor tags
- `GET /api/login-logs` - Login audit trail

---

*Integration audit: 2026-02-27*
