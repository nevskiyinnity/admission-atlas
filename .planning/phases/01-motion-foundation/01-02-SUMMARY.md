---
phase: 01-motion-foundation
plan: 02
subsystem: ui
tags: [css-initial-states, prefers-reduced-motion, noscript, client-component-islands, animated-section, smooth-scroll-provider, accessibility]

# Dependency graph
requires:
  - phase: 01-01
    provides: AnimatedSection, SmoothScrollProvider, landing-animations.css placeholder, gsap-registration singleton
provides:
  - CSS initial states hiding all 9 animated sections (opacity:0, translateY:24px)
  - prefers-reduced-motion overrides restoring full visibility
  - noscript fallback for no-JS users
  - All 9 landing page sections wrapped in AnimatedSection Client Component islands
  - SmoothScrollProvider wrapping page content for smooth scroll
  - page.tsx remains Server Component with Client Component island architecture
affects: [02-typography, 03-css-polish, 05-hero, 06-scroll-reveals]

# Tech tracking
tech-stack:
  added: []
  patterns: [css-initial-states-for-gsap, option-b-wrapping-strategy, noscript-fallback-pattern]

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/landing-animations.css
    - src/app/[locale]/(landing)/layout.tsx
    - src/app/[locale]/(landing)/page.tsx

key-decisions:
  - "Option B wrapping strategy: AnimatedSection wraps sections without moving class names"
  - "translateY(24px) contract established between CSS initial states and future GSAP from({y:24})"

patterns-established:
  - "CSS initial states: opacity:0 + translateY(24px) for sections awaiting GSAP reveal, matching GSAP from() values"
  - "Option B wrapping: AnimatedSection wraps existing elements without moving classes or attributes"
  - "Accessibility contract: prefers-reduced-motion always shows full content via !important overrides"
  - "No-JS fallback: noscript style block in layout.tsx resets opacity and transform"

requirements-completed: [FOUND-03, FOUND-04, FOUND-05]

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 1 Plan 2: CSS Initial States and Client Component Island Wrappers Summary

**CSS initial states hiding 9 animated sections with opacity:0/translateY(24px), prefers-reduced-motion overrides, noscript fallback, and AnimatedSection + SmoothScrollProvider island wrappers on page.tsx**

## Performance

- **Duration:** 4 min (across two agent sessions with checkpoint verification)
- **Started:** 2026-02-27T06:42:00Z
- **Completed:** 2026-02-27T06:54:41Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Populated landing-animations.css with CSS initial states for all 7 animation selectors (hero children, hero orbs, metrics, h-sect, h-dark-sect, h-callout, h-final)
- Added prefers-reduced-motion media query resetting all initial states to visible with !important overrides
- Added noscript style block in layout.tsx ensuring no-JS users see full content
- Wrapped all 9 landing page sections in AnimatedSection Client Component islands using Option B strategy
- Wrapped page content in SmoothScrollProvider for Lenis smooth scroll integration
- page.tsx remains a Server Component (no 'use client' directive) with Client Component islands pattern
- User verified visual parity with reduced-motion enabled and smooth scroll on desktop
- Build passes cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Populate landing-animations.css with initial states and reduced-motion overrides** - `fe62c14` (feat)
2. **Task 2: Wrap page.tsx sections in Client Component islands** - `d64f2c1` (feat)
3. **Task 3: Verify visual parity and smooth scroll** - checkpoint approved (no commit, verification-only task)

## Files Created/Modified
- `src/app/[locale]/(landing)/landing-animations.css` - CSS initial states (opacity:0, translateY:24px) for all animated sections, prefers-reduced-motion overrides
- `src/app/[locale]/(landing)/layout.tsx` - Added noscript fallback style block resetting opacity/transform for no-JS users
- `src/app/[locale]/(landing)/page.tsx` - All 9 sections wrapped in AnimatedSection, content wrapped in SmoothScrollProvider, remains Server Component

## Decisions Made
- Used Option B wrapping strategy (AnimatedSection wraps existing section elements without moving classes/attributes) for safety and simplicity
- Established translateY(24px) as the contract value between CSS initial states and future GSAP from({y:24}) animations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing Next.js error ("Client Functions cannot be passed directly to Server Functions") related to Clerk router internals -- NOT caused by Phase 1 changes, ignored per user confirmation

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete Phase 1 animation infrastructure is in place: GSAP + Lenis installed, plugin singleton, smooth scroll provider, Client Component islands, CSS initial states, accessibility overrides
- All 9 animated sections are hidden (opacity:0) awaiting GSAP reveal animations in Phase 5-6
- Users with prefers-reduced-motion see full content immediately
- Users without JavaScript see full content via noscript fallback
- Ready for Phase 2 (typography) and Phase 3 (CSS polish) which build on this foundation

## Self-Check: PASSED

All modified files verified on disk. Both task commits (fe62c14, d64f2c1) verified in git log. Build passes cleanly.

---
*Phase: 01-motion-foundation*
*Completed: 2026-02-27*
