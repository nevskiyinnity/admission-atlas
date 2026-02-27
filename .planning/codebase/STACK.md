# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase (frontend and backend)
- JSX/TSX 18.3.1 - React component files

**Secondary:**
- JavaScript - Configuration files (next.config.mjs, tailwind.config.js, postcss.config.mjs)

## Runtime

**Environment:**
- Node.js 20 (Alpine) - Production runtime in Docker
- Browser (React 18)

**Package Manager:**
- npm 10+ (specified by package-lock.json)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.35 - Full-stack React framework with App Router
- React 18.3.1 - UI library
- React DOM 18.3.1 - DOM rendering

**Database:**
- Prisma 5.22.0 - ORM and schema management
  - Schema: `prisma/schema.prisma`
  - PostgreSQL 16 datasource
  - Client generation via `npm run db:generate`

**Styling:**
- Tailwind CSS 3.4.19 - Utility-first CSS framework
  - Config: `tailwind.config.js`
  - Plugins: `tailwindcss-animate` 1.0.7
- PostCSS 8.5.6 - CSS transformations (with autoprefixer 10.4.24)
  - Config: `postcss.config.mjs`

**Testing:**
- Vitest 4.0.18 - Unit test runner
  - Config: `vitest.config.ts` (main), `vitest.integration.config.ts`
  - Environment: Node.js
  - Globals enabled

**Build/Dev:**
- TypeScript 5.9.3 - Type checking (strict mode enabled)
- ESLint 8.57.1 - Linting (extends `next/core-web-vitals`)
  - Config: `.eslintrc.json`
- SWC - Next.js bundler/transpiler
  - @swc/helpers 0.5.19 - Runtime helpers

**Internationalization:**
- next-intl 4.8.3 - Multi-language support (English and Chinese)
  - Config: `src/i18n/routing`

## Key Dependencies

**Critical:**
- @clerk/nextjs 6.37.5 - Authentication and user management
  - Provides Clerk middleware and auth hooks
  - Webhook integration via Svix
- @prisma/client 5.22.0 - Database client for all data operations
- openai 6.22.0 - GPT-4o-mini integration for profile analysis
  - Fallback: Returns mock response if API key not configured
- @vercel/blob 2.2.0 - File storage (Vercel Blob CDN)
  - Used for document uploads

**Infrastructure & Observability:**
- @sentry/nextjs 10.39.0 - Error tracking and performance monitoring
  - Initialized in both server and client
  - Config: `src/instrumentation.ts`, `src/instrumentation-client.ts`
- svix 1.85.0 - Webhook verification (Clerk webhook signature validation)

**Rate Limiting & Caching:**
- @upstash/redis 1.36.2 - Redis client for distributed rate limiting
- @upstash/ratelimit 2.0.8 - Sliding window rate limiting (100 req/60s)
  - Fallback: In-memory rate limiter if Upstash not configured

**UI Components & Utilities:**
- @radix-ui/react-slot 1.2.4 - Primitive component composition
- lucide-react 0.568.0 - Icon library
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.1 - Tailwind class merging

**Validation:**
- zod 4.3.6 - Schema validation and type inference
  - Used for API request/response validation
  - Usage: `src/lib/validations.ts`

**Development:**
- tsx 4.21.0 - TypeScript execution (for Prisma seed scripts)
- Prisma CLI 5.22.0 - Database migrations and schema management

## Configuration

**Environment:**
- `.env.example` - Configuration template (note: `.env` present but not committed)
- Key configs: `DATABASE_URL`, Clerk keys, Vercel Blob token, Upstash Redis, OpenAI API key, Sentry credentials

**Secrets Management:**
- Environment variables in `.env` (not versioned)
- Clerk webhook secret via `CLERK_WEBHOOK_SECRET`
- Database URL via `DATABASE_URL`
- Third-party API keys: OpenAI, Vercel Blob, Upstash Redis, Sentry

**Build Output:**
- Next.js standalone mode: `output: 'standalone'` in `next.config.mjs`
- Deployment: Docker image with Alpine base (lightweight)
- Health check: HTTP GET to `/` every 30s

## Type System & Paths

**TypeScript:**
- `tsconfig.json`: Strict mode enabled, bundler module resolution
- Path alias: `@/*` → `./src/*`
- JSX mode: `preserve` (Next.js handles transformation)

## Platform Requirements

**Development:**
- Node.js 20+
- npm 10+
- PostgreSQL 16 (local or Docker)
- TypeScript knowledge required

**Production:**
- Docker (Alpine Linux base)
- Node.js 20 runtime
- PostgreSQL 16 database
- Environment variables for:
  - Clerk (authentication)
  - Vercel Blob (file storage)
  - Upstash Redis (rate limiting)
  - OpenAI (AI analysis)
  - Sentry (error tracking)

**Security Headers (via Next.js config):**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains

---

*Stack analysis: 2026-02-27*
