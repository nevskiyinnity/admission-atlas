# Codebase Concerns

**Analysis Date:** 2026-02-27

## Tech Debt

**Unimplemented Password Reset Flow:**
- Issue: Password reset endpoints are stubbed with setTimeout placeholders instead of real implementation
- Files: `src/app/[locale]/(auth)/forgot-password/page.tsx` (lines 26, 41)
- Impact: Users cannot reset forgotten passwords; feature is non-functional
- Fix approach: Implement email verification code sending (via email service), validate codes, call password reset API, integrate with Clerk authentication

**Type Safety with `any` Assertions (13 instances across codebase):**
- Issue: 13 instances of `as any` type assertions bypass TypeScript type checking
- Files:
  - `src/app/[locale]/(counselor)/counselor/students/[studentId]/projects/[projectId]/page.tsx:116` - Link href cast
  - `src/app/[locale]/(counselor)/counselor/students/page.tsx:40` - User object filter cast
  - `src/app/[locale]/(counselor)/counselor/students/page.tsx:66` - Link href cast
  - `src/app/[locale]/(student)/student/dashboard/page.tsx:52` - Link href cast
  - `src/app/[locale]/(student)/student/account/page.tsx:25` - State initialization cast
  - `src/app/[locale]/layout.tsx:27` - Locale validation cast
  - `src/app/[locale]/(admin)/admin/tasks/page.tsx:27` - Array map type cast
  - `src/app/[locale]/(admin)/admin/teachers/page.tsx:56` - Form body cast
  - `src/app/[locale]/(admin)/admin/students/page.tsx:64, 97` - Multiple casting issues
  - `src/components/layout/language-switcher.tsx:20` - Locale type cast
- Impact: Type errors masked at compile time; runtime errors possible; code maintainability reduced
- Fix approach: Define proper interfaces for all response shapes, use `satisfies` keyword where appropriate, avoid type assertions in favor of type narrowing

**Untyped State in Client Components:**
- Issue: Multiple client components use `useState<any>` for complex data structures
- Files:
  - `src/app/[locale]/(counselor)/counselor/account/page.tsx:25` - `user` state
  - `src/app/[locale]/(student)/student/account/page.tsx:25` - `user` state
  - `src/app/[locale]/(admin)/admin/tasks/page.tsx:27` - `projects` array cast
- Impact: No autocomplete; runtime type errors possible; difficult refactoring
- Fix approach: Create reusable types in `src/types/index.ts` for all fetch response shapes (User, Project, etc.); use these throughout

**Unhandled Promise Chains in Fetch Calls:**
- Issue: Multiple fetch calls lack error handling or don't propagate errors
- Files (selected examples):
  - `src/app/[locale]/(counselor)/counselor/feedback/page.tsx:24, 26` - Feed feedback types/items without error handling
  - `src/app/[locale]/(student)/student/projects/[projectId]/page.tsx:50-59` - Fetch project without catch
  - `src/app/[locale]/(counselor)/counselor/students/[studentId]/page.tsx:48-59` - Promise.all fetch without error handling
  - `src/app/[locale]/(student)/student/account/page.tsx:32-33` - Multiple fetches chained with `.then()` without `.catch()`
- Impact: UI shows loading state indefinitely on network errors; users see no error message
- Fix approach: Wrap all fetch calls in try-catch or add `.catch()` handlers; set error state and display error UI; implement error boundary component

**Console Logs in Production Middleware:**
- Issue: Debug console.log statements left in middleware
- Files: `src/middleware.ts` (lines 92, 94)
- Impact: Logs clutter production logs; security concern for revealing request paths
- Fix approach: Remove console.log statements or replace with proper logging service (Sentry, structured logging)

**Artificial Delays with setTimeout in Mock Features:**
- Issue: setTimeout used to simulate async operations instead of real API calls
- Files:
  - `src/app/[locale]/(auth)/forgot-password/page.tsx:27, 42` - Fake delays in password reset
  - `src/app/[locale]/(counselor)/counselor/students/page.tsx:32` - Debounce implemented as setTimeout (acceptable but coarse)
  - `src/app/[locale]/(admin)/admin/teachers/page.tsx:48, 68` - Debounce with setTimeout
- Impact: Password reset appears functional but doesn't work; encourages false sense of completion
- Fix approach: Implement real password reset API, remove setTimeout delays, use proper debouncing utility if needed

---

## Security Considerations

**CSRF Protection May Allow Non-Browser Requests:**
- Issue: CSRF validation allows requests without Origin header
- Files: `src/lib/csrf.ts:11-24`
- Current behavior: Returns `true` if `!origin || !host` (lines 15-16)
- Risk: Tools like curl, Postman, or malicious scripts can bypass CSRF protection
- Recommendations:
  - Consider stricter validation (e.g., require Origin for state-changing requests)
  - Add CSRFToken in request body for API calls
  - Document CSRF strategy and when it's appropriate to allow non-browser requests

**Console Output in Middleware May Leak Path Information:**
- Issue: Middleware logs all request paths to console
- Files: `src/middleware.ts:92, 94`
- Risk: In development logs could be accidentally committed; in production, reveals routing structure
- Recommendations: Use structured logging with proper log levels; never log to console in production

**Type Casting in Role-Based Auth:**
- Issue: Role from session claims cast with `as string | undefined`
- Files: `src/middleware.ts:114`
- Risk: If metadata structure changes, type assertions hide the failure
- Recommendations: Create validated SessionMetadata type; parse with Zod; fail safely if structure is unexpected

---

## Performance Bottlenecks

**Large Landing Page Component:**
- Problem: Landing page with 415 lines of JSX content
- Files: `src/app/[locale]/(landing)/page.tsx`
- Cause: Hero section, metrics, services, process, and outcomes all in single page component
- Improvement path:
  - Extract sections into separate components (`src/components/landing/hero.tsx`, `src/components/landing/services.tsx`, etc.)
  - Use React.lazy for below-fold sections if client-side rendering
  - Measure Core Web Vitals; consider static generation if content is stable

**N+1 Query Pattern in User Endpoints:**
- Problem: GET /api/users includes related data without cursor-based pagination
- Files: `src/app/api/users/route.ts:38-55`
- Cause: `include: { assignedCounselor, students, tags }` on every user query
- Improvement path:
  - Make `include` optional via query parameter
  - Use cursor-based pagination for large datasets
  - Add indexes on `assignedCounselorId`, `role` in database schema

**Multiple Fetch Calls Without Concurrent Optimization:**
- Problem: Sequential .then() chains instead of Promise.all() where possible
- Files: Multiple pages like `src/app/[locale]/(counselor)/counselor/account/page.tsx:32-33`
- Cause: Using promise chains instead of async/await with Promise.all
- Improvement path:
  - Consolidate multiple related fetches using Promise.all()
  - Consider server-side data fetching for layout data

---

## Fragile Areas

**Password Reset Page (Entirely Stubbed):**
- Files: `src/app/[locale]/(auth)/forgot-password/page.tsx`
- Why fragile: Feature is non-functional; relies on TODO implementation
- Safe modification: Must complete password reset flow before users encounter it; test with real email service
- Test coverage: No test file exists for this component; add tests for happy path and error cases

**Type Duplication Across Components:**
- Files: Task, Milestone, Project, Message interfaces duplicated in 8+ component files
- Why fragile: Changes to schema require updates in multiple places; easy to miss one
- Safe modification: Move all types to `src/types/index.ts` (already has some types); import from there
- Test coverage: No tests verify type consistency; adding shared types helps prevent drift

**Untyped Fetch Response Data:**
- Files: All pages that fetch data (counselor, student, admin dashboards)
- Why fragile: No runtime validation of API response shape; mismatches between API and UI silent
- Safe modification:
  - Add Zod schemas in `src/lib/validations.ts` for all API responses
  - Parse all fetch responses with `.safeParse()`, handle errors
  - Example: `const result = userSchema.safeParse(data); if (!result.success) setError(...)`

**Error Boundary Coverage Gaps:**
- Files: No error boundaries found in page layouts
- Why fragile: Single component error crashes entire page; no graceful fallback
- Safe modification: Add error boundary wrapping to `src/app/[locale]/layout.tsx` and critical routes
- Test coverage: No tests for error boundaries; add tests simulating component errors

**Mass Assignment Prevention Implemented but Not Comprehensive:**
- Files: `src/app/api/users/[id]/route.ts` checks role but doesn't validate all fields
- Why fragile: Schema-based validation exists (`createUserSchema` in validations.ts) but update endpoint may miss fields
- Safe modification: Use strict field whitelist in PATCH/PUT endpoints; never pass raw request body to Prisma
- Test coverage: Test file exists (`src/app/api/__tests__/mass-assignment.test.ts`) but only covers role/status; expand to all fields

---

## Test Coverage Gaps

**Fetch Error Handling Untested:**
- What's not tested: Network errors, 404s, 500s in page components
- Files:
  - `src/app/[locale]/(student)/student/projects/[projectId]/page.tsx:50-59`
  - `src/app/[locale]/(counselor)/counselor/account/page.tsx:32-33`
  - All dashboard pages without error handlers
- Risk: Users see indefinite loading spinners on network errors
- Priority: **High** - directly impacts user experience

**Password Reset Feature Has No Tests:**
- What's not tested: Entire forgot-password page
- Files: `src/app/[locale]/(auth)/forgot-password/page.tsx`
- Risk: Non-functional code ships to production undetected
- Priority: **High** - feature completely broken

**CSRF Protection Not Tested:**
- What's not tested: Origin validation edge cases (subdomain, port mismatch, missing headers)
- Files: `src/lib/csrf.ts`, no test file exists
- Risk: CSRF bypass if non-browser request assumption is wrong
- Priority: **High** - security feature

**Rate Limiting Edge Cases:**
- What's not tested: Behavior when Redis is unavailable (fallback to in-memory)
- Files: `src/lib/rate-limit.ts:54-64` has fallback logic but not tested in integration
- Risk: Rate limiting disabled silently if Redis fails
- Priority: **Medium** - degrades security but doesn't break functionality

**Link Type Casts Not Tested:**
- What's not tested: Whether `as any` casts for Link href props actually work at runtime
- Files: Multiple Link components with `href={... as any}` assertions
- Risk: Broken navigation links in production
- Priority: **Medium** - appears to work but type hints are wrong

**Server-Side Data Validation:**
- What's not tested: Prisma query result shapes match TypeScript types
- Files: All API routes that return nested data
- Risk: Runtime errors if schema changes
- Priority: **Medium** - data mismatches possible

---

## Known Bugs

**Search Debounce May Not Work as Expected:**
- Symptoms: Search input may trigger multiple API calls within 300ms window
- Files: `src/app/[locale]/(counselor)/counselor/students/page.tsx:32-45`
- Trigger: Rapid typing; timer clearing is dependent on useEffect dependencies
- Workaround: None; debounce works but could be more robust
- Note: This is acceptable debouncing, not a critical bug

**Unhandled Async State Transitions:**
- Symptoms: Loading state set to `false` but error state never managed
- Files: Multiple pages (e.g., `src/app/[locale]/(student)/student/dashboard/page.tsx:30-31`)
- Trigger: Network error during fetch
- Workaround: None; users must reload page
- Fix: Add error state and display error message

---

## Dependencies at Risk

**No Major Dependency Issues Detected:**
- Stack uses modern, well-maintained packages: Next.js 14, React 18, Prisma 5, Clerk 6
- Sentry integration is optional (no forced dependency)
- OpenAI dependency is optional (mocks responses if not configured)
- All dependencies appear actively maintained

---

## Missing Critical Features

**Password Reset Functionality:**
- Problem: Password reset feature is entirely stubbed
- Blocks: Users cannot recover locked-out accounts
- Priority: **Critical** - core authentication feature
- Blocking: Production deployment until implemented

**Error Handling and User Feedback:**
- Problem: No error boundaries, no error messages on fetch failures
- Blocks: Users unaware of network issues or API errors
- Priority: **High** - affects user experience
- Blocking: Should be addressed before scaling to many users

**Email Service Integration:**
- Problem: No email sending service configured (password reset emails, notifications)
- Blocks: Password reset, email verification
- Priority: **High** - multiple features depend on this
- Blocking: Password reset feature cannot be completed without email service

---

## Scaling Limits

**In-Memory Rate Limiting as Fallback:**
- Current capacity: Limited by process memory (in-memory map grows unbounded)
- Limit: If Redis unavailable, rate limiter becomes memory leak risk over time
- Scaling path:
  - Ensure Redis/Upstash is always available in production
  - Implement cleanup/expiration in in-memory fallback
  - Add monitoring for in-memory fallback usage

**API Response Size Not Paginated:**
- Current capacity: User list endpoint returns all users in response
- Limit: At 1000+ users, response becomes slow; browser may struggle parsing large JSON
- Scaling path:
  - Cursor-based pagination already implemented (lines 19-21, 39-42)
  - Default limit is 10; verify frontend always respects pagination
  - Test with 10,000+ users

---

*Concerns audit: 2026-02-27*
