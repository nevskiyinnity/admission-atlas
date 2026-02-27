# Project Research Summary

**Project:** Admission Atlas — Animation & Interaction Layer
**Domain:** Premium animated landing page (scroll-driven motion design layer for existing Next.js 14 App Router site)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Executive Summary

Admission Atlas needs a motion design layer added to an existing Next.js 14 App Router landing page. The research consensus is clear: the correct stack is GSAP 3.x + ScrollTrigger + Lenis, using a "Client Component Islands" architecture that keeps the page.tsx as a Server Component and wraps individual sections in thin client-side wrappers. This is the same pattern used by award-winning Awwwards sites and premium SaaS brands (Linear, Stripe, Vercel) that achieve the "quietly authoritative" quality the project is targeting. All required libraries are now free — GSAP removed its $99/yr paywall following its Webflow acquisition — making the recommended stack cost-free and production-proven.

The key technical decision is the Server/Client Component boundary. The page must remain a Server Component for SSR, streaming, and SEO. Animated wrappers (`AnimatedSection`, `AnimatedHero`, etc.) must be thin Client Components that receive Server-rendered HTML as `children` props — never the reverse. This pattern is well-documented and has clear implementation examples from official sources. CSS-only effects (gradient mesh backgrounds, grain textures, SVG geometry accents) can ship first as a no-JavaScript polish pass, followed by the full GSAP integration for scroll-triggered reveals, the hero entrance sequence, and SplitText reveals.

The primary risks are all architectural rather than visual: FOUC (flash of unstyled content) if initial animation states are not set in CSS before GSAP initializes; hydration mismatches if Client/Server component boundaries are drawn incorrectly; ScrollTrigger memory leaks from improper cleanup; and over-animation — adding too many simultaneous motion effects until the page feels like a demo rather than a premium product. All seven critical pitfalls identified in research are addressable with established patterns, and the prevention strategies map cleanly to specific build phases. The project has a strong foundation to work from: the `.landing-scope` CSS architecture, the existing grain texture, backdrop-filter nav, and gradient orbs are all assets that extend naturally into the animation layer.

## Key Findings

### Recommended Stack

The animation stack is GSAP (v3.14.2) as the core engine, `@gsap/react` (v2.1.2) for the `useGSAP` React hook, and Lenis (v1.3.17) for smooth scroll. These three packages are the complete installation (`npm install gsap @gsap/react lenis`). GSAP's ScrollTrigger and SplitText plugins are bundled with the main `gsap` package at no additional cost. Total animation bundle: ~29KB gzipped, which is less than Framer Motion alone while offering far greater scroll choreography capability.

Motion (Framer Motion) was evaluated and rejected as the primary animation engine. Its `useScroll` API cannot support pinning, scrubbing, or timeline choreography. GSAP ScrollSmoother was rejected in favor of Lenis because ScrollSmoother wraps the DOM in a fixed container that conflicts with the existing `.landing-scope` architecture. Three.js/WebGL was rejected as over-engineered for a 2D gradient/typography design language.

**Core technologies:**
- **GSAP 3.14.2:** Animation engine for all scroll-driven and timeline choreography — industry standard for award-winning scroll animation; now 100% free
- **@gsap/react 2.1.2:** `useGSAP()` hook for React lifecycle-safe animation — auto-handles cleanup, prevents strict-mode double-mount bugs, SSR-safe
- **GSAP ScrollTrigger:** Scroll-driven animation triggers, pin, scrub — bundled with GSAP; the definitive scroll animation plugin with no viable alternative
- **GSAP SplitText:** Character/word/line splitting for text reveal animations — bundled with GSAP; now free (was $99/yr Club GSAP)
- **Lenis 1.3.17:** Buttery smooth scroll via GSAP ticker sync — lightweight (~4KB), keeps native DOM (unlike ScrollSmoother), proven Awwwards pattern
- **Vanilla CSS:** Gradient mesh backgrounds, aurora effects, grain overlay, SVG geometry accents — no library needed; extends existing `.landing-scope` CSS

### Expected Features

The "quietly authoritative" quality comes from restraint over abundance. Award-winning pages animate 20-30% of elements. The research explicitly defines an animation hierarchy: the hero entrance sequence is the one signature moment; section reveals are functional, not decorative; hover states are user-initiated micro-interactions; everything else is static.

**Must have (table stakes — P1):**
- Scroll-triggered reveal animations — content scrolling in without this feels broken in 2026
- Hero entrance choreography — orbs -> SplitText headline -> description -> CTAs, ~1.4s total
- Text reveal animations (clip-path + SplitText) — the single highest-impact typography technique
- Typography scale upgrade — hero heading to 4.5-6rem, 4:1+ ratio vs body text with `clamp()`
- Enhanced hover transitions — all interactive elements need 160-300ms transitions with custom ease
- `prefers-reduced-motion` compliance — WCAG 2.1 SC 2.3.3, European Accessibility Act 2025; design this first, not last

**Should have (differentiators — P2):**
- Staggered section choreography — per-section GSAP timelines with ordered reveals (kicker -> heading -> body -> cards)
- Animated gradient mesh / aurora background — CSS-only, 3-4 radial gradients cycling over 15-25s
- Parallax depth on decorative elements — hero orbs and geometry at 0.4-0.6x scroll speed
- Dark section atmospheric transition — gradient bleed, increased grain opacity, subtle glow pulses
- Section visual separation — distinct environmental feel per section, not just padding changes
- FAQ smooth accordion — CSS `grid-template-rows` trick; zero JS cost
- Scroll-progress indicator — 2px gold bar under nav, driven by ScrollTrigger

**Defer to v2+:**
- Magnetic button effect — requires per-button Client Component; careful mobile handling needed
- Card tilt/perspective — per-card Client Component; validate performance on mobile first
- Lenis smooth scroll (desktop only) — confirm reduced-motion handling before shipping
- ScrollSmoother — rejected entirely; use Lenis instead

**Explicit anti-features (do not build):**
- Custom scroll hijacking on mobile — breaks accessibility, causes motion sickness
- Page preloader/loading screen — adds perceived load time, penalizes LCP
- Particle systems / Three.js — massively over-engineered for this design language
- Horizontal scroll sections — breaks scroll predictability, poor mobile experience
- Parallax on text content — makes text unreadable, accessibility failure
- Custom cursor replacement — feels dated, breaks expected interaction patterns
- Everything animated simultaneously — when everything moves, nothing has importance

### Architecture Approach

The architecture is a hybrid Server/Client Component model. The `page.tsx` remains a Server Component that renders the static HTML structure and SEO content. Thin Client Component islands (`AnimatedHero`, `AnimatedSection`, `AnimatedDarkSection`, etc.) wrap individual sections and receive the Server-rendered content as `children` props. A `SmoothScrollProvider` Client Component sits at the top of the landing tree, initializing Lenis and syncing it with GSAP's ticker. A module-level `gsap-registration.ts` (not a React component) registers GSAP plugins exactly once via ES module singleton semantics.

Data flows unidirectionally: Browser scroll -> Lenis interpolation -> GSAP ticker -> ScrollTrigger position calculation -> individual island animation callbacks. No React state is involved in scroll coordination — GSAP's internal scheduler manages all frame timing at the DOM level, outside React's render cycle. Hover interactions (magnetic buttons, card tilt) are fully local to their Client Component via `mousemove` events and `gsap.quickTo()`.

**Major components:**
1. `SmoothScrollProvider` (Client) — Lenis init, GSAP ticker sync, ScrollTrigger coordination; wraps entire landing page
2. `gsap-registration.ts` (module) — one-time GSAP plugin registration; imported as side-effect by all Client islands
3. `AnimatedHero` (Client) — hero entrance timeline, SplitText reveals, parallax orbs; highest visual impact
4. `AnimatedSection` (Client) — generic scroll-reveal wrapper with child stagger; used by Services, Process, Pricing, FAQ sections
5. `AnimatedDarkSection` (Client) — Outcomes section atmosphere, glow pulses, card stagger
6. `AnimatedCallout` (Client) — AI Engine section parallax and gradient shift
7. `AnimatedFinalCTA` (Client) — final CTA glow pulse and button emphasis
8. `MagneticButton` (Client) — magnetic hover on primary CTAs (v2)
9. `AnimatedCard` (Client) — tilt hover on bento/pricing cards (v2)
10. `landing-animations.css` (CSS) — initial GSAP animation states, keyframes, `prefers-reduced-motion` overrides

### Critical Pitfalls

1. **GSAP strict mode double-mount via raw `useEffect`** — Always use `useGSAP()` hook (never raw `useEffect` for GSAP). The hook wraps animations in `gsap.context()` and auto-reverts on unmount, making React 18 strict mode safe. Register with `gsap.registerPlugin(useGSAP)`. Establish this in Phase 1; all subsequent code inherits the pattern.

2. **Flash of unstyled content (FOUC) on animated elements** — Set initial animation states in CSS before GSAP initializes. If GSAP will `from({ opacity: 0, y: 50 })`, the element's CSS must start at `opacity: 0; transform: translateY(50px)`. The `landing-animations.css` file is the home for all initial states plus a `prefers-reduced-motion: reduce` override that resets everything to visible. Lighthouse CLS < 0.1 is the verification target.

3. **`prefers-reduced-motion` ignored until it's too late** — This is a WCAG 2.1 SC 2.3.3 requirement and a legal obligation under the European Accessibility Act (2025). Design the reduced-motion experience first. Use `gsap.matchMedia()` to define separate animation tracks. The recovery cost if this is implemented late is HIGH — every component must be retrofitted. Build it in Phase 1.

4. **ScrollTrigger stale instances after route navigation** — All ScrollTrigger instances must be created inside `useGSAP()` so they are auto-reverted on unmount. Never create ScrollTrigger at module scope or in global event listeners. Verify with a navigation round-trip test (landing -> /team -> landing -> /contact -> landing) and memory profiling.

5. **Over-animation degrading the premium feel** — Enforce the "2-4 hero moments" rule: the hero entrance, the dark section transition, and one or two key stat reveals. Use the 3-second rule: no animation should prevent content access for more than 300ms. Conduct a full-page scroll review after Phase 3 and remove 50% of animations if the page feels like a CodePen rather than an Apple product page.

6. **Hydration mismatch from server/client DOM divergence** — Client Component wrappers must receive Server-rendered content as `children`, never import Server Components directly. Avoid `pin: true` on server-rendered elements (it adds a DOM wrapper on the client only). The `useGSAP()` hook's `useIsomorphicLayoutEffect` safely no-ops during SSR.

7. **Layout thrashing from read-write cycles in scroll handlers** — Use GSAP ScrollTrigger instead of raw `addEventListener('scroll')`. Only animate `transform` and `opacity` (GPU-composited S-tier properties). Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`. Use `will-change` sparingly and remove it after animation completes.

## Implications for Roadmap

Based on the combined research, a four-phase build order emerges from hard architectural dependencies. The architecture research explicitly defines a build dependency chain: foundation must precede all animation work; the generic `AnimatedSection` wrapper unlocks four sections at once; section-specific islands are then independent; polish requires all animations to be in place.

### Phase 1: Foundation (No Animations Yet)

**Rationale:** Every animated component depends on GSAP registration, animation CSS initial states, and the Lenis/ScrollTrigger sync being in place. Pitfalls 1, 2, 3, 4, and 6 are all prevention-phase 1 concerns — establishing correct patterns here means all subsequent phases inherit them automatically.

**Delivers:** GSAP installed and registered (`gsap-registration.ts`); `SmoothScrollProvider` with Lenis + GSAP ticker sync; `landing-animations.css` with all initial states and `prefers-reduced-motion` overrides; Client/Server component boundary defined in `page.tsx` (structure only, no islands yet wired up). Page renders identically to today but infrastructure is in place.

**Addresses (from FEATURES.md):** `prefers-reduced-motion` compliance (P1); initial state prevents FOUC when JS arrives.

**Avoids:** Pitfall 1 (strict mode), Pitfall 2 (FOUC), Pitfall 3 (reduced motion), Pitfall 4 (stale instances), Pitfall 6 (hydration mismatch).

**Research flag:** Standard patterns — no additional research needed. All patterns are verified against official GSAP + Next.js docs at HIGH confidence.

### Phase 2: CSS-Only Polish Pass

**Rationale:** CSS-only features (gradient mesh, SVG accents, section separation, hover transitions, FAQ accordion) are completely independent of GSAP and Client Component architecture. They can ship immediately as a low-risk, high-value visual upgrade. This delivers premium perception before any JavaScript animation, and validates the visual direction before the complex GSAP work begins.

**Delivers:** Typography scale upgrade (hero heading to 4.5-6rem with `clamp()`); all hover transitions polished (160-300ms, custom ease); animated gradient mesh backgrounds via CSS `@keyframes`; SVG geometry accents at section headings; dark section gradient bleed transition; FAQ accordion with CSS `grid-template-rows` animation; grain texture opacity tuned per section.

**Addresses (from FEATURES.md):** Typography scale (P1), enhanced hover transitions (P1), section visual separation (P1), animated gradient background (P2), SVG geometry accents (P2), FAQ accordion (P2).

**Avoids:** Pitfall 5 (layout thrashing — CSS animations are compositor-only); Pitfall 7 (over-animation — these are calm background effects).

**Research flag:** Standard patterns — CSS gradient mesh and SVG animation are well-documented. No additional research needed.

### Phase 3: Core GSAP Animations

**Rationale:** With foundation in place and CSS polish shipped, the GSAP animation layer can be added section by section. The hero entrance sequence is the single highest-impact feature and should be first within this phase. The generic `AnimatedSection` wrapper unlocks four sections simultaneously. Then section-specific islands for the dark section, callout, and final CTA.

**Delivers:** `AnimatedHero` with choreographed entrance (badge -> SplitText headline -> description -> CTAs in ~1.4s); `AnimatedSection` generic wrapper with scroll-triggered reveals and child stagger; scroll-triggered reveals on all eight sections; parallax on hero orbs and decorative geometry; dark section atmospheric entry with GSAP-driven glow pulses; scroll-progress indicator.

**Addresses (from FEATURES.md):** Scroll-triggered reveals (P1), hero entrance (P1), SplitText text reveals (P1), staggered section choreography (P2), parallax depth (P2), dark section atmosphere (P2), scroll-progress indicator (P2).

**Avoids:** Pitfall 5 (use `useGSAP` everywhere, never raw `useEffect`); Pitfall 7 (enforce 2-4 hero moments rule, animation budget review before this phase ends).

**Research flag:** Needs phase research for SplitText 3.13+ masking feature specifically (verify the built-in overflow clipping behavior with latest API), and for the Lenis + ScrollTrigger ticker sync on Next.js 14 specifically. The core patterns are HIGH confidence but implementation details warrant verification with `use_mcp_tool context7` before starting.

### Phase 4: Micro-Interactions and Polish

**Rationale:** Micro-interactions (magnetic buttons, card tilt) are independent of scroll animations and require per-element Client Components. They belong last because: (a) they are P3 features, (b) they require mobile testing and edge-case handling not needed for scroll animations, and (c) over-animation risk is highest when adding these — a full-page review is needed first.

**Delivers:** `MagneticButton` with 8-12px max displacement, `gsap.quickTo()` for 60fps tracking, disabled on touch devices; `AnimatedCard` with `perspective: 800px` tilt and cursor-following gradient sheen; full-page animation audit (remove bottom 50% by impact); navigation round-trip memory test; Lighthouse audit targeting 90+ performance, CLS < 0.1; reduced-motion end-to-end verification against the checklist from PITFALLS.md.

**Addresses (from FEATURES.md):** Magnetic buttons (P3), card tilt (P3), plus cross-cutting quality of all prior phases.

**Avoids:** Pitfall 7 (over-animation — this is the dedicated removal phase as much as an addition phase); Pitfall 4 (navigation round-trip verification); hover effects on touch devices (gate with `@media (hover: hover)`).

**Research flag:** Standard patterns for magnetic buttons (well-documented on Codrops and community). Card tilt needs mobile GPU performance verification — check GPU layer count with Chrome Layers panel before shipping.

### Phase Ordering Rationale

- Foundation before everything because GSAP registration, animation CSS initial states, and Lenis sync are hard dependencies for all animation code.
- CSS-only pass before GSAP because it delivers visible value with zero risk, validates visual direction, and is fully independent.
- Hero animation first within Phase 3 because it is the highest-impact feature and the "one signature moment" the design targets.
- Micro-interactions last because they are P3 features that require a stable full-page animation system to audit against and pose the highest over-animation risk.
- This order mirrors the architecture file's explicit "Build Order (Dependency Chain)" with 6 phases collapsed into 4 roadmap phases.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (GSAP Animations):** SplitText 3.13+ built-in masking API — verify current API shape; Lenis `ReactLenis` vs manual `new Lenis()` approach — two patterns exist in docs, confirm which is correct for Next.js 14 App Router.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Official GSAP + Next.js docs cover all patterns at HIGH confidence. Implementation is straightforward.
- **Phase 2 (CSS Polish):** All CSS techniques are standard, well-documented, no library-specific gotchas.
- **Phase 4 (Micro-interactions):** Magnetic button and card tilt are well-documented patterns. Verify GPU performance empirically rather than through research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via Context7 + official npm + official docs. Versions pinned and confirmed 2026-02-27. |
| Features | HIGH | Competitor analysis cross-references Apple, Linear, Stripe, Vercel. Feature prioritization grounded in established premium design patterns. Anti-features backed by documented UX failures. |
| Architecture | HIGH | Client Component Islands pattern verified in official Next.js docs + GSAP React docs + real-world Awwwards tutorials. Code examples in ARCHITECTURE.md are production-ready. |
| Pitfalls | HIGH | 7 critical pitfalls documented with official source references. Context7 + GSAP community forums + web.dev case studies. Recovery strategies and phase mappings included. |

**Overall confidence:** HIGH

### Gaps to Address

- **Lenis provider pattern:** Two different Lenis React integration patterns appear in docs (`ReactLenis` component vs manual `new Lenis()` in `useEffect`). Both claim to be correct. Validate the correct approach for Next.js 14 strict mode before Phase 1 implementation. The STACK.md uses `ReactLenis` from `lenis/react`; ARCHITECTURE.md uses manual `new Lenis()`. Reconcile before writing `SmoothScrollProvider`.

- **SplitText 3.13+ masking feature:** FEATURES.md notes that SplitText 3.13+ handles overflow clipping automatically without manual wrapper divs. Verify the exact API surface (property name, how to opt in) from the current GSAP docs before Phase 3 starts. This affects how `AnimatedHero` text reveals are implemented.

- **Mobile performance budget for card tilt:** `AnimatedCard` with `perspective` and `rotateX/Y` transforms can cause GPU layer explosion on mobile. No mobile-specific performance data in research. Establish a test device and GPU layer budget (< 15 promoted layers during scroll) before shipping Phase 4.

- **Lenis on `prefers-reduced-motion`:** The `SmoothScrollProvider` should skip Lenis initialization when the user prefers reduced motion. The pattern is mentioned in ARCHITECTURE.md but not implemented in the provided code example. Confirm the check goes in `useEffect` before Lenis construction.

## Sources

### Primary — HIGH Confidence
- GSAP React Documentation (Context7 `/llmstxt/gsap_llms_txt`) — `useGSAP` hook, SSR safety, strict mode, cleanup, plugin registration
- GSAP ScrollTrigger Official Docs (gsap.com/docs/v3/Plugins/ScrollTrigger) — pin, scrub, matchMedia, invalidateOnRefresh, callbacks
- GSAP SplitText Official Docs (gsap.com/docs/v3/Plugins/SplitText) — character/word/line splitting, masking, revert
- Lenis Documentation (Context7 `/darkroomengineering/lenis`) — GSAP ticker integration, ReactLenis, autoRaf
- Next.js 14 App Router composition patterns — official docs on Server/Client component children composition
- GSAP pricing (gsap.com/pricing/) — confirmed 100% free as of 2025
- npm: gsap@3.14.2, @gsap/react@2.1.2, lenis@1.3.17 — version verification 2026-02-27

### Secondary — MEDIUM Confidence
- Awwwards Landing Page Tutorial (Olivier Larose) — real-world Next.js + GSAP + Lenis pattern
- Codrops: SplitText + MorphSVG creative demos (2025) — text reveal techniques
- Codrops: 7 Must-Know GSAP Animation Tips (2025) — production animation patterns
- Motion (Framer Motion) official docs — `useScroll` capabilities (evaluated and rejected)
- GSAP vs Motion comparison (motion.dev) — bundle size, scroll API limitations
- Smooth Scroll Comparison (Zun Creative) — Lenis vs ScrollSmoother analysis
- W3C WCAG 2.1 SC 2.3.3 — animation from interactions accessibility requirement
- web.dev: Optimize CLS — animation-caused layout shift prevention
- NN/g: Animation Duration — timing guidelines (100-300ms micro, 300-800ms reveals)

### Tertiary — LOW Confidence (needs validation)
- Medium: Over-animation and conversion rates (2026) — directional guidance on animation budgets; not controlled study

---
*Research completed: 2026-02-27*
*Ready for roadmap: yes*
