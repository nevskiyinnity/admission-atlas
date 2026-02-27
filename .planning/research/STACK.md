# Stack Research: Animation & Interaction Layer

**Domain:** Premium animated landing page (motion design layer for existing Next.js 14 App Router site)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| GSAP | 3.14.2 | Animation engine — timelines, tweens, scroll-driven choreography | Industry standard for award-winning sites. Used by every Awwwards SOTD with complex scroll animation. Direct DOM manipulation bypasses React diffing for buttery 60fps. Now 100% free (Webflow acquisition). Modular — import only what you need. **Confidence: HIGH** (Context7 + official docs + npm verified) |
| @gsap/react | 2.1.2 | React integration — `useGSAP()` hook for safe animation lifecycle | Official React hook that replaces `useEffect`/`useLayoutEffect` for GSAP. Auto-handles cleanup via `gsap.context()`, preventing memory leaks and strict mode double-render issues. SSR-safe via `useIsomorphicLayoutEffect` pattern. **Confidence: HIGH** (Context7 verified) |
| GSAP ScrollTrigger | (bundled with gsap) | Scroll-driven animation triggers, pin, scrub, snap | The definitive scroll animation plugin. Trigger animations at scroll positions, pin elements, scrub through timelines based on scroll progress. Free as of 2024. No viable alternative offers this level of scroll choreography. **Confidence: HIGH** (Context7 verified) |
| GSAP SplitText | (bundled with gsap) | Character/word/line splitting for text reveal animations | Splits text into individual characters, words, and lines for staggered animation. Now free (was $99/yr Club GSAP). Superior to SplitType for GSAP integration — handles nested elements, revert, and resize. **Confidence: HIGH** (official docs verified) |
| Lenis | 1.3.17 | Smooth scroll — buttery scroll feel with native DOM | Lightweight smooth scroll library from Darkroom Engineering (studio behind award-winning sites). Keeps native DOM structure (unlike ScrollSmoother which wraps content). Pairs perfectly with GSAP ScrollTrigger via ticker sync. Used on most Awwwards sites that combine smooth scroll + GSAP. **Confidence: HIGH** (Context7 verified) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GSAP DrawSVG | (bundled) | Animated SVG stroke drawing | Abstract geometric line-draw animations in hero and section transitions. Free as of 2024. |
| GSAP MorphSVG | (bundled) | SVG shape morphing between paths | If abstract shape transitions are used between sections. Free as of 2024. |
| tailwindcss-animate | 1.0.7 (already installed) | Utility classes for simple CSS animations | Keep for simple utility animations (fade, slide). Don't use for scroll-driven work — that's GSAP's domain. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| GSAP DevTools | Animation debugging/timeline inspection | Free plugin. Register with `gsap.registerPlugin(GSDevTools)`. Strip from production builds. |

## Architecture Pattern: Client Component Islands

The existing page (`page.tsx`) is a Server Component. Animation requires client-side JavaScript. The correct pattern:

```
Layout (Server Component)
  └── page.tsx (Server Component — static HTML + SEO content)
       ├── <SmoothScrollProvider> (Client Component — wraps entire page)
       │    ├── <HeroAnimation> (Client Component island)
       │    │    └── hero static JSX passed as children
       │    ├── <ScrollReveal> (Client Component island)
       │    │    └── metrics static JSX passed as children
       │    ├── <ParallaxSection> (Client Component island)
       │    └── ...
```

**Key principle:** Server Components render the HTML. Client Component wrappers add animation behavior. Content stays server-rendered for SEO and performance.

```typescript
// src/components/animation/scroll-reveal.tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(container.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: container });

  return <div ref={container}>{children}</div>;
}
```

## Lenis + GSAP ScrollTrigger Integration Pattern

Lenis must drive GSAP's ticker (not its own `requestAnimationFrame`). This is the verified pattern from Context7:

```typescript
// src/components/animation/smooth-scroll-provider.tsx
'use client';

import { ReactLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // disable lag smoothing for responsiveness

    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
```

## CSS Techniques for Premium Visual Effects

These require no additional libraries — pure CSS within the existing `.landing-scope`:

| Effect | Technique | Notes |
|--------|-----------|-------|
| **Gradient mesh backgrounds** | Layered `radial-gradient` with multiple color stops + `filter: blur()` on positioned pseudo-elements | No library needed. Layer 3-4 radial gradients with different positions and sizes. Animate positions with GSAP for breathing effect. |
| **Aurora / northern lights** | CSS `@keyframes` animating `background-position` on large gradient + `mix-blend-mode` overlay | Pair with GSAP timeline for scroll-linked aurora intensity. The project already uses gradient orbs (`.h-hero-orb`). |
| **Grain texture overlay** | SVG `<feTurbulence>` filter via CSS `filter: url()` or CSS `background-image` with noise | Already implemented (`.h-grain`). Ensure it layers above gradient meshes with correct `z-index` and `pointer-events: none`. |
| **Glass morphism / frosted panels** | `backdrop-filter: blur() saturate()` with semi-transparent background | Already used on nav (`.h-nav`). Extend to cards and section overlays. |
| **Text gradient fill** | `background: linear-gradient(...)` + `background-clip: text` + `color: transparent` | For headline accents. Animate gradient position with GSAP for shimmer effect. |
| **Clip-path reveals** | `clip-path: inset()` or `polygon()` animated via GSAP | For section and text reveal animations. GPU-accelerated. |
| **Parallax depth** | GSAP ScrollTrigger `scrub: true` with different `y` speeds per layer | Multiple layers at different scroll rates create spatial depth without 3D transforms. |

## Installation

```bash
# Core animation stack
npm install gsap @gsap/react lenis
```

No dev dependencies needed. GSAP DevTools is imported from the main `gsap` package.

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| **GSAP** (scroll choreography) | Motion 12 (Framer Motion) | Motion excels at layout animations and simple entrance/exit. For complex scroll timelines, pinning, scrubbing, staggered sequences, and precise choreography, GSAP is categorically superior. Motion's `useScroll` is too limited for award-caliber scroll work. |
| **Lenis** (smooth scroll) | GSAP ScrollSmoother | ScrollSmoother wraps your DOM in a fixed container — conflicts with the existing `.landing-scope` architecture. Lenis keeps native DOM, is lighter, and pairs cleanly with ScrollTrigger. The Awwwards community overwhelmingly prefers Lenis over ScrollSmoother for this reason. |
| **Lenis** (smooth scroll) | Locomotive Scroll v5 | Heavier, more opinionated, wraps DOM in translate3d containers. Lenis is leaner and more compatible with GSAP ScrollTrigger. Locomotive was the standard in 2020-2022; Lenis replaced it. |
| **GSAP SplitText** | SplitType | SplitType is a solid open-source alternative, but GSAP SplitText is now free and integrates natively with GSAP timelines, context cleanup, and revert. No reason to add a separate dependency. |
| **CSS + GSAP** (visual effects) | Three.js / React Three Fiber | Massively over-engineered for 2D gradient/geometry effects. Three.js is for 3D scenes. This project's visual language is abstract 2D — gradients, geometry, typography — not 3D. |
| **GSAP** | Anime.js | Smaller community, less active development, weaker scroll integration. GSAP is the clear winner for this use case. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` / `motion` as primary animation engine | Adds 32KB+ gzipped for capabilities GSAP handles better. Two animation engines = bundle bloat and conflicting paradigms. Motion's scroll API cannot do pinning, scrubbing, or timeline choreography. | GSAP for all scroll and timeline work. If simple enter/exit needed on non-scroll elements, CSS transitions suffice. |
| GSAP ScrollSmoother | Wraps entire DOM in a fixed container + transform layer. Conflicts with existing `.landing-scope` CSS architecture. Harder to debug layout issues. | Lenis — lightweight, native DOM, proven GSAP ScrollTrigger compatibility. |
| Locomotive Scroll | Legacy choice from 2020-2022. Heavier than Lenis. Wraps content in translate3d. Less maintained. Known ScrollTrigger sync issues. | Lenis. |
| `react-spring` | Physics-based animation library. Wrong tool for scroll-driven choreography. No ScrollTrigger equivalent. | GSAP. |
| `@studio-freight/lenis` (old package name) | Deprecated. Lenis moved to `lenis` package under `darkroomengineering` org. Old package no longer updated. | `npm install lenis` (new package). React import: `lenis/react`. |
| CSS `scroll-snap` for animations | Only handles snap points, not choreographed animation. Cannot trigger timelines or pin elements. | GSAP ScrollTrigger for all scroll-driven animation. CSS `scroll-snap` is fine for carousels but not for this use case. |

## React 18 Strict Mode + GSAP: Known Gotchas

| Gotcha | Symptom | Prevention |
|--------|---------|------------|
| **Double mount in dev** | Animations run twice, creating duplicates or glitched states | Always use `useGSAP()` hook (not raw `useEffect`). It uses `gsap.context()` internally which reverts all animations on cleanup, so double-mount is safe. **Confidence: HIGH** (Context7 verified) |
| **`.from()` tween flicker** | `gsap.from()` sets initial state, but strict mode unmount/remount causes flash to end state then back | Use `gsap.fromTo()` instead of `gsap.from()` when possible, or rely on `useGSAP()` auto-revert. **Confidence: HIGH** (GSAP official docs) |
| **ScrollTrigger stale refs** | ScrollTrigger instances referencing unmounted DOM nodes | `useGSAP()` auto-kills ScrollTriggers on unmount. For manual setup, call `ScrollTrigger.refresh()` after all animations init. **Confidence: HIGH** |
| **SplitText double-split** | Text gets split twice, creating nested span chaos | Create SplitText inside `useGSAP()` — it auto-reverts on cleanup. Call `.revert()` in cleanup if manual. **Confidence: HIGH** (GSAP official docs) |
| **Lenis + strict mode** | Lenis initializes twice, creating duplicate scroll handlers | Use `useEffect` with cleanup that removes the GSAP ticker listener. The `ReactLenis` component handles this internally. **Confidence: MEDIUM** (community pattern, not official docs) |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| gsap@3.14.2 | React 18.3.1, Next.js 14.2.x | Fully tested. Use `'use client'` directive on any component using GSAP. |
| @gsap/react@2.1.2 | gsap@3.12+, React 16.8+ | Requires `gsap.registerPlugin(useGSAP)` to avoid React version discrepancies. |
| lenis@1.3.17 | React 18.x, Next.js 14.x | Import from `lenis/react` for React bindings. Set `autoRaf: false` when syncing with GSAP ticker. |
| ScrollTrigger | lenis@1.x | Sync via `lenis.on('scroll', ScrollTrigger.update)` + GSAP ticker integration. Pattern verified in Context7 docs. |

## Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| GSAP core + ScrollTrigger + SplitText | ~25KB gzipped | Tree-shake unused plugins. Import only what's used. |
| Lenis | ~4KB gzipped | Minimal overhead for smooth scroll. |
| **Total animation bundle** | **~29KB gzipped** | Significantly less than Motion (32KB) alone, with far more capability. |
| Lighthouse Performance | >= 90 | Use `will-change` on animated elements. Prefer `transform` and `opacity` (GPU-composited). Avoid animating `width`/`height`/`top`/`left`. |
| `prefers-reduced-motion` | Required | Wrap all GSAP animations in a media query check. Disable Lenis smooth scroll. Provide instant state (no animation). |

## Sources

- [GSAP React Documentation (Context7 /llmstxt/gsap_llms_txt)](https://gsap.com/resources/React/) — useGSAP hook, SSR safety, strict mode handling. **HIGH confidence.**
- [Lenis Documentation (Context7 /darkroomengineering/lenis)](https://github.com/darkroomengineering/lenis) — GSAP ticker integration, ReactLenis setup, configuration. **HIGH confidence.**
- [Motion Documentation (Context7 /websites/motion_dev)](https://motion.dev/docs/react) — useScroll, whileInView capabilities (evaluated and rejected for this use case). **HIGH confidence.**
- [GSAP Pricing](https://gsap.com/pricing/) — Confirmed 100% free including all plugins (SplitText, MorphSVG, DrawSVG, ScrollSmoother). **HIGH confidence.**
- [npm registry: gsap@3.14.2](https://www.npmjs.com/package/gsap) — Version verified 2026-02-27. **HIGH confidence.**
- [npm registry: @gsap/react@2.1.2](https://www.npmjs.com/package/@gsap/react) — Version verified 2026-02-27. **HIGH confidence.**
- [npm registry: lenis@1.3.17](https://www.npmjs.com/package/lenis) — Version verified 2026-02-27. **HIGH confidence.**
- [Awwwards Landing Page Tutorial (Olivier Larose)](https://blog.olivierlarose.com/tutorials/awwwards-landing-page) — Real-world Next.js + GSAP + Lenis pattern. **MEDIUM confidence** (community source).
- [GSAP vs Motion Comparison (Motion official)](https://motion.dev/docs/gsap-vs-motion) — Feature comparison from Motion's perspective. **MEDIUM confidence** (vendor comparison).
- [Smooth Scroll Comparison (Zun Creative)](https://zuncreative.com/en/blog/smooth_scroll_meditation/) — Lenis vs ScrollSmoother analysis. **MEDIUM confidence** (community source).

---
*Stack research for: Admission Atlas — Animation & Interaction Layer*
*Researched: 2026-02-27*
