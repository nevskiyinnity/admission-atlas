# Phase 7: Parallax & Visual Depth - Research

**Researched:** 2026-02-27
**Domain:** GSAP ScrollTrigger scrub-driven parallax on decorative elements
**Confidence:** HIGH

## Summary

Phase 7 adds scroll-linked parallax movement to decorative elements (hero orbs, SVG geometry accents, dark section glows, final CTA glow) to create a sense of spatial layering as the user scrolls. The technique is straightforward: `gsap.to()` with `scrub` ties an element's `y` transform directly to scroll position, making it move at a fraction of the normal scroll speed. A speed ratio of 0.4-0.6x (meaning the element's displacement is 40-60% of what normal content would travel over the same scroll distance) produces a subtle background-layer illusion.

The project already has GSAP 3.14.2 + ScrollTrigger registered and working with Lenis smooth scroll. Lenis feeds scroll updates to ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` in SmoothScrollProvider, so all ScrollTrigger instances (including scrub-based parallax) automatically integrate with the smooth scroll system. No new dependencies are needed.

The key architectural question is where to place the parallax code. Hero orbs live inside the `HeroEntrance` component, SVG accents live inside `AnimatedSection` instances, and the dark section glows / final CTA glow also live inside `AnimatedSection` wrappers. Rather than creating a new component, the cleanest approach is to add parallax ScrollTriggers to the existing components that already own these elements: `HeroEntrance` for hero orbs, and `AnimatedSection` for accents/glows. Parallax must be disabled below 768px (where orbs and accents are already `display: none`) and for `prefers-reduced-motion: reduce` users.

**Primary recommendation:** Add scrub-based `gsap.to()` parallax tweens inside existing `HeroEntrance` and `AnimatedSection` `useGSAP` hooks, targeting only `aria-hidden="true"` decorative elements. Use `start: "top bottom"` / `end: "bottom top"` to span the full viewport traversal, with `scrub: 0.5` for smooth catch-up. Animate `y` property only (compositor-friendly, no layout thrash).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISUAL-03 | Parallax depth on decorative elements -- hero orbs and SVG accents move at 0.4-0.6x scroll speed via ScrollTrigger scrub | Use `gsap.to(element, { y: deltaY, scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0.5 } })` inside existing HeroEntrance and AnimatedSection useGSAP hooks. Delta Y values calibrated so decorative elements move 40-60% of viewport scroll distance. Only targets decorative elements (`aria-hidden="true"`, classes `h-hero-orb`, `h-accent`, `h-dark-glow`, `h-final-glow`). Disabled at < 768px and for reduced-motion. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GSAP | 3.14.2 | Animation engine | Already installed. Powers all animations. |
| ScrollTrigger | 3.14.2 (bundled) | Scroll-linked animation with scrub | Already registered in gsap-registration.ts. `scrub` property ties tween progress to scrollbar position -- the fundamental mechanism for parallax. |
| @gsap/react | 2.1.2 | useGSAP hook | Already installed. Provides automatic cleanup of ScrollTrigger instances on unmount. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lenis | 1.3.17 | Smooth scroll | Already integrated. SmoothScrollProvider syncs Lenis with ScrollTrigger. Scrub-based parallax gets smooth interpolation automatically via the existing Lenis ticker sync. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ScrollTrigger scrub | ScrollSmoother data-speed | ScrollSmoother is a separate GSAP plugin that replaces the scroll system. Project already uses Lenis -- adding ScrollSmoother would conflict. ScrollTrigger scrub achieves the same result with no additional dependencies. |
| Per-element ScrollTrigger | CSS scroll-driven animations | CSS `animation-timeline: scroll()` is gaining support but is not Baseline yet. ScrollTrigger is already in the bundle and battle-tested. |
| JavaScript parallax | Pure CSS `background-attachment: fixed` | Only works for backgrounds, not arbitrary elements. Poor mobile support. Not applicable to SVG accents or div-based orbs. |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Current File Structure (relevant to Phase 7)
```
src/app/[locale]/(landing)/
  _components/
    gsap-registration.ts        # GSAP + ScrollTrigger registered
    smooth-scroll-provider.tsx   # Lenis <-> ScrollTrigger sync
    hero-entrance.tsx            # Hero timeline (orbs, badge, h1, desc, CTAs)
    animated-section.tsx         # Wraps 8 sections with scroll-triggered reveals
  page.tsx                       # Server Component, decorative elements in markup
  landing-home.css               # Orb/accent/glow styles
  landing-animations.css         # Initial states + reduced-motion overrides
```

### Modified Files for Phase 7
```
src/app/[locale]/(landing)/
  _components/
    hero-entrance.tsx            # MODIFY: add parallax on hero orbs
    animated-section.tsx         # MODIFY: add parallax on SVG accents + glows
  landing-animations.css         # MODIFY: add will-change:transform on parallax targets (optional)
```

No new files needed. No changes to `page.tsx`.

### Pattern 1: ScrollTrigger Scrub Parallax (Core Pattern)

**What:** A `gsap.to()` tween with `scrub` links an element's `y` transform to scroll position. As the user scrolls, the element moves at a fraction of the scroll speed.

**When to use:** Any decorative element that should appear to float in a background or foreground layer.

**How parallax math works:**
- ScrollTrigger range: `start: "top bottom"` to `end: "bottom top"` spans the full traverse of the trigger element through the viewport (from entering at the bottom to exiting at the top).
- Over this range, `gsap.to(el, { y: -80 })` means the element will shift 80px upward relative to its static position by the time the trigger exits the viewport.
- If the trigger section is ~600px tall, the viewport is ~900px, the total scroll distance through the range is ~1500px. Moving 80px over 1500px ≈ 5% displacement. This creates a subtle offset that reads as "this element is on a different depth plane."
- Larger `y` values = more parallax displacement = stronger depth separation.
- Negative `y` = element moves upward relative to content (reads as "behind content" / farther away).

**Example:**
```typescript
// Source: GSAP docs (ScrollTrigger scrub) + community patterns
gsap.to(orb, {
  y: -60,  // moves 60px upward over the scroll range
  ease: 'none',  // linear mapping to scroll position
  scrollTrigger: {
    trigger: section,           // the parent section
    start: 'top bottom',       // when section top enters viewport bottom
    end: 'bottom top',         // when section bottom exits viewport top
    scrub: 0.5,                // 0.5s smoothing for natural feel
  },
});
```

### Pattern 2: Differential Speeds via Different Y Values

**What:** Multiple decorative elements in the same section receive different `y` displacement values, creating foreground/background separation between decorative layers themselves.

**When to use:** Hero section has two orbs that should move at slightly different rates.

**Example:**
```typescript
// Orb 1: slower movement (farther back)
gsap.to(orb1, {
  y: -50,
  ease: 'none',
  scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 0.5 },
});

// Orb 2: slightly more movement (closer foreground)
gsap.to(orb2, {
  y: -80,
  ease: 'none',
  scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 0.5 },
});
```

### Pattern 3: Parallax Inside Existing useGSAP Hooks

**What:** Rather than creating new components, parallax tweens are added inside the existing `useGSAP` callbacks of `HeroEntrance` and `AnimatedSection`. They coexist with the entrance timelines.

**When to use:** Always -- parallax targets live inside these components' DOM scopes.

**Why this works:** `useGSAP` can contain multiple independent tweens and timelines. The entrance timeline plays once (via `toggleActions`), while parallax tweens scrub continuously. They don't conflict because they target different properties or the same property at different lifecycle stages:
- Entrance: `gsap.from(orbs, { scale: 0.8, opacity: 0 })` -- plays once on load
- Parallax: `gsap.to(orbs, { y: -60, scrub })` -- continuously scrubs

**Important:** The parallax tween uses `gsap.to()` (not `from()`). The entrance uses `gsap.from()`. The entrance sets the initial state (scale + opacity), then parallax continuously adjusts `y` based on scroll. Since they animate different properties (`scale`/`opacity` vs `y`), they don't conflict.

**Example integration in HeroEntrance:**
```typescript
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', () => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = container.querySelectorAll('.h-hero-orb');
    const heroSection = container.querySelector('.h-hero');
    if (!heroSection || !orbs.length) return;

    // Entrance timeline (existing code -- unchanged)
    // ... existing tl code ...

    // Parallax (NEW): orbs drift upward at different rates
    gsap.to(orbs[0], {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

    if (orbs[1]) {
      gsap.to(orbs[1], {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }
  });
}, { scope: containerRef });
```

### Pattern 4: Accent/Glow Parallax in AnimatedSection

**What:** SVG accents and glow elements inside sections receive a subtle parallax effect.

**When to use:** Sections that contain `.h-accent` SVG elements or `.h-dark-glow` / `.h-final-glow` decorative divs.

**Key consideration:** SVG accents are `display: none` below 768px (CSS media query). The parallax matchMedia condition should include `(min-width: 769px)` so ScrollTriggers are not created for hidden elements.

**Example in AnimatedSection:**
```typescript
// Inside useGSAP, after the reveal timeline code

// Parallax on SVG accents (if present)
const accents = section.querySelectorAll('.h-accent');
accents.forEach((accent, i) => {
  gsap.to(accent, {
    y: i % 2 === 0 ? -30 : -20,  // alternate displacement for variety
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
    },
  });
});

// Parallax on dark section glows (if present)
const glows = section.querySelectorAll('.h-dark-glow');
glows.forEach((glow, i) => {
  gsap.to(glow, {
    y: i === 0 ? -40 : -25,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
    },
  });
});

// Parallax on final CTA glow (if present)
const finalGlow = section.querySelector('.h-final-glow');
if (finalGlow) {
  gsap.to(finalGlow, {
    y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
    },
  });
}
```

### Anti-Patterns to Avoid

- **Parallax on text content:** VISUAL-03 explicitly states parallax on decorative elements only. Text parallax causes readability issues and is listed in the project's Out of Scope section ("Parallax on text content: Makes text hard to read, cognitive dissonance between content layers").
- **Large displacement values:** Excessive `y` values (e.g., -200px+) make the parallax obvious and distracting. The goal is "subtle enough to feel natural -- enhances spatial perception without calling attention to itself." Keep displacement under 100px.
- **Using `yPercent` instead of `y`:** `yPercent` moves relative to the element's own size. For decorative elements of varying sizes (400px orb vs 20px accent), percentage-based movement produces inconsistent visual results. Pixel values (`y`) give direct control over displacement magnitude.
- **Forgetting `ease: "none"`:** When scrub is active, easing creates non-linear mapping to scroll position. For parallax, linear (`ease: "none"`) is standard -- the element moves proportionally to scroll at all points.
- **Creating ScrollTriggers for hidden elements:** At < 768px, orbs and accents are `display: none`. Creating ScrollTriggers for invisible elements wastes resources and can cause layout calculation issues. Gate behind `(min-width: 769px)` media query.
- **Animating `top`/`left` instead of `transform`:** CSS `top`/`left` changes trigger layout recalculation. GSAP's `y` property maps to `translateY()`, which is compositor-friendly (GPU-accelerated, no layout thrash).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-linked element movement | Custom scroll event listener + manual transform | ScrollTrigger with scrub | ScrollTrigger handles Lenis integration, resize recalculation, cleanup, and scroll position normalization. Manual listeners miss the Lenis smooth scroll position. |
| Different scroll speed ratios | requestAnimationFrame loop with scroll delta math | Multiple gsap.to() with different y values | GSAP handles RAF internally via ticker, avoids duplicate loops, provides automatic cleanup via useGSAP |
| Responsive parallax disabling | Manual window.matchMedia listener | gsap.matchMedia() | Already used in project. Auto-reverts animations when media query changes (e.g., resize from desktop to mobile). |
| Motion preference gating | Custom prefers-reduced-motion listener | gsap.matchMedia() compound query | Combine `(prefers-reduced-motion: no-preference) and (min-width: 769px)` in a single matchMedia condition. Already established pattern in the codebase. |

**Key insight:** The project already has the complete infrastructure for scrub-based parallax. ScrollTrigger, Lenis sync, useGSAP cleanup, and matchMedia gating are all in place. Phase 7 is purely additive -- a handful of `gsap.to()` calls inside existing hooks.

## Common Pitfalls

### Pitfall 1: Parallax Conflicts with Entrance Animations
**What goes wrong:** The entrance timeline animates orbs with `gsap.from(orbs, { scale: 0.8, opacity: 0 })`. If the parallax tween also uses `gsap.from()` or targets the same properties, they conflict.
**Why it happens:** Two GSAP tweens targeting the same property on the same element at overlapping times.
**How to avoid:** Parallax uses `gsap.to()` on `y` property only. Entrance uses `gsap.from()` on `scale` and `opacity`. They animate orthogonal properties and don't conflict. The hero entrance timeline plays once on page load; parallax scrubs continuously. Since `y` is not animated in the hero entrance, there is no conflict.
**Warning signs:** Orbs jump or flicker on scroll, especially near the top of the page.

### Pitfall 2: ScrollTrigger Created for display:none Elements
**What goes wrong:** At < 768px, hero orbs (`.h-hero-orb`) and SVG accents (`.h-accent`) are `display: none` via CSS media query. If ScrollTriggers are created for these elements, GSAP calculates trigger positions based on zero-size elements, causing incorrect behavior.
**Why it happens:** The JavaScript `useGSAP` runs regardless of CSS visibility unless gated by matchMedia.
**How to avoid:** Use a compound matchMedia condition: `(prefers-reduced-motion: no-preference) and (min-width: 769px)`. This ensures parallax ScrollTriggers are only created when elements are visible.
**Warning signs:** Console warnings about zero-height triggers, or invisible elements suddenly appearing at wrong positions on mobile.

### Pitfall 3: Parallax Displacement Exceeds Container Overflow
**What goes wrong:** If an orb with `position: absolute` moves beyond its container's bounds via parallax `y` displacement, and the container has `overflow: hidden`, the orb gets clipped mid-scroll.
**Why it happens:** The hero section and dark-inner both have `overflow: hidden` for containing their decorative elements.
**How to avoid:** Check the container overflow settings. The hero section (`.h-hero`) does NOT have `overflow: hidden` -- it is `position: relative` without overflow clipping. Orbs are free to move. The dark section (`.h-dark-inner`) DOES have `overflow: hidden`. Glows parallax must keep displacement small enough to stay within the container bounds, or the overflow needs to be adjusted. For `.h-dark-inner`, the container is 80px + content height padded, so -40px displacement is safe. The `.h-final` section also has `overflow: hidden` -- same constraint applies.
**Warning signs:** Decorative elements visibly clip or vanish at certain scroll positions.

### Pitfall 4: Too Many ScrollTrigger Instances
**What goes wrong:** Creating individual ScrollTrigger instances for every decorative element on the page (2 orbs + 4 accents + 2 dark glows + 1 final glow = 9 instances) adds to the ScrollTrigger refresh cycle.
**Why it happens:** Each ScrollTrigger instance must recalculate positions on resize/refresh.
**How to avoid:** 9 instances is fine -- this is well within GSAP's comfort zone. The concern would be 50+ instances. The existing page already has ~10 ScrollTrigger instances from section reveals + progress bar. Adding 9 more for parallax brings the total to ~19, which is perfectly manageable.
**Warning signs:** None expected at this scale. Only relevant if you add parallax to hundreds of elements.

### Pitfall 5: Over-Animating -- Parallax That Calls Attention to Itself
**What goes wrong:** Displacement values too large make the parallax effect obvious and distracting, breaking the "quietly authoritative" aesthetic.
**Why it happens:** Easy to over-tune during development on large monitors.
**How to avoid:** Keep hero orb displacement at 50-80px, accent displacement at 20-30px, glow displacement at 25-40px. Test at multiple viewport sizes. The requirement states "subtle enough to feel natural -- enhances spatial perception without calling attention to itself."
**Warning signs:** You notice the parallax. If it's noticeable, it's too strong. Good parallax is felt, not seen.

## Decorative Element Inventory

Complete inventory of elements eligible for parallax:

| Element | CSS Class | Location | Container | Overflow | Visible | Recommended Y |
|---------|-----------|----------|-----------|----------|---------|---------------|
| Hero orb 1 (gold) | `.h-hero-orb--1` | Hero section | `.h-hero` (no overflow) | No clip | Desktop only (hidden < 768px) | -50px |
| Hero orb 2 (teal) | `.h-hero-orb--2` | Hero section | `.h-hero` (no overflow) | No clip | Desktop only (hidden < 768px) | -80px |
| Diamond accent (Services) | `.h-accent--diamond.h-accent--tr` | Services `.h-sect-head` | `.h-sect` | No clip | Desktop only (hidden < 768px) | -25px |
| Ring accent (Services) | `.h-accent--ring.h-accent--bl` | Services `.h-sect-head` | `.h-sect` | No clip | Desktop only (hidden < 768px) | -18px |
| Ring accent (Process) | `.h-accent--ring.h-accent--tr` | Process `.h-sect-head` | `.h-sect` | No clip | Desktop only (hidden < 768px) | -22px |
| Diamond accent (Pricing) | `.h-accent--diamond.h-accent--tl` | Pricing `.h-sect-head` | `.h-sect` | No clip | Desktop only (hidden < 768px) | -25px |
| Ring accent (FAQ) | `.h-accent--ring.h-accent--br` | FAQ `.h-sect-head` | `.h-sect` | No clip | Desktop only (hidden < 768px) | -18px |
| Dark glow 1 (gold) | `.h-dark-glow--1` | Outcomes `.h-dark-inner` | `.h-dark-inner` | `overflow: hidden` | Always | -35px |
| Dark glow 2 (teal) | `.h-dark-glow--2` | Outcomes `.h-dark-inner` | `.h-dark-inner` | `overflow: hidden` | Always | -25px |
| Final CTA glow | `.h-final-glow` | Final CTA `.h-final` | `.h-final` | `overflow: hidden` | Always | -25px |

**Note:** Dark glows and final glow are NOT hidden at mobile breakpoints. However, their parallax effect is less useful on touch devices with shorter scroll distances. Gating behind `(min-width: 769px)` is appropriate for consistency (parallax is a desktop-enhancement pattern).

## Code Examples

### Example 1: Hero Orb Parallax (in HeroEntrance)

```typescript
// Inside HeroEntrance useGSAP, after the entrance timeline
// Source: GSAP ScrollTrigger scrub docs + project conventions

// Gate parallax behind desktop + no-reduced-motion
mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', () => {
  const container = containerRef.current;
  if (!container) return;

  const orbs = container.querySelectorAll('.h-hero-orb');
  const heroSection = container.querySelector('.h-hero');
  if (!heroSection || !orbs.length) return;

  // Orb 1: gold, larger, slower drift (deeper layer)
  gsap.to(orbs[0], {
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',      // hero starts at viewport top (above fold)
      end: 'bottom top',     // until hero bottom reaches viewport top
      scrub: 0.5,
    },
  });

  // Orb 2: teal, smaller, faster drift (closer layer)
  if (orbs[1]) {
    gsap.to(orbs[1], {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }
});
```

### Example 2: SVG Accent Parallax (in AnimatedSection)

```typescript
// Inside AnimatedSection useGSAP, after the reveal timeline
// Only runs on desktop where accents are visible
// Source: GSAP ScrollTrigger scrub docs

// Separate matchMedia for parallax (needs min-width gate)
mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', () => {
  const container = containerRef.current;
  if (!container) return;

  const section = container.querySelector('section');
  if (!section) return;

  // SVG geometry accents
  const accents = section.querySelectorAll('.h-accent');
  accents.forEach((accent, i) => {
    gsap.to(accent, {
      y: i % 2 === 0 ? -25 : -18,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  });

  // Dark section glows
  const glows = section.querySelectorAll('.h-dark-glow');
  glows.forEach((glow, i) => {
    gsap.to(glow, {
      y: i === 0 ? -35 : -25,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  });

  // Final CTA glow
  const finalGlow = section.querySelector('.h-final-glow');
  if (finalGlow) {
    gsap.to(finalGlow, {
      y: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }
});
```

### Example 3: Compound matchMedia Query

```typescript
// The project already uses gsap.matchMedia() for reduced-motion gating.
// For parallax, we add a viewport width condition to avoid creating
// ScrollTriggers for display:none elements.

const mm = gsap.matchMedia();

// Existing entrance animations: only reduced-motion gated
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // ... entrance timeline (existing code) ...
});

// NEW: Parallax -- gated behind reduced-motion AND min-width
mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', () => {
  // ... parallax code ...
});
```

**Note:** `gsap.matchMedia()` supports multiple `.add()` calls with different conditions. When the media query stops matching, GSAP auto-reverts all animations created inside that callback. This means if a user resizes from desktop to mobile, the parallax ScrollTriggers are automatically killed.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery parallax plugins (Stellar.js, etc.) | GSAP ScrollTrigger scrub | 2020+ | Native RAF, GPU compositing, automatic cleanup |
| ScrollSmoother data-speed attributes | ScrollTrigger scrub with Lenis | 2023+ | Lenis provides smooth scroll; ScrollTrigger scrub handles parallax. No need for ScrollSmoother's custom scroll container. |
| CSS `background-attachment: fixed` | Transform-based parallax via JS | Always | CSS fixed attachment is broken on iOS, doesn't work for arbitrary elements, poor performance |
| Manual requestAnimationFrame scroll listeners | useGSAP with ScrollTrigger | @gsap/react 2.x (2024+) | Automatic context cleanup, no memory leaks, integrates with React lifecycle |
| CSS `animation-timeline: scroll()` | GSAP ScrollTrigger scrub | 2025+ (CSS spec evolving) | CSS scroll-driven animations are not yet Baseline. When they are, simple cases could migrate, but GSAP provides more control and is already in the bundle. |

**Deprecated/outdated:**
- `gsap.context()` manual usage: `useGSAP` wraps this automatically. No need for manual context creation.
- `will-change: transform` on parallax elements: Modern browsers handle this automatically for transform animations. Adding `will-change` pre-emptively can actually harm performance by consuming GPU memory. GSAP applies it optimally during animation. Avoid setting it in CSS.

## Open Questions

1. **Hero parallax start position: `top top` vs `top bottom`**
   - What we know: The hero section is above the fold. At page load, the hero top IS at the viewport top (`top top`). Using `start: "top bottom"` would mean parallax starts before the section is visible, which for the hero is impossible (it's already visible on load).
   - What's unclear: Whether the entrance timeline's completion timing conflicts with parallax scrub starting at the same scroll position.
   - Recommendation: Use `start: "top top"` for hero orbs (they're already visible). The entrance timeline plays on page load (not scroll-triggered), so it completes before any scrolling occurs. Parallax kicks in only when the user starts scrolling. No conflict.

2. **Optimal displacement values**
   - What we know: VISUAL-03 says "0.4-0.6x scroll speed." The displacement values in this research (50-80px for orbs, 18-30px for accents) are starting points.
   - What's unclear: The exact "right" values depend on section heights, viewport size, and aesthetic judgment.
   - Recommendation: Start with the values in the inventory table. Test at 1440px and 1024px viewports. Adjust if the effect is too strong or too subtle. The requirement says "subtle" -- err on the side of less displacement. These can be fine-tuned during implementation.

## Sources

### Primary (HIGH confidence)
- [Context7 /llmstxt/gsap_llms_txt](https://context7.com) - ScrollTrigger scrub property, start/end positions, matchMedia, gsap.to pattern
- [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) - scrub, trigger, start, end, toggleActions API reference
- [GSAP Common ScrollTrigger Mistakes](https://gsap.com/resources/st-mistakes) - Looping pattern, duration with scrub, nested timeline issues
- Project codebase analysis - hero-entrance.tsx, animated-section.tsx, landing-home.css, landing-animations.css (verified current element structure, overflow settings, media queries)

### Secondary (MEDIUM confidence)
- [GSAPify ScrollTrigger Guide (2025)](https://gsapify.com/gsap-scrolltrigger) - Parallax pattern with layer index multiplication, scrub best practices, batch() for parallax layers
- [GSAP Community: Parallax with ScrollTrigger](https://gsap.com/community/forums/topic/25542-parallax-effect-using-scrolltrigger/) - End position recommendations, selector conventions
- [Shakuro: Optimizing Complex Animations (2025)](https://shakuro.com/blog/optimizing-complex-animations-tips-and-tricks) - GPU performance, will-change best practices, transform vs top/left

### Tertiary (LOW confidence)
- None -- all critical patterns verified against official docs and codebase analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, everything is installed and working
- Architecture: HIGH -- patterns verified against GSAP docs and consistent with existing codebase conventions (useGSAP, matchMedia, ScrollTrigger)
- Pitfalls: HIGH -- identified from codebase analysis (overflow hidden containers, display:none responsive behavior, entrance animation property conflicts)
- Displacement values: MEDIUM -- starting point values based on common practice; exact tuning requires visual testing

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable -- GSAP API and project architecture are mature)
