---
phase: 03-css-visual-polish
plan: 02
subsystem: ui
tags: [css-animations, accordion, grid-template-rows, hover-transitions, accessibility]

# Dependency graph
requires:
  - phase: 03-css-visual-polish
    provides: "Gradient mesh backgrounds and SVG accents from Plan 01"
  - phase: 01-motion-foundation
    provides: "Animation initial states and var(--hm-ease) easing token"
provides:
  - "Smooth FAQ accordion with grid-template-rows 0fr/1fr animation (both open and close)"
  - "Standardized hover transitions across all interactive elements with tiered durations"
  - "Reduced-motion override for FAQ accordion transition"
  - "Accessibility: aria-controls/id linking on FAQ items"
affects: [05-scroll-animations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sibling pattern for animated details accordion: details+div with grid-template-rows"
    - ":has() pseudo-class for parent state based on child details[open]"
    - "Three-tier hover transition system: 160ms (small), 200ms (buttons), 300ms (cards)"

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/page.tsx
    - src/app/[locale]/(landing)/landing-home.css
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "Sibling pattern (details + adjacent div) chosen for FAQ to enable smooth close animation -- browser hides content inside details instantly on close, sibling div avoids this"
  - ":has(.h-faq-toggle[open]) used for parent wrapper styling -- Baseline 2023 support"
  - "Three-tier duration system (160/200/300ms) standardized across all hover transitions"

patterns-established:
  - "FAQ sibling pattern: details.h-faq-toggle > summary, div.h-faq-body > div.h-faq-body-inner for animated accordion"
  - "All hover transitions must include var(--hm-ease) easing -- no raw durations"

requirements-completed: [MICRO-03, MICRO-04]

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 3 Plan 2: FAQ Accordion Animation & Hover Transition Standardization Summary

**Smooth CSS grid-template-rows FAQ accordion with bidirectional animation plus all hover transitions standardized to three-tier easing system (160/200/300ms)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-27T07:38:47Z
- **Completed:** 2026-02-27T07:42:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- FAQ accordion now animates smoothly on both open AND close using grid-template-rows 0fr/1fr transition with sibling pattern
- All hover transitions across the landing page use var(--hm-ease) easing with consistent tiered durations
- FAQ maintains full keyboard accessibility (Tab + Enter/Space to toggle) and screen reader support via aria-controls/id
- Reduced-motion users see instant FAQ toggle (no transition animation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite FAQ accordion with smooth CSS grid-template-rows animation** - `e450eb2` (feat)
2. **Task 2: Standardize hover transitions across all interactive elements** - `15b8c27` (feat)

## Files Created/Modified
- `src/app/[locale]/(landing)/page.tsx` - FAQ restructured from details>p to details+div sibling pattern with aria-controls/id linking
- `src/app/[locale]/(landing)/landing-home.css` - Grid-template-rows accordion animation, :has() parent styling, all hover transitions standardized with var(--hm-ease)
- `src/app/[locale]/(landing)/landing-animations.css` - Reduced-motion override for FAQ accordion transition

## Decisions Made
- Used sibling pattern (details + adjacent div) instead of content-visibility or JS-based accordion -- enables smooth close animation that native details element prevents
- :has(.h-faq-toggle[open]) for wrapper border state -- Baseline 2023 with Chrome 105+, Safari 15.4+, Firefox 121+ support
- Standardized bento cards from 400ms to 300ms and plan cards from 350ms to 300ms to unify the card tier
- Fixed timeline dot and outcome card transitions that had background property missing easing (auto-fix, deviation Rule 1)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed timeline dot and outcome card missing easing on background property**
- **Found during:** Task 2 (hover transition audit)
- **Issue:** `.h-tl-dot` and `.h-outcome` had `transition: background 300ms, transform 300ms var(--hm-ease)` -- background property lacked easing function
- **Fix:** Added `var(--hm-ease)` to background transition property on both selectors
- **Files modified:** `src/app/[locale]/(landing)/landing-home.css`
- **Committed in:** `15b8c27` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed FAQ item border-color transition missing easing**
- **Found during:** Task 2 (hover transition audit)
- **Issue:** `.h-faq-item` had `border-color 300ms` without easing in its transition shorthand
- **Fix:** Added `var(--hm-ease)` to border-color transition
- **Files modified:** `src/app/[locale]/(landing)/landing-home.css`
- **Committed in:** `15b8c27` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs -- missing easing on existing transitions)
**Impact on plan:** Both auto-fixes improve consistency. The plan's audit found these existing inconsistencies; fixing them was part of the standardization goal.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 (CSS Visual Polish) complete -- all ambient gradients, SVG accents, FAQ animation, and hover transitions shipped
- All new CSS animations and transitions are compatible with GSAP ScrollTrigger integration in Phase 5
- Reduced-motion handling covers all new animations

---
*Phase: 03-css-visual-polish*
*Completed: 2026-02-27*
