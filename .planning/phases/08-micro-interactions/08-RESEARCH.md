# Phase 8: Micro-Interactions - Research

**Researched:** 2026-02-27
**Domain:** Cursor-driven micro-interactions (magnetic buttons, 3D card tilt)
**Confidence:** HIGH

## Summary

Phase 8 adds two cursor-driven micro-interactions: magnetic CTA buttons and 3D tilt on bento grid cards. Both effects are fundamentally `mousemove`-driven animations that compute offsets from the element center, then apply transforms via GSAP. The key GSAP API is `gsap.quickTo()` -- a purpose-built method for high-frequency updates (like `mousemove`) that creates a reusable tween optimized for rapid value changes with built-in lerping. This is explicitly recommended by GSAP's official React documentation for pointer-tracking use cases.

The project already has GSAP 3.14.2 installed with `@gsap/react` 2.1.2, `useGSAP` for scoped cleanup, and `gsap.matchMedia()` for media query gating. No new dependencies are needed. Both effects share the same lifecycle pattern: compute offset on `mousemove`, animate with `quickTo`, reset on `mouseleave`, and gate behind `@media (hover: hover)` to ensure touch devices get standard (non-magnetic, non-tilt) hover states.

**Primary recommendation:** Use `gsap.quickTo()` for both effects. Create two new Client Component islands: `MagneticButton` (wraps CTAs) and `TiltCard` (wraps bento cards). Gate all pointer-tracking logic behind `@media (hover: hover)` via `gsap.matchMedia()` to disable on touch devices. Keep rotation clamped to 4-5 degrees max per the requirements.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MICRO-01 | Magnetic button effect on primary CTAs -- buttons subtly pull toward cursor within ~50px radius, lerped tracking, eased reset on mouseleave | `gsap.quickTo()` provides built-in lerp. Offset calculation via `getBoundingClientRect()`. Distance check against 50px radius threshold. Reset with `quickTo(0)`. Pattern verified in GSAP official React docs + multiple community implementations. |
| MICRO-02 | Card tilt/perspective on bento grid cards -- subtle 3D rotation (max 4-5deg) with radial gradient light sheen following cursor | `gsap.to()` on `rotationX`/`rotationY` with `gsap.utils.clamp()` for degree limits. Radial gradient via CSS custom properties `--mx`/`--my` updated on mousemove. CSS `perspective` on parent container. Pattern verified across GSAP forum + CodePen examples. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 | Animation engine -- `quickTo()`, `gsap.to()`, `gsap.utils.clamp()` | Already installed. `quickTo()` is GSAP's official API for high-frequency pointer-tracking animations |
| @gsap/react | 2.1.2 | `useGSAP` hook for scoped context + auto-cleanup | Already installed. Auto-reverts DOM on unmount |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gsap.matchMedia() | (built-in) | Gate hover effects behind `@media (hover: hover)` | Required to disable on touch devices |
| gsap.utils.clamp() | (built-in) | Constrain rotation degrees to safe range | Used in card tilt to enforce max 4-5deg |
| gsap.utils.mapRange() | (built-in) | Map pixel offset to rotation angle range | Optional: cleaner than manual division for rotation calc |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gsap.quickTo() | gsap.to() in mousemove | quickTo is 2-5x more performant for rapid updates -- reuses tween instance |
| gsap.quickTo() | gsap.quickSetter() | quickSetter gives zero lerp (instant snap). quickTo has built-in duration/ease, which is what creates the magnetic "pull" feel |
| CSS custom properties for light sheen | GSAP animating a pseudo-element position | CSS vars are simpler, no extra GSAP tweens needed, just set on mousemove |

**Installation:**
```bash
# No new packages needed -- everything ships with GSAP 3.14.2
```

## Architecture Patterns

### Recommended Component Structure
```
src/app/[locale]/(landing)/_components/
  magnetic-button.tsx        # NEW -- wraps h-btn-primary elements
  tilt-card.tsx              # NEW -- wraps h-bento-card elements
  animated-section.tsx       # EXISTING -- no changes needed
  hero-entrance.tsx          # EXISTING -- no changes needed
  gsap-registration.ts       # EXISTING -- no changes needed
```

### Pattern 1: MagneticButton -- Wrapper Component with quickTo
**What:** A thin Client Component that wraps any child element, adds pointer tracking within a ~50px radius, and applies lerped x/y transforms via `gsap.quickTo()`.
**When to use:** Wrap the three `h-btn-primary` elements (hero CTA, pricing CTA, final CTA).

**Example:**
```typescript
// Source: GSAP official React docs + olivierlarose tutorial (verified)
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from './gsap-registration';

const RADIUS = 50;   // activation radius in px
const STRENGTH = 0.4; // how far button moves (0-1, where 1 = full offset)

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(hover: hover)', () => {
      const el = wrapRef.current;
      if (!el) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          xTo(dx * STRENGTH);
          yTo(dy * STRENGTH);
        }
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);

      // useGSAP context cleanup removes tweens; manual listener cleanup
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    });
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
}
```

**Key design decisions:**
- `display: inline-block` wrapper preserves flex layout in hero-actions
- `STRENGTH = 0.4` means 40% of the offset distance (subtle pull, not jarring follow)
- `quickTo` duration 0.6s with `power3.out` creates the lerped magnetic feel
- Listener on the wrapper div, not the child -- avoids ref forwarding through Next.js `<Link>`
- `mousemove` on the element itself (not document) -- effect only when hovering near the button

### Pattern 2: TiltCard -- 3D Perspective with Light Sheen
**What:** A wrapper that adds 3D rotation on mousemove + radial gradient light sheen via CSS custom properties.
**When to use:** Wrap each `h-bento-card` element.

**Example:**
```typescript
// Source: GSAP forum verified pattern + freejsprojects.com code
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from './gsap-registration';

const MAX_ROTATION = 4; // degrees -- requirement says 4-5deg max

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(hover: hover)', () => {
      const card = cardRef.current;
      if (!card) return;

      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        // Normalized -0.5 to 0.5 from center
        const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
        const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

        const rotateY = gsap.utils.clamp(-MAX_ROTATION, MAX_ROTATION, xNorm * MAX_ROTATION * 2);
        const rotateX = gsap.utils.clamp(-MAX_ROTATION, MAX_ROTATION, -yNorm * MAX_ROTATION * 2);

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Update CSS custom properties for radial gradient sheen
        card.style.setProperty('--sheen-x', `${(e.clientX - rect.left)}px`);
        card.style.setProperty('--sheen-y', `${(e.clientY - rect.top)}px`);
      };

      const onLeave = () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'power3.out',
        });
        card.style.removeProperty('--sheen-x');
        card.style.removeProperty('--sheen-y');
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      return () => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      };
    });
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className={className} style={{ perspective: '800px', transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}
```

**CSS for light sheen (in landing-home.css):**
```css
/* Radial gradient light sheen -- follows cursor via CSS custom properties */
.landing-scope .shell .h-bento-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    300px 300px at var(--sheen-x, 50%) var(--sheen-y, 50%),
    rgba(158, 124, 56, 0.06) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 300ms var(--hm-ease);
  z-index: 1;
}

.landing-scope .shell .h-bento-card:hover::before {
  opacity: 1;
}
```

### Pattern 3: Media Query Gating via matchMedia
**What:** All cursor-tracking effects wrapped in `gsap.matchMedia()` with `(hover: hover)` condition.
**Why:** Touch devices (phones, tablets) get standard CSS hover states. Magnetic/tilt JS never initializes.

```typescript
// This pattern is already established in the codebase:
// - HeroEntrance: mm.add('(prefers-reduced-motion: no-preference)', ...)
// - AnimatedSection: mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', ...)
// Phase 8 adds: mm.add('(hover: hover)', ...) for pointer-dependent effects

mm.add('(hover: hover)', () => {
  // All magnetic/tilt logic here
  // On touch devices, this block never runs
  // Standard CSS :hover still works for touch-and-hold
});
```

### Anti-Patterns to Avoid
- **Listening on `document` for mousemove:** Wasteful -- listen on the element or its immediate parent only. Every mousemove on the page fires the handler otherwise.
- **Creating new tweens on every mousemove:** Use `quickTo()` or `overwrite: 'auto'` to reuse/replace tweens. Creating new `gsap.to()` on every frame without overwrite causes tween pile-up.
- **Putting perspective on the animated element:** Perspective must go on the PARENT container, not the rotating element itself. Putting it on the same element flattens the 3D effect.
- **Animating `left`/`top` instead of `transform`:** Layout-triggering. Always use `x`/`y` (translates) for magnetic, `rotationX`/`rotationY` for tilt.
- **Forgetting to remove event listeners:** `useGSAP` context cleanup handles GSAP tweens, but manual `addEventListener` requires manual `removeEventListener` in the cleanup return.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lerped pointer tracking | Manual RAF loop with lerp math | `gsap.quickTo()` | Built-in lerp, easing, tween reuse. Handles edge cases (rapid direction change, tab blur) |
| Clamping rotation values | Manual `Math.min(Math.max(...))` | `gsap.utils.clamp()` | Composable, pipe-friendly, tested edge cases |
| Range mapping (offset to degrees) | Manual division formulas | `gsap.utils.mapRange()` | Reusable, chainable with `pipe()` |
| Touch device detection | navigator.maxTouchPoints / ontouchstart | `@media (hover: hover)` via matchMedia | CSS media query is the standard; works with matchMedia for JS gating |

**Key insight:** GSAP already has purpose-built utilities for every computation needed here. The `quickTo()` method alone eliminates 80% of the complexity -- it manages tween lifecycle, lerping, and high-frequency update batching internally.

## Common Pitfalls

### Pitfall 1: Tween Pile-Up on Mousemove
**What goes wrong:** Creating a new `gsap.to()` on every mousemove event without `overwrite` causes hundreds of queued tweens, resulting in stuttering and eventual memory issues.
**Why it happens:** Each `gsap.to()` creates a new tween instance. At 60fps mousemove, that's 60 new tweens per second.
**How to avoid:** For magnetic buttons, use `gsap.quickTo()` (reuses one tween). For tilt cards, use `gsap.to()` with `overwrite: 'auto'` (kills conflicting tweens on same properties).
**Warning signs:** Dev tools shows increasing GSAP tween count; animation becomes sluggish after hovering for a few seconds.

### Pitfall 2: Perspective on Wrong Element
**What goes wrong:** 3D tilt looks flat/distorted because `perspective` is set on the rotating element instead of its parent.
**Why it happens:** CSS `perspective` defines the viewing distance for CHILDREN, not for the element itself.
**How to avoid:** Apply `perspective: 800px` on the parent wrapper, `transform-style: preserve-3d` on the rotating card.
**Warning signs:** Card rotation looks 2D or has fisheye distortion.

### Pitfall 3: Magnetic Effect on Next.js Link Components
**What goes wrong:** Trying to attach a ref directly to `<Link>` from next/link fails or requires `forwardRef`.
**Why it happens:** Next.js `<Link>` is a component, not a native element. Refs don't pass through automatically.
**How to avoid:** Wrap the `<Link>` in a `<div>` with the ref. The magnetic transform applies to the wrapper, which moves the child link along with it.
**Warning signs:** TypeScript error about ref not being assignable, or ref.current is null at runtime.

### Pitfall 4: Transform Conflict with Existing Hover States
**What goes wrong:** CSS `transform: translateY(-2px)` on `:hover` fights with GSAP's `x`/`y` transforms from the magnetic effect.
**Why it happens:** CSS hover transitions and GSAP both write to `transform`. GSAP wins (inline style), but the CSS transition on mouseleave can cause a snap.
**How to avoid:** For magnetic buttons, GSAP handles ALL transform. Remove or simplify the CSS `:hover` `transform` to only handle non-transform properties (background, box-shadow). Alternatively, let GSAP handle the hover lift too.
**Warning signs:** Button snaps back to position on mouseleave instead of smooth return.

### Pitfall 5: Bento Card ::after Pseudo-Element Conflict
**What goes wrong:** The existing `::after` on `.h-bento-card` (bottom gradient bar on hover) may conflict with the new `::before` for light sheen.
**Why it happens:** Both are positioned absolute over the card. Need to ensure z-index layering is correct.
**How to avoid:** Light sheen `::before` at `z-index: 1`, bottom bar `::after` at `z-index: 2` (or vice versa). Both use `pointer-events: none`.
**Warning signs:** Light sheen appears behind the card content or obscures the bottom bar.

## Code Examples

### gsap.quickTo() -- Magnetic Pull
```typescript
// Source: GSAP official docs (gsap.com/resources/react-basics)
// quickTo returns a function. Call it with new target values on each mousemove.
const xTo = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3.out' });
const yTo = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3.out' });

// On mousemove: compute offset from center, scale by strength
const rect = element.getBoundingClientRect();
const dx = e.clientX - (rect.left + rect.width / 2);
const dy = e.clientY - (rect.top + rect.height / 2);
xTo(dx * 0.4);  // 40% of offset = subtle pull
yTo(dy * 0.4);

// On mouseleave: reset to origin
xTo(0);
yTo(0);
```

### gsap.utils.clamp() -- Constrain Rotation
```typescript
// Source: GSAP utility docs (gsap.com/docs/v3/GSAP/UtilityMethods)
const MAX_DEG = 4;
const clampRotation = gsap.utils.clamp(-MAX_DEG, MAX_DEG);

// Mouse normalized to -0.5..0.5 from card center
const xNorm = (mouseX - rect.left) / rect.width - 0.5;
const rotateY = clampRotation(xNorm * MAX_DEG * 2); // maps -0.5..0.5 to -4..4, clamped
```

### CSS Custom Properties for Light Sheen
```css
/* Radial gradient positioned via JS-updated custom properties */
.card::before {
  background: radial-gradient(
    300px 300px at var(--sheen-x, 50%) var(--sheen-y, 50%),
    rgba(158, 124, 56, 0.06) 0%,
    transparent 60%
  );
}
```
```typescript
// JS: update on mousemove
card.style.setProperty('--sheen-x', `${mouseX - rect.left}px`);
card.style.setProperty('--sheen-y', `${mouseY - rect.top}px`);
```

### matchMedia Gating for Touch Devices
```typescript
// Source: Established project pattern (animated-section.tsx, hero-entrance.tsx)
const mm = gsap.matchMedia();

// Only runs on devices with fine pointer (mouse/trackpad)
mm.add('(hover: hover)', () => {
  // pointer-tracking code here
  // auto-cleaned when media query stops matching
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ontouchstart` / userAgent sniffing | `@media (hover: hover)` / `matchMedia` | 2022+ (Baseline) | Reliable, future-proof, no false positives from hybrid devices |
| Manual RAF lerp loops | `gsap.quickTo()` | GSAP 3.7+ (2021) | Built-in lerp, easing, tween recycling. 2-5x less code |
| `tilt.js` / `vanilla-tilt` libraries | GSAP `rotationX`/`rotationY` + utils | N/A | No extra dependency needed when GSAP is already present |
| Inline style `transform` concatenation | GSAP manages transform components independently | GSAP 3.0+ | GSAP handles transform decomposition; no string building needed |

**Deprecated/outdated:**
- `tilt.js` / `vanilla-tilt.js`: Unnecessary extra dependency when GSAP is already loaded. GSAP handles the same transforms with better control.
- `navigator.maxTouchPoints` for feature gating: Unreliable for hybrid devices. CSS `@media (hover: hover)` is the standard.
- Creating new tweens per mousemove without overwrite: Pre-GSAP 3.7 pattern. Use `quickTo()` instead.

## Open Questions

1. **Magnetic radius activation approach**
   - What we know: Requirement says "within ~50px radius". Two approaches: (a) listen on the button element and apply effect for all cursor positions, (b) listen on a larger wrapper/parent and only activate within 50px of button center.
   - What's unclear: Whether option (a) -- simply listening on the element -- provides enough radius since the cursor must already be over the button to trigger mousemove. For a ~50px radius extending beyond the button boundary, we'd need a slightly larger hit area.
   - Recommendation: Use a wrapper `<div>` with padding/margin that extends the hover zone to ~50px beyond the button edge. This keeps the approach simple (mousemove on the wrapper). Alternatively, use `mouseenter`/`mouseleave` on the button but `mousemove` on the parent container within a computed radius. The wrapper approach is cleaner.

2. **Transform conflict with existing CSS hover translateY**
   - What we know: `.h-btn-primary:hover` has `transform: translateY(-2px)`. GSAP's inline `transform` will override this.
   - What's unclear: Whether to remove the CSS hover transform entirely (let GSAP own all transforms) or integrate the lift into the GSAP magnetic effect.
   - Recommendation: Remove `transform` from the CSS `:hover` rule for magnetic-enabled buttons. Keep `background` and `box-shadow` hover transitions in CSS. Let GSAP handle all transform-based interactions. This avoids the CSS-vs-GSAP transform fight.

3. **TiltCard wrapper vs. direct DOM manipulation**
   - What we know: Bento cards are currently plain `<article>` elements. Wrapping each in `<TiltCard>` adds a div wrapper.
   - What's unclear: Whether the extra wrapper div affects the grid layout or the existing `::after` bottom bar pseudo-element.
   - Recommendation: Apply tilt directly to the `<article>` elements via a single parent component that queries `.h-bento-card` elements (similar to how AnimatedSection queries section children). This avoids wrapper divs in the DOM. Alternative: if wrapper approach is cleaner for isolation, apply `perspective` on the `.h-bento` grid container and let each card rotate within that shared perspective space.

## Sources

### Primary (HIGH confidence)
- GSAP official React docs (`gsap.com/resources/react-basics`) -- `quickTo` / `quickSetter` for mousemove
- GSAP utility methods docs (`gsap.com/docs/v3/GSAP/UtilityMethods`) -- `clamp()`, `mapRange()`
- GSAP best practices (`gsap.com/resources/mistakes`) -- overwrite, quickTo for dynamic targets
- Project codebase: `animated-section.tsx`, `hero-entrance.tsx`, `gsap-registration.ts` -- established `matchMedia` + `useGSAP` patterns

### Secondary (MEDIUM confidence)
- Olivier Larose tutorial (`blog.olivierlarose.com/tutorials/magnetic-button`) -- React + GSAP magnetic pattern verified against GSAP official docs
- GSAP forum thread (`gsap.com/community/forums/topic/24044`) -- Moderator-confirmed rotational transform approach for card tilt
- freejsprojects.com (`freejsprojects.com/post/15-pro-level-gsap-effects`) -- 3D tilt code with CSS custom property sheen

### Tertiary (LOW confidence)
- None -- all findings verified against official GSAP sources or moderator responses

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- GSAP 3.14.2 already installed, `quickTo()` is documented API, `matchMedia` is established project pattern
- Architecture: HIGH -- Component wrapper pattern matches existing `HeroEntrance` / `AnimatedSection` islands approach
- Pitfalls: HIGH -- Transform conflict, tween pile-up, and perspective placement are well-documented GSAP gotchas with clear solutions

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable -- GSAP APIs are mature and rarely change)
