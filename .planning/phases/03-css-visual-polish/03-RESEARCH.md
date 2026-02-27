# Phase 3: CSS Visual Polish - Research

**Researched:** 2026-02-27
**Domain:** CSS animations, gradient effects, SVG decorative elements, accordion patterns
**Confidence:** HIGH

## Summary

Phase 3 adds visual richness using only CSS -- no new JS dependencies, no GSAP involvement. The four requirements break into two pure CSS animation tasks (gradient mesh backgrounds, SVG geometry accents), one hover-state consistency audit, and one FAQ accordion rewrite. All techniques use well-supported CSS features (keyframes, grid-template-rows, `@property`, transforms) that work across modern browsers.

The primary technical challenge is the FAQ accordion: replacing the native `<details>` snap with a smooth CSS `grid-template-rows: 0fr -> 1fr` transition. This requires restructuring the HTML slightly (moving content into a sibling div with grid applied, using the Tailwind `peer` / CSS `:has()` pattern, or wrapping the content div inside `<details>`). The gradient mesh and SVG accents are straightforward CSS keyframe work with no cross-browser risk.

**Primary recommendation:** Implement in two plans -- Plan 03-01 handles gradient backgrounds + SVG geometry accents (purely additive CSS), Plan 03-02 handles the FAQ accordion rewrite + hover transition audit (touches existing markup and styles).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISUAL-01 | Animated gradient mesh / aurora backgrounds -- slow-breathing radial gradients behind hero and CTA sections using CSS animations (15-25s cycles) | Gradient mesh via stacked radial-gradients with `@keyframes` animating `background-position`, or use `@property` to animate color stops directly. Both patterns documented below. |
| VISUAL-04 | Subtle animated SVG geometry accents -- rotating diamonds, pulsing rings near section headings (CSS keyframes, 8-12% opacity) | Inline SVG elements with `@keyframes` for rotation and opacity pulse. Position absolute within section headers. No libraries needed. |
| MICRO-03 | Smooth FAQ accordion -- animated open/close via CSS `grid-template-rows` (no JS needed), replacing native details snap | `grid-template-rows: 0fr -> 1fr` transition on a wrapper div. Requires HTML restructure to separate `<details>` toggle from the animated content container. Pattern verified and documented below. |
| MICRO-04 | Enhanced hover transitions on all interactive elements -- consistent easing, subtle scale/shadow responses across nav links, buttons, cards, footer links | Audit existing transitions (currently inconsistent: 160ms-400ms, mixed easing). Standardize to `--hm-ease` with 200ms default duration. Add missing hover states where needed. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS `@keyframes` | Native | Breathing gradient animations, SVG rotation/pulse, chevron rotation | Zero-JS, compositor-friendly when animating transforms/opacity |
| CSS `grid-template-rows` | Native | Smooth accordion height animation (0fr -> 1fr) | Cross-browser since Chrome 107 / Safari 16.4 / Firefox 66; avoids JS height calculation |
| CSS `@property` | Native (Baseline 2024) | Type-safe custom properties for gradient color stop animation | Baseline July 2024 -- supported in Chrome 85+, Firefox 128+, Safari 15.4+ |
| Inline SVG | Native | Decorative geometry accents (diamonds, rings) | No external files, CSS-animatable, tiny payload |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS custom properties | Native | Shared easing, duration, color tokens | Already established (`--hm-ease`, `--hm-ease-out`); extend with `--hm-dur` if needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@property` gradient animation | `background-position` shift on oversized gradient | `background-position` has universal support but animates on main thread (repaint); `@property` is compositor-friendly but needs Baseline 2024. Use `background-position` as fallback. |
| `grid-template-rows` accordion | `interpolate-size` / `::details-content` | `interpolate-size` is Chromium-only (Feb 2026). `::details-content` baseline Sept 2025. `grid-template-rows` has wider support -- use it. |
| Inline SVG accents | CSS `::before`/`::after` with borders | Pseudo-elements can make diamonds/shapes, but SVG is more flexible for rings and complex geometry. SVG preferred for maintainability. |

**Installation:**
```bash
# No packages to install -- pure CSS phase
```

## Architecture Patterns

### Recommended File Organization

All new CSS goes into `landing-home.css`. No new CSS files needed.

```
src/app/[locale]/(landing)/
├── landing-home.css          # Add gradient, SVG accent, and accordion styles here
├── landing-animations.css    # Add prefers-reduced-motion overrides for new animations
├── page.tsx                  # Minimal HTML changes (FAQ structure, SVG accent elements)
└── _components/              # No new components needed
```

### Pattern 1: Breathing Gradient Mesh (VISUAL-01)

**What:** Stacked radial-gradient layers with `@keyframes` animating `background-position` on a large background-size (300%+ of container). Creates a slow-breathing aurora effect.

**When to use:** Hero section background, CTA section background.

**Approach A -- background-position shift (universal support):**
```css
.h-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(158,124,56,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(26,107,90,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(27,58,75,0.08) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: hm-gradient-breathe 20s ease-in-out infinite alternate;
}

@keyframes hm-gradient-breathe {
  0%   { background-position: 0% 0%; }
  50%  { background-position: 100% 100%; }
  100% { background-position: 0% 100%; }
}
```

**Approach B -- @property color stop animation (Baseline 2024+, smoother):**
```css
@property --mesh-x {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 20%;
}
@property --mesh-y {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 30%;
}

.h-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at var(--mesh-x) var(--mesh-y), rgba(158,124,56,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at calc(100% - var(--mesh-x)) calc(100% - var(--mesh-y)), rgba(26,107,90,0.10) 0%, transparent 50%);
  animation: hm-mesh-drift 22s ease-in-out infinite alternate;
}

@keyframes hm-mesh-drift {
  0%   { --mesh-x: 20%; --mesh-y: 30%; }
  33%  { --mesh-x: 70%; --mesh-y: 60%; }
  66%  { --mesh-x: 40%; --mesh-y: 80%; }
  100% { --mesh-x: 60%; --mesh-y: 20%; }
}
```

**Recommendation:** Use Approach A (`background-position` shift) for maximum compatibility. The existing hero already has `::before`/`::after` pseudo-elements in use on some containers, so use a dedicated child div or pick the available pseudo-element. The hero section itself does not use `::before`, so it is available. The CTA callout inner uses `::before` for grain, so use `::after` there.

**Performance note:** `background-position` animates on the main thread (triggers repaint), but at 20s cycle duration the repaints are infrequent and imperceptible to performance. This is standard practice for ambient background effects.

### Pattern 2: SVG Geometry Accents (VISUAL-04)

**What:** Small inline SVG elements (diamond shapes, ring/circle outlines) positioned near section headings with CSS keyframe animations for slow rotation and opacity pulsing.

**When to use:** Near `.h-sect-head` elements, positioned absolute relative to the heading container.

**Example -- rotating diamond:**
```html
<!-- In page.tsx, inside h-sect-head -->
<svg class="h-accent h-accent--diamond" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)"
        fill="none" stroke="currentColor" stroke-width="1"/>
</svg>
```

```css
.h-accent {
  position: absolute;
  width: 24px;
  height: 24px;
  color: var(--hm-gold);
  opacity: 0.10;
  pointer-events: none;
}

.h-accent--diamond {
  top: -8px;
  right: -32px;
  animation: hm-spin-slow 30s linear infinite;
}

@keyframes hm-spin-slow {
  to { transform: rotate(360deg); }
}
```

**Example -- pulsing ring:**
```html
<svg class="h-accent h-accent--ring" viewBox="0 0 32 32" aria-hidden="true">
  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="1"/>
</svg>
```

```css
.h-accent--ring {
  bottom: -12px;
  left: -28px;
  animation: hm-pulse-ring 6s ease-in-out infinite alternate;
}

@keyframes hm-pulse-ring {
  0%   { opacity: 0.08; transform: scale(1); }
  100% { opacity: 0.12; transform: scale(1.15); }
}
```

**Key constraints:**
- Opacity MUST be 8-12% (requirement spec)
- Use `aria-hidden="true"` on all accents -- purely decorative
- Position relative to `.h-sect-head` (add `position: relative` to it)
- Hide on mobile (768px breakpoint) to avoid visual clutter

### Pattern 3: FAQ Accordion with grid-template-rows (MICRO-03)

**What:** Replace the native `<details>` snap open/close with a smooth CSS animation using `grid-template-rows: 0fr -> 1fr`.

**Challenge:** The `<details>` element natively shows/hides content. To animate, the content wrapper needs to be a CSS grid container that transitions `grid-template-rows`. The content itself needs `overflow: hidden`.

**Recommended HTML structure:**
```html
<div class="h-faq-item">
  <details class="h-faq-toggle">
    <summary>
      Question text
      <span class="h-faq-chevron" aria-hidden="true"></span>
    </summary>
  </details>
  <div class="h-faq-body">
    <div class="h-faq-body-inner">
      <p>Answer text</p>
    </div>
  </div>
</div>
```

**CSS pattern:**
```css
.h-faq-item {
  /* existing styles remain */
}

.h-faq-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms var(--hm-ease);
}

.h-faq-body-inner {
  overflow: hidden;
}

/* When the sibling details is open, expand the grid row */
.h-faq-toggle[open] + .h-faq-body {
  grid-template-rows: 1fr;
}
```

**Important implementation detail:** The current structure has `<details class="h-faq-item">` with `<summary>` and `<p>` inside. The new structure wraps `<details>` and the answer div as siblings inside a container div. The `<details>` element becomes just the toggle (summary only), and the answer content moves into the grid-animated sibling. The `+` adjacent sibling selector connects them.

**Alternative approach (simpler, keeps content inside details):**
```css
/* If we keep content inside <details>, wrap it in a grid div */
.h-faq-item[open] .h-faq-body {
  grid-template-rows: 1fr;
}
```
This only works if we add a wrapper div inside `<details>` around the answer content. The closing animation won't work with native `<details>` because the browser hides content immediately on close. The sibling approach (separating `<details>` from content) gives both open AND close animation.

**Recommended:** Use the sibling approach for both open and close animations. This requires moving the `<p>` answer outside `<details>` into a sibling `<div>`.

### Pattern 4: Hover Transition Audit (MICRO-04)

**What:** Standardize all hover transitions to use consistent easing and duration values.

**Current state (inconsistent):**
| Element | Current Duration | Current Easing |
|---------|-----------------|----------------|
| Nav links | 160ms | none (linear) |
| Nav login | 160ms | none (linear) |
| Nav CTA | 200ms | none (linear) |
| Primary buttons | 200ms | none (linear) |
| Ghost buttons | 200ms | none (linear) |
| Outline buttons | 200ms | none (linear) |
| Bento cards | 400ms | `var(--hm-ease)` |
| Timeline dots | 300ms | `var(--hm-ease)` |
| Outcome cards | 300ms | `var(--hm-ease)` |
| Plan cards | 350ms | `var(--hm-ease)` |
| FAQ items | 300ms | `var(--hm-ease)` |
| Footer links | 160ms | none (linear) |

**Target state:**
- Small elements (nav links, footer links, icon states): 160ms with `var(--hm-ease)`
- Buttons: 200ms with `var(--hm-ease)`
- Cards (larger transform + shadow): 300ms with `var(--hm-ease)`
- Always include easing function -- no raw durations

**Implementation:** Add `var(--hm-ease)` to every `transition` declaration that currently lacks it. Adjust outlier durations (400ms bento -> 300ms, 350ms plan -> 300ms) for consistency.

### Anti-Patterns to Avoid

- **Animating `background-image` directly:** CSS cannot interpolate between gradient values (except via `@property`). Use `background-position` or `background-size` shifts on oversized gradients instead.
- **Animating layout properties for accordion:** Never animate `height`, `max-height`, or `padding` for open/close. `grid-template-rows` is the correct pattern -- it avoids layout thrash and handles auto height.
- **Forgetting `overflow: hidden` on accordion inner div:** Without it, content is visible even at `0fr` (the grid cell is 0-height but content overflows).
- **Using `animation` on hover states:** Hover effects should use `transition`, not `@keyframes`. Animations don't reverse on unhover; transitions do.
- **SVG accents that compete with content:** Keep accents at 8-12% opacity. Higher opacity makes them distracting. They're ambient texture, not focal elements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Height animation 0->auto | JS measuring element height + animating | CSS `grid-template-rows: 0fr -> 1fr` | Browser handles auto height calculation; JS approach causes layout thrash and reflows |
| Gradient interpolation | JS requestAnimationFrame gradient updates | CSS `@keyframes` with `background-position` or `@property` | 20s cycles don't need JS precision; CSS is more efficient for ambient effects |
| Hover state management | JS mouseenter/mouseleave handlers | CSS `transition` on `:hover` | CSS transitions are declarative, always reverse correctly, zero JS overhead |

**Key insight:** This entire phase is CSS-only by design. There is zero reason to reach for JavaScript. The FAQ accordion's `grid-template-rows` trick and `@property` gradient animation are the "modern" techniques; everything else is standard CSS keyframes and transitions.

## Common Pitfalls

### Pitfall 1: Details Element Closing Animation
**What goes wrong:** The opening animation works, but closing snaps instantly.
**Why it happens:** When `<details>` loses the `[open]` attribute, the browser immediately hides content -- the CSS transition never gets to run.
**How to avoid:** Use the sibling pattern: `<details>` contains only `<summary>`, the animated content is in a sibling `<div>`. The `[open] + .body` selector drives the animation, and when `[open]` is removed, the sibling div transitions back to `0fr` smoothly because it was never hidden by the browser.
**Warning signs:** Close animation snapping, content disappearing before transition completes.

### Pitfall 2: Gradient Animation Performance on Low-End Devices
**What goes wrong:** Background-position animation causes visible jank on older phones.
**Why it happens:** `background-position` triggers repaint on every frame (not compositor-only).
**How to avoid:** Use long cycle times (20s+) so repaints are spread out. Add `will-change: background-position` to hint the browser. Disable via `prefers-reduced-motion`. On mobile, the hero orbs are already hidden; consider hiding gradient animation below 768px too if performance is a concern.
**Warning signs:** Choppy gradient movement, high paint time in DevTools Performance tab.

### Pitfall 3: SVG Accents Visible During FOUC
**What goes wrong:** SVG geometry accents flash visible before GSAP sets initial states.
**Why it happens:** SVG accents are new elements not covered by the existing `landing-animations.css` initial states.
**How to avoid:** These accents are CSS-animated (not GSAP-animated), so they DON'T need initial state hiding. They should be visible immediately. BUT they DO need `prefers-reduced-motion` handling -- add `animation: none` for them in the reduced-motion media query.
**Warning signs:** Accents spinning/pulsing for users who have reduced motion enabled.

### Pitfall 4: FAQ Accordion Accessibility
**What goes wrong:** Screen readers can't find the answer content because it's outside the `<details>` element.
**Why it happens:** Moving content out of `<details>` into a sibling div breaks the semantic association.
**How to avoid:** Use `aria-controls` on `<summary>` pointing to the answer div's `id`, and `aria-labelledby` on the answer div pointing back to the summary. Also set `role="region"` on the answer div. Test with VoiceOver.
**Warning signs:** Screen reader users can't discover answers, or answers are read in wrong order.

### Pitfall 5: Pseudo-Element Conflicts on CTA Sections
**What goes wrong:** Adding a gradient `::before` pseudo-element overwrites an existing one.
**Why it happens:** `.h-callout-inner::before` and `.h-dark-inner::before` are already used for grain/glow overlays.
**How to avoid:** Audit which pseudo-elements are in use before adding gradients. Use `::after` where `::before` is taken, or use a dedicated child `<div>` element instead of pseudo-elements.
**Warning signs:** Grain texture disappearing, gradient replacing existing decorative layers.

## Code Examples

Verified patterns from official sources and community best practices:

### Breathing Gradient Background
```css
/* Source: Community pattern, verified across multiple implementations */
/* Uses background-position shift on oversized gradient -- universal support */

.h-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(158,124,56,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(26,107,90,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(27,58,75,0.06) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: hm-gradient-breathe 22s ease-in-out infinite alternate;
}

@keyframes hm-gradient-breathe {
  0%   { background-position: 0% 0%; }
  33%  { background-position: 100% 50%; }
  66%  { background-position: 50% 100%; }
  100% { background-position: 100% 0%; }
}
```

### Grid-Template-Rows Accordion
```css
/* Source: Community pattern, widely documented
   Browser support: Chrome 107+, Safari 16.4+, Firefox 66+ */

/* Wrapper div around details + content */
.h-faq-item {
  /* existing border, background styles */
}

/* The grid container that animates */
.h-faq-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms var(--hm-ease);
}

/* The overflow container inside the grid */
.h-faq-body-inner {
  overflow: hidden;
}

/* Adjacent sibling selector: when details is open, expand grid row */
.h-faq-toggle[open] + .h-faq-body {
  grid-template-rows: 1fr;
}

/* Chevron rotation follows the same open state */
.h-faq-toggle[open] .h-faq-chevron {
  transform: rotate(180deg);
}
```

### Reduced Motion Override for New Animations
```css
/* Add to existing @media (prefers-reduced-motion: reduce) block in landing-animations.css */
@media (prefers-reduced-motion: reduce) {
  /* Gradient breathing */
  .landing-scope .shell .h-hero::before,
  .landing-scope .shell .h-final::before,
  .landing-scope .shell .h-callout-inner::after {
    animation: none !important;
  }

  /* SVG geometry accents */
  .landing-scope .shell .h-accent {
    animation: none !important;
  }

  /* FAQ accordion -- instant open/close instead of animated */
  .landing-scope .shell .h-faq-body {
    transition: none !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS-measured height animation | `grid-template-rows: 0fr/1fr` | Chrome 107 (Oct 2022), Safari 16.4 (Mar 2023) | No JS needed for height:auto animation |
| `max-height: 9999px` hack | `grid-template-rows: 0fr/1fr` | Same | No arbitrary max-height, no delay mismatch |
| JS gradient animation loop | `@property` typed custom properties | Baseline July 2024 | Browser interpolates gradient stops natively |
| `background-size` shift | `background-position` shift on 200%+ gradient | Always available | Smoother than size changes, less reflow |
| `interpolate-size: allow-keywords` | Experimental; Chromium-only | Chrome 129 (2024) | NOT ready for production -- use grid-template-rows instead |
| `::details-content` pseudo | Baseline September 2025 | Recent | Could be used for details styling, but grid-template-rows approach is more battle-tested |

**Deprecated/outdated:**
- `max-height` hack for accordion: Creates delayed close animation and arbitrary limits. Use `grid-template-rows` instead.
- JS `Element.animate()` for details open/close: Unnecessary complexity when CSS grid handles it.
- `interpolate-size`: Chromium-only as of February 2026. Not cross-browser ready.

## Open Questions

1. **Pseudo-element availability on `.h-final` section**
   - What we know: `.h-final` has a `.h-final-glow` child div for the glow effect, and the section itself doesn't use `::before` or `::after`
   - What's unclear: Whether adding a `::before` for the breathing gradient will layer correctly with the existing `.h-final-glow` div
   - Recommendation: Test layering with `z-index` control during implementation. The `::before` should sit below `.h-final-glow`.

2. **FAQ answer content outside `<details>` -- SEO implications**
   - What we know: Content is still in the DOM, still visible when details is open
   - What's unclear: Whether search engines expect FAQ content inside `<details>` for FAQ rich snippets
   - Recommendation: Add `aria-controls`/`aria-labelledby` to maintain semantic association. Monitor with Structured Data Testing Tool if FAQ schema is in use.

## Sources

### Primary (HIGH confidence)
- [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) -- Baseline July 2024 status confirmed
- [MDN: ::details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content) -- Baseline September 2025 status confirmed
- [MDN: grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows) -- Full browser support confirmed

### Secondary (MEDIUM confidence)
- [DEV.to: CSS trick height 0 to auto](https://dev.to/francescovetere/css-trick-transition-from-height-0-to-auto-21de) -- grid-template-rows accordion pattern verified
- [DEV.to: CSS Only Accordion with animations](https://dev.to/neophen/css-only-accordion-with-animations-2d8n) -- sibling pattern for details element confirmed
- [CSS-Tricks: State of Changing Gradients](https://css-tricks.com/the-state-of-changing-gradients-with-css-transitions-and-animations/) -- gradient animation limitations and workarounds
- [web.dev: @property superpowers](https://web.dev/articles/at-property) -- @property registration and gradient animation
- [Dalton Walsh: Aurora CSS Background Effect](https://daltonwalsh.com/blog/aurora-css-background-effect/) -- layered gradient breathing technique

### Tertiary (LOW confidence)
- None -- all findings verified through multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all CSS-native features, no dependencies, well-documented browser support
- Architecture: HIGH -- patterns verified through MDN docs and multiple community implementations; existing codebase structure is clear
- Pitfalls: HIGH -- accordion closing animation gotcha is the #1 documented pitfall; all others are standard CSS awareness

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable CSS features, no rapid change expected)
