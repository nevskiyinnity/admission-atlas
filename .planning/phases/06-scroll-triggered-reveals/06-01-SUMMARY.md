---
phase: 06-scroll-triggered-reveals
plan: 01
subsystem: ui
tags: [gsap, scrolltrigger, splittext, animation, scroll-reveal, choreography]

# Dependency graph
requires:
  - phase: 05-hero-entrance
    provides: "Standalone h2 SplitText scroll reveals in AnimatedSection (now replaced by section-level choreography)"
  - phase: 01-motion-foundation
    provides: "GSAP registration singleton, AnimatedSection wrapper, Lenis smooth scroll, landing-animations.css initial states"
provides:
  - "Per-section choreographed reveal timelines with staggered child animations"
  - "Metrics section simple stagger pattern"
  - "Section container instant-reveal via gsap.set() clearing CSS FOUC prevention"
  - "CTA button spring easing pattern (back.out(1.4))"
affects: [06-02, 07-parallax, 08-micro-interactions, 09-performance-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-section-timeline-choreography, gsap-set-fouc-clear, content-element-query-chain]

key-files:
  created: []
  modified:
    - "src/app/[locale]/(landing)/_components/animated-section.tsx"

key-decisions:
  - "gsap.set() instantly clears section CSS initial states so children animate individually"
  - "Single timeline per section with positional offsets creates reading-order choreography"
  - "h2 SplitText reveal integrated into section timeline (replaces standalone Phase 5 code)"
  - "Metrics section uses simple gsap.from stagger (no timeline) -- no kicker/heading/description"
  - "Content element query chain tries each type in order; only one type exists per section"
  - "No CSS changes needed -- existing section-level initial states and reduced-motion overrides sufficient"

patterns-established:
  - "Section choreography pattern: kicker(0s) -> heading(+0.1s) -> description(+0.2s) -> content(+0.2s) -> CTA(+0.15s)"
  - "FOUC prevention: CSS hides section, gsap.set clears it, gsap.from animates children"
  - "Content element query chain for polymorphic section content"

requirements-completed: [SCROLL-01, SCROLL-03]

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 6 Plan 01: Scroll-Triggered Section Reveals Summary

**Per-section choreographed scroll reveal timelines with kicker-heading-description-content staggering across all 8 sections**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T08:56:24Z
- **Completed:** 2026-02-27T09:01:15Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- AnimatedSection rewritten with per-section choreographed reveal timelines replacing standalone h2-only reveals
- Each section follows consistent choreography: kicker -> heading words (SplitText clip-path) -> description -> content elements -> CTA button
- Metrics section uses simple stagger pattern (no kicker/heading) for its 4 metric items
- gsap.matchMedia() gates all animation behind prefers-reduced-motion; reduced-motion users see all content immediately
- Verified existing CSS initial states and reduced-motion overrides are complete and correct for new animation scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite AnimatedSection with per-section choreographed reveal timelines** - `7d3f0b6` (feat)
2. **Task 2: Verify CSS initial states and reduced-motion coverage** - No commit (verification only, no changes needed)

## Files Created/Modified
- `src/app/[locale]/(landing)/_components/animated-section.tsx` - Per-section choreographed reveal timelines with staggered child animations

## Decisions Made
- **gsap.set() for FOUC clearing:** Section container immediately set to opacity:1, y:0 when ScrollTrigger fires. CSS initial states serve as FOUC prevention only; GSAP takes over from there.
- **Single timeline per section:** One ScrollTrigger + one timeline per section (8 total). Positional offsets (pos variable) create cascading choreography in reading order.
- **h2 SplitText integrated into timeline:** Phase 5's standalone h2 ScrollTrigger replaced by a timeline position, preventing double-animation on headings. Same clip-path technique and stagger values preserved.
- **Metrics special case:** No timeline needed -- simple gsap.from() with stagger and early return. Avoids empty timeline for a section with no kicker/heading/description.
- **No CSS changes:** Existing section-level opacity:0/translateY:24px initial states and reduced-motion overrides cover all animated elements. No child-level initial states needed because gsap.from() handles initial values programmatically.
- **CTA button spring easing:** back.out(1.4) on callout and final CTA buttons matches the hero CTA pattern from Phase 5.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build error `ENOENT: 500.html rename` is a pre-existing Next.js infrastructure issue unrelated to our changes. TypeScript compilation passes cleanly for all landing page files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 sections now have choreographed scroll reveals
- Ready for Plan 06-02 (if any additional scroll reveal refinements)
- Foundation set for Phase 7 (parallax) and Phase 8 (micro-interactions) which layer on top of these reveals

## Self-Check: PASSED

- FOUND: `src/app/[locale]/(landing)/_components/animated-section.tsx`
- FOUND: `.planning/phases/06-scroll-triggered-reveals/06-01-SUMMARY.md`
- FOUND: commit `7d3f0b6`

---
*Phase: 06-scroll-triggered-reveals*
*Completed: 2026-02-27*
