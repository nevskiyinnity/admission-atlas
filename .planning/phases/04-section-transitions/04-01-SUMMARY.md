---
phase: 04-section-transitions
plan: 01
subsystem: ui
tags: [css, animations, gradients, dark-section, reduced-motion]

# Dependency graph
requires:
  - phase: 03-css-visual-polish
    provides: gradient mesh breathing animations, SVG accents, FAQ accordion
provides:
  - Gradient bleed pseudo-elements between all adjacent sections
  - Dark section atmospheric upgrade with grain overlay and animated glows
  - hm-dark-glow keyframe animation
  - Reduced-motion overrides for dark section glows
affects: [05-gsap-scroll, 06-micro-interactions]

# Tech tracking
tech-stack:
  added: []
  patterns: [gradient-bleed-pseudo-elements, desynchronized-glow-animations, denser-grain-overlay]

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/landing-home.css
    - src/app/[locale]/(landing)/page.tsx
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "Gradient bleeds use ::before on .h-sect and .h-callout with warm rgba(248,246,241,0.5) tone"
  - "Dark section atmospheric entry uses 120% width centered gradient for wide darkening effect"
  - "Glow elements use 18s/22s desynchronized durations (consistent with Phase 3 pattern)"
  - "Dark grain uses higher baseFrequency (0.75 vs 0.65) and smaller tile size (256px vs 512px) for visibly denser texture"

patterns-established:
  - "Gradient bleed pattern: ::before pseudo-elements spanning inter-section gaps with pointer-events:none"
  - "Atmospheric z-index layering: z-index 0 for bleeds, 1 for grain/glows, 2 for content"

requirements-completed: [VISUAL-02, VISUAL-05]

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 4 Plan 1: Section Transitions Summary

**Gradient bleed pseudo-elements between all sections plus dark outcomes atmosphere with animated glows and denser grain overlay**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-27T07:58:35Z
- **Completed:** 2026-02-27T08:01:22Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Adjacent sections now flow into each other with soft radial gradient bleeds in the 140px gaps -- no hard color boundaries
- Dark outcomes section has a deliberate atmospheric shift with darkening gradient above the card and enveloping background gradient around it
- Two animated glow elements create subtle ambient movement inside the dark card at 18s/22s desynchronized cycles
- Dark section grain overlay is visibly denser than global page grain (baseFrequency 0.75, opacity 0.35)
- All new animations respect prefers-reduced-motion with explicit overrides

## Task Commits

Each task was committed atomically:

1. **Task 1: Add gradient bleed pseudo-elements between all adjacent sections** - `dbb96ab` (feat)
2. **Task 2: Add dark section atmospheric upgrade -- grain overlay, animated glows, reduced-motion** - `50129a6` (feat)

## Files Created/Modified
- `src/app/[locale]/(landing)/landing-home.css` - Gradient bleed ::before pseudo-elements, dark section atmosphere styles, grain overlay, glow animations, hm-dark-glow keyframe
- `src/app/[locale]/(landing)/page.tsx` - Added h-dark-grain, h-dark-glow--1, h-dark-glow--2 decorative elements inside dark section
- `src/app/[locale]/(landing)/landing-animations.css` - Reduced-motion override for dark section glow animations

## Decisions Made
- Gradient bleeds use warm tone rgba(248,246,241,0.5) matching the page background palette
- Dark section atmospheric entry gradient uses 120% width to create wide immersive effect beyond card edges
- Glow elements at 18s and 22s continue the desynchronized duration pattern from Phase 3
- Dark grain uses smaller tile size (256px) and higher frequency for denser, more tactile texture

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Section transitions complete; page reads as continuous visual journey
- Ready for Phase 5 (GSAP scroll animations) which will animate section reveals
- z-index layering (0/1/2) established for atmospheric effects vs content

## Self-Check: PASSED

- All 3 modified files exist on disk
- Commit dbb96ab (Task 1) found in git log
- Commit 50129a6 (Task 2) found in git log
- SUMMARY.md created at expected path

---
*Phase: 04-section-transitions*
*Completed: 2026-02-27*
