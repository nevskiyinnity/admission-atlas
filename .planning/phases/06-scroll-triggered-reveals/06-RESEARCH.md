# Phase 6: Scroll-Triggered Reveals - Research

**Researched:** 2026-02-27
**Domain:** GSAP ScrollTrigger section reveal animations + scroll progress indicator
**Confidence:** HIGH

## Summary

Phase 6 builds the scroll-triggered content reveal system that makes every section animate into view as the user scrolls. The infrastructure is already solid: GSAP 3.14.2 + ScrollTrigger are registered, `AnimatedSection` wraps all 8 non-hero sections with `containerRef` scopes, CSS initial states hide elements with `opacity: 0; transform: translateY(24px)`, and the `prefers-reduced-motion` override already shows everything with `!important`. The h2 heading reveals (SplitText clip-path) were built in Phase 5 (Plan 05-02) inside `AnimatedSection` -- this phase adds the rest: kicker labels, descriptions, and content elements animate in with staggered choreography, plus a gold scroll-progress bar under the nav.

The approach is to expand `AnimatedSection`'s existing `useGSAP` hook to create per-section ScrollTrigger timelines that choreograph child elements in sequence. Each section follows a consistent pattern: kicker label first, then heading (already done), then description, then content blocks (cards, timeline steps, pricing cards, etc.). The scroll-progress bar is a separate, standalone ScrollTrigger with `scrub: true` that drives a `scaleX` tween on a thin fixed element under the nav.

**Primary recommendation:** Extend `AnimatedSection` with per-section choreographed timelines using individual `gsap.from()` calls with ScrollTrigger per element group. Add a new `ScrollProgressBar` client component for the gold progress indicator. Use the existing CSS initial states -- no new initial states needed since `opacity: 0; translateY(24px)` already covers all section-level elements.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCROLL-01 | Scroll-triggered reveal animations on all major sections -- elements animate in with opacity + transform, staggered timing per section | AnimatedSection already wraps all sections with containerRef. Expand useGSAP hook to add gsap.from() with ScrollTrigger for kicker, description, and content children. CSS initial states already set opacity:0 + translateY(24px). |
| SCROLL-03 | Staggered section choreography -- each section has its own reveal timeline (kicker -> heading -> description -> content elements) | Use gsap.timeline() per section inside useGSAP, or sequential gsap.from() calls with incrementing ScrollTrigger start offsets / timeline position parameters. Each section's children get different delays to create the cascading entrance. |
| SCROLL-04 | Scroll-progress indicator -- thin gold bar under nav showing page scroll position | New ScrollProgressBar client component using gsap.to() with scaleX:1 + ScrollTrigger scrub:true on the entire page (trigger: body or main, start: "top top", end: "bottom bottom"). Positioned fixed under the nav. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 | Animation engine | Already installed and registered. Powers all animations in the project. |
| ScrollTrigger | 3.14.2 (bundled) | Scroll-triggered animations | Already registered in gsap-registration.ts. Provides trigger, start, toggleActions, scrub. |
| @gsap/react | 2.1.2 | useGSAP hook | Already installed. Provides automatic cleanup of ScrollTriggers and GSAP contexts on unmount. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SplitText | 3.14.2 (bundled) | Text splitting for word reveals | Already used in AnimatedSection for h2 reveals (Phase 5). No additional SplitText work needed for Phase 6. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Individual gsap.from() per element group | ScrollTrigger.batch() | Batch is designed for homogeneous grids (e.g., 20 identical cards). Our sections have heterogeneous children (kicker, heading, description, cards) that need choreographed order, not batched simultaneous entry. Individual ScrollTrigger per section is more appropriate. |
| gsap.timeline() per section | Individual gsap.from() calls with shared trigger | Timeline is cleaner for choreography with absolute offsets. However, the simplest approach is individual from() calls where each targets the section as trigger but uses different `start` values or delays. Either works; timeline is slightly more explicit. |
| CSS scroll-driven animations | GSAP ScrollTrigger scrub for progress bar | CSS scroll-driven animations (@scroll-timeline) have incomplete browser support. GSAP ScrollTrigger scrub is battle-tested and already in the bundle. |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Current File Structure
```
src/app/[locale]/(landing)/
  _components/
    gsap-registration.ts        # GSAP + ScrollTrigger + SplitText registered
    smooth-scroll-provider.tsx   # Lenis smooth scroll with GSAP ticker sync
    animated-section.tsx         # Wraps 8 sections, currently does h2 SplitText reveals
    hero-entrance.tsx            # Dedicated hero component (page-load timeline)
  page.tsx                       # Server Component, 9 sections
  landing-home.css               # ~1260 lines scoped styles
  landing-animations.css         # FOUC-prevention initial states + reduced-motion overrides
```

### New/Modified Files for Phase 6
```
src/app/[locale]/(landing)/
  _components/
    animated-section.tsx         # MODIFY: add per-section choreographed reveals
    scroll-progress-bar.tsx      # NEW: gold progress indicator under nav
  page.tsx                       # MODIFY: add ScrollProgressBar component
  landing-home.css               # MODIFY: add progress bar styles
  landing-animations.css         # MODIFY: add child-level initial states if needed
```

### Pattern 1: Per-Section Choreographed Timeline in AnimatedSection

**What:** Expand the existing `useGSAP` hook in AnimatedSection to animate child elements in a choreographed sequence per section.

**When to use:** Every AnimatedSection instance -- the hook queries children and builds a section-specific timeline.

**How it works:** Inside the existing `mm.add('(prefers-reduced-motion: no-preference)', () => { ... })` block, after the h2 SplitText code, add section-level reveal logic. Query kicker (`.h-kicker`), description (`.h-sect-sub`, `p` after h2), and content containers (`.h-bento`, `.h-timeline`, `.h-outcomes`, `.h-plans`, `.h-faq`, etc.). Animate each with `gsap.from()` using the section or element as ScrollTrigger trigger.

**Key architecture decision -- Timeline vs individual from() calls:**

Option A: Single timeline per section with ScrollTrigger
```typescript
// Source: GSAP docs (ScrollTrigger + timeline)
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: container.querySelector('section'),
    start: 'top 85%',
    toggleActions: 'play none none none',
  },
});
tl.from(kicker, { y: 24, opacity: 0, duration: 0.5 }, 0);
// h2 reveal already handled by SplitText code above
tl.from(desc, { y: 24, opacity: 0, duration: 0.5 }, 0.15);
tl.from(contentEls, { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.3);
```

Option B: Individual gsap.from() calls with separate ScrollTriggers
```typescript
// Each element triggers independently based on its own position
gsap.from(kicker, {
  y: 24, opacity: 0, duration: 0.5, ease: 'power3.out',
  scrollTrigger: { trigger: kicker, start: 'top 90%', toggleActions: 'play none none none' },
});
gsap.from(contentEls, {
  y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
  scrollTrigger: { trigger: contentEls[0], start: 'top 90%', toggleActions: 'play none none none' },
});
```

**Recommendation: Option A (single timeline per section).** Reasons:
1. Guarantees choreography order -- kicker always before heading, heading before description, etc.
2. Single ScrollTrigger per section (fewer instances = better performance)
3. Consistent with hero entrance pattern (HeroEntrance uses a single timeline)
4. Easier to control timing relationships between elements

**Important consideration:** The h2 SplitText reveal (added in 05-02) already has its own ScrollTrigger with `trigger: h2, start: 'top 85%'`. If we add a section-level timeline, we need to either:
- Remove the standalone h2 ScrollTrigger and move the SplitText animation INTO the section timeline at the right position offset
- OR keep both and accept that the h2 fires independently based on its own position

**Recommendation:** Integrate the h2 SplitText into the section timeline for coordinated choreography. This means refactoring the existing h2 code from 05-02 to be part of the section timeline instead of standalone. The choreography order would be: kicker (0s) -> h2 words (0.1s) -> description (0.3s) -> content (0.5s).

### Pattern 2: Scroll Progress Bar with ScrollTrigger scrub

**What:** A thin gold bar fixed at the top of the viewport (under the nav) that fills from left to right as the user scrolls down the page.

**When to use:** Always visible while scrolling. Shows overall page scroll progress.

**Implementation:**
```typescript
// Source: GSAP docs + community patterns
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from './gsap-registration';

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,  // smooth catch-up
        },
      });
    });
  });

  return (
    <div
      ref={barRef}
      className="h-scroll-progress"
      aria-hidden="true"
    />
  );
}
```

CSS:
```css
.landing-scope .h-scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--hm-gold);
  transform-origin: left center;
  transform: scaleX(0);
  z-index: 101;  /* above nav (z-index: 100) */
  pointer-events: none;
}
```

**Trigger element:** Use `document.documentElement` or `document.body` as the trigger to track entire page scroll. Since the page uses Lenis smooth scroll which connects to ScrollTrigger via ticker sync, this automatically works.

**scrub value:** Using `scrub: 0.3` (0.3s catch-up) gives a slightly smoothed progress that feels natural rather than jumpy. `scrub: true` (instant) works too but can feel jittery on some scroll inputs.

### Pattern 3: Section Child Element Queries

**What:** Reliable CSS selectors for finding animatable children within each section type.

**Section inventory and their animatable children:**

| Section | CSS Class | Children to Animate |
|---------|-----------|-------------------|
| Metrics | `.h-metrics` | `.h-metric` items (4) -- stagger |
| Services | `.h-sect` (first) | `.h-kicker`, h2 (SplitText), `.h-sect-sub`, `.h-bento-card` items (6) -- stagger |
| Process | `.h-sect` (second) | `.h-kicker`, h2 (SplitText), `.h-tl-step` items (4) -- stagger |
| Outcomes | `.h-dark-sect` | `.h-kicker`, h2 (SplitText), `.h-outcome` items (4) -- stagger |
| Pricing | `.h-sect` (third) | `.h-kicker`, h2 (SplitText), `.h-plan-card` items (3) -- stagger |
| AI Callout | `.h-callout` | `.h-kicker`, h2 (SplitText), p, `.h-btn-light` |
| FAQ | `.h-sect` (fourth) | `.h-kicker`, h2 (SplitText), `.h-faq-item` items (4) -- stagger |
| Final CTA | `.h-final` | h2 (SplitText), p, `.h-btn-primary` |

**Query strategy inside AnimatedSection:**
```typescript
const section = container.querySelector('section');
if (!section) return;

const kicker = section.querySelector('.h-kicker');
const sub = section.querySelector('.h-sect-sub');

// Content elements: query all possible content containers
// Only one of these will exist per section
const cards = section.querySelectorAll('.h-bento-card');
const steps = section.querySelectorAll('.h-tl-step');
const outcomes = section.querySelectorAll('.h-outcome');
const plans = section.querySelectorAll('.h-plan-card');
const faqItems = section.querySelectorAll('.h-faq-item');
const metrics = section.querySelectorAll('.h-metric');

// Gather whatever content elements exist
const contentEls = cards.length ? cards
  : steps.length ? steps
  : outcomes.length ? outcomes
  : plans.length ? plans
  : faqItems.length ? faqItems
  : metrics.length ? metrics
  : [];
```

**Simpler approach:** Instead of querying specific class names, use a more generic pattern. Each section has a predictable structure:
1. A kicker `.h-kicker` (optional)
2. An h2 heading
3. A description paragraph (`.h-sect-sub` or direct `p`)
4. A content container with repeating children

We can query generically and animate whatever exists.

### Anti-Patterns to Avoid
- **Animating the section container itself:** The section-level `opacity: 0; translateY(24px)` CSS is a FOUC-prevention initial state. GSAP should animate the section TO visible as a single unit first, THEN individual children reveal. Or better: animate the section itself to visible (opacity 1, y 0) as the first step in the timeline, then stagger children.
- **Creating ScrollTriggers outside useGSAP scope:** All ScrollTriggers must be inside `useGSAP()` for automatic cleanup on unmount.
- **Using batch() for heterogeneous sections:** batch() is for grids of identical elements. Our sections have mixed children needing ordered choreography.
- **Forgetting the Lenis integration:** ScrollTrigger already receives scroll updates from Lenis via `lenis.on('scroll', ScrollTrigger.update)` in SmoothScrollProvider. No additional integration needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll position tracking | Custom IntersectionObserver | ScrollTrigger | ScrollTrigger handles edge cases (resize, route change, dynamic content), integrates with Lenis, provides scrub and progress |
| Staggered child animation | Manual setTimeout chains | gsap stagger property | GSAP stagger handles timing precision, GPU compositing, and cleanup |
| Scroll progress calculation | Custom scroll event listener | ScrollTrigger with scrub | Manual scroll listeners miss Lenis smooth scroll position, don't account for dynamic content height changes, miss ScrollTrigger.refresh() |
| Reduced-motion gating | Manual matchMedia listeners | gsap.matchMedia() | GSAP matchMedia auto-reverts animations when media query changes, handles cleanup |

**Key insight:** GSAP ScrollTrigger already handles the complex scroll position calculation, viewport intersection, and cleanup. Building custom solutions would duplicate what's already registered and working.

## Common Pitfalls

### Pitfall 1: Section-Level vs Child-Level Initial States
**What goes wrong:** CSS has `opacity: 0; translateY(24px)` on section-level selectors (`.h-sect`, `.h-dark-sect`, etc.). If GSAP only animates children (kicker, heading, cards) but never sets the SECTION to visible, the entire section stays invisible even though children are animating.
**Why it happens:** The CSS initial states were designed for simple section-level fade-in. Phase 6 adds child-level choreography which is more granular.
**How to avoid:** The section timeline must FIRST set the section itself to `opacity: 1; y: 0` (or `autoAlpha: 1`), then animate children. Alternatively, move CSS initial states from section-level to child-level selectors. The cleanest approach: use `gsap.set(section, { opacity: 1, y: 0 })` at the start of each section's ScrollTrigger timeline to reveal the container, then stagger children.
**Warning signs:** Sections appear blank on scroll even though GSAP code is running.

### Pitfall 2: Double Animation on h2 Headings
**What goes wrong:** Phase 5 (Plan 05-02) added standalone ScrollTrigger h2 reveals in AnimatedSection. Adding a section timeline that also touches h2 would cause the heading to animate twice or conflict.
**Why it happens:** Two separate animation systems targeting the same element.
**How to avoid:** Integrate the h2 SplitText reveal INTO the section timeline at the correct position offset. Remove the standalone h2 ScrollTrigger code and replace it with a timeline position.
**Warning signs:** Heading animates, resets, then animates again, or clips incorrectly.

### Pitfall 3: Metrics Section Has No Kicker or h2
**What goes wrong:** The metrics section (`section.h-metrics`) is a simple 4-column grid with no `.h-kicker`, no h2, no description. Code that assumes all sections have these elements will error.
**Why it happens:** Metrics is structurally different from other sections.
**How to avoid:** Null-check all queried elements. The metrics section should simply stagger its `.h-metric` children with a basic fade-in.
**Warning signs:** TypeError on null when trying to animate non-existent kicker/heading in metrics section.

### Pitfall 4: Dark Section Has Nested Structure
**What goes wrong:** The outcomes section has `section.h-dark-sect > div.h-dark-inner > (content)`. The content is nested deeper than other sections. Querying `section.querySelector('.h-kicker')` still works because querySelector searches all descendants, but the z-index layering means the dark-inner container should also be part of the reveal.
**Why it happens:** Dark section uses a separate inner container for background/atmosphere.
**How to avoid:** Query from the section element (which querySelector already does recursively). No special handling needed for depth.
**Warning signs:** None expected -- just be aware of the nesting.

### Pitfall 5: Progress Bar Position with Floating Nav
**What goes wrong:** The nav is `position: fixed; top: 20px` with capsule shape. Placing a progress bar directly under the nav capsule requires knowing its height, which varies by viewport.
**Why it happens:** Nav is not a standard top-0 bar; it's a floating capsule with margin from top.
**How to avoid:** Place the progress bar at the very top of the viewport (`top: 0`), above the nav visually but below in z-index, OR at the absolute top with `z-index: 101` (above nav's 100). A thin 3px gold line at `top: 0` across the full viewport width is clean and doesn't interfere with the floating nav design.
**Warning signs:** Progress bar overlaps nav content or looks disconnected.

### Pitfall 6: Callout and Final CTA Have Relative Content z-index
**What goes wrong:** Both `.h-callout-inner` and `.h-final` use `position: relative` and `overflow: hidden` with pseudo-elements for atmospheric effects. Animated children need `position: relative; z-index: 2` to appear above atmospheric layers.
**Why it happens:** The dark/atmospheric design uses stacked pseudo-elements at z-index 0-1.
**How to avoid:** Content elements already have `position: relative; z-index: 2` set in the CSS for these sections. GSAP animations on opacity/transform don't affect z-index, so no conflict.
**Warning signs:** Content appears behind gradient overlays during animation.

## Code Examples

### Example 1: Section Reveal Timeline (recommended pattern)

```typescript
// Inside AnimatedSection useGSAP callback, after matchMedia wrapping
// Source: Verified pattern from GSAP docs + project conventions

const section = container.querySelector('section') || container.querySelector('[class*="h-"]');
if (!section) return;

// Step 0: Reveal section container (clear CSS initial state)
gsap.set(section, { opacity: 1, y: 0 });

// Find animatable children
const kicker = section.querySelector('.h-kicker');
const headings = section.querySelectorAll('h2');
const sub = section.querySelector('.h-sect-sub');

// Build timeline with ScrollTrigger
const tl = gsap.timeline({
  defaults: { ease: 'power3.out', duration: 0.6 },
  scrollTrigger: {
    trigger: section,
    start: 'top 85%',
    toggleActions: 'play none none none',
  },
});

// Choreography: kicker -> heading -> description -> content
let pos = 0;

if (kicker) {
  tl.from(kicker, { y: 16, opacity: 0, duration: 0.4 }, pos);
  pos += 0.1;
}

headings.forEach((h2) => {
  const split = SplitText.create(h2, { type: 'words' });
  tl.from(split.words, {
    clipPath: 'inset(0 100% 0 0)',
    duration: 0.5,
    stagger: 0.04,
  }, pos);
  pos += 0.15;
});

if (sub) {
  tl.from(sub, { y: 24, opacity: 0 }, pos);
  pos += 0.15;
}

// Content elements (cards, steps, outcomes, etc.)
const contentEls = section.querySelectorAll(
  '.h-bento-card, .h-tl-step, .h-outcome, .h-plan-card, .h-faq-item, .h-metric'
);
if (contentEls.length) {
  tl.from(contentEls, { y: 24, opacity: 0, stagger: 0.08 }, pos);
}
```

### Example 2: Scroll Progress Bar Component

```typescript
// Source: GSAP ScrollTrigger docs (scrub + scaleX pattern)
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from './gsap-registration';

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!barRef.current) return;

      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        }
      );
    });
  });

  return (
    <div
      ref={barRef}
      className="h-scroll-progress"
      aria-hidden="true"
    />
  );
}
```

### Example 3: Metrics Section (no heading, just stagger)

```typescript
// For sections without kicker/heading (like metrics)
const metrics = section.querySelectorAll('.h-metric');
if (metrics.length) {
  gsap.set(section, { opacity: 1, y: 0 });
  gsap.from(metrics, {
    y: 24,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
}
```

### Example 4: Callout Section (fewer children, direct choreography)

```typescript
// AI Callout and Final CTA have simpler structures
// kicker -> h2 -> p -> button
const p = section.querySelector('p:not(.h-sect-sub)');
const btn = section.querySelector('[class*="h-btn"]');

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top 85%',
    toggleActions: 'play none none none',
  },
});

if (kicker) tl.from(kicker, { y: 16, opacity: 0, duration: 0.4 }, 0);
// h2 SplitText at 0.1
if (p) tl.from(p, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.35);
if (btn) tl.from(btn, { y: 24, opacity: 0, duration: 0.5, ease: 'back.out(1.4)' }, 0.5);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| IntersectionObserver + CSS transitions | GSAP ScrollTrigger with useGSAP cleanup | GSAP 3.x (2020+) | Better timing control, automatic cleanup, Lenis integration |
| Custom scroll event listeners | ScrollTrigger with scrub for progress bars | GSAP 3.x (2020+) | Handles resize, dynamic content, smooth scroll libraries |
| CSS @scroll-timeline | GSAP ScrollTrigger scrub | 2024+ (CSS spec still evolving) | GSAP is more reliable cross-browser. CSS scroll-driven animations gaining support but not yet Baseline. |
| ScrollTrigger.batch() for reveals | Individual ScrollTriggers per section timeline | Pattern evolution | batch() is for homogeneous grids; section choreography needs explicit ordering |

**Deprecated/outdated:**
- `new SplitText()` constructor: Use `SplitText.create()` (GSAP 3.12+). Both work but `.create()` is the modern API.
- `gsap.context()` manual usage: `useGSAP` wraps this automatically since @gsap/react 2.x. No need for manual context.

## Open Questions

1. **Section-level vs child-level CSS initial states**
   - What we know: Current CSS sets `opacity: 0; translateY(24px)` on section wrappers (`.h-sect`, `.h-dark-sect`, `.h-callout`, `.h-final`). Phase 6 needs child-level animation instead.
   - What's unclear: Should we move the CSS initial states to child elements, or use `gsap.set()` to immediately reveal the section container when its ScrollTrigger fires?
   - Recommendation: Use `gsap.set(section, { opacity: 1, y: 0 })` at the start of each section timeline. This keeps the existing CSS initial states as FOUC prevention (sections start hidden), and GSAP immediately reveals the container when the ScrollTrigger fires, then staggers children. This is the least invasive approach -- no CSS changes to existing initial states needed. The section opacity/transform is cleared instantly (not animated) while children animate individually.

2. **Progress bar position: top of viewport vs under nav capsule**
   - What we know: Nav is `position: fixed; top: 20px` with capsule shape, `z-index: 100`. Progress bar needs to be visible without interfering with nav.
   - What's unclear: Aesthetic preference -- a 3px gold line at the very top of the viewport, or positioned below the nav capsule.
   - Recommendation: Place at `top: 0; z-index: 101` across full viewport width. This is the standard pattern, visually clean, and doesn't depend on nav height calculations. The thin gold line at the top provides a subtle progress cue without competing with the floating nav.

3. **Should AnimatedSection handle all section types, or split into specialized components?**
   - What we know: All 8 non-hero sections use AnimatedSection. Sections have different internal structures.
   - What's unclear: Whether one generic component can handle all variations cleanly.
   - Recommendation: Keep one AnimatedSection with smart child detection. The querying logic (find kicker, find heading, find content elements) handles all section types because it null-checks each element. This avoids component proliferation and keeps the architecture clean.

## Sources

### Primary (HIGH confidence)
- GSAP official docs: ScrollTrigger API (trigger, start, toggleActions, scrub, progress) - https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- GSAP official docs: ScrollTrigger batch() method - https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()
- GSAP official docs: useGSAP React hook with automatic cleanup - https://gsap.com/resources/React
- GSAP official docs: Common ScrollTrigger mistakes (looping pattern) - https://gsap.com/resources/st-mistakes
- Context7 /llmstxt/gsap_llms_txt: ScrollTrigger timeline, toggleActions, useGSAP cleanup, progress callbacks

### Secondary (MEDIUM confidence)
- GSAPify complete guide (2025): Scroll progress bar + batch patterns - https://gsapify.com/gsap-scrolltrigger
- GSAP community CodePen: ScrollTrigger.batch() + stagger - https://codepen.io/GreenSock/pen/GRjWxaJ
- GSAP community CodePen: Scroll progress indicator - https://codepen.io/GreenSock/pen/GRovmpJ

### Tertiary (LOW confidence)
- None -- all critical patterns verified against official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and working; no new dependencies
- Architecture: HIGH -- patterns verified against GSAP docs, consistent with Phase 5 hero entrance approach
- Pitfalls: HIGH -- identified from codebase analysis; section-level vs child-level CSS states is the main integration risk
- Scroll progress bar: HIGH -- standard GSAP pattern (scaleX + scrub), verified in official docs and community examples

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable -- GSAP API is mature and doesn't change frequently)
