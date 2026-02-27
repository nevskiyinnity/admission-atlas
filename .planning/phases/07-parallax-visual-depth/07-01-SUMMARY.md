---
phase: 07-parallax-visual-depth
plan: 01
subsystem: ui
tags: [gsap, scrolltrigger, parallax, animation, scrub]

# Dependency graph
requires:
  - phase: 05-hero-entrance
    provides: HeroEntrance component with useGSAP + matchMedia structure
  - phase: 06-scroll-triggered-reveals
    provides: AnimatedSection component with ScrollTrigger-based reveal timelines
provides:
  - Scroll-linked parallax drift on hero orbs (differential depth separation)
  - Scroll-linked parallax drift on SVG geometry accents (services, process, pricing, FAQ)
  - Scroll-linked parallax drift on dark section atmospheric glows
  - Scroll-linked parallax drift on final CTA glow
affects: [08-micro-interactions, 09-performance-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns: [compound matchMedia gating, scrub-based scroll-linked animation, differential displacement for depth layers]

key-files:
  created: []
  modified:
    - src/app/[locale]/(landing)/_components/hero-entrance.tsx
    - src/app/[locale]/(landing)/_components/animated-section.tsx

key-decisions:
  - "Separate matchMedia block for parallax vs entrance/reveal -- different media conditions (parallax adds min-width:769px)"
  - "gsap.to() on y property only -- orthogonal to entrance gsap.from() on scale/opacity, zero conflict"
  - "scrub:0.5 for smooth catch-up -- matches scroll progress bar pattern from Phase 6"
  - "Hero uses start:'top top'/end:'bottom top' (above fold); sections use start:'top bottom'/end:'bottom top' (full traversal)"
  - "Alternating accent displacement (-25px/-18px) prevents mechanical lockstep movement"

patterns-established:
  - "Compound matchMedia: '(prefers-reduced-motion: no-preference) and (min-width: 769px)' for desktop-only visual enhancements"
  - "Additive parallax pattern: new mm.add() sibling block inside existing useGSAP, targets decorative elements only"
  - "Differential displacement: different y values per layer create foreground/background depth perception"

requirements-completed: [VISUAL-03]

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 7 Plan 01: Parallax Visual Depth Summary

**Scroll-linked parallax drift on hero orbs, SVG accents, and atmospheric glows with differential displacement for spatial depth perception**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T11:01:28Z
- **Completed:** 2026-02-27T11:06:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Hero orbs drift at differential scroll speeds (-50px gold, -80px teal), creating foreground/background depth separation
- SVG geometry accents in 4 sections receive alternating parallax (-25px/-18px) for subtle variation
- Dark section glows and final CTA glow drift with conservative displacement that respects overflow:hidden bounds
- All parallax gated behind compound matchMedia (reduced-motion + desktop) -- invisible to accessibility and mobile users

## Task Commits

Each task was committed atomically:

1. **Task 1: Add parallax scroll-linked drift to hero orbs in HeroEntrance** - `962b466` (feat)
2. **Task 2: Add parallax scroll-linked drift to SVG accents and glows in AnimatedSection** - `e3f050f` (feat)

**Plan metadata:** `bcb8dc7` (docs: complete plan)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/hero-entrance.tsx` - Added ScrollTrigger import, parallax mm.add() block for hero orbs with differential -50px/-80px drift
- `src/app/[locale]/(landing)/_components/animated-section.tsx` - Added parallax mm.add() block for SVG accents (-25px/-18px), dark glows (-35px/-25px), and final CTA glow (-25px)

## Decisions Made
- Separate matchMedia block for parallax (adds min-width:769px) vs entrance/reveal animations (motion-only) -- different gating conditions for different purposes
- gsap.to() on y property is orthogonal to gsap.from() on scale/opacity -- no property conflicts between entrance and parallax
- scrub:0.5 matches the established smoothing pattern from Phase 6 scroll progress bar
- Hero parallax uses 'top top'/'bottom top' (hero is above the fold), section parallax uses 'top bottom'/'bottom top' (full viewport traversal)
- Alternating accent displacement (-25px even, -18px odd) prevents decorative elements from moving in mechanical lockstep

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All decorative elements now have scroll-linked parallax depth
- Parallax is purely additive -- coexists with Phase 5 entrance and Phase 6 reveal animations
- Ready for Phase 8 (Micro-interactions: magnetic buttons, card tilt) or Phase 9 (Performance Hardening)
- ScrollTrigger count is reasonable (~19 total: 8 reveals + 1 metrics + 1 progress bar + ~9 parallax)

## Self-Check: PASSED

- FOUND: hero-entrance.tsx
- FOUND: animated-section.tsx
- FOUND: 07-01-SUMMARY.md
- FOUND: commit 962b466
- FOUND: commit e3f050f
- Build: zero errors

---
*Phase: 07-parallax-visual-depth*
*Completed: 2026-02-27*
