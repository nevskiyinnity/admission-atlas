---
phase: 01-motion-foundation
plan: 01
subsystem: ui
tags: [gsap, lenis, scroll-trigger, split-text, react, next.js, client-components, smooth-scroll]

# Dependency graph
requires:
  - phase: none
    provides: first plan, no prior dependencies
provides:
  - GSAP plugin registration singleton (gsap-registration.ts)
  - Lenis SmoothScrollProvider with GSAP ticker sync
  - AnimatedSection thin Client Component wrapper
  - landing-animations.css placeholder for animation initial states
affects: [01-02, 02-typography, 03-css-polish, 05-hero, 06-scroll-reveals]

# Tech tracking
tech-stack:
  added: [gsap@3.14.2, "@gsap/react@2.1.2", lenis@1.3.17]
  patterns: [module-level-plugin-registration, client-component-islands, lenis-gsap-ticker-sync]

key-files:
  created:
    - src/app/[locale]/(landing)/_components/gsap-registration.ts
    - src/app/[locale]/(landing)/_components/smooth-scroll-provider.tsx
    - src/app/[locale]/(landing)/_components/animated-section.tsx
    - src/app/[locale]/(landing)/landing-animations.css
  modified:
    - package.json
    - package-lock.json
    - src/app/[locale]/(landing)/layout.tsx

key-decisions:
  - "Manual new Lenis() over ReactLenis for direct ticker sync control"
  - "Module-level GSAP registration singleton via ES module semantics"
  - "SplitText registered upfront (Phase 5 usage) to avoid future changes to singleton"
  - "Desktop-only smooth scroll gated on pointer:coarse AND prefers-reduced-motion"

patterns-established:
  - "GSAP registration singleton: all islands import from gsap-registration.ts, never from 'gsap' directly"
  - "Client Component islands: 'use client' wrapper components accept children as React.ReactNode"
  - "Lenis ticker sync: lenis.on('scroll', ScrollTrigger.update) + gsap.ticker.add for single RAF loop"
  - "CSS import order: landing-animations.css after landing-home.css for cascade precedence"

requirements-completed: [FOUND-01, FOUND-02, FOUND-06]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 1 Plan 1: Motion Foundation Infrastructure Summary

**GSAP 3.14 + Lenis 1.3.17 animation stack with plugin registration singleton, SmoothScrollProvider with ticker sync, and AnimatedSection Client Component wrapper**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T06:27:19Z
- **Completed:** 2026-02-27T06:29:40Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed gsap@3.14.2, @gsap/react@2.1.2, and lenis@1.3.17 with verified package versions
- Created GSAP plugin registration singleton that registers ScrollTrigger, SplitText, and useGSAP once at module scope
- Created SmoothScrollProvider with Lenis smooth scroll gated to desktop-only, synced with GSAP ticker for accurate ScrollTrigger positioning
- Created AnimatedSection thin Client Component wrapper ready for future useGSAP() animation hooks
- Added landing-animations.css placeholder and wired it into layout.tsx with correct import cascade order
- Build passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install GSAP + Lenis packages and create GSAP registration singleton** - `76be98f` (feat)
2. **Task 2: Create SmoothScrollProvider, AnimatedSection, and wire CSS import in layout** - `9dd59eb` (feat)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/gsap-registration.ts` - Module-level GSAP plugin registration singleton, re-exports gsap, ScrollTrigger, SplitText
- `src/app/[locale]/(landing)/_components/smooth-scroll-provider.tsx` - Lenis smooth scroll provider with GSAP ticker sync, desktop-only, reduced-motion aware
- `src/app/[locale]/(landing)/_components/animated-section.tsx` - Thin Client Component wrapper with containerRef, identity wrapper for Phase 1
- `src/app/[locale]/(landing)/landing-animations.css` - Placeholder for animation initial states (populated in Plan 01-02)
- `package.json` - Added gsap, @gsap/react, lenis dependencies
- `package-lock.json` - Lock file updated with new dependencies
- `src/app/[locale]/(landing)/layout.tsx` - Added landing-animations.css import after landing-home.css

## Decisions Made
- Used manual `new Lenis()` approach over ReactLenis component for direct control over ticker synchronization and simpler gating logic
- Registered SplitText in Phase 1 singleton even though it is used in Phase 5, to avoid future modifications to the registration file
- Set Lenis lerp to 0.1 (default) as starting point -- can be tuned by feel in later phases
- Gated smooth scroll on both `(pointer: coarse)` AND `(prefers-reduced-motion: reduce)` for comprehensive desktop-only behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- GSAP + Lenis infrastructure fully installed and verified via build
- gsap-registration.ts singleton ready for import by all future Client Component islands
- SmoothScrollProvider ready to wrap page content (will be integrated in Plan 01-02 when page.tsx sections are wrapped)
- AnimatedSection wrapper ready for useGSAP() hooks in later phases
- landing-animations.css placeholder ready for CSS initial states in Plan 01-02

## Self-Check: PASSED

All created files verified on disk. Both task commits (76be98f, 9dd59eb) verified in git log.

---
*Phase: 01-motion-foundation*
*Completed: 2026-02-27*
