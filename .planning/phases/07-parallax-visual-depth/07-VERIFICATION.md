---
phase: 07-parallax-visual-depth
verified: 2026-02-27T12:00:00Z
status: human_needed
score: 15/15 must-haves verified
re_verification: false
human_verification:
  - test: "Scroll through page on desktop (>769px) and observe hero orbs"
    expected: "Gold orb drifts upward ~50px slower than teal orb which drifts ~80px — creating visible foreground/background depth separation between the two orbs"
    why_human: "Cannot verify spatial depth perception or the subtle/felt quality of differential parallax programmatically"
  - test: "Scroll Services, Process, Pricing, and FAQ sections on desktop"
    expected: "SVG diamond and ring accents near each heading drift slightly upward at alternating rates — even-indexed accents move -25px, odd-indexed move -18px — preventing mechanical lockstep"
    why_human: "Visual quality of alternating displacement and whether it reads as 'subtle depth' vs 'distracting movement' requires human assessment"
  - test: "Scroll the dark Outcomes section (dark background) through viewport"
    expected: "Gold glow (h-dark-glow--1) drifts -35px, teal glow (h-dark-glow--2) drifts -25px — neither clips at the overflow:hidden boundary of .h-dark-inner"
    why_human: "Overflow clipping at the boundary of the container during mid-scroll positions cannot be verified without live rendering"
  - test: "Scroll the final CTA section through viewport"
    expected: "The glow element drifts -25px upward without clipping inside the overflow:hidden .h-final container"
    why_human: "Same overflow boundary check requires live rendering"
  - test: "Enable prefers-reduced-motion (System Preferences > Accessibility > Reduce Motion) then scroll"
    expected: "All decorative elements remain completely static — no parallax movement whatsoever on any element"
    why_human: "OS-level accessibility setting behaviour requires human testing"
  - test: "Resize viewport below 769px (or use mobile device) then scroll"
    expected: "No parallax movement occurs — decorative elements remain in static CSS positions"
    why_human: "Responsive breakpoint behaviour at the exact 769px boundary requires visual confirmation"
  - test: "Verify hero entrance sequence and section reveal animations are unaffected"
    expected: "Hero orb scale-in, badge fade, headline SplitText clip-path reveal, description fade, and CTA spring all fire identically to Phase 5. Section kicker->heading->description->content stagger timelines fire identically to Phase 6"
    why_human: "Animation coexistence (gsap.from on scale/opacity vs gsap.to on y) cannot be verified visually without running the page"
  - test: "Navigate away and back, then scroll"
    expected: "No memory leaks, no duplicated ScrollTrigger instances — all parallax continues to function normally"
    why_human: "React unmount/remount cleanup requires live navigation testing"
---

# Phase 7: Parallax Visual Depth Verification Report

**Phase Goal:** Decorative elements create spatial depth -- the page has a sense of layered dimensionality as the user scrolls
**Verified:** 2026-02-27T12:00:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Hero orbs move at different scroll speeds via ScrollTrigger scrub, creating foreground/background depth separation | VERIFIED | `hero-entrance.tsx:96-119` — two separate `gsap.to()` calls on `orbs[0]` (y:-50) and `orbs[1]` (y:-80) with `scrub:0.5` |
| 2 | Orb 1 (gold) drifts -50px, orb 2 (teal) drifts -80px, producing differential parallax | VERIFIED | `hero-entrance.tsx:97` y:-50, line 110 y:-80 |
| 3 | SVG accents (.h-accent) receive alternating -25px/-18px parallax in services, process, pricing, FAQ sections | VERIFIED | `animated-section.tsx:151-163` — `querySelectorAll('.h-accent')` with `i % 2 === 0 ? -25 : -18` |
| 4 | Dark section glows receive parallax (-35px for glow 1, -25px for glow 2) | VERIFIED | `animated-section.tsx:166-178` — `querySelectorAll('.h-dark-glow')` with `i === 0 ? -35 : -25` |
| 5 | Final CTA glow (.h-final-glow) receives -25px parallax | VERIFIED | `animated-section.tsx:181-193` — `querySelector('.h-final-glow')` with `y:-25` |
| 6 | All parallax tweens use gsap.to() with ease:'none' and scrub:0.5 | VERIFIED | All 5 parallax `gsap.to()` calls confirmed with `ease: 'none'` and `scrub: 0.5` |
| 7 | All parallax gated behind compound matchMedia: (prefers-reduced-motion: no-preference) and (min-width: 769px) | VERIFIED | `hero-entrance.tsx:87` and `animated-section.tsx:143` — both use exact compound condition |
| 8 | Parallax only targets decorative elements (aria-hidden="true") -- no text content receives parallax | VERIFIED | `gsap.to()` targets: `.h-hero-orb`, `.h-accent`, `.h-dark-glow`, `.h-final-glow` — all confirmed `aria-hidden="true"` in `page.tsx:50,51,106,109,176,227,228,285,361,441` |
| 9 | Hero parallax uses start:'top top' / end:'bottom top' | VERIFIED | `hero-entrance.tsx:101-102` and `114-115` |
| 10 | Section parallax uses start:'top bottom' / end:'bottom top' | VERIFIED | `animated-section.tsx:158-159`, `173-174`, `188-189` |
| 11 | Parallax tweens animate only the y property (compositor-friendly, no layout thrash) | VERIFIED | All `gsap.to()` parallax calls specify only `y`, `ease`, and `scrollTrigger` -- no layout-triggering properties |
| 12 | Parallax tweens coexist with entrance animations without conflict (gsap.to on y vs gsap.from on scale/opacity) | VERIFIED | Entrance: `gsap.from(orbs, { scale:0.8, opacity:0 })`. Parallax: `gsap.to(orb, { y:-50/-80 })`. Orthogonal properties confirmed. |
| 13 | All parallax ScrollTriggers cleaned up on unmount via useGSAP context | VERIFIED | Both files use `useGSAP({ scope: containerRef })` — `hero-entrance.tsx:122`, `animated-section.tsx:196` |
| 14 | Users with prefers-reduced-motion see no parallax (gated by matchMedia condition) | VERIFIED | Compound matchMedia string requires `no-preference` — any other value excludes the parallax block entirely |
| 15 | On viewports below 769px, no parallax ScrollTriggers created | VERIFIED | Compound matchMedia string requires `min-width: 769px` — parallax block does not execute at mobile |

**Score:** 15/15 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/[locale]/(landing)/_components/hero-entrance.tsx` | Parallax scroll-linked drift on hero orbs at differential speeds — must contain `scrub` | VERIFIED | 131 lines, substantive: 2 `gsap.to()` parallax calls, compound matchMedia, correct displacement values |
| `src/app/[locale]/(landing)/_components/animated-section.tsx` | Parallax scroll-linked drift on SVG accents, dark glows, final CTA glow — must contain `scrub` | VERIFIED | 205 lines, substantive: 3 `gsap.to()` parallax call groups (accents forEach, glows forEach, finalGlow), compound matchMedia |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `hero-entrance.tsx` | `gsap-registration.ts` | `import { gsap, ScrollTrigger, SplitText } from './gsap-registration'` | WIRED | Line 5 confirms ScrollTrigger added to import (was `{ gsap, SplitText }` pre-phase). `gsap-registration.ts` exports `ScrollTrigger` at line 10. |
| `animated-section.tsx` | `gsap-registration.ts` | `import { gsap, ScrollTrigger, SplitText } from './gsap-registration'` | WIRED | Line 5 — pre-existing import from Phase 6, unchanged and correct |

**Note on ScrollTrigger usage pattern:** `ScrollTrigger` is imported in `hero-entrance.tsx` at line 5 but does not appear as an identifier in the component body. This is correct GSAP behaviour — ScrollTrigger registers itself with GSAP on import; it is then invoked implicitly via the `scrollTrigger: { ... }` config key inside `gsap.to()`. The import is required for the registration side-effect; direct reference in code is not needed.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| VISUAL-03 | 07-01-PLAN.md | Parallax depth on decorative elements — hero orbs and SVG accents move at 0.4-0.6x scroll speed via ScrollTrigger scrub | SATISFIED | Hero orbs: -50px/-80px displacement with `scrub:0.5` over hero scroll range. SVG accents: -25px/-18px. Dark glows: -35px/-25px. Final glow: -25px. All elements targeted by CSS class selectors that match the `aria-hidden="true"` decorative elements in page.tsx. |

**Orphaned requirements check:** Only VISUAL-03 is mapped to Phase 7 in REQUIREMENTS.md traceability table (line 92). The plan declares `requirements: [VISUAL-03]`. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No TODO/FIXME/placeholder comments, no empty implementations, no console.log-only handlers found in either modified file |

### Human Verification Required

All 15 automated must-have checks pass. The following items require human testing because they concern visual perception, runtime animation behaviour, or OS-level accessibility settings:

#### 1. Differential Parallax Depth on Hero Orbs

**Test:** On desktop viewport (>769px), scroll slowly from the top of the page downward through the hero section
**Expected:** The gold orb (larger, behind) moves upward noticeably slower than the teal orb (smaller, in front). The two orbs separate in apparent depth plane as the page scrolls. The effect is felt rather than obvious — a sense of spatial layers, not a spectacle.
**Why human:** Spatial depth perception and the "subtle/felt" quality of differential parallax cannot be verified programmatically.

#### 2. SVG Accent Parallax Quality

**Test:** On desktop, scroll Services, Process, Pricing, and FAQ sections into view
**Expected:** Diamond and ring accents near headings drift slightly upward at alternating rates. Even-indexed accents (-25px total travel) move perceptibly slower than odd-indexed (-18px). Movement is subtle — you sense depth without noticing the animation.
**Why human:** Visual quality of alternating displacement and whether it reads as refined depth vs distracting motion requires aesthetic judgment.

#### 3. Dark Glow Overflow Boundary Check

**Test:** On desktop, scroll the dark Outcomes section through the viewport at a slow, deliberate pace
**Expected:** Gold glow (h-dark-glow--1) and teal glow (h-dark-glow--2) drift upward without any hard clipping at the edges of the `.h-dark-inner` container (which has `overflow: hidden`).
**Why human:** Container overflow clipping at mid-scroll positions requires live rendering to verify. The displacement values (-35px / -25px) are designed to stay within bounds, but visual confirmation is necessary.

#### 4. Final CTA Glow Overflow Boundary Check

**Test:** On desktop, scroll the final CTA section through the viewport
**Expected:** The glow element drifts -25px without clipping at the `.h-final` container's `overflow: hidden` boundary.
**Why human:** Same overflow boundary constraint as the dark section — requires visual confirmation at mid-scroll.

#### 5. Prefers-Reduced-Motion Compliance

**Test:** Enable "Reduce Motion" in System Preferences (macOS) or equivalent OS setting, then scroll through the full page
**Expected:** All decorative elements (orbs, accents, glows) remain completely static — no movement at any scroll position on any section.
**Why human:** OS-level accessibility preference behaviour requires testing with the actual system setting enabled.

#### 6. Mobile Viewport: No Parallax

**Test:** Resize browser to <769px width (or use a mobile device), then scroll through the page
**Expected:** No parallax movement on any element at any viewport width below 769px. Decorative elements hold their CSS-defined static positions.
**Why human:** Responsive breakpoint behaviour at the exact 769px threshold requires visual confirmation.

#### 7. Coexistence with Entrance and Reveal Animations

**Test:** On desktop with reduced-motion disabled, load the page fresh (Ctrl+Shift+R) and observe both the hero entrance sequence and the scroll-triggered section reveals
**Expected:** Hero entrance (orb scale-in -> badge fade -> headline SplitText word reveals -> description fade -> CTA spring) fires identically to Phase 5. Section reveals (kicker -> heading SplitText -> description -> content stagger) fire identically to Phase 6. Then scroll — parallax activates without any flickering, jumping, or property conflict on the orbs.
**Why human:** Animation coexistence (gsap.from on scale/opacity vs gsap.to on y) needs visual confirmation that no property conflicts or jerky transitions occur, especially at page load before any scrolling.

#### 8. Memory Leak / Cleanup Test

**Test:** Navigate away from the landing page (to another route) and back, then scroll through the page
**Expected:** All parallax continues working normally. No console errors about duplicate ScrollTrigger instances or invalid tweens. Scroll feels identical to first load.
**Why human:** React component unmount/remount and useGSAP cleanup requires live navigation testing.

### Summary

Phase 7 is fully implemented. All 15 observable truths verified against actual code. Both artifacts are substantive (not stubs), with correct implementation of scrub-based parallax using `gsap.to()` on the `y` property exclusively. Key links are wired: `ScrollTrigger` was added to the hero-entrance import and is correctly consumed via the `scrollTrigger` config key in `gsap.to()`. The single declared requirement (VISUAL-03) is satisfied with explicit evidence. No anti-patterns found.

The goal — "decorative elements create spatial depth, the page has a sense of layered dimensionality" — is structurally achieved. The differential displacement values (-50px/-80px for orbs, -25px/-18px alternating for accents, -35px/-25px for dark glows) implement the correct parallax architecture. Whether the result achieves the subjective "felt, not seen" quality requires human verification.

---

_Verified: 2026-02-27T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
