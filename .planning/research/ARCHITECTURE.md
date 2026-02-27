# Architecture Research

**Domain:** Animated landing page — Next.js 14 App Router with GSAP ScrollTrigger
**Researched:** 2026-02-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
Landing Page Architecture — Hybrid Server/Client Component Model

                          SERVER SIDE (RSC)
 ┌──────────────────────────────────────────────────────────────┐
 │  LandingLayout (Server Component)                            │
 │  ├── Font loading (Instrument Serif, Plus Jakarta Sans)      │
 │  ├── CSS imports (landing-atlas.css, landing-home.css)       │
 │  └── .landing-scope wrapper div                              │
 │       │                                                      │
 │  LandingHomePage (Server Component)                          │
 │  ├── <header> Nav — pure HTML                                │
 │  ├── <main class="shell">                                    │
 │  │    ├── AnimatedHero ─────────── Client Component Island   │
 │  │    ├── AnimatedMetrics ──────── Client Component Island   │
 │  │    ├── AnimatedSection ──────── Client Component Island   │
 │  │    │   └── Services (Server children passed in)           │
 │  │    ├── AnimatedSection ──────── Client Component Island   │
 │  │    │   └── Process (Server children passed in)            │
 │  │    ├── AnimatedDarkSection ──── Client Component Island   │
 │  │    │   └── Outcomes (Server children passed in)           │
 │  │    ├── AnimatedSection ──────── Client Component Island   │
 │  │    │   └── Pricing (Server children passed in)            │
 │  │    ├── AnimatedCallout ──────── Client Component Island   │
 │  │    ├── AnimatedSection ──────── Client Component Island   │
 │  │    │   └── FAQ (Server children passed in)                │
 │  │    └── AnimatedFinalCTA ─────── Client Component Island   │
 │  └── <footer> — pure HTML                                    │
 └──────────────────────────────────────────────────────────────┘

                          CLIENT SIDE
 ┌──────────────────────────────────────────────────────────────┐
 │  SmoothScrollProvider (wraps entire page)                    │
 │  ├── Lenis instance                                          │
 │  ├── GSAP ticker sync                                        │
 │  └── ScrollTrigger integration                               │
 │                                                              │
 │  GSAPRegistration (module-level, runs once)                  │
 │  ├── gsap.registerPlugin(ScrollTrigger, useGSAP)             │
 │  └── Shared across all Client Component islands              │
 │                                                              │
 │  Per-Island Animation (useGSAP hook, scoped)                 │
 │  ├── Each island manages its own animations                  │
 │  ├── Each island has its own container ref                   │
 │  └── ScrollTrigger instances auto-scoped via useGSAP         │
 └──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `LandingLayout` (Server) | Font loading, CSS imports, `.landing-scope` wrapper | Children via props |
| `LandingHomePage` (Server) | Page structure, SEO metadata, static HTML shell | Wraps Client islands around static content |
| `SmoothScrollProvider` (Client) | Lenis smooth scroll, GSAP ticker sync, ScrollTrigger coordination | All animated islands (via scroll events) |
| `AnimatedHero` (Client) | Hero entrance sequence, parallax orbs, text reveal animations | SmoothScrollProvider (scroll position) |
| `AnimatedSection` (Client) | Generic scroll-triggered reveal wrapper with staggered children | SmoothScrollProvider (scroll position), accepts `children` |
| `AnimatedDarkSection` (Client) | Outcomes section atmosphere, glow effects, card reveals | SmoothScrollProvider (scroll position) |
| `AnimatedCallout` (Client) | AI Engine section parallax, gradient shifts | SmoothScrollProvider (scroll position) |
| `AnimatedFinalCTA` (Client) | Final CTA glow pulse, button magnetic effect | SmoothScrollProvider (scroll position) |
| `MagneticButton` (Client) | Magnetic hover effect on CTA buttons | Direct DOM events (mousemove) |
| `AnimatedCard` (Client) | Tilt effect on hover for bento/pricing cards | Direct DOM events (mousemove) |

## Recommended Project Structure

```
src/app/[locale]/(landing)/
├── layout.tsx                       # Server — font loading, CSS, .landing-scope
├── page.tsx                         # Server — page shell, composes islands
├── landing-atlas.css                # Shared landing design system (KEEP AS-IS)
├── landing-home.css                 # Home page styles (KEEP, extend)
├── landing-animations.css           # NEW — animation keyframes, states, reduced-motion
├── _components/                     # NEW — landing-specific components
│   ├── smooth-scroll-provider.tsx   # Client — Lenis + GSAP ticker sync
│   ├── gsap-registration.ts        # Module — one-time GSAP plugin registration
│   ├── animated-hero.tsx            # Client — hero entrance + parallax
│   ├── animated-section.tsx         # Client — generic scroll reveal wrapper
│   ├── animated-dark-section.tsx    # Client — outcomes atmosphere
│   ├── animated-callout.tsx         # Client — AI Engine section
│   ├── animated-final-cta.tsx       # Client — final CTA effects
│   ├── magnetic-button.tsx          # Client — magnetic hover buttons
│   └── animated-card.tsx            # Client — tilt hover cards
```

### Structure Rationale

- **`_components/`:** Underscore prefix keeps components co-located with the landing route but excluded from Next.js routing. Every animated wrapper lives here. This keeps the page file clean and the animation logic isolated.
- **`landing-animations.css`:** A separate CSS file for animation-specific styles (initial states for reveal, keyframes, `prefers-reduced-motion` overrides). Keeps animation concerns separated from layout/typography in `landing-home.css`.
- **`gsap-registration.ts`:** A plain TypeScript module (not a component) that calls `gsap.registerPlugin(ScrollTrigger)` once at module scope. Every Client Component island imports this file, but because ES modules are singletons, registration only executes once per session.
- **`page.tsx` stays as Server Component:** The page file does not get `"use client"`. It imports Client Component islands and passes Server-rendered children into them. This preserves SSR, streaming, zero-JS-on-initial-paint for the HTML structure.

## Architectural Patterns

### Pattern 1: Client Component Islands with Server Children

**What:** Wrap animated sections in thin Client Components that accept `children: React.ReactNode`. The page (Server Component) composes these wrappers around static content.

**When to use:** Every section that needs scroll-triggered animation or interaction.

**Trade-offs:**
- Pro: Keeps 90%+ of the HTML as Server Component output (no JS cost for content)
- Pro: Client Components are tiny (animation logic only, no content duplication)
- Con: Slightly more verbose page.tsx composition
- Con: Each Client island adds a small JS chunk

**Example:**

```typescript
// _components/animated-section.tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './gsap-registration';  // side-effect import, registers plugins once

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function AnimatedSection({ children, className, stagger = 0.12, delay = 0 }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Stagger direct children for cascading reveal
    const staggerTargets = el.querySelectorAll(':scope > *');
    if (staggerTargets.length > 1) {
      gsap.from(staggerTargets, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
```

```typescript
// page.tsx (Server Component — no "use client")
import { AnimatedSection } from './_components/animated-section';

export default function LandingHomePage() {
  return (
    <main className="shell">
      {/* Server-rendered content passed as children to Client wrapper */}
      <AnimatedSection className="h-sect">
        <div className="h-sect-head">
          <span className="h-kicker">What We Do</span>
          <h2>End-to-end admissions strategy</h2>
        </div>
        <div className="h-bento">
          {/* ...bento cards, fully server-rendered */}
        </div>
      </AnimatedSection>
    </main>
  );
}
```

### Pattern 2: Module-Level GSAP Registration (Singleton)

**What:** A plain `.ts` file that registers GSAP plugins at module scope. Imported as a side-effect by every Client Component island. ES module semantics guarantee it runs exactly once.

**When to use:** Always. Every project using GSAP with multiple Client Components needs this.

**Trade-offs:**
- Pro: No React Context overhead, no provider nesting
- Pro: Tree-shaking friendly — only imports what's needed
- Pro: Works even if components mount at different times
- Con: Must be imported in every Client Component file (but it's one line)

**Example:**

```typescript
// _components/gsap-registration.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Optional: disable GSAP's internal lag smoothing for Lenis compatibility
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
```

### Pattern 3: Smooth Scroll Provider (Lenis + GSAP Ticker Sync)

**What:** A Client Component provider that initializes Lenis for buttery smooth scrolling and synchronizes it with GSAP's ticker so ScrollTrigger positions stay accurate.

**When to use:** When the project targets award-winning scroll feel. Lenis replaces the browser's native scroll with an interpolated, momentum-based scroll.

**Trade-offs:**
- Pro: Dramatically smoother scroll feel, characteristic of award-winning sites
- Pro: Lenis is lightweight (~4KB gzipped)
- Con: Adds a Client Component at the top of the landing page tree
- Con: Requires careful cleanup on unmount
- Con: Can interfere with native browser features (find-in-page, accessibility scroll)

**Example:**

```typescript
// _components/smooth-scroll-provider.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-registration';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Sync Lenis scroll position with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis raf to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

## Data Flow

### Animation State Flow

```
[Browser Scroll Event]
         │
         ▼
[Lenis Smooth Scroll]──── interpolates scroll position
         │
         ▼
[GSAP Ticker]──────────── syncs Lenis position to GSAP
         │
         ▼
[ScrollTrigger]────────── calculates trigger positions for all registered instances
         │
         ├──▶ [AnimatedHero]──── entrance timeline, parallax orbs
         ├──▶ [AnimatedSection: Services]──── fade-up reveal, staggered cards
         ├──▶ [AnimatedSection: Process]──── timeline dots, step reveal
         ├──▶ [AnimatedDarkSection: Outcomes]──── atmosphere entry, card stagger
         ├──▶ [AnimatedSection: Pricing]──── card reveal, popular card emphasis
         ├──▶ [AnimatedCallout]──── gradient shift, text reveal
         ├──▶ [AnimatedSection: FAQ]──── accordion reveal
         └──▶ [AnimatedFinalCTA]──── glow pulse, button emphasis
```

### Key Data Flows

1. **Scroll position propagation:** Browser scroll -> Lenis (smooth interpolation) -> GSAP ticker -> ScrollTrigger -> individual animation instances. Each Client Component island registers its own ScrollTrigger instances via `useGSAP`. No explicit state sharing between islands is needed because ScrollTrigger's global registry handles coordination.

2. **Hero entrance sequence:** On page load, AnimatedHero runs a GSAP timeline that choreographs badge fade-in -> h1 text reveal -> description fade -> buttons slide-up -> orb scale-in. This is time-based (not scroll-based), triggered once on mount via `useGSAP`.

3. **Hover interactions:** MagneticButton and AnimatedCard handle their own `mousemove`/`mouseleave` events locally. No state flows between these and the scroll system. They use `gsap.to()` with `quickTo` for 60fps magnetic tracking.

4. **Reduced motion:** CSS `@media (prefers-reduced-motion: reduce)` disables animations at the CSS level. The `SmoothScrollProvider` checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and skips Lenis initialization if the user prefers reduced motion. Each `useGSAP` block can also check this preference.

### Component Communication Summary

| From | To | Mechanism | Purpose |
|------|-----|-----------|---------|
| Lenis | ScrollTrigger | `lenis.on('scroll', ScrollTrigger.update)` | Sync scroll position |
| Lenis | GSAP ticker | `gsap.ticker.add(lenis.raf)` | Sync animation frame |
| ScrollTrigger | Each island | ScrollTrigger callback system | Trigger animations |
| Each island | DOM | `gsap.to()` / `gsap.from()` | Apply transforms |
| User mouse | MagneticButton | `mousemove` event | Magnetic effect |
| User mouse | AnimatedCard | `mousemove` event | Tilt effect |
| prefers-reduced-motion | All components | CSS media query + JS matchMedia | Disable animations |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (landing page) | 8-10 Client Component islands, each ~2-5KB JS. Total animation JS ~30-40KB gzipped (GSAP core + ScrollTrigger + Lenis + island logic). Fully acceptable. |
| More sections (10-15) | No changes needed. Each island is independent. ScrollTrigger handles any number of triggers. |
| Multiple animated pages | Extract shared components (AnimatedSection, MagneticButton) into `src/components/landing/` shared directory. Each page still composes its own islands. |
| Heavy 3D/WebGL additions | Lazy-load Three.js/R3F via `next/dynamic` with `ssr: false`. Keep GSAP for scroll orchestration, use Three.js only for specific visual elements. |

### Scaling Priorities

1. **First bottleneck — initial JS payload:** Monitor total Client Component JS. If islands grow beyond ~50KB gzipped total, use `next/dynamic` to lazy-load below-the-fold islands (pricing, FAQ, final CTA).
2. **Second bottleneck — scroll jank:** If animations cause frame drops, reduce the number of simultaneous active ScrollTrigger instances by using `toggleActions: 'play none none none'` (fire once, don't reverse) and `once: true` where appropriate.

## Anti-Patterns

### Anti-Pattern 1: Making the Entire Page a Client Component

**What people do:** Add `"use client"` to `page.tsx` or wrap the entire page in one large animated Client Component.
**Why it's wrong:** Forces all content into the client bundle. Kills SSR benefits. Sends all HTML content as JS strings instead of server-rendered HTML. Breaks streaming. Dramatically increases Time to Interactive.
**Do this instead:** Keep `page.tsx` as a Server Component. Create small, focused Client Component islands that wrap specific sections. Pass Server-rendered children into them.

### Anti-Pattern 2: Registering GSAP Plugins Inside Each Component

**What people do:** Call `gsap.registerPlugin(ScrollTrigger)` inside every `useGSAP` callback or in every component's module scope.
**Why it's wrong:** While GSAP handles duplicate registration gracefully (it's a no-op), it signals a lack of architecture. Worse, if combined with dynamic imports, it can cause race conditions where some components try to use ScrollTrigger before it's registered.
**Do this instead:** Create a single `gsap-registration.ts` module. Import it as a side-effect in every Client Component island. Module-level code runs once per session.

### Anti-Pattern 3: Sharing Animation State via React Context

**What people do:** Create a React Context that holds scroll progress, animation states, or GSAP timelines, and pass it to all animated components.
**Why it's wrong:** Causes unnecessary React re-renders on every scroll frame. Scroll events fire 60+ times per second. React's reconciliation loop is far too slow for this. GSAP and ScrollTrigger already handle this coordination at the DOM level, outside React's render cycle.
**Do this instead:** Let ScrollTrigger manage coordination globally. Each island registers its own triggers. GSAP's internal scheduler ensures they all fire on the same frame. No React state needed for scroll position.

### Anti-Pattern 4: CSS-Only Scroll Animations for Complex Choreography

**What people do:** Try to build the entire animation system with CSS `@keyframes` and `animation-timeline: scroll()` or IntersectionObserver polyfills.
**Why it's wrong:** CSS scroll animations (`animation-timeline: scroll()`) have limited browser support (no Firefox as of 2025, partial Safari support). IntersectionObserver can only detect enter/leave — not scrub progress. Complex choreography (stagger, timeline sequencing, physics-based easing) is nearly impossible in pure CSS.
**Do this instead:** Use CSS for simple hover transitions and initial states (opacity, transform). Use GSAP ScrollTrigger for scroll-driven reveals, parallax, and orchestrated sequences.

### Anti-Pattern 5: Importing Server Components Inside Client Components

**What people do:** Import a content component (e.g., `<BentoGrid />` Server Component) inside a `"use client"` animated wrapper.
**Why it's wrong:** Next.js cannot render a Server Component inside a Client Component when imported directly. The Server Component will silently become a Client Component, losing SSR benefits.
**Do this instead:** Pass Server-rendered content as `children` to the Client Component wrapper. The parent Server Component (`page.tsx`) handles the composition.

## Integration Points

### External Libraries

| Library | Integration Pattern | Notes |
|---------|---------------------|-------|
| GSAP (gsap) | `npm install gsap` — core animation engine | ~23KB gzipped. Free for all uses (including commercial) as of 2025. |
| @gsap/react | `npm install @gsap/react` — React hook | Provides `useGSAP` hook with automatic cleanup. SSR-safe. |
| ScrollTrigger | Included with `gsap` package, import from `gsap/ScrollTrigger` | No separate install. Register once via `gsap.registerPlugin()`. |
| Lenis | `npm install lenis` — smooth scroll | ~4KB gzipped. Optional but recommended for award-winning feel. |
| SplitText (optional) | Included with `gsap` package, import from `gsap/SplitText` | For text reveal animations (character/word/line splitting). Now free. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server page -> Client islands | React `children` prop | Server-rendered HTML passed into Client wrappers. Never import Server Components inside Client Components. |
| Client islands -> ScrollTrigger | `useGSAP` hook (auto-registers triggers) | Each island is self-contained. No explicit cross-island communication. |
| Lenis -> ScrollTrigger | `lenis.on('scroll', ScrollTrigger.update)` | Initialized once in SmoothScrollProvider. |
| landing-home.css -> landing-animations.css | CSS cascade, same `.landing-scope` scope | Animation CSS extends (not replaces) existing layout CSS. |
| Landing route -> rest of app | Fully isolated via `(landing)` route group | No CSS bleed, no shared Client Components with portal. |

## Build Order (Dependency Chain)

The following build order reflects hard dependencies: each item requires the ones above it to function.

```
Phase 1: Foundation (no visual animations yet)
├── 1a. gsap-registration.ts          # Module-level plugin setup
├── 1b. landing-animations.css         # Animation initial states + prefers-reduced-motion
└── 1c. SmoothScrollProvider           # Lenis + GSAP ticker sync

Phase 2: Core Animation Wrapper (enables all sections)
└── 2a. AnimatedSection                # Generic scroll-reveal wrapper with stagger
                                       # (most sections use this)

Phase 3: Section-Specific Islands (independent, can be built in parallel)
├── 3a. AnimatedHero                   # Hero entrance sequence (most impactful, build first)
├── 3b. AnimatedDarkSection            # Outcomes atmosphere
├── 3c. AnimatedCallout                # AI Engine section
└── 3d. AnimatedFinalCTA               # Final CTA glow + emphasis

Phase 4: Micro-interactions (independent, can be built in parallel)
├── 4a. MagneticButton                 # Magnetic hover on CTAs
└── 4b. AnimatedCard                   # Tilt hover on bento/pricing cards

Phase 5: Compose in page.tsx
└── 5a. Refactor page.tsx to wrap sections in Client islands
        (Keep as Server Component, import islands, pass children)

Phase 6: Polish & Performance
├── 6a. ScrollTrigger.refresh() call after all islands mount
├── 6b. Lazy-load below-fold islands via next/dynamic (if needed)
├── 6c. Lighthouse audit, animation frame budget testing
└── 6d. prefers-reduced-motion end-to-end verification
```

### Build Order Rationale

- **Phase 1 must come first** because every Client Component island depends on GSAP being registered, the animation CSS initial states being defined (so content doesn't flash), and the smooth scroll provider being in place.
- **Phase 2 (AnimatedSection) unlocks Phase 3** because most sections (Services, Process, Pricing, FAQ) use the same generic reveal pattern. Building the generic wrapper first means 4 of 8 sections are immediately animated.
- **Phase 3 items are independent** of each other. AnimatedHero should be built first within this phase because it's the first thing visitors see, but none of these depend on each other.
- **Phase 4 micro-interactions are fully independent** from scroll animations. They respond to mouse events, not scroll position. Can be added at any point after Phase 1.
- **Phase 5 is the integration step** where `page.tsx` is refactored from pure static HTML to the hybrid Server/Client composition. This should happen only after the islands are tested individually.
- **Phase 6 is polish** that cannot be meaningfully done until all animations are in place.

## CSS Architecture Decision

**Recommendation: Keep vanilla CSS. Add a dedicated `landing-animations.css` file.**

Rationale:
- The existing `landing-home.css` (1070 lines) is well-organized with clear section comments and consistent `h-` prefixed class names scoped under `.landing-scope`. It works. Migrating to CSS Modules now would be a rewrite with no functional benefit.
- CSS Modules would break the existing `.landing-scope .shell .h-*` specificity chain. Every selector would need restructuring.
- Next.js automatically code-splits CSS in production, so the bundling benefit of CSS Modules is already present.
- A new `landing-animations.css` file cleanly separates animation concerns (initial hidden states, keyframes, reduced-motion overrides) from layout/typography concerns in `landing-home.css`.

**`landing-animations.css` should contain:**
1. Initial animation states (elements start invisible/translated before GSAP takes over)
2. New keyframes for effects GSAP doesn't manage (ambient pulses, gradient shifts)
3. `@media (prefers-reduced-motion: reduce)` overrides that disable all animations
4. Will-change hints for commonly animated properties

**Example structure:**

```css
/* landing-animations.css */

/* ── Initial states for GSAP-animated elements ── */
.landing-scope .shell .h-sect,
.landing-scope .shell .h-dark-sect,
.landing-scope .shell .h-callout,
.landing-scope .shell .h-final {
  opacity: 0;
  transform: translateY(40px);
}

/* ── Reduced motion: show everything immediately ── */
@media (prefers-reduced-motion: reduce) {
  .landing-scope .shell .h-sect,
  .landing-scope .shell .h-dark-sect,
  .landing-scope .shell .h-callout,
  .landing-scope .shell .h-final,
  .landing-scope .shell .h-hero * {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }
}

/* ── Will-change hints for animated elements ── */
.landing-scope .shell .h-bento-card,
.landing-scope .shell .h-outcome,
.landing-scope .shell .h-plan-card {
  will-change: transform, opacity;
}
```

## Sources

### Context7 (HIGH confidence)
- [GSAP React integration and useGSAP hook](https://gsap.com/resources/React) — Official GSAP documentation on React usage, SSR safety, cleanup patterns
- [ScrollTrigger API and callbacks](https://gsap.com/docs/v3/Plugins/ScrollTrigger) — Official ScrollTrigger documentation
- [Next.js 14 Client/Server Component composition patterns](https://github.com/vercel/next.js/blob/v14.3.0-canary.87/docs/02-app/01-building-your-application/03-rendering/04-composition-patterns.mdx) — Official Next.js docs on passing Server Components as children to Client Components
- [Motion (Framer Motion) scroll animations](https://motion.dev/docs/react) — Official Motion documentation on whileInView and useScroll

### Official Documentation (HIGH confidence)
- [GSAP licensing — now free for commercial use](https://gsap.com/pricing/) — GSAP is fully free as of 2025 after Webflow acquisition
- [Next.js CSS documentation](https://nextjs.org/docs/app/getting-started/css) — CSS Modules and code splitting behavior
- [Lenis smooth scroll library](https://github.com/darkroomengineering/lenis) — Official Lenis repository

### Web Research (MEDIUM confidence — verified against official docs)
- [Setting up GSAP with Next.js: 2025 Edition](https://medium.com/@thomasaugot/setting-up-gsap-with-next-js-2025-edition-bcb86e48eab6) — Centralized plugin registration pattern
- [GSAP plugin registration in Next.js App Router](https://gsap.com/community/forums/topic/40634-good-way-to-register-gsap-plugins-in-nextjs-app-router-and-how-many-many-times-we-can-do-it/) — Official GSAP forum confirming module-level registration is safe
- [Optimizing GSAP Animations in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) — Cleanup patterns, ScrollTrigger.refresh() timing
- [Smooth scroll with Lenis and GSAP in Next.js](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — Lenis + ScrollTrigger sync pattern
- [Rebuild an Awwwards Landing page with Next.js and GSAP](https://blog.olivierlarose.com/tutorials/awwwards-landing-page) — Real-world award-winning page architecture
- [GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) — Bundle size and performance trade-offs
- [Comparing React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — Ecosystem landscape

---
*Architecture research for: Animated landing page — Next.js 14 App Router with GSAP ScrollTrigger*
*Researched: 2026-02-27*
