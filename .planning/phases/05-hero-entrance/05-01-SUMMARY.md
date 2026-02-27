---
phase: 05-hero-entrance
plan: 01
subsystem: ui
tags: [gsap, splittext, clip-path, animation, hero, timeline]

# Dependency graph
requires:
  - phase: 01-motion-foundation
    provides: "GSAP singleton (gsap-registration.ts), AnimatedSection wrapper, SmoothScrollProvider, landing-animations.css initial states"
provides:
  - "HeroEntrance Client Component with orchestrated GSAP timeline"
  - "SplitText clip-path word reveal pattern for headline text"
  - "matchMedia-gated page-load animation pattern (no ScrollTrigger)"
affects: [05-hero-entrance, 06-scroll-reveals]

# Tech tracking
tech-stack:
  added: []
  patterns: [gsap-matchMedia-gated-timeline, splittext-clippath-reveal, page-load-choreography]

key-files:
  created:
    - src/app/[locale]/(landing)/_components/hero-entrance.tsx
  modified:
    - src/app/[locale]/(landing)/page.tsx
    - src/app/[locale]/(landing)/landing-animations.css

key-decisions:
  - "h1 opacity override (opacity:1, transform:none) so word-level clip-path controls visibility instead of h1-level opacity"
  - "useGSAP scope auto-cleanup for SplitText revert -- no manual cleanup needed"
  - "Absolute timeline offsets (0, 0.15, 0.3, 0.7, 0.9) for precise choreography control"

patterns-established:
  - "matchMedia-gated timeline: gsap.matchMedia() wraps all animation code, prefers-reduced-motion users see no JS animation"
  - "SplitText clip-path reveal: split into words, from({clipPath: 'inset(0 100% 0 0)'}) for left-to-right uncover"
  - "Page-load entrance: GSAP timeline without ScrollTrigger for above-fold hero content"

requirements-completed: [SCROLL-02]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 5 Plan 1: Hero Entrance Sequence Summary

**Orchestrated hero entrance with SplitText clip-path word reveal, spring CTA buttons, and matchMedia reduced-motion gating over ~1.4s choreographed timeline**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T08:25:39Z
- **Completed:** 2026-02-27T08:27:43Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created HeroEntrance Client Component with precisely choreographed 5-stage GSAP timeline (orbs, badge, headline words, description, CTAs)
- Headline word-by-word reveal using SplitText + clip-path masking -- the signature visual moment
- CTA buttons arrive with back.out(1.7) spring easing for tactile physicality
- Full prefers-reduced-motion support via gsap.matchMedia() gating
- Automatic SplitText cleanup via useGSAP context scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HeroEntrance Client Component** - `ef09c6c` (feat)
2. **Task 2: Swap AnimatedSection for HeroEntrance + CSS setup** - `5525e40` (feat)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/hero-entrance.tsx` - New Client Component with orchestrated GSAP timeline (orbs scale, badge fade, SplitText clip-path headline reveal, desc fade, CTA spring)
- `src/app/[locale]/(landing)/page.tsx` - Added HeroEntrance import, swapped hero section wrapper from AnimatedSection to HeroEntrance
- `src/app/[locale]/(landing)/landing-animations.css` - Added h1 opacity:1/transform:none override so word-level clip-path controls visibility

## Decisions Made
- h1 element gets explicit opacity:1 and transform:none override to bypass the parent `.h-hero > *` opacity:0 rule -- SplitText word divs handle their own visibility via clip-path
- useGSAP with `{ scope: containerRef }` provides automatic cleanup for both SplitText instances and the timeline, eliminating need for manual revert calls
- Absolute position offsets on timeline (0, 0.15, 0.3, 0.7, 0.9s) chosen over relative offsets for deterministic choreography

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hero entrance component is complete and builds successfully
- Ready for Plan 05-02 (hero parallax/scroll effects if applicable) or Phase 06 (scroll reveals)
- The SplitText + clip-path pattern established here can be reused for other text reveals in Phase 06
- AnimatedSection remains in use for 8 other sections, ready for scroll-triggered reveal logic

## Self-Check: PASSED

- hero-entrance.tsx: FOUND
- 05-01-SUMMARY.md: FOUND
- Commit ef09c6c: FOUND
- Commit 5525e40: FOUND

---
*Phase: 05-hero-entrance*
*Completed: 2026-02-27*
