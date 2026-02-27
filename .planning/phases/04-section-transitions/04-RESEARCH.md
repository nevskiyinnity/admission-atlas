# Phase 4: Section Transitions & Dark Atmosphere - Research

**Researched:** 2026-02-27
**Domain:** CSS gradient transitions, atmospheric section design, grain density control, animated glow elements
**Confidence:** HIGH

## Summary

Phase 4 transforms the page from stacked blocks into a continuous visual journey. Two distinct CSS problems need solving: (1) gradient bleeds between all adjacent sections to eliminate hard color boundaries, and (2) an atmospheric upgrade to the dark outcomes section that makes it feel like entering a different environment -- not just a background-color change.

The current architecture uses `.landing-scope:has(.shell)` to set a warm page-level gradient (`#FAFAF7` -> `var(--hm-bg)` -> `#F2EDE4`). Individual sections sit on this background with `margin-top: 140px` gaps between them. The dark section (`.h-dark-sect` / `.h-dark-inner`) is a `border-radius: 24px` navy card with a static radial gradient overlay via `::before`. There is no transition between the warm page background and the dark section -- it is an abrupt visual boundary. The grain overlay (`.h-grain`) is a fixed-position element at `opacity: 0.28` with a single density across the entire page.

The implementation is entirely CSS-only. No GSAP involvement is needed (scroll-triggered effects come in Phase 6). The gradient bleed technique uses pseudo-elements with radial/linear gradients positioned at section boundaries. The dark section atmospheric upgrade adds an enveloping gradient that extends beyond the card's border-radius, increased grain density via a local grain overlay element, and animated glow elements using CSS keyframes (reusing the established `hm-gradient-breathe` pattern with adapted colors).

**Primary recommendation:** Implement in a single plan with two tasks -- Task 1 handles gradient bleeds between all adjacent sections (the "continuous flow" problem), Task 2 handles the dark section atmospheric upgrade (enveloping gradient, grain density shift, animated glows, transition gradient at the entry boundary).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISUAL-02 | Section transition design -- gradient bleeds between sections, dark section feels like entering a different atmosphere (grain density shift, gradient overlay at boundary) | Gradient bleed pseudo-elements between adjacent sections; dark section boundary gradient overlay; local grain density element within dark section |
| VISUAL-05 | Dark outcomes section atmospheric upgrade -- enveloping gradient, increased grain density, animated glow elements, gradient bleed transition from previous section | Enveloping gradient extends beyond .h-dark-inner card; dedicated grain overlay inside .h-dark-sect; animated radial glow elements via CSS keyframes; gradient transition pseudo-element at top of dark section |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS `::before`/`::after` pseudo-elements | Native | Gradient bleed overlays between sections, atmospheric overlays | Zero payload, compositable, precise positioning relative to section boundaries |
| CSS `radial-gradient` / `linear-gradient` | Native | Gradient bleeds, enveloping dark atmosphere, glow elements | Universal browser support, compositable with `pointer-events: none` |
| CSS `@keyframes` | Native | Animated glow elements in dark section | Reuses existing `hm-gradient-breathe` pattern from Phase 3; compositor-friendly at long cycle durations |
| CSS custom properties | Native | Token-based opacity and color control for grain density | Already established (`--hm-*` tokens); extend with dark-section-specific tokens |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Inline SVG (`feTurbulence`) | Native | Grain texture with adjustable density | Used for the dark section's higher-density grain overlay -- the existing `.h-grain` uses this pattern |
| CSS `mix-blend-mode` | Native | Blending grain overlay with dark background | Optional: if standard opacity overlay doesn't produce the desired grain-on-dark aesthetic |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pseudo-element gradient bleeds | CSS `mask-image` on sections | `mask-image` is cleaner conceptually but requires careful edge handling; pseudo-elements are simpler to debug and position |
| Local grain overlay element | Adjusting global `.h-grain` opacity per section | Global grain is `position: fixed` -- cannot vary per section. A local overlay is the only way to increase density in one area |
| CSS keyframe glow animations | GSAP-animated glows | Phase 4 is CSS-only by design (GSAP scroll effects are Phase 6); CSS keyframes match Phase 3 patterns |
| Extending `.h-dark-inner` boundaries | Full-width dark background section | The current rounded-card design is intentional -- the atmospheric upgrade should preserve the card aesthetic while making the surrounding area also feel dark |

**Installation:**
```bash
# No packages to install -- pure CSS phase
```

## Architecture Patterns

### Recommended File Organization

All new CSS goes into `landing-home.css`. Minor HTML additions to `page.tsx` (glow elements, grain overlay div inside dark section). Reduced-motion overrides in `landing-animations.css`.

```
src/app/[locale]/(landing)/
  landing-home.css          # Gradient bleed styles, dark section atmosphere, glow animations
  landing-animations.css    # Reduced-motion overrides for new animations
  page.tsx                  # Add glow divs and grain overlay inside dark section
```

### Pattern 1: Gradient Bleed Between Adjacent Sections

**What:** A soft gradient overlay positioned at the boundary between two adjacent sections, creating a visual "bleed" that prevents hard color transitions. Implemented as a pseudo-element on the lower section that extends upward into the gap.

**When to use:** Between every pair of adjacent sections on the page.

**Technique:** Use `::before` on each section to place a gradient that fades from the previous section's color scheme into the current one. Position it above the section content using negative `top` values.

```css
/* Gradient bleed INTO a standard section from the section above */
.h-sect::before,
.h-dark-sect::before {
  content: "";
  position: absolute;
  top: -70px; /* extends into the gap between sections */
  left: -28px;
  right: -28px;
  height: 140px; /* spans the full gap */
  pointer-events: none;
  z-index: 0;
}

/* Each section's bleed fades FROM the previous section's tone */
/* Example: bleed into services section from metrics */
#services::before {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(248, 246, 241, 0.4) 50%,
    transparent 100%
  );
}
```

**Important considerations:**
- Sections currently use `margin-top: 140px` for spacing. The bleed pseudo-element should span part of this gap.
- Sections need `position: relative` to anchor the pseudo-element (`.h-sect-head` already has it; `.h-sect` itself needs it added).
- The gradient bleed should be subtle -- 30-50% opacity at peak -- to create a "mist" effect, not a solid band.
- The bleed FROM the warm background INTO the dark section is the most critical transition (success criteria #3).

### Pattern 2: Dark Section Boundary Transition

**What:** A deliberate atmospheric shift at the boundary where the page transitions from the warm light theme into the dark outcomes section. This is the signature transition -- not just a background change.

**When to use:** At the top edge of `.h-dark-sect`.

**Technique:** A gradient overlay pseudo-element on `.h-dark-sect` that creates a "darkening" effect above the navy card, combined with a separate gradient that bleeds warm tones into the dark boundary.

```css
/* The atmospheric transition INTO the dark section */
.h-dark-sect::before {
  content: "";
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 200px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(27, 58, 75, 0.08) 0%,
    rgba(15, 37, 51, 0.04) 40%,
    transparent 70%
  );
}
```

**Key design principle:** The warm-to-dark transition should feel like entering a different space. The gradient should darken the background above the card, creating a "shadow" or "depth" effect as if the dark section is pulling the visitor in.

### Pattern 3: Enveloping Dark Section Gradient

**What:** Extending the dark atmosphere beyond the `.h-dark-inner` card so the entire `.h-dark-sect` area feels dark, not just the card.

**When to use:** On the `.h-dark-sect` element itself.

**Technique:** Add a background gradient to `.h-dark-sect` (currently transparent) that creates an ambient dark wash around the card.

```css
.h-dark-sect {
  /* existing: margin-top, margin-left/right, padding */
  position: relative;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(27, 58, 75, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 30%, rgba(15, 25, 35, 0.04) 0%, transparent 50%);
}
```

### Pattern 4: Increased Grain Density in Dark Section

**What:** A local grain overlay inside the dark section with higher density than the global `.h-grain` (which is at `opacity: 0.28`).

**When to use:** Inside `.h-dark-inner` to create a grittier, more atmospheric texture.

**Technique:** Add a dedicated grain overlay element inside the dark section with higher opacity and potentially higher `baseFrequency` for denser noise.

```html
<!-- Inside .h-dark-inner in page.tsx -->
<div class="h-dark-grain" aria-hidden="true"></div>
```

```css
.h-dark-grain {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1; /* above the ::before gradient, below content */
  opacity: 0.06; /* higher effective grain than the global 0.03 */
  background-image: url("data:image/svg+xml,..."); /* same pattern, higher baseFrequency */
  background-size: 256px;
}
```

**Why a local element instead of adjusting global grain:**
- The global `.h-grain` is `position: fixed` and covers the entire viewport at uniform density.
- There is no CSS mechanism to vary a fixed overlay's opacity per-section.
- A local element inside `.h-dark-inner` with `border-radius: inherit` clips to the card shape.

### Pattern 5: Animated Glow Elements in Dark Section

**What:** Subtle radial glow elements that slowly shift position within the dark section, creating an "alive" atmospheric effect.

**When to use:** Inside `.h-dark-inner`, layered behind the content.

**Technique:** Dedicated `<div>` elements with radial gradients and the existing `hm-gradient-breathe` keyframe animation (or a variant with darker colors).

```html
<!-- Inside .h-dark-inner in page.tsx -->
<div class="h-dark-glow h-dark-glow--1" aria-hidden="true"></div>
<div class="h-dark-glow h-dark-glow--2" aria-hidden="true"></div>
```

```css
.h-dark-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  z-index: 1; /* below content (z-index 2+) */
}

.h-dark-glow--1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 15%;
  background: radial-gradient(circle, rgba(158, 124, 56, 0.12) 0%, transparent 70%);
  animation: hm-dark-glow 18s ease-in-out infinite alternate;
}

.h-dark-glow--2 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  right: 15%;
  background: radial-gradient(circle, rgba(26, 107, 90, 0.10) 0%, transparent 70%);
  animation: hm-dark-glow 22s ease-in-out infinite alternate-reverse;
}

@keyframes hm-dark-glow {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
  50%  { transform: translate(30px, -20px) scale(1.1); opacity: 1; }
  100% { transform: translate(-20px, 15px) scale(0.95); opacity: 0.8; }
}
```

**Design notes:**
- Gold (`--hm-gold`) and teal (`--hm-teal`) glow colors match the project palette.
- Long animation cycles (18-22s) match Phase 3 breathing pattern durations.
- Desynchronized durations prevent synchronized pulsing (established Phase 3 decision).
- `filter: blur(60px)` creates soft ambient glow, not sharp circles.
- `.h-dark-inner` already has `overflow: hidden`, so glows clip to the card boundary.

### Anti-Patterns to Avoid

- **Gradient bleed on the page background instead of on sections:** Avoid modifying the `.landing-scope:has(.shell)` background gradient to create per-section color changes. This would break the unified warm background and create maintenance complexity. Instead, use per-section pseudo-element overlays.
- **Making the dark section full-width:** The dark section's rounded-card design (`.h-dark-inner` with `border-radius: 24px`) is a deliberate design choice. The atmospheric upgrade should enhance the card, not replace it with a full-bleed dark background.
- **Over-saturating grain in dark section:** The existing global grain at `opacity: 0.28` / inner `opacity: 0.03` on the SVG is very subtle. The dark section's local grain should be noticeably denser but not gritty -- aim for `opacity: 0.05-0.08` on the SVG element.
- **Animated glows that compete with content:** Glow elements must stay behind content (z-index layering) and at low opacity. They are atmospheric texture, not focal elements.
- **Using `box-shadow` for atmospheric transition:** `box-shadow` on `.h-dark-inner` would create an outward glow but cannot create the directional "entering a space" effect. Gradient pseudo-elements are more controllable and atmospheric.
- **Forgetting `position: relative` on sections:** Gradient bleed pseudo-elements require their parent to be `position: relative`. `.h-sect` currently has no explicit position -- it must be added.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-section grain density | JS IntersectionObserver changing global grain opacity | Local grain overlay element per section | CSS-only, no JS needed; positioned element with different opacity |
| Atmospheric color transitions | JS scroll-linked background-color changes | CSS pseudo-element gradient overlays | Phase 4 is CSS-only; scroll-linked effects are Phase 6 |
| Animated glow movement | GSAP-animated glow positions | CSS `@keyframes` with transform + opacity | Reuses Phase 3 pattern; GSAP not needed for ambient effects |

**Key insight:** This phase is entirely CSS-only, extending the pattern established in Phase 3. The atmospheric effects are all ambient/decorative and do not need scroll synchronization or JavaScript state management. CSS pseudo-elements and keyframe animations are the correct tool for every task in this phase.

## Common Pitfalls

### Pitfall 1: Pseudo-Element Collision on `.h-dark-inner`
**What goes wrong:** `.h-dark-inner::before` is already used for the existing radial gradient overlay (gold at 20% 0%, teal at 80% 100%). Adding new atmospheric gradients would overwrite it.
**Why it happens:** Each element has only two pseudo-elements (`::before` and `::after`).
**How to avoid:** Use dedicated child `<div>` elements for the new atmospheric glows and grain overlay. Keep the existing `::before` unchanged. The existing `::before` serves as the base gradient layer; new glows are separate positioned elements.
**Warning signs:** Existing gold/teal gradient overlay disappearing when new styles are added.

### Pitfall 2: Gradient Bleed Pseudo-Elements Receiving Clicks
**What goes wrong:** The gradient bleed overlays, positioned above sections, intercept pointer events on content below them.
**Why it happens:** Pseudo-elements are part of the DOM tree and receive events by default.
**How to avoid:** Always add `pointer-events: none` to gradient bleed pseudo-elements. This is already the pattern used for grain and glow overlays in the codebase.
**Warning signs:** Links or buttons near section boundaries become unclickable.

### Pitfall 3: Gradient Bleed Visible During FOUC / Initial Load
**What goes wrong:** Gradient bleed pseudo-elements flash briefly before the full page loads or before GSAP sets initial states.
**Why it happens:** CSS pseudo-elements render immediately; there is no hiding mechanism for them.
**How to avoid:** Gradient bleeds are always-visible decorative elements (like the grain overlay) -- they should NOT be hidden in animation initial states. They are part of the static visual design, not animated content. No FOUC concern applies.
**Warning signs:** N/A -- this is a non-issue if handled correctly. Only add to `prefers-reduced-motion` if the bleed itself is animated (it is not in the recommended approach).

### Pitfall 4: Dark Section Grain Not Clipping to Border-Radius
**What goes wrong:** The local grain overlay inside `.h-dark-inner` extends beyond the rounded corners.
**Why it happens:** Absolute-positioned children ignore parent `border-radius` unless the parent has `overflow: hidden`.
**How to avoid:** `.h-dark-inner` already has `overflow: hidden` (confirmed in codebase). The grain overlay will clip correctly. Use `border-radius: inherit` on the grain element as a safety measure.
**Warning signs:** Grain texture visible in the rounded corners, creating a visible rectangular shape.

### Pitfall 5: Z-Index Stacking Order Inside Dark Section
**What goes wrong:** Glow elements or grain overlay appear above the card content (text, icons, cards).
**Why it happens:** All absolutely positioned elements default to the same stacking context.
**How to avoid:** Establish clear z-index layers inside `.h-dark-inner`:
- `z-index: 0` -- existing `::before` gradient overlay
- `z-index: 1` -- new grain overlay and glow elements
- `z-index: 2` -- content (kicker, heading, outcome cards)
Content elements need `position: relative; z-index: 2` to stay above the atmospheric layers.
**Warning signs:** Text appearing behind glow effects, outcome cards losing hover interaction.

### Pitfall 6: `.h-sect` Missing `position: relative`
**What goes wrong:** Gradient bleed pseudo-elements position relative to a different ancestor.
**Why it happens:** `.h-sect` currently has no `position` property set. The pseudo-element would position relative to the nearest positioned ancestor (`.shell` at `position: relative`).
**How to avoid:** Add `position: relative` to `.h-sect` and `.h-dark-sect` before adding any pseudo-element gradient bleeds. `.h-dark-sect` also needs `position: relative`.
**Warning signs:** Gradient bleeds appearing at wrong positions, overlapping the wrong sections.

## Code Examples

### Section Gradient Bleed (Between Warm Sections)

```css
/* Source: Standard CSS gradient overlay technique */

/* Ensure all sections can anchor pseudo-elements */
.landing-scope .shell .h-sect,
.landing-scope .shell .h-dark-sect {
  position: relative;
}

/* Subtle warm-to-warm bleed between standard sections */
.landing-scope .shell .h-sect::before {
  content: "";
  position: absolute;
  top: -70px;
  left: -28px;
  right: -28px;
  height: 140px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    rgba(248, 246, 241, 0.5) 0%,
    transparent 70%
  );
}
```

### Dark Section Entry Transition

```css
/* Source: Atmospheric transition pattern */

/* Darkening gradient above the dark card */
.landing-scope .shell .h-dark-sect::before {
  content: "";
  position: absolute;
  top: -100px;
  left: -10%;
  right: -10%;
  height: 200px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(27, 58, 75, 0.08) 0%,
    rgba(15, 37, 51, 0.03) 50%,
    transparent 80%
  );
}
```

### Dark Section Content Z-Index Fix

```css
/* Source: Standard stacking context management */

/* Ensure content stays above atmospheric layers */
.landing-scope .shell .h-dark-inner .h-kicker,
.landing-scope .shell .h-dark-inner h2,
.landing-scope .shell .h-dark-inner .h-outcomes {
  position: relative;
  z-index: 2;
}
```

### Animated Glow Inside Dark Section

```css
/* Source: Extends Phase 3 hm-gradient-breathe pattern */

.landing-scope .shell .h-dark-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  z-index: 1;
}

.landing-scope .shell .h-dark-glow--1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 15%;
  background: radial-gradient(circle, rgba(158, 124, 56, 0.12) 0%, transparent 70%);
  animation: hm-dark-glow 18s ease-in-out infinite alternate;
}

.landing-scope .shell .h-dark-glow--2 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  right: 15%;
  background: radial-gradient(circle, rgba(26, 107, 90, 0.10) 0%, transparent 70%);
  animation: hm-dark-glow 22s ease-in-out infinite alternate-reverse;
}

@keyframes hm-dark-glow {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
  50%  { transform: translate(30px, -20px) scale(1.1); opacity: 1; }
  100% { transform: translate(-20px, 15px) scale(0.95); opacity: 0.8; }
}
```

### Reduced-Motion Override for New Animations

```css
/* Add to existing @media block in landing-animations.css */
@media (prefers-reduced-motion: reduce) {
  /* Dark section glow animations */
  .landing-scope .shell .h-dark-glow {
    animation: none !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hard section boundaries with solid backgrounds | Gradient bleed pseudo-elements at boundaries | Established CSS pattern | Seamless section flow without JS |
| Dark sections as full-width background-color bands | Dark card with atmospheric gradient envelope | Design trend 2024+ | More sophisticated, dimensional feel |
| Uniform page-wide grain texture | Per-section grain density control via local overlays | Standard overlay technique | Enables atmospheric variation without global changes |
| Static dark section backgrounds | Animated radial glow elements with CSS keyframes | Extends Phase 3 pattern | Ambient movement creates "living" atmosphere |

**Deprecated/outdated:**
- Full-width dark section bands: Modern design uses contained dark sections with atmospheric transitions, not hard background-color switches.
- JS-based scroll-linked color transitions: CSS gradient overlays achieve the "flowing" effect without scroll dependency.

## Open Questions

1. **Gradient bleed subtlety calibration**
   - What we know: Gradient bleeds need to be subtle enough to be felt, not seen. 30-50% opacity on the radial gradient seems right.
   - What's unclear: The exact opacity and spread values will need visual tuning during implementation.
   - Recommendation: Start at the lower end (30% opacity, 70% gradient spread) and increase if the effect is too subtle. Test on both light and dark monitors.

2. **Pseudo-element availability on `.h-sect` and `.h-dark-sect`**
   - What we know: `.h-sect` does not currently use `::before` or `::after`. `.h-dark-sect` does not use them either. `.h-dark-inner::before` IS used for the existing radial gradient overlay.
   - What's unclear: Whether future phases (5, 6, 7) plan to use `::before`/`::after` on `.h-sect` for scroll-triggered effects.
   - Recommendation: Use `::before` on `.h-sect` for gradient bleeds. If Phase 6 needs pseudo-elements, the gradient bleed can be moved to a child `<div>` at that time. Document this as a known interface point.

3. **Dark section grain texture appearance on dark background**
   - What we know: The existing grain SVG (`feTurbulence` with `baseFrequency: 0.65`) is designed for a light background. On a dark navy background, the visual effect will differ.
   - What's unclear: Whether the same SVG pattern produces a pleasing grain effect on dark backgrounds or needs `baseFrequency` adjustment.
   - Recommendation: Test the existing grain pattern first; adjust `baseFrequency` (try 0.75-0.85 for denser grain) and opacity if needed. The grain should be visible but not distracting.

4. **Gradient bleed interaction with `.h-callout` section**
   - What we know: `.h-callout` is a dark gradient banner similar to `.h-dark-sect`. The transition from FAQ (light) to Callout (dark) should also feel atmospheric.
   - What's unclear: Whether VISUAL-02 requires gradient bleeds on ALL section transitions or primarily the dark section.
   - Recommendation: Apply gradient bleeds to all sections for consistency, with a more pronounced transition effect at the dark section boundary specifically.

## Sources

### Primary (HIGH confidence)
- Project codebase: `landing-home.css` lines 592-667 (dark section existing styles) -- direct inspection
- Project codebase: `landing-home.css` lines 1-25 (token definitions) -- direct inspection
- Project codebase: `page.tsx` lines 219-271 (dark section HTML structure) -- direct inspection
- Phase 3 research and summary: established patterns for gradient meshes, animation durations, pseudo-element allocation

### Secondary (MEDIUM confidence)
- CSS gradient overlay technique for section transitions: widely documented pattern in modern CSS tutorials and design system implementations
- `feTurbulence` grain texture adjustments: SVG filter specification for noise generation

### Tertiary (LOW confidence)
- None -- all findings verified through codebase inspection and established CSS patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- pure CSS, no dependencies, all patterns verified in existing codebase
- Architecture: HIGH -- extends Phase 3 patterns directly; all file locations and naming conventions established
- Pitfalls: HIGH -- pseudo-element collisions and z-index stacking are the primary risks; both are well-understood and documented with specific solutions

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable CSS features, no rapid change expected)
