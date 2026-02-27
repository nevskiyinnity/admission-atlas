# Roadmap: Admission Atlas Landing Page Redesign

## Overview

Transform the Admission Atlas landing page from a well-made editorial template to Apple Design Award-caliber work by layering motion, visual depth, and micro-interactions onto the existing Next.js 14 Server Component architecture. The build progresses from invisible infrastructure (GSAP + Lenis foundation), through CSS-only visual polish (zero-risk, high-impact), into orchestrated scroll animations (the signature moments), and finishes with micro-interactions and performance hardening. Each phase delivers observable improvement; the page gets progressively more impressive without ever being broken.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Motion Foundation** - GSAP + Lenis installed, Client Component islands architecture, animation CSS initial states, prefers-reduced-motion infrastructure
- [x] **Phase 2: Typography & Copy** - Typography drama with fluid scaling, copy restructuring for quiet authority
- [ ] **Phase 3: CSS Visual Polish** - Gradient mesh backgrounds, SVG geometry accents, enhanced hover transitions, FAQ accordion
- [ ] **Phase 4: Section Transitions & Dark Atmosphere** - Seamless section flow, dark outcomes section atmospheric upgrade, grain density tuning
- [x] **Phase 5: Hero Entrance Sequence** - Cinematic orchestrated hero animation with SplitText reveals, the signature moment (completed 2026-02-27)
- [x] **Phase 6: Scroll-Triggered Reveals** - All sections animate into view with staggered choreography, scroll-progress indicator (completed 2026-02-27)
- [x] **Phase 7: Parallax & Visual Depth** - Decorative elements move at different scroll speeds, spatial depth perception (completed 2026-02-27)
- [x] **Phase 8: Micro-Interactions** - Magnetic buttons, card tilt effects, tactile hover responses (completed 2026-02-27)
- [ ] **Phase 9: Performance & Quality Hardening** - Lighthouse 90+, animation audit, memory leak testing, reduced-motion end-to-end verification

## Phase Details

### Phase 1: Motion Foundation
**Goal**: The animation infrastructure is in place and invisible -- the page renders identically to today but GSAP, Lenis, and the Client Component boundary are ready for all subsequent animation work
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. GSAP 3.14, ScrollTrigger, SplitText, and @gsap/react are installed and the dev server starts without errors
  2. Lenis smooth scroll is active on desktop and synced with GSAP's ticker -- scrolling feels buttery compared to native
  3. The page.tsx remains a Server Component; animated sections are wrapped in thin Client Component shells that render their children unchanged
  4. All elements that will later animate start in their CSS initial states (opacity: 0, transforms applied) via landing-animations.css, with a prefers-reduced-motion media query that resets everything to visible
  5. A user with prefers-reduced-motion enabled sees the full page content immediately with no animation, no FOUC, no blank sections
**Plans**: TBD

Plans:
- [x] 01-01: Install GSAP + Lenis, create registration singleton, SmoothScrollProvider, AnimatedSection
- [x] 01-02: CSS initial states, reduced-motion overrides, wrap page.tsx sections in Client Component islands

### Phase 2: Typography & Copy
**Goal**: The page communicates quiet authority through typography alone -- display type dominates, copy is tighter and more confident, fluid scaling works across all breakpoints
**Depends on**: Phase 1
**Requirements**: TYPE-01, TYPE-02
**Success Criteria** (what must be TRUE):
  1. Hero heading renders at 4.5-6rem on desktop with clamp() fluid scaling down to mobile, creating a 4:1+ ratio against body text
  2. All section headlines and descriptions are rewritten to be shorter, more confident, and aligned with the "most competent people in the room" voice
  3. Typography changes render correctly across desktop, tablet, and mobile without overflow or awkward line breaks
**Plans**: TBD

Plans:
- [x] 02-01: Typography scale update (clamp() values) + copy restructuring (quiet authority voice)

### Phase 3: CSS Visual Polish
**Goal**: The page feels premium and alive through CSS-only effects -- gradient backgrounds breathe, geometry accents add sophistication, hover states feel tactile, and the FAQ opens smoothly
**Depends on**: Phase 1
**Requirements**: VISUAL-01, VISUAL-04, MICRO-03, MICRO-04
**Success Criteria** (what must be TRUE):
  1. Hero and CTA sections have slow-breathing animated gradient mesh backgrounds (15-25s CSS animation cycles) that create ambient visual interest
  2. Subtle SVG geometry accents (rotating diamonds, pulsing rings at 8-12% opacity) appear near section headings
  3. All interactive elements (nav links, buttons, cards, footer links) have consistent hover transitions with custom easing (160-300ms)
  4. FAQ accordion opens and closes with smooth CSS grid-template-rows animation instead of the native details snap
**Plans**: TBD

Plans:
- [x] 03-01: Gradient mesh backgrounds + SVG geometry accents (VISUAL-01, VISUAL-04)
- [ ] 03-02: FAQ accordion rewrite + hover transition audit (MICRO-03, MICRO-04)

### Phase 4: Section Transitions & Dark Atmosphere
**Goal**: Sections flow into each other as a continuous visual journey rather than stacked blocks -- the dark outcomes section feels like entering a different space with its own atmosphere
**Depends on**: Phase 3
**Requirements**: VISUAL-02, VISUAL-05
**Success Criteria** (what must be TRUE):
  1. Gradient bleeds between sections create seamless visual transitions -- no hard color boundaries between adjacent sections
  2. The dark outcomes section has an enveloping gradient, increased grain density, and animated glow elements that make it feel like entering a different environment
  3. The transition into the dark section is a deliberate atmospheric shift (gradient overlay at boundary), not just a background-color change
**Plans**: 1 plan

Plans:
- [ ] 04-01: Gradient bleeds between sections + dark outcomes section atmospheric upgrade (VISUAL-02, VISUAL-05)

### Phase 5: Hero Entrance Sequence
**Goal**: The page load is a cinematic moment -- visitors experience an orchestrated entrance that communicates precision and craft before they read a word
**Depends on**: Phase 1, Phase 2
**Requirements**: SCROLL-02, TYPE-03
**Success Criteria** (what must be TRUE):
  1. On page load, the hero animates in a choreographed sequence: orbs scale in, headline reveals word-by-word via SplitText clip-path masking, description fades in, CTAs arrive with spring -- total duration approximately 1.4s
  2. Section headings throughout the page reveal word-by-word with clip-path animations triggered on scroll entry
  3. A user with prefers-reduced-motion sees all hero content immediately without the entrance sequence
  4. The entrance feels inevitable and confident, not decorative or showy -- like an Apple product page reveal
**Plans**: TBD

Plans:
- [ ] 05-01: HeroEntrance Client Component with orchestrated GSAP timeline (SCROLL-02)
- [ ] 05-02: Scroll-triggered SplitText heading reveals on all section h2s (TYPE-03)

### Phase 6: Scroll-Triggered Reveals
**Goal**: Content materializes as the user scrolls -- every section has choreographed reveal animations that make the page feel responsive to the visitor's presence
**Depends on**: Phase 1, Phase 5
**Requirements**: SCROLL-01, SCROLL-03, SCROLL-04
**Success Criteria** (what must be TRUE):
  1. All major sections animate into view on scroll with opacity + transform transitions and staggered timing
  2. Each section has its own reveal timeline following a consistent choreography pattern: kicker label, then heading, then description, then content elements
  3. A thin gold scroll-progress bar appears under the navigation showing page scroll position
  4. Scroll animations feel natural and functional -- content reveals serve comprehension, not spectacle
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Parallax & Visual Depth
**Goal**: Decorative elements create spatial depth -- the page has a sense of layered dimensionality as the user scrolls
**Depends on**: Phase 6
**Requirements**: VISUAL-03
**Success Criteria** (what must be TRUE):
  1. Hero orbs and SVG accents move at 0.4-0.6x scroll speed via ScrollTrigger scrub, creating a clear sense of foreground/background separation
  2. Parallax is applied only to decorative elements, never to readable text content
  3. The depth effect is subtle enough to feel natural -- it enhances spatial perception without calling attention to itself
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Micro-Interactions
**Goal**: Interactive elements feel tactile and responsive -- buttons pull toward the cursor, cards respond to hover with subtle 3D perspective, creating a sense of physical craft
**Depends on**: Phase 6
**Requirements**: MICRO-01, MICRO-02
**Success Criteria** (what must be TRUE):
  1. Primary CTA buttons subtly pull toward the cursor within approximately 50px radius with lerped tracking and eased reset on mouseleave
  2. Bento grid cards respond to hover with subtle 3D rotation (max 4-5 degrees) and a radial gradient light sheen that follows the cursor
  3. Magnetic and tilt effects are disabled on touch devices (gated by @media (hover: hover)) -- mobile users get standard hover states
**Plans**: 1 plan

Plans:
- [ ] 08-01: Magnetic CTA buttons + 3D tilt bento cards (MICRO-01, MICRO-02)

### Phase 9: Performance & Quality Hardening
**Goal**: The animation layer ships at production quality -- fast, accessible, leak-free, and audited for restraint
**Depends on**: Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Lighthouse performance score is 90 or above with all animations active
  2. All animations use only compositor-friendly properties (transform, opacity, clip-path, filter) -- zero layout-triggering animations
  3. Navigating away from and back to the landing page produces no memory leaks -- all GSAP instances and ScrollTriggers are cleaned up via useGSAP on unmount
  4. A full-page scroll review has been conducted and the "2-4 hero moments" rule is enforced -- the page feels like a premium product, not a CodePen demo
  5. A user with prefers-reduced-motion enabled experiences the complete page content with zero animation, zero FOUC, and full functionality
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

Note: Phases 2 and 3 depend only on Phase 1 and can execute in parallel. Phases 7 and 8 depend on Phase 6 and can execute in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Motion Foundation | 2/2 | Complete | 2026-02-27 |
| 2. Typography & Copy | 0/1 | Planned | - |
| 3. CSS Visual Polish | 1/2 | In Progress | - |
| 4. Section Transitions & Dark Atmosphere | 0/1 | Not started | - |
| 5. Hero Entrance Sequence | 0/2 | Complete    | 2026-02-27 |
| 6. Scroll-Triggered Reveals | 0/2 | Complete    | 2026-02-27 |
| 7. Parallax & Visual Depth | 0/1 | Complete    | 2026-02-27 |
| 8. Micro-Interactions | 0/1 | Complete    | 2026-02-27 |
| 9. Performance & Quality Hardening | 0/2 | Not started | - |
