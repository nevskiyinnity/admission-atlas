---
phase: 08-micro-interactions
plan: 01
subsystem: ui
tags: [gsap, micro-interactions, magnetic-button, tilt-card, 3d-rotation, pointer-tracking]

# Dependency graph
requires:
  - phase: 01-motion-foundation
    provides: "GSAP + ScrollTrigger + useGSAP + gsap-registration singleton"
  - phase: 06-scroll-triggered-reveals
    provides: "AnimatedSection with querySelectorAll('.h-bento-card') for entrance reveals"
provides:
  - "MagneticButton component with gsap.quickTo() pointer tracking for CTAs"
  - "TiltCard component with 3D rotationX/Y and CSS custom property light sheen for bento cards"
  - "CSS ::before light sheen pseudo-element on h-bento-card"
affects: [09-performance-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns: ["gsap.quickTo() for lerped pointer tracking", "gsap.matchMedia('(hover: hover)') for touch device gating", "transformPerspective for single-element 3D rotation", "CSS custom properties (--sheen-x/y) set from JS for radial gradient positioning"]

key-files:
  created:
    - src/app/[locale]/(landing)/_components/magnetic-button.tsx
    - src/app/[locale]/(landing)/_components/tilt-card.tsx
  modified:
    - src/app/[locale]/(landing)/page.tsx
    - src/app/[locale]/(landing)/landing-home.css

key-decisions:
  - "(hover: hover) media query for touch gating instead of prefers-reduced-motion -- magnetic/tilt are pointer-dependent, not motion-dependent"
  - "h-bento-wide class moved to TiltCard wrapper div for correct CSS grid participation"
  - "CSS transform removed from h-btn-primary:hover and h-bento-card:hover -- GSAP owns transform on interactive elements"
  - "transformPerspective: 800 on card element (not CSS perspective on wrapper) to avoid conflicting with AnimatedSection entrance transforms"

patterns-established:
  - "gsap.quickTo() for smooth lerped value tracking: quickTo returns a callable that uses internal GSAP tween for buttery interpolation"
  - "(hover: hover) matchMedia gating: separates pointer interactions from motion preferences, so reduced-motion desktop users still get magnetic/tilt"

requirements-completed: [MICRO-01, MICRO-02]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 8 Plan 01: Magnetic Buttons & Tilt Cards Summary

**Cursor-driven magnetic pull on 3 CTAs via gsap.quickTo() and 3D tilt with gold light sheen on 6 bento cards, both gated behind (hover: hover) for touch safety**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T11:24:28Z
- **Completed:** 2026-02-27T11:27:10Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- MagneticButton component: gsap.quickTo() lerped tracking within 50px radius at 40% strength, smooth eased return on mouseleave
- TiltCard component: 3D rotationX/Y (max 4 degrees) with GSAP transformPerspective, CSS custom properties for light sheen positioning
- Both effects completely disabled on touch devices via (hover: hover) gsap.matchMedia() gating
- CSS transform ownership transferred from CSS :hover rules to GSAP -- no CSS-vs-GSAP transform conflicts
- Gold-tinted radial gradient light sheen (::before pseudo-element) on bento cards follows cursor position

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MagneticButton and TiltCard Client Component islands** - `c4a5e3f` (feat)
2. **Task 2: Wire components into page.tsx and update CSS for hover compatibility** - `d3c383f` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/magnetic-button.tsx` - MagneticButton with gsap.quickTo() pointer tracking, (hover: hover) gated
- `src/app/[locale]/(landing)/_components/tilt-card.tsx` - TiltCard with rotationX/Y, transformPerspective, and CSS custom property sheen, (hover: hover) gated
- `src/app/[locale]/(landing)/page.tsx` - 3 CTAs wrapped in MagneticButton, 6 bento cards wrapped in TiltCard
- `src/app/[locale]/(landing)/landing-home.css` - Light sheen ::before added, CSS transform removed from h-btn-primary:hover and h-bento-card:hover, transform transitions removed from base rules

## Decisions Made
- **(hover: hover) for touch gating:** Magnetic and tilt effects are pointer-dependent, not motion-dependent. A reduced-motion desktop user with a mouse should still get magnetic pull and tilt. prefers-reduced-motion gates CSS animations; (hover: hover) gates pointer interactions.
- **h-bento-wide moved to TiltCard wrapper:** CSS grid requires grid-column: span 2 on the direct grid child. Since TiltCard wraps the article, the h-bento-wide class must be on the TiltCard div, not the nested article.
- **GSAP owns all transforms on interactive elements:** Removed CSS transform: translateY(-2px) from h-btn-primary:hover and transform: translateY(-4px) from h-bento-card:hover. GSAP quickTo/to handles x/y/rotation. CSS handles background and box-shadow only. This prevents transform string conflicts.
- **transformPerspective (not CSS perspective):** GSAP's transformPerspective injects perspective() into the element's own transform string, avoiding a parent wrapper with CSS perspective that would conflict with AnimatedSection's entrance animations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved h-bento-wide class to TiltCard wrapper for CSS grid layout**
- **Found during:** Task 2 (wiring TiltCard into page.tsx)
- **Issue:** Plan specified TiltCard wraps articles without className, but h-bento-wide uses grid-column: span 2 which must be on the direct grid child. Wrapping articles in TiltCard divs breaks grid layout.
- **Fix:** Passed className="h-bento-wide" to the 2 wide TiltCard instances, removed h-bento-wide from their nested articles
- **Files modified:** src/app/[locale]/(landing)/page.tsx
- **Verification:** Build succeeds, grid layout preserved
- **Committed in:** d3c383f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for correct grid layout. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 Plan 01 complete: magnetic buttons and tilt cards are the final interactive polish layer
- Ready for Phase 9 (Performance Hardening) -- all visual/interaction work is done
- All existing animations (entrance, scroll reveals, parallax) continue working alongside new micro-interactions

## Self-Check: PASSED

- [x] magnetic-button.tsx exists
- [x] tilt-card.tsx exists
- [x] 08-01-SUMMARY.md exists
- [x] Commit c4a5e3f (Task 1) found
- [x] Commit d3c383f (Task 2) found

---
*Phase: 08-micro-interactions*
*Completed: 2026-02-27*
