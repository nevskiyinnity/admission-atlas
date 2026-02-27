---
phase: 09-performance-quality-hardening
plan: 01
subsystem: ui
tags: [css, gsap, animation, performance, compositor]

# Dependency graph
requires:
  - phase: 05-hero-entrance
    provides: GSAP hero entrance choreography that replaces CSS hm-fadeUp
  - phase: 06-scroll-triggered-reveals
    provides: AnimatedSection scroll-reveal system for all sections
  - phase: 08-micro-interactions
    provides: MagneticButton and TiltCard client components
provides:
  - Zero CSS/GSAP animation conflicts (5 redundant declarations removed)
  - Compositor property audit with documented exceptions
  - Verified useGSAP cleanup coverage across all 6 client components
  - Verified reduced-motion completeness (13 animation categories covered)
affects: [09-02-lighthouse-restraint]

# Tech tracking
tech-stack:
  added: []
  patterns: [compositor-exceptions-documented-in-css-comments]

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/landing-home.css
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "Remove @keyframes hm-fadeUp entirely -- zero selectors reference it after cleanup"
  - "Two compositor exceptions accepted and documented: background-position (breathing meshes) and grid-template-rows (FAQ accordion)"
  - "All 6 client components confirmed clean for useGSAP/useEffect auto-cleanup"

patterns-established:
  - "Compositor exception documentation: CSS comment block in landing-animations.css documents accepted non-compositor properties with justification"

requirements-completed: [PERF-02, PERF-03]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 9 Plan 1: CSS/GSAP Redundancy Cleanup Summary

**Removed 5 redundant CSS hm-fadeUp animations shadowing GSAP, audited all animated properties for compositor-friendliness, verified useGSAP cleanup across 6 components**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T11:45:32Z
- **Completed:** 2026-02-27T11:47:49Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Removed 5 CSS `animation: hm-fadeUp` declarations + `animation-delay` lines from `.h-badge`, `h1`, `.h-hero-desc`, `.h-hero-actions`, `.h-metrics` that were firing redundantly before GSAP entrance choreography
- Removed the `@keyframes hm-fadeUp` definition itself (zero remaining references)
- Audited all 7 remaining CSS @keyframes and all GSAP .from()/.to()/.set()/.fromTo() calls -- all compositor-friendly
- Documented 2 accepted non-compositor exceptions with clear justification
- Verified all 6 client components use proper useGSAP/useEffect cleanup
- Verified reduced-motion block covers all 13 animation categories with zero gaps

## Task Commits

Each task was committed atomically:

1. **Task A: Remove redundant CSS hm-fadeUp animations** - `081a8d9` (fix)
2. **Task B: Audit animated properties and verify cleanup coverage** - `cb0d68f` (chore)

## Files Created/Modified
- `src/app/[locale]/(landing)/landing-home.css` - Removed 5 animation/animation-delay declarations and @keyframes hm-fadeUp definition (15 lines deleted)
- `src/app/[locale]/(landing)/landing-animations.css` - Added compositor property exceptions documentation comment (8 lines added)

## Decisions Made
- **Remove @keyframes hm-fadeUp entirely:** After removing all 5 selector references, zero other selectors use this keyframe, so the definition itself was removed rather than left as dead code
- **Two compositor exceptions accepted:** `background-position` on breathing gradient meshes (paint-only, 15-25s cycles on pseudo-elements) and `grid-template-rows` on FAQ accordion (user-click only, standard CSS height animation pattern)
- **All 6 components confirmed clean:** useGSAP with scope-based auto-cleanup on hero-entrance, animated-section, scroll-progress-bar, magnetic-button, tilt-card; useEffect with explicit lenis.destroy() + ticker.remove() on smooth-scroll-provider

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSS/GSAP redundancy eliminated, ready for Lighthouse audit in 09-02
- All animations verified compositor-friendly with documented exceptions
- Clean baseline for performance measurement

## Self-Check: PASSED

- 09-01-SUMMARY.md: FOUND
- Commit 081a8d9 (Task A): FOUND
- Commit cb0d68f (Task B): FOUND

---
*Phase: 09-performance-quality-hardening*
*Completed: 2026-02-27*
