# Phase 1: Motion Foundation - Research

**Researched:** 2026-02-27
**Domain:** GSAP + Lenis animation infrastructure for Next.js 14 App Router
**Confidence:** HIGH

## Summary

Phase 1 installs the animation stack (GSAP 3.14.2, @gsap/react 2.1.2, Lenis 1.3.17), establishes the Client Component islands architecture around the existing Server Component page, creates CSS initial states for all elements that will animate in later phases, and implements `prefers-reduced-motion` support. The page must render identically to today after this phase -- zero visual change for users without reduced-motion preference, and full content visibility for users with reduced-motion enabled.

The core technical challenge is threading the Client/Server Component boundary correctly: `page.tsx` stays a Server Component, but animated sections need thin Client Component wrappers that accept children as `React.ReactNode`. GSAP plugin registration must happen exactly once via a module-level singleton. Lenis smooth scroll must sync with GSAP's ticker so ScrollTrigger reads the correct scroll position.

**Primary recommendation:** Build in strict dependency order -- (1) GSAP registration singleton, (2) CSS initial states file, (3) SmoothScrollProvider with Lenis+GSAP ticker sync, (4) thin AnimatedSection wrappers in page.tsx, (5) reduced-motion verification. The page must look identical before and after -- this phase is infrastructure only.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- GSAP 3.14.2 + @gsap/react 2.1.2 for animation engine
- ScrollTrigger + SplitText plugins (now free post-Webflow acquisition)
- Lenis 1.3.17 for smooth scroll (NOT GSAP ScrollSmoother -- conflicts with existing .landing-scope CSS)
- Total bundle: ~29KB gzipped
- Lenis active on desktop only -- disable on touch devices via matchMedia
- Sync Lenis with GSAP ticker for ScrollTrigger compatibility
- Keep native scroll on mobile (don't fight native behavior)
- page.tsx stays Server Component -- no changes to the page shell
- Create thin Client Component wrappers (AnimatedSection, SmoothScrollProvider)
- Each animated section becomes an island that accepts children as React.ReactNode
- No React Context for animation state -- ScrollTrigger's global registry handles coordination
- Single gsap-registration.ts file at module scope for plugin registration
- All islands import this as side-effect -- ES module semantics guarantee single execution
- Always use useGSAP() hook, never raw useEffect for animation code
- New landing-animations.css file (separate from landing-home.css)
- Set opacity: 0, transform: translateY(24px) on elements that will animate in
- prefers-reduced-motion media query resets all initial states to visible

### Claude's Discretion
- Exact file organization for animation utilities
- Whether to create a shared hooks file or co-locate with components
- Lenis configuration parameters (lerp, duration, etc.)
- Exact Client Component wrapper API design

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | GSAP 3.14 + ScrollTrigger + SplitText + @gsap/react installed and configured for Next.js 14 App Router | Standard Stack section: exact packages, versions, install command. Architecture Pattern 2: module-level registration singleton. |
| FOUND-02 | Lenis smooth scroll integrated with ScrollTrigger via ticker sync | Architecture Pattern 3: SmoothScrollProvider with two integration approaches (ReactLenis vs manual). Lenis config recommendations. Desktop-only via matchMedia. |
| FOUND-03 | Client Component islands architecture -- page.tsx stays Server Component, animated sections wrapped in thin Client Components | Architecture Pattern 1: islands with Server children. Current page.tsx analysis: 9 wrappable sections identified. Project structure recommendation. |
| FOUND-04 | CSS initial states in landing-animations.css to prevent FOUC on all animated elements | CSS Initial States section: exact selectors from current page.tsx mapped, specificity chain using .landing-scope .shell prefix. |
| FOUND-05 | prefers-reduced-motion support via gsap.matchMedia() -- all animations disabled gracefully | Reduced Motion section: CSS media query resets + JS gsap.matchMedia() pattern + Lenis skip on reduced-motion. |
| FOUND-06 | GSAP plugin registration singleton (gsap-registration.ts) to prevent duplicate registration | Architecture Pattern 2: module-level singleton with re-exports. Anti-pattern warning about per-component registration. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 | Animation engine -- timelines, tweens, scroll-driven choreography | Industry standard. 100% free post-Webflow acquisition. Direct DOM manipulation bypasses React diffing. **Confidence: HIGH** (Context7 + npm verified) |
| @gsap/react | 2.1.2 | React integration -- useGSAP() hook for safe animation lifecycle | Official hook with auto-cleanup via gsap.context(). SSR-safe. Handles strict mode. **Confidence: HIGH** (Context7 verified) |
| ScrollTrigger | (bundled with gsap) | Scroll-driven animation triggers, scrub, pin | Bundled with gsap package. Import from `gsap/ScrollTrigger`. Register once. **Confidence: HIGH** |
| SplitText | (bundled with gsap) | Character/word/line splitting for text reveals | Bundled with gsap package. Import from `gsap/SplitText`. Now free. Needed in later phases but register in Phase 1. **Confidence: HIGH** |
| lenis | 1.3.17 | Smooth scroll -- buttery scroll feel with native DOM | ~4KB gzipped. Keeps native DOM (unlike ScrollSmoother). React bindings at `lenis/react`. **Confidence: HIGH** (Context7 verified) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss-animate | 1.0.7 (already installed) | Utility classes for simple CSS animations | Keep for simple utility animations. Not for scroll-driven work. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lenis (smooth scroll) | GSAP ScrollSmoother | ScrollSmoother wraps DOM in fixed container -- conflicts with existing .landing-scope architecture. **Decision: Lenis (locked).** |
| Manual `new Lenis()` | `ReactLenis` from `lenis/react` | ReactLenis is a convenience wrapper. Manual gives more control over ticker sync. **Recommendation: Use manual `new Lenis()` -- see Architecture Patterns.** |

**Installation:**
```bash
npm install gsap@3.14.2 @gsap/react@2.1.2 lenis@1.3.17
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/[locale]/(landing)/
├── layout.tsx                       # Server -- font loading, CSS, .landing-scope (EXISTS, no changes)
├── page.tsx                         # Server -- page shell, wraps sections in Client islands (EXISTS, modify)
├── landing-atlas.css                # Shared landing design system (EXISTS, no changes)
├── landing-home.css                 # Home page styles (EXISTS, no changes)
├── landing-animations.css           # NEW -- animation initial states + reduced-motion overrides
├── _components/                     # NEW -- landing-specific animation components
│   ├── gsap-registration.ts        # Module -- one-time GSAP plugin registration
│   ├── smooth-scroll-provider.tsx   # Client -- Lenis + GSAP ticker sync
│   └── animated-section.tsx         # Client -- thin wrapper, passes children through unchanged
```

### Pattern 1: Client Component Islands with Server Children (FOUND-03)

**What:** Wrap animated sections in thin Client Components that accept `children: React.ReactNode`. The page (Server Component) composes these wrappers around static content. In Phase 1, these wrappers render children unchanged -- no animation logic yet.

**When to use:** Every section that will later receive scroll-triggered animation.

**Critical rule:** Never import a Server Component inside a Client Component. Always pass as `children` from the Server Component parent.

**Phase 1 implementation (identity wrapper -- no animation):**
```typescript
// _components/animated-section.tsx
'use client';

import { useRef } from 'react';
import './gsap-registration'; // side-effect import

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Phase 1: no animation logic -- just the wrapper shell
  // Later phases will add useGSAP() here

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
```

**Page composition (Server Component stays Server Component):**
```typescript
// page.tsx -- still NO "use client" directive
import { AnimatedSection } from './_components/animated-section';
import { SmoothScrollProvider } from './_components/smooth-scroll-provider';

export default function LandingHomePage() {
  return (
    <SmoothScrollProvider>
      {/* ... hero, metrics ... */}
      <AnimatedSection className="h-sect">
        {/* Server-rendered children passed through */}
      </AnimatedSection>
    </SmoothScrollProvider>
  );
}
```

**Sections to wrap (from current page.tsx):**
| Section | Current class(es) | Wrapper needed |
|---------|-------------------|----------------|
| Hero | `.h-hero` | `AnimatedSection` (will become `AnimatedHero` in Phase 5) |
| Metrics | `.h-metrics` | `AnimatedSection` |
| Services | `.h-sect` (id="services") | `AnimatedSection` |
| Process | `.h-sect` (id="process") | `AnimatedSection` |
| Outcomes | `.h-dark-sect` (id="outcomes") | `AnimatedSection` (will become `AnimatedDarkSection` in Phase 4) |
| Pricing | `.h-sect` | `AnimatedSection` |
| AI Callout | `.h-callout` | `AnimatedSection` |
| FAQ | `.h-sect` | `AnimatedSection` |
| Final CTA | `.h-final` | `AnimatedSection` |

**Key insight for Phase 1:** All 9 sections use the same generic `AnimatedSection` wrapper. Specialized wrappers (AnimatedHero, AnimatedDarkSection, etc.) are created in later phases when animation logic is added. Phase 1 only needs one wrapper component.

### Pattern 2: Module-Level GSAP Registration Singleton (FOUND-06)

**What:** A plain `.ts` file that registers GSAP plugins at module scope. Imported as a side-effect by every Client Component. ES module semantics guarantee it runs exactly once per session.

**Example:**
```typescript
// _components/gsap-registration.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Register all plugins once. ES module singleton guarantees single execution.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Re-export for convenience -- islands import from here instead of 'gsap' directly
export { gsap, ScrollTrigger, SplitText };
```

**Why register SplitText now:** Even though SplitText is used in Phase 5, registering it here avoids future changes to this file. Registration is cheap (no-op if not used).

### Pattern 3: Smooth Scroll Provider -- Lenis + GSAP Ticker Sync (FOUND-02)

**What:** A Client Component that initializes Lenis for smooth scrolling and synchronizes it with GSAP's ticker so ScrollTrigger positions stay accurate.

**Reconciliation of two patterns (STATE.md flagged this gap):**

The project-level research found two approaches: `ReactLenis` component from `lenis/react` and manual `new Lenis()`. After analysis:

**Recommendation: Use manual `new Lenis()` approach.**

Rationale:
- ReactLenis is a convenience wrapper but its ref-based access (`lenisRef.current?.lenis`) adds indirection
- Manual approach gives direct control over ticker sync and cleanup
- Manual approach is easier to gate with matchMedia for desktop-only
- The manual pattern is what the GSAP community recommends for ScrollTrigger integration

```typescript
// _components/smooth-scroll-provider.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-registration';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Desktop-only: skip Lenis on touch devices and reduced-motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,            // interpolation factor (0.05 = smoother/slower, 0.15 = snappier)
      smoothWheel: true,     // enable smooth scrolling for mouse wheel
      syncTouch: false,      // do NOT override native touch scroll
    });
    lenisRef.current = lenis;

    // Connect Lenis scroll updates to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (single RAF loop)
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

**Lenis configuration parameters (Claude's Discretion):**
| Parameter | Recommended | Range | Notes |
|-----------|-------------|-------|-------|
| `lerp` | 0.1 | 0.05-0.15 | 0.1 is the Lenis default. Lower = smoother/floatier, higher = snappier. Start at default, tune by feel. |
| `smoothWheel` | true | boolean | Enables smooth scrolling for mouse wheel events. |
| `syncTouch` | false | boolean | Must be false. Native touch scroll is better on mobile. |
| `duration` | (omit) | 0.6-1.6 | Alternative to lerp. If set, overrides lerp with duration-based easing. Omit to use lerp. |

### Anti-Patterns to Avoid

- **Making page.tsx a Client Component:** Adding `"use client"` to page.tsx forces all content into the client bundle, destroying SSR. The page MUST stay a Server Component.
- **Registering plugins inside each component:** While GSAP handles duplicate registration gracefully, it signals bad architecture. Use the singleton pattern.
- **Sharing animation state via React Context:** Causes 60fps re-renders. ScrollTrigger's global registry handles coordination.
- **Using raw useEffect for GSAP code:** Breaks in React 18 strict mode. Always use `useGSAP()` hook.
- **Importing Server Components inside Client Components:** They silently become Client Components. Always pass as `children`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scrolling | Custom `requestAnimationFrame` scroll interpolation | Lenis | Edge cases with focus management, browser find, hash links, accessibility |
| Scroll-triggered animation | IntersectionObserver + custom animation | GSAP ScrollTrigger | Cannot scrub, pin, or choreograph timelines with IO |
| GSAP cleanup in React | Manual `useEffect` + `.kill()` calls | `useGSAP()` hook from @gsap/react | Strict mode double-mount breaks manual cleanup; hook handles gsap.context() automatically |
| Plugin registration | Per-component `gsap.registerPlugin()` | Module-level singleton file | Race conditions with dynamic imports; ES module singleton is guaranteed |
| Reduced motion detection | Manual `window.matchMedia` in each component | `gsap.matchMedia()` | GSAP's matchMedia auto-reverts animations when media query changes; manual checks don't |

## Common Pitfalls

### Pitfall 1: FOUC on Animated Elements (FOUND-04 critical)
**What goes wrong:** Elements render at full opacity in server HTML, flash visible, snap to opacity: 0 when GSAP initializes, then animate in. User sees: content -> blank -> fade in.
**Why it happens:** Server-rendered CSS doesn't match GSAP's "from" state. Gap between HTML paint and JS initialization.
**How to avoid:** Set CSS initial states in `landing-animations.css` that match GSAP's future `from()` values. Elements start hidden in CSS; GSAP animates them to visible. With `prefers-reduced-motion`, CSS resets to visible immediately.
**Warning signs:** Content flashes on load; Lighthouse CLS > 0.1.

### Pitfall 2: Blank Page for No-JS / Slow-JS Users
**What goes wrong:** CSS sets `opacity: 0` on sections. JS fails to load or loads slowly. User sees blank page.
**How to avoid:** The `prefers-reduced-motion` query handles accessibility users. For slow-JS, GSAP will eventually load and reveal content. For no-JS, add a `<noscript>` style tag in layout.tsx that resets opacity. Alternatively, use a CSS-only fallback with `@supports` or a class-based approach.
**Warning signs:** Blank sections on Slow 3G throttle test.

### Pitfall 3: Hydration Mismatch from Extra Wrapper Divs
**What goes wrong:** Client Component wrappers add `<div>` elements that don't exist in the server-rendered HTML, causing React hydration errors.
**How to avoid:** The wrapper div IS rendered on the server (it's part of the Client Component's JSX). This is fine as long as the wrapper doesn't conditionally render different HTML server vs client. Never use `typeof window` checks in render logic.
**Warning signs:** Console "Hydration failed" errors.

### Pitfall 4: Lenis Breaking Browser Find-in-Page
**What goes wrong:** Lenis intercepts scroll events, which can interfere with browser Ctrl+F find-in-page scroll-to-result behavior.
**How to avoid:** Lenis 1.3.x handles this correctly by default. The `smoothWheel` option only affects wheel events, not programmatic scrolls. Verify with manual testing.
**Warning signs:** Find-in-page doesn't scroll to highlighted result.

### Pitfall 5: CSS Specificity Conflicts with Existing Styles
**What goes wrong:** New `landing-animations.css` selectors conflict with or override existing `landing-home.css` styles.
**How to avoid:** Use the same specificity chain as existing CSS: `.landing-scope .shell .h-*`. Import `landing-animations.css` AFTER `landing-home.css` in layout.tsx so animation styles cascade correctly. Only set `opacity` and `transform` in animation CSS -- never layout properties.
**Warning signs:** Sections displaced or styled differently after adding animation CSS.

## Code Examples

### CSS Initial States (FOUND-04)

The following selectors target every element in `page.tsx` that will receive animation in later phases. In Phase 1, these are set to their "pre-animation" state (hidden/translated). GSAP will later animate FROM these values TO visible.

```css
/* landing-animations.css */

/* ── Initial states for scroll-revealed sections ──
   These match the GSAP from() values that will be set in later phases.
   Elements start invisible; GSAP reveals them on scroll. */

.landing-scope .shell .h-hero > * {
  opacity: 0;
  transform: translateY(24px);
}

.landing-scope .shell .h-metrics {
  opacity: 0;
  transform: translateY(24px);
}

.landing-scope .shell .h-sect {
  opacity: 0;
  transform: translateY(24px);
}

.landing-scope .shell .h-dark-sect {
  opacity: 0;
  transform: translateY(24px);
}

.landing-scope .shell .h-callout {
  opacity: 0;
  transform: translateY(24px);
}

.landing-scope .shell .h-final {
  opacity: 0;
  transform: translateY(24px);
}

/* ── Hero orbs start scaled down (will scale in during hero entrance) ── */
.landing-scope .shell .h-hero-orb {
  opacity: 0;
  transform: scale(0.8);
}

/* ── Reduced motion: show everything immediately ──
   Users with prefers-reduced-motion see full content, no animation, no FOUC. */
@media (prefers-reduced-motion: reduce) {
  .landing-scope .shell .h-hero > *,
  .landing-scope .shell .h-metrics,
  .landing-scope .shell .h-sect,
  .landing-scope .shell .h-dark-sect,
  .landing-scope .shell .h-callout,
  .landing-scope .shell .h-final,
  .landing-scope .shell .h-hero-orb {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
}
```

**Important:** The `translateY(24px)` value must match the GSAP `from({ y: 24 })` value used in later phases. If the planner changes the animation distance, both CSS and GSAP must update together.

### GSAP Registration Singleton (FOUND-06)

```typescript
// _components/gsap-registration.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText };
```

### Layout.tsx CSS Import Addition

```typescript
// layout.tsx -- add landing-animations.css import AFTER landing-home.css
import './landing-atlas.css';
import './landing-home.css';
import './landing-animations.css'; // NEW -- animation initial states
```

### Reduced Motion JS Pattern (FOUND-05)

```typescript
// Inside any useGSAP callback in later phases:
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Full animation code here
    gsap.from(containerRef.current, {
      y: 24, opacity: 0, duration: 0.8,
      scrollTrigger: { trigger: containerRef.current, start: 'top 85%' }
    });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    // Ensure elements are visible (CSS handles this, but belt-and-suspenders)
    gsap.set(containerRef.current, { clearProps: 'all' });
  });
}, { scope: containerRef });
```

## Current Page Structure Analysis

**File:** `src/app/[locale]/(landing)/page.tsx` (Server Component, 415 lines)

The page exports `LandingHomePage` as default. It renders:
1. `div.h-grain` -- ambient grain overlay (fixed, decorative, no animation needed)
2. `header.h-nav` -- floating navigation (already has CSS animation via `hm-slideDown`)
3. `main.shell` -- contains all content sections:
   - `section.h-hero` -- hero with orbs, badge, h1, description, CTAs
   - `section.h-metrics` -- 4 metric cards
   - `section#services.h-sect` -- services bento grid (6 cards)
   - `section#process.h-sect` -- process timeline (4 steps)
   - `section#outcomes.h-dark-sect` -- dark outcomes section (4 outcome cards)
   - `section.h-sect` -- pricing (3 plan cards)
   - `section.h-callout` -- AI engine callout
   - `section.h-sect` -- FAQ (4 details/summary items)
   - `section.h-final` -- final CTA with glow
4. `footer.h-foot` -- footer (no animation needed)

**Layout:** `src/app/[locale]/(landing)/layout.tsx` (Server Component, 56 lines)
- Loads 5 Google fonts with `display: 'swap'`
- Wraps children in `div.landing-scope` with font CSS variables
- Imports `landing-atlas.css` and `landing-home.css`

**CSS:** `landing-home.css` uses `.landing-scope .shell .h-*` specificity chain consistently. All animation CSS must follow this pattern.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@studio-freight/lenis` package | `lenis` package (darkroomengineering) | 2024 | Old package deprecated. Must use `npm install lenis`. |
| GSAP Club plugins ($99/yr) | All GSAP plugins free | 2024 (Webflow acquisition) | ScrollTrigger, SplitText, MorphSVG, DrawSVG all free. No license concerns. |
| `useEffect` + manual GSAP cleanup | `useGSAP()` hook from @gsap/react | 2023 | Hook handles gsap.context() cleanup automatically. Required for React 18 strict mode. |
| ScrollSmoother for smooth scroll | Lenis preferred | 2023-2024 | ScrollSmoother wraps DOM in fixed container. Community moved to Lenis for native DOM. |

**Deprecated/outdated:**
- `@studio-freight/lenis`: Renamed to `lenis` under `darkroomengineering` org. Old package no longer updated.
- Raw `useEffect` for GSAP: Replaced by `useGSAP()` hook. Manual cleanup is error-prone in strict mode.

## Open Questions

1. **No-JS fallback strategy**
   - What we know: CSS `opacity: 0` hides content. `prefers-reduced-motion` resets it. But a user without reduced-motion AND without JS sees blank sections.
   - What's unclear: How important is no-JS support for this landing page? Is the audience expected to have JS enabled?
   - Recommendation: Add a `<noscript><style>` block in layout.tsx that resets opacity. Low effort, covers the edge case. The planner should include this as a task.

2. **Lenis + hash link scrolling**
   - What we know: Page has hash links (`#services`, `#process`, `#outcomes`). Lenis should handle smooth scrolling to these anchors.
   - What's unclear: Does Lenis 1.3.17 handle hash links on initial page load (e.g., user visits `/#services` directly)?
   - Recommendation: Test during implementation. Lenis docs indicate it handles `scrollTo` for anchors, but verify with the actual hash links in the nav.

3. **SmoothScrollProvider placement**
   - What we know: It wraps the entire page content. But should it wrap inside `main.shell` or around the entire fragment including nav and footer?
   - What's unclear: Lenis affects all scrollable content. The nav is `position: fixed` so it's unaffected. Footer should scroll normally.
   - Recommendation: Wrap at the top level of page.tsx's return (around the fragment). Lenis operates on the document's scroll, not a specific container, when using the default `wrapper: window` option.

## Sources

### Primary (HIGH confidence)
- [GSAP React docs (Context7)](https://gsap.com/resources/React/) -- useGSAP hook, strict mode, SSR safety, cleanup patterns
- [ScrollTrigger docs (Context7)](https://gsap.com/docs/v3/Plugins/ScrollTrigger) -- trigger config, matchMedia, refresh
- [Lenis docs (Context7)](https://github.com/darkroomengineering/lenis) -- GSAP ticker sync, ReactLenis vs manual, configuration
- [Next.js 14 composition patterns](https://github.com/vercel/next.js/blob/v14.3.0-canary.87/docs/02-app/01-building-your-application/03-rendering/04-composition-patterns.mdx) -- Server/Client Component boundaries
- npm registry: gsap@3.14.2, @gsap/react@2.1.2, lenis@1.3.17 -- versions verified 2026-02-27

### Secondary (MEDIUM confidence)
- [GSAP forum: plugin registration in App Router](https://gsap.com/community/forums/topic/40634-good-way-to-register-gsap-plugins-in-nextjs-app-router-and-how-many-many-times-we-can-do-it/) -- module-level singleton confirmed safe
- [Awwwards tutorial: Next.js + GSAP + Lenis](https://blog.olivierlarose.com/tutorials/awwwards-landing-page) -- real-world architecture pattern
- Project-level research files: STACK.md, ARCHITECTURE.md, PITFALLS.md -- cross-verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via Context7 + npm, patterns from official docs
- Architecture: HIGH -- Client Component islands pattern from official Next.js docs, GSAP registration from official forum
- Pitfalls: HIGH -- FOUC, hydration, strict mode pitfalls all documented in official GSAP React docs and project-level PITFALLS.md

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable libraries, unlikely to change)
