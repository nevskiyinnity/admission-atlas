---
phase: 06-scroll-triggered-reveals
plan: 02
subsystem: ui
tags: [gsap, scrolltrigger, scroll-progress, animation, css]

# Dependency graph
requires:
  - phase: 06-01
    provides: "ScrollTrigger infrastructure with gsap-registration singleton and Lenis-synced scroll"
  - phase: 01-01
    provides: "SmoothScrollProvider with Lenis + ScrollTrigger.update sync"
provides:
  - "ScrollProgressBar client component with scrub-based scroll tracking"
  - "Gold scroll-progress indicator bar at viewport top (z-index 101)"
  - "Reduced-motion override hiding progress bar entirely"
affects: [09-performance-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns: ["gsap.matchMedia() for reduced-motion gating", "gsap.fromTo() with scaleX for compositor-friendly scroll indicator"]

key-files:
  created:
    - src/app/[locale]/(landing)/_components/scroll-progress-bar.tsx
  modified:
    - src/app/[locale]/(landing)/page.tsx
    - src/app/[locale]/(landing)/landing-home.css
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "scaleX transform for scroll indicator -- compositor-friendly, no layout thrash"
  - "z-index 101 above nav (100) -- 3px bar at top:0 does not interfere with floating nav at top:20px"

patterns-established:
  - "Standalone fixed-overlay component pattern: placed inside SmoothScrollProvider but outside main"

requirements-completed: [SCROLL-04]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 6 Plan 02: Scroll Progress Bar Summary

**Gold scroll-progress indicator bar using GSAP ScrollTrigger scrub with scaleX transform and reduced-motion gating**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T09:03:59Z
- **Completed:** 2026-02-27T09:06:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created standalone ScrollProgressBar client component with useGSAP automatic cleanup
- Integrated scrub-based scroll tracking (scrub: 0.3) for smooth catch-up behavior
- Added reduced-motion support at both GSAP (matchMedia) and CSS (display:none) layers
- Placed component inside SmoothScrollProvider for Lenis-synced scroll position

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScrollProgressBar Client Component** - `628057f` (feat)
2. **Task 2: Add ScrollProgressBar to page.tsx and CSS styles** - `3f2ec2e` (feat)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/scroll-progress-bar.tsx` - Standalone client component with GSAP ScrollTrigger scrub tracking
- `src/app/[locale]/(landing)/page.tsx` - ScrollProgressBar import and placement inside SmoothScrollProvider
- `src/app/[locale]/(landing)/landing-home.css` - Fixed position bar styles (3px, gold, z-index:101, pointer-events:none)
- `src/app/[locale]/(landing)/landing-animations.css` - Reduced-motion override (display:none)

## Decisions Made
- scaleX transform chosen over width animation -- compositor-friendly, no layout thrash during scroll
- z-index 101 places bar above nav (z-index 100) without visual interference (nav floats at top:20px, bar is 3px at top:0)
- Component placed inside SmoothScrollProvider but outside main -- receives Lenis-synced scroll but is not page content
- Dual reduced-motion approach: matchMedia prevents ScrollTrigger creation, CSS display:none removes from render tree

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 complete -- all scroll-triggered reveal animations in place
- Ready for Phase 7 (Parallax) or Phase 8 (Micro-interactions)
- ScrollProgressBar cleanup handled by useGSAP, no memory leak concerns

## Self-Check: PASSED

All 4 files verified present. Both task commits (628057f, 3f2ec2e) confirmed in git log. Build passes with zero errors.

---
*Phase: 06-scroll-triggered-reveals*
*Completed: 2026-02-27*
