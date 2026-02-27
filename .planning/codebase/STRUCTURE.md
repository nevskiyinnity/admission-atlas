# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```
admission-atlas/
├── src/
│   ├── app/                          # Next.js App Router (routes, pages, API)
│   │   ├── layout.tsx                # Root layout (pass-through)
│   │   ├── globals.css               # Global Tailwind + custom styles
│   │   ├── [locale]/                 # Locale dynamic segment (en, zh)
│   │   │   ├── layout.tsx            # Locale wrapper with i18n, Clerk, Sentry
│   │   │   ├── (auth)/               # Authentication pages (group, not in URL)
│   │   │   │   ├── login/            # Login page and SSO callback
│   │   │   │   └── forgot-password/  # Password recovery
│   │   │   ├── (landing)/            # Public landing pages (group)
│   │   │   │   ├── page.tsx          # Home page
│   │   │   │   ├── team/
│   │   │   │   ├── results/
│   │   │   │   └── contact/
│   │   │   ├── (student)/            # Student portal pages (group)
│   │   │   │   ├── layout.tsx        # Student portal layout with sidebar
│   │   │   │   └── student/          # Student route prefix
│   │   │   │       ├── dashboard/    # /student/dashboard
│   │   │   │       ├── projects/     # /student/projects and [projectId]
│   │   │   │       ├── messages/     # /student/messages
│   │   │   │       ├── feedback/     # /student/feedback
│   │   │   │       ├── notifications/# /student/notifications
│   │   │   │       ├── account/      # /student/account
│   │   │   │       ├── settings/     # /student/settings
│   │   │   │       └── help/         # /student/help
│   │   │   ├── (counselor)/          # Counselor portal pages (group)
│   │   │   │   ├── layout.tsx        # Counselor portal layout
│   │   │   │   └── counselor/        # Counselor route prefix
│   │   │   │       ├── students/     # /counselor/students and [studentId]
│   │   │   │       ├── feedback/     # /counselor/feedback
│   │   │   │       ├── notifications/# /counselor/notifications
│   │   │   │       ├── account/      # /counselor/account
│   │   │   │       ├── settings/     # /counselor/settings
│   │   │   │       └── help/         # /counselor/help
│   │   │   └── (admin)/              # Admin portal pages (group)
│   │   │       ├── layout.tsx        # Admin portal layout
│   │   │       └── admin/            # Admin route prefix
│   │   │           ├── dashboard/    # Admin dashboard
│   │   │           ├── announcements/# Manage announcements
│   │   │           └── faqs/         # Manage FAQs
│   │   │
│   │   └── api/                      # RESTful API routes (prefixed /api)
│   │       ├── users/                # User management (GET, POST, PATCH)
│   │       ├── projects/             # Project CRUD (GET, POST, PUT, DELETE)
│   │       ├── milestones/           # Milestone CRUD
│   │       ├── tasks/                # Task CRUD + custom actions
│   │       │   ├── route.ts          # GET, POST for tasks
│   │       │   └── [id]/
│   │       │       ├── route.ts      # PATCH, DELETE for single task
│   │       │       ├── complete/     # Custom action: mark task complete
│   │       │       └── reassign/     # Custom action: reassign task
│   │       ├── messages/             # Message CRUD
│   │       ├── files/                # File operations (upload, download)
│   │       ├── notifications/        # Notification CRUD
│   │       ├── feedback/             # Feedback CRUD
│   │       ├── feedback-types/       # Feedback type management
│   │       ├── announcements/        # Announcement CRUD
│   │       ├── faqs/                 # FAQ CRUD
│   │       ├── tags/                 # Tag management
│   │       ├── dashboard/            # Dashboard data aggregation
│   │       ├── analyze/              # AI analysis endpoint
│   │       ├── login-logs/           # Login activity logging
│   │       ├── upload-logs/          # File upload tracking
│   │       ├── webhooks/             # External webhook handlers (Clerk, Svix)
│   │       └── __tests__/            # API route unit tests
│   │
│   ├── components/                   # Reusable React components
│   │   ├── ui/                       # Radix UI primitives (Button, Card, Badge, etc.)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── input.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ... (other UI primitives)
│   │   ├── layout/                   # Portal layout components
│   │   │   ├── portal-layout.tsx     # Main layout wrapper with sidebar/topbar
│   │   │   ├── sidebar.tsx           # Sidebar navigation
│   │   │   ├── top-bar.tsx           # Header with user menu
│   │   │   ├── user-menu.tsx         # User dropdown menu
│   │   │   └── language-switcher.tsx # Locale switcher (en, zh)
│   │   └── shared/                   # Domain-specific components
│   │       ├── error-boundary.tsx    # Error boundary wrapper
│   │       ├── file-upload.tsx       # File upload widget
│   │       ├── file-history-panel.tsx# File history list
│   │       ├── tawk-to-widget.tsx    # Customer support chat widget
│   │       └── ... (other shared components)
│   │
│   ├── lib/                          # Business logic, utilities, and helpers
│   │   ├── prisma.ts                 # Prisma client singleton (connection pooling)
│   │   ├── api-auth.ts               # requireAuth(), isAuthError(), canAccessX() helpers
│   │   ├── api-helpers.ts            # successResponse(), errorResponse(), sanitizeUser()
│   │   ├── validations.ts            # Zod schemas for all models
│   │   ├── analysis-utils.ts         # AI analysis and text processing utilities
│   │   ├── prompts.ts                # OpenAI prompt templates
│   │   ├── csrf.ts                   # CSRF token validation
│   │   ├── rate-limit.ts             # Rate limiting via Upstash Redis
│   │   ├── logger.ts                 # Winston logger configuration
│   │   ├── utils.ts                  # General purpose utilities (cn(), etc.)
│   │   └── __tests__/                # Unit tests for lib functions
│   │       ├── api-auth.test.ts
│   │       ├── api-helpers.test.ts
│   │       ├── validations.test.ts
│   │       ├── pagination.test.ts
│   │       ├── rate-limit.test.ts
│   │       ├── csrf.test.ts
│   │       └── ... (other tests)
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── index.ts                  # Shared types (Task, Milestone, Project, Message)
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── routing.ts                # i18n routing config (locales, defaultLocale)
│   │   └── en.json / zh.json         # Translation files (in messages/ folder)
│   │
│   ├── middleware.ts                 # Request middleware (auth, CSRF, rate limit, security headers)
│   ├── instrumentation.ts            # Sentry configuration
│   └── instrumentation-client.ts     # Client-side Sentry setup
│
├── prisma/
│   ├── schema.prisma                 # Database schema (16+ models)
│   ├── seed.ts                       # Database seeding script
│   └── migrations/                   # Database migration history
│
├── public/
│   └── uploads/                      # File uploads directory (local fallback, Vercel Blob primary)
│
├── messages/                         # Internationalization message files
│   ├── en.json                       # English translations
│   └── zh.json                       # Chinese translations
│
├── .planning/
│   └── codebase/                     # GSD codebase documentation
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       └── ... (other docs)
│
├── .github/
│   └── workflows/                    # CI/CD workflows
│
├── .clerk/                           # Clerk authentication configuration
│
├── .next/                            # Next.js build output (generated, not committed)
│
├── package.json                      # npm dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── vitest.config.ts                  # Unit test configuration
├── vitest.integration.config.ts      # Integration test configuration
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier formatting configuration
└── .gitignore                        # Git ignore rules
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router - all routes, pages, and API endpoints
- Contains: Layout wrappers, page components (Server or Client), API route handlers
- Key pattern: Directories without layout.tsx or page.tsx are route groups (parentheses notation)

**src/app/[locale]/**
- Purpose: Locale-aware routing supporting multiple languages (en, zh)
- Contains: Parametrized layout that validates and loads locale-specific configuration
- Key files: `src/app/[locale]/layout.tsx` wraps all routes with i18n, Clerk, Sentry providers

**src/app/[locale]/(student|counselor|admin)/**
- Purpose: Role-specific portal sections with shared layout wrapper
- Contains: Portal-specific layouts with sidebar navigation and role-specific pages
- Pattern: Each group has layout.tsx that wraps child routes with PortalLayout component

**src/app/api/**
- Purpose: RESTful API endpoints matching resource domains
- Contains: 32+ route handlers organized by resource type
- Pattern: Subdirectories group related endpoints (e.g., /api/projects/, /api/tasks/), custom actions in subdirectories ([id]/complete/, [id]/reassign/)

**src/components/ui/**
- Purpose: Reusable Radix UI primitive components (unstyled, styled with Tailwind)
- Contains: Button, Card, Label, Input, Avatar, Badge, etc.
- Pattern: Single responsibility - each component wraps one Radix primitive with Tailwind classes

**src/components/layout/**
- Purpose: Portal navigation and structure (multi-role aware)
- Contains: PortalLayout, Sidebar, TopBar, UserMenu, LanguageSwitcher
- Key pattern: PortalLayout is a wrapper component that provides consistent structure across student/counselor/admin portals

**src/components/shared/**
- Purpose: Domain-specific components used across multiple pages (FileUpload, ErrorBoundary, ChatWidget)
- Contains: Features that are not UI primitives but used in multiple routes
- Pattern: Components marked with 'use client' when using client hooks (useState, useEffect)

**src/lib/**
- Purpose: Business logic, validation, authentication, database access layer
- Contains: Prisma client, auth helpers, validation schemas, API response helpers, rate limiting, logging
- Pattern: Each concern has dedicated file (api-auth.ts, validations.ts, csrf.ts), tests co-located in __tests__/ subdirectory

**src/types/**
- Purpose: Shared TypeScript types and interfaces
- Contains: Domain types (Task, Milestone, Project, Message) representing superset of variations
- Pattern: Types are used for type safety across page components and API routes; use Pick<> or Partial<> to narrow at call sites

**src/i18n/**
- Purpose: Internationalization configuration and routing
- Contains: Locale routing config, Link component wrapper for i18n
- Key files: routing.ts defines locales, Link component automatically prefixes locale to URLs

**prisma/**
- Purpose: Database schema, migrations, and seed data
- Contains: schema.prisma defining 16 models (User, Project, Milestone, Task, Message, File, Notification, etc.)
- Key pattern: Models use CUID for IDs, relationships include cascade delete where appropriate, indexes on foreign keys

**messages/**
- Purpose: Translation files for both supported languages
- Contains: JSON files with UI text organized by page/feature (student.dashboard, student.sidebar, etc.)
- Pattern: Accessed via useTranslations() hook in components, server-side getMessages() in layouts

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout (pass-through, prevents Next.js auto-generation)
- `src/app/[locale]/layout.tsx`: Locale wrapper with i18n, Clerk, Sentry providers
- `src/middleware.ts`: Request middleware handling auth, CSRF, rate limiting, security headers
- `src/app/[locale]/(student)/student/dashboard/page.tsx`: Student dashboard entry
- `src/app/[locale]/(counselor)/counselor/students/page.tsx`: Counselor students list entry
- `src/app/[locale]/(admin)/admin/dashboard/page.tsx`: Admin dashboard entry

**Configuration:**
- `package.json`: Dependencies, scripts (dev, build, test, db:*)
- `tsconfig.json`: TypeScript config with path alias (@/ → src/)
- `next.config.js`: Next.js app config
- `tailwind.config.js`: Tailwind CSS theme and plugin configuration
- `prisma/schema.prisma`: Complete database schema
- `vitest.config.ts`: Unit test runner configuration
- `vitest.integration.config.ts`: Integration test runner configuration
- `messages/en.json`, `messages/zh.json`: Translation strings

**Core Logic:**
- `src/lib/prisma.ts`: Database connection singleton
- `src/lib/api-auth.ts`: `requireAuth()`, `canAccessProject()`, `canAccessTask()`, `canAccessFile()` helpers
- `src/lib/api-helpers.ts`: `successResponse()`, `errorResponse()`, `sanitizeUser()` helpers
- `src/lib/validations.ts`: Zod schemas for all models (createProjectSchema, updateTaskSchema, etc.)
- `src/lib/rate-limit.ts`: Upstash Redis rate limiting
- `src/lib/csrf.ts`: CSRF origin validation
- `src/lib/logger.ts`: Winston logger setup

**Testing:**
- `src/__tests__/`: Integration tests directory
- `src/lib/__tests__/`: Unit tests for lib functions
- `src/app/api/__tests__/`: API route tests
- Test files follow naming: `*.test.ts` or `*.spec.ts`

**API Endpoints:**
- `src/app/api/projects/route.ts`: GET projects (paginated), POST create project
- `src/app/api/projects/[id]/route.ts`: GET/PUT/DELETE individual project
- `src/app/api/tasks/[id]/complete/route.ts`: POST custom action to mark task complete
- `src/app/api/tasks/[id]/reassign/route.ts`: POST custom action to reassign task
- `src/app/api/files/route.ts`: File upload handler
- `src/app/api/webhooks/clerk/route.ts`: Clerk user sync webhook
- `src/app/api/webhooks/svix/route.ts`: Svix message queue webhook

**UI Components:**
- `src/components/layout/portal-layout.tsx`: Main app layout (sidebar + topbar + content)
- `src/components/layout/sidebar.tsx`: Navigation sidebar
- `src/components/layout/top-bar.tsx`: Header with user info
- `src/components/ui/button.tsx`: Reusable button (Radix + Tailwind)
- `src/components/ui/card.tsx`: Card container component
- `src/components/shared/file-upload.tsx`: File upload widget
- `src/components/shared/error-boundary.tsx`: Error boundary wrapper

## Naming Conventions

**Files:**
- Page files: `page.tsx` (Server Component by default)
- Layout files: `layout.tsx`
- API routes: `route.ts` in route segments
- Components: PascalCase (`UserMenu.tsx`, `FileUpload.tsx`)
- Utilities/helpers: camelCase (`api-auth.ts`, `rate-limit.ts`)
- Tests: `*.test.ts` or `*.spec.ts` (co-located with source or in __tests__ folder)

**Directories:**
- Route segments: kebab-case (`/student/dashboard`)
- Dynamic segments: brackets (`[id]`, `[locale]`, `[projectId]`)
- Route groups: parentheses `(student)`, `(counselor)`, `(auth)` - not part of URL path
- Feature directories: kebab-case (`file-upload`, `user-menu`)

**Variables & Functions:**
- React components: PascalCase (`StudentDashboard`, `ProjectCard`)
- Hooks: camelCase with `use` prefix (`useAuth`, `useTranslations`)
- Regular functions: camelCase (`requireAuth`, `parseBody`, `sanitizeUser`)
- Constants: UPPER_SNAKE_CASE (`API_TIMEOUT`, `MAX_FILE_SIZE`)
- Database IDs/references: userId, projectId, counselorId (Clerk format)
- Prisma model IDs: `id` field as @id
- Display IDs: `studentId`, `counselorId` (e.g., "STU-001", "COU-001")

**Types:**
- TypeScript interfaces: PascalCase (`User`, `Project`, `Message`)
- Zod schemas: camelCase (`createProjectSchema`, `updateUserSchema`)
- Enum values: UPPER_SNAKE_CASE matching Prisma enums (Role, TaskStatus, etc.)

## Where to Add New Code

**New Page/Feature:**
1. Create directory structure in `src/app/[locale]/(role)/route-prefix/feature/`
2. Add `page.tsx` (use 'use client' if needs interactivity)
3. Create API endpoint in `src/app/api/resource/route.ts` if data fetching needed
4. Import components from `src/components/` (layout, shared, ui)
5. Add translations to `messages/en.json` and `messages/zh.json`
6. Add unit/integration tests in `src/__tests__/` or co-located `__tests__/`

**New Component:**
- UI primitive (button, card): Add to `src/components/ui/component.tsx`
- Layout component (sidebar, header): Add to `src/components/layout/component.tsx`
- Feature/domain component (file-upload, error-boundary): Add to `src/components/shared/component.tsx`
- Always mark client-only components with `'use client'` at top

**New API Endpoint:**
1. Create directory: `src/app/api/resource/` (if new resource) or add to existing
2. Create `route.ts` implementing GET/POST/etc handlers
3. Import `requireAuth`, `isAuthError` from `@/lib/api-auth`
4. Import `parseBody` and validation schema from `@/lib/validations`
5. Use Prisma client: `import { prisma } from '@/lib/prisma'`
6. Return `NextResponse.json(data, { status })` with appropriate status code
7. For custom actions on resource: Create `src/app/api/resource/[id]/action/route.ts`

**New Database Model:**
1. Add model to `prisma/schema.prisma`
2. Add relationships and indexes as needed
3. Run `npx prisma migrate dev --name <feature_name>`
4. Create Zod validation schemas in `src/lib/validations.ts` for create/update
5. Create API routes in `src/app/api/model/route.ts` for CRUD operations

**Utility/Helper Function:**
- Data validation: Add Zod schema to `src/lib/validations.ts`
- Auth/API concerns: Add to `src/lib/api-auth.ts` or `src/lib/api-helpers.ts`
- General utilities: Add to `src/lib/utils.ts`
- Domain-specific logic: Create new file in `src/lib/` (e.g., `analysis-utils.ts`)
- Include unit test in `src/lib/__tests__/function.test.ts`

## Special Directories

**src/app/api/__tests__/**
- Purpose: API route endpoint tests
- Generated: No
- Committed: Yes
- Pattern: Test files that import and test route.ts handlers

**src/lib/__tests__/**
- Purpose: Unit tests for lib functions
- Generated: No
- Committed: Yes
- Pattern: Tests for validation schemas, auth helpers, rate limiting, etc.

**src/__tests__/integration/**
- Purpose: Integration tests that test full flows
- Generated: No
- Committed: Yes
- Pattern: Tests that may hit database and multiple API endpoints

**prisma/migrations/**
- Purpose: Database migration history
- Generated: Yes (by `prisma migrate dev`)
- Committed: Yes (to ensure team consistency)
- Pattern: Timestamped folders with migration.sql files

**.next/**
- Purpose: Next.js build output
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignored)
- Pattern: Contains compiled code, static assets, serverless functions

**public/uploads/**
- Purpose: Local file storage fallback
- Generated: Yes (by file upload handler)
- Committed: No (.gitignored)
- Pattern: Files uploaded by users (Vercel Blob is primary storage)

**messages/**
- Purpose: Translation strings
- Generated: No
- Committed: Yes
- Pattern: One JSON file per locale (en.json, zh.json), organized by page/feature keys

---

*Structure analysis: 2026-02-27*
