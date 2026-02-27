# Requirements: Admission Atlas Landing Page Redesign

**Defined:** 2026-02-27
**Core Value:** The landing page must make visitors feel they've found the most competent people in the room — through design craft alone.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: GSAP 3.14 + ScrollTrigger + SplitText + @gsap/react installed and configured for Next.js 14 App Router
- [x] **FOUND-02**: Lenis smooth scroll integrated with ScrollTrigger via ticker sync
- [x] **FOUND-03**: Client Component islands architecture — page.tsx stays Server Component, animated sections wrapped in thin Client Components
- [x] **FOUND-04**: CSS initial states in `landing-animations.css` to prevent FOUC on all animated elements
- [x] **FOUND-05**: `prefers-reduced-motion` support via `gsap.matchMedia()` — all animations disabled gracefully for users who prefer reduced motion
- [x] **FOUND-06**: GSAP plugin registration singleton (`gsap-registration.ts`) to prevent duplicate registration

### Scroll Animation

- [x] **SCROLL-01**: Scroll-triggered reveal animations on all major sections — elements animate in with opacity + transform, staggered timing per section
- [x] **SCROLL-02**: Orchestrated hero entrance sequence — cinematic choreography: orbs scale in, headline reveals word-by-word via SplitText clip-path, description fades, CTAs arrive with spring
- [x] **SCROLL-03**: Staggered section choreography — each section has its own reveal timeline (kicker → heading → description → content elements)
- [x] **SCROLL-04**: Scroll-progress indicator — thin gold bar under nav showing page scroll position

### Visual Depth

- [x] **VISUAL-01**: Animated gradient mesh / aurora backgrounds — slow-breathing radial gradients behind hero and CTA sections using CSS animations (15-25s cycles)
- [x] **VISUAL-02**: Section transition design — gradient bleeds between sections, dark section feels like entering a different atmosphere (grain density shift, gradient overlay at boundary)
- [ ] **VISUAL-03**: Parallax depth on decorative elements — hero orbs and SVG accents move at 0.4-0.6x scroll speed via ScrollTrigger scrub
- [x] **VISUAL-04**: Subtle animated SVG geometry accents — rotating diamonds, pulsing rings near section headings (CSS keyframes, 8-12% opacity)
- [x] **VISUAL-05**: Dark outcomes section atmospheric upgrade — enveloping gradient, increased grain density, animated glow elements, gradient bleed transition from previous section

### Micro-interactions

- [ ] **MICRO-01**: Magnetic button effect on primary CTAs — buttons subtly pull toward cursor within ~50px radius, lerped tracking, eased reset on mouseleave
- [ ] **MICRO-02**: Card tilt/perspective on bento grid cards — subtle 3D rotation (max 4-5°) with radial gradient light sheen following cursor
- [x] **MICRO-03**: Smooth FAQ accordion — animated open/close via CSS grid-template-rows (no JS needed), replacing native details snap
- [x] **MICRO-04**: Enhanced hover transitions on all interactive elements — consistent easing, subtle scale/shadow responses across nav links, buttons, cards, footer links

### Typography & Copy

- [x] **TYPE-01**: Typography drama — increase display-to-body size ratio to 4:1+, hero heading at 4.5-6rem desktop, refined `clamp()` fluid scaling
- [x] **TYPE-02**: Copy restructuring — tighter, more confident headlines; fewer words, more impact; copy that matches the quietly authoritative design direction
- [x] **TYPE-03**: Text reveal animations on section headings — SplitText word-by-word clip-path reveals triggered on scroll

### Performance & Quality

- [ ] **PERF-01**: Lighthouse performance score ≥ 90 with all animations active
- [ ] **PERF-02**: All animations use compositor-friendly properties only (transform, opacity, clip-path, filter) — no layout-triggering animations
- [ ] **PERF-03**: GSAP cleanup on component unmount via useGSAP — no memory leaks on navigation
- [ ] **PERF-04**: Lazy-load animation code for below-fold sections where beneficial

## v2 Requirements

### Enhancements

- **V2-01**: Scroll-linked navigation shadow/opacity changes (nav becomes more prominent after scrolling past hero)
- **V2-02**: Custom animated page transitions between landing pages (home → team → contact)
- **V2-03**: Dark mode variant of the landing page
- **V2-04**: Animated counter/number reveals on metrics section

## Out of Scope

| Feature | Reason |
|---------|--------|
| Photography or real imagery | Abstract visual language is the design direction — geometry and typography only |
| Custom cursor / cursor trails | Breaks expected interaction patterns, adds latency, accessibility concern |
| Scroll hijacking on mobile | Fights native scroll, causes motion sickness, accessibility violation |
| Particle systems / Three.js / WebGL | Massive bundle, GPU-intensive, overkill for service landing page |
| Horizontal scroll sections | Breaks scroll predictability, poor mobile/accessibility experience |
| Parallax on text content | Makes text hard to read, cognitive dissonance between content layers |
| Page preloader / loading screen | Adds perceived load time, penalizes LCP, SSR makes it unnecessary |
| Portal/dashboard UI changes | This project is landing page only |
| Other landing pages (team, results, contact) | Scoped to home page only |
| Backend/API/database changes | Pure frontend redesign |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| SCROLL-01 | Phase 6 | Complete |
| SCROLL-02 | Phase 5 | Complete |
| SCROLL-03 | Phase 6 | Complete |
| SCROLL-04 | Phase 6 | Complete |
| VISUAL-01 | Phase 3 | Complete |
| VISUAL-02 | Phase 4 | Complete |
| VISUAL-03 | Phase 7 | Pending |
| VISUAL-04 | Phase 3 | Complete |
| VISUAL-05 | Phase 4 | Complete |
| MICRO-01 | Phase 8 | Pending |
| MICRO-02 | Phase 8 | Pending |
| MICRO-03 | Phase 3 | Complete |
| MICRO-04 | Phase 3 | Complete |
| TYPE-01 | Phase 2 | Complete |
| TYPE-02 | Phase 2 | Complete |
| TYPE-03 | Phase 5 | Complete |
| PERF-01 | Phase 9 | Pending |
| PERF-02 | Phase 9 | Pending |
| PERF-03 | Phase 9 | Pending |
| PERF-04 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26/26
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap creation*
