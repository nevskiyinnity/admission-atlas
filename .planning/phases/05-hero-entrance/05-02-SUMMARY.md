---
phase: 05-hero-entrance
plan: 02
subsystem: ui
tags: [gsap, splittext, scrolltrigger, clip-path, scroll-reveal, reduced-motion]

# Dependency graph
requires:
  - phase: 05-hero-entrance/01
    provides: "HeroEntrance component with SplitText clip-path reveal for h1; gsap-registration singleton exporting gsap, ScrollTrigger, SplitText"
  - phase: 01-motion-foundation/02
    provides: "AnimatedSection identity wrapper with containerRef; landing-animations.css initial states"
provides:
  - "Scroll-triggered SplitText word-by-word heading reveals on all h2 elements inside AnimatedSection"
  - "Defensive clip-path reduced-motion override for SplitText word wrappers"
affects: [06-scroll-reveals, 07-parallax, 09-performance-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns: [useGSAP-matchMedia-SplitText-ScrollTrigger pattern for scroll-triggered text reveals]

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/_components/animated-section.tsx
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "0.04s stagger (vs hero 0.05s) for snappier section heading reveals"
  - "Defensive clip-path:none override for SplitText wrappers in reduced-motion block"

patterns-established:
  - "useGSAP + matchMedia + SplitText + ScrollTrigger: reusable pattern for scroll-triggered text reveals"
  - "Defensive CSS overrides for GSAP-generated DOM wrappers in reduced-motion block"

requirements-completed: [TYPE-03]

# Metrics
duration: 1min
completed: 2026-02-27
---

# Phase 5 Plan 2: Heading Reveals Summary

**Scroll-triggered SplitText word-by-word clip-path reveals on all section h2 headings via AnimatedSection + useGSAP**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-27T08:30:27Z
- **Completed:** 2026-02-27T08:31:37Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- All 7 section h2 headings now reveal word-by-word on scroll entry with clip-path animation
- gsap.matchMedia() gates all animation behind prefers-reduced-motion: no-preference
- Defensive CSS override ensures SplitText word wrappers are visible for reduced-motion users
- useGSAP context auto-reverts SplitText instances and kills ScrollTriggers on unmount

## Task Commits

Each task was committed atomically:

1. **Task 1: Add scroll-triggered SplitText heading reveals to AnimatedSection** - `06c6dc5` (feat)
2. **Task 2: Verify and update CSS reduced-motion coverage** - `5de7df1` (fix)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/animated-section.tsx` - Added useGSAP hook with SplitText word-by-word clip-path reveal on all h2 elements, gated by matchMedia
- `src/app/[locale]/(landing)/landing-animations.css` - Added defensive clip-path:none override for SplitText word wrappers in reduced-motion block

## Decisions Made
- 0.04s stagger for section headings (vs 0.05s for hero h1) -- section headings are shorter and should feel snappier
- Defensive clip-path:none CSS override added even though matchMedia prevents SplitText from running for reduced-motion users -- safety net for edge cases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All section headings now have scroll-triggered reveals, completing the text animation language across the page
- Hero h1 reveals on load (Plan 05-01), section h2s reveal on scroll (Plan 05-02) -- consistent clip-path technique throughout
- Ready for Phase 6 (Scroll Reveals) which will add scroll-triggered animations to section content beyond headings

## Self-Check: PASSED

- All files exist (animated-section.tsx, landing-animations.css, 05-02-SUMMARY.md)
- All commits found (06c6dc5, 5de7df1)
- Content checks pass (SplitText.create, clip-path override)
- Build passes with zero errors

---
*Phase: 05-hero-entrance*
*Completed: 2026-02-27*
