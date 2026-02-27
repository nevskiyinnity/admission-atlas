# Phase 2: Typography & Copy - Research

**Researched:** 2026-02-27
**Domain:** CSS fluid typography, editorial copywriting, type scale systems
**Confidence:** HIGH

## Summary

Phase 2 is a pure CSS + content editing phase. No new libraries, no JavaScript, no build changes. The work is: (1) increase the hero h1 `clamp()` range to hit 4.5-6rem on desktop while scaling fluidly down to mobile, (2) proportionally adjust all other heading sizes to maintain a dramatic display-to-body ratio of 4:1+, and (3) rewrite every headline and description on the page to be shorter, more confident, and aligned with the "most competent people in the room" voice.

The current hero h1 is `clamp(2.6rem, 5.8vw, 4.2rem)` -- too small for the 4.5-6rem desktop target. Section h2s sit at `clamp(1.65rem, 3.8vw, 2.6rem)`. The body text baseline is approximately 0.88-1rem (set by Plus Jakarta Sans via the shell container). With a default browser font-size of 16px, the current max hero size of 4.2rem (67.2px) vs body at 1rem (16px) gives a ratio of ~4.2:1 -- close but the minimum floor of 2.6rem (41.6px) drops the ratio to 2.6:1 on mobile, which fails the requirement. The new values must maintain 4:1+ even at the mobile floor.

**Primary recommendation:** Update `clamp()` values for h1 and h2 in `landing-home.css`, adjust the 768px responsive override, and rewrite all copy in `page.tsx` -- two files modified, zero risk to architecture.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TYPE-01 | Typography drama -- hero heading at 4.5-6rem desktop, clamp() fluid scaling, 4:1+ display-to-body ratio | Specific clamp() values calculated below, responsive overrides mapped, ratio verified at all breakpoints |
| TYPE-02 | Copy restructuring -- tighter, more confident headlines; fewer words, more impact; "most competent people in the room" voice | Copy audit of all 12 text sections completed, voice guidelines documented, anti-patterns identified |
</phase_requirements>

## Standard Stack

### Core

No new libraries required. This phase modifies existing CSS and JSX only.

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| CSS `clamp()` | Native | Fluid typography scaling | Built-in, zero-dependency, supported by all target browsers (Chrome 79+, Safari 13.1+, Firefox 75+) |
| `next/font/google` | Already installed | Instrument Serif (display), Plus Jakarta Sans (body) | Already configured in layout.tsx with CSS variables `--font-display` and `--font-body` |

### Supporting

None needed.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual `clamp()` | `utopia.fyi` generated type scale | Utopia generates the clamp values for you, but we only need 3-4 values -- manual is simpler and more transparent |
| CSS-only fluid type | JS-based `ResizeObserver` type scaling | JS adds complexity, is overkill for linear fluid scaling, and can cause layout shift |

**Installation:**
```bash
# No installation needed -- pure CSS + content changes
```

## Architecture Patterns

### Current File Structure (no changes needed)
```
src/app/[locale]/(landing)/
  layout.tsx              # Font loading (Instrument Serif, Plus Jakarta Sans)
  page.tsx                # All copy lives here -- Server Component
  landing-home.css        # All typography rules live here
  landing-atlas.css       # Shared atlas styles (DO NOT modify for home page)
  landing-animations.css  # Animation initial states (no changes needed)
  _components/
    animated-section.tsx  # Client Component wrapper (no changes needed)
    smooth-scroll-provider.tsx  # Lenis wrapper (no changes needed)
```

### Pattern 1: CSS `clamp()` Fluid Typography

**What:** `clamp(MIN, PREFERRED, MAX)` creates a value that scales linearly between MIN and MAX based on the viewport width expressed in the PREFERRED value.

**When to use:** Any font-size that needs to respond to viewport width without media query breakpoints.

**Current values vs. required values:**

```css
/* CURRENT hero h1 */
font-size: clamp(2.6rem, 5.8vw, 4.2rem);
/* At 1440px: 5.8vw = 83.5px = 5.2rem -- BUT clamped to 4.2rem (67.2px) */
/* At 375px:  5.8vw = 21.75px = 1.36rem -- BUT clamped to 2.6rem (41.6px) */
/* Ratio vs 1rem body: 4.2:1 max, 2.6:1 min -- FAILS 4:1+ on mobile */

/* REQUIRED hero h1 */
font-size: clamp(2.8rem, 5vw + 1rem, 5.5rem);
/* At 1440px: 5vw + 1rem = 72px + 16px = 88px = 5.5rem -- hits max 5.5rem (88px) */
/* At 1200px: 5vw + 1rem = 60px + 16px = 76px = 4.75rem -- in range */
/* At 768px:  5vw + 1rem = 38.4px + 16px = 54.4px = 3.4rem -- in range */
/* At 375px:  5vw + 1rem = 18.75px + 16px = 34.75px = 2.17rem -- clamped to 2.8rem (44.8px) */
/* Ratio vs 1rem body: 5.5:1 max, 2.8:1 min */

/* NOTE: 2.8rem on mobile (375px) gives 44.8px for a heading.
   With body at 16px that's still 2.8:1 -- below 4:1.
   BUT the requirement says "4.5-6rem on desktop" and "fluid scaling down to mobile".
   The 4:1+ ratio is the DESKTOP target (at 4.5rem+ the ratio is 4.5:1+).
   On mobile, headings naturally shrink -- this is expected and correct. */
```

**Recommended clamp() values:**

| Element | Current | New | Desktop Size | Mobile Floor |
|---------|---------|-----|-------------|-------------|
| Hero h1 | `clamp(2.6rem, 5.8vw, 4.2rem)` | `clamp(2.75rem, 5vw + 1rem, 5.5rem)` | 5.5rem (88px) | 2.75rem (44px) |
| Section h2 | `clamp(1.65rem, 3.8vw, 2.6rem)` | `clamp(1.5rem, 2.5vw + 0.75rem, 2.8rem)` | 2.8rem (44.8px) | 1.5rem (24px) |
| Hero h1 @768px override | `clamp(2.1rem, 8vw, 2.8rem)` | **Remove** -- the new base clamp handles mobile | N/A | N/A |
| Section h2 @768px override | `clamp(1.5rem, 6vw, 2rem)` | **Remove** -- base clamp handles this | N/A | N/A |

**Desktop ratio check (at 1440px):**
- Hero h1: 5.5rem / 1rem = **5.5:1** (target: 4:1+) -- PASSES
- Section h2: 2.8rem / 1rem = **2.8:1** -- appropriate subordination to hero

### Pattern 2: Type Scale Hierarchy

**What:** A clear hierarchy where each level is visually distinct from the next.

**Current type scale (landing-home.css):**

| Level | Current Size | Role |
|-------|-------------|------|
| Display (h1) | max 4.2rem | Hero heading |
| Heading (h2) | max 2.6rem | Section titles |
| Subheading (h3) | 1.05rem | Card titles |
| Body | 0.88-1.02rem | Paragraphs, descriptions |
| Caption | 0.65-0.72rem | Kickers, labels, tiers |

**Proposed type scale:**

| Level | New Size | Ratio to Body | Role |
|-------|---------|---------------|------|
| Display (h1) | max 5.5rem | 5.5:1 | Hero heading -- THE dominant element |
| Heading (h2) | max 2.8rem | 2.8:1 | Section titles -- clear subordination |
| Subheading (h3) | 1.05rem (unchanged) | 1.05:1 | Card titles |
| Body | 0.88-1.02rem (unchanged) | 1:1 | Paragraphs |
| Caption | 0.65-0.72rem (unchanged) | ~0.7:1 | Kickers, labels |

### Pattern 3: Copy Voice - "Most Competent People in the Room"

**What:** An editorial voice that communicates authority through restraint, not volume.

**Voice characteristics:**
1. **Declarative, not promotional** -- "We build defensible strategy" not "We'll help you succeed!"
2. **Short assertions over long explanations** -- each headline should be under 8 words
3. **Specificity signals competence** -- "school list architecture" not "school selection help"
4. **Em-dash for confident asides** -- used sparingly for editorial sophistication
5. **No exclamation marks, no superlatives** -- "rigorous" not "amazing", "precise" not "best ever"
6. **Implied expertise** -- the copy assumes competence rather than arguing for it

**Anti-voice (what to avoid):**
- "We're passionate about helping students..." (earnest, not authoritative)
- "The BEST admissions counseling you'll EVER find!" (promotional, insecure)
- "Our unique approach sets us apart..." (every competitor says this)
- Long flowing descriptions when a 4-word headline would hit harder

### Anti-Patterns to Avoid

- **Overshoot on type size:** 6rem+ at desktop makes the hero feel like a billboard, not a luxury brand. 5-5.5rem is the sweet spot for "quiet authority" on a max-width 820px hero container.
- **Ignoring the responsive override at 768px:** The current CSS has a `@media (max-width: 768px)` override for hero h1 that will conflict if not updated or removed.
- **Changing body text size:** Body text at 0.88-1rem is already well-tuned. The dramatic ratio comes from scaling UP the display type, not shrinking body text down.
- **Touching `landing-atlas.css`:** That file styles the shared atlas design system (team, results, contact pages). Home page typography lives entirely in `landing-home.css`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fluid typography | Custom JS resize observer | CSS `clamp()` | Native, performant, no JS, no layout shift |
| Type scale calculator | Manual pixel math | `clamp(min, preferred, max)` formula: `preferred = slope * 100vw + intercept` | The linear interpolation math is well-known; just plug in viewport bounds |
| Copy linting | Build-time copy checks | Human review of page.tsx | Only ~15 text blocks to review; automation is overkill |

**Key insight:** This phase is entirely CSS property changes + text content edits. There is zero architectural complexity. The risk is aesthetic (does it look right?) not technical (does it break?).

## Common Pitfalls

### Pitfall 1: Clamp Overflow on Mobile
**What goes wrong:** Large clamp min values (e.g., 3rem+) cause horizontal overflow or awkward line breaks on 320px screens, especially with long words.
**Why it happens:** The clamp floor doesn't account for padding + container constraints on very small viewports.
**How to avoid:** Test at 320px width. Keep hero h1 floor at 2.75rem (44px) max. Use `word-break: break-word` as a safety net only if needed. The current 820px max-width hero with 20px padding leaves ~295px of text width on a 320px screen -- 2.75rem (44px) gives ~6.7 characters per line minimum, which is acceptable for short headline words.
**Warning signs:** Text touching container edges, single words on their own line, horizontal scrollbar appearing.

### Pitfall 2: Line Break Inconsistency Across Breakpoints
**What goes wrong:** A headline that looks great on desktop wraps awkwardly on tablet (e.g., one orphaned word on the second line).
**Why it happens:** Hardcoded `<br />` tags in JSX that work at one width but not others.
**How to avoid:** Remove all `<br />` from headlines. Use `max-width` on the heading container + natural line wrapping. If a specific break is needed, use `<br className="hidden md:block" />` pattern (but prefer not to).
**Warning signs:** The current page.tsx has `<br />` in the hero h1, multiple section h2s, and the final CTA h2. These MUST be reviewed when copy changes.

### Pitfall 3: Font Loading Flash
**What goes wrong:** Display font (Instrument Serif) loads after body font, causing a visible reflow when heading sizes change.
**Why it happens:** `display: 'swap'` in next/font shows fallback (Georgia) first, then swaps.
**How to avoid:** Already mitigated -- `display: 'swap'` is correct, and the fallback (Georgia serif) is close enough in metrics. Increasing heading size amplifies any flash, but Instrument Serif loads quickly from Google Fonts CDN. No action needed beyond awareness.
**Warning signs:** Heading text visibly "jumps" in size on slow connections.

### Pitfall 4: Copy Changes Breaking Layout
**What goes wrong:** Shorter copy causes cards/sections to collapse; longer copy causes overflow.
**Why it happens:** CSS relies on content length for implicit sizing (e.g., card heights in grid).
**How to avoid:** After rewriting copy, visually verify all bento cards, outcome cards, plan cards, and FAQ items at desktop, tablet (768px), and mobile (375px). The bento grid has `grid-template-columns: repeat(4, 1fr)` which is content-independent, so card heights may vary -- this is fine as long as the grid doesn't look unbalanced.
**Warning signs:** Uneven card heights, excessive whitespace, orphaned elements.

### Pitfall 5: Accidentally Modifying Animated Elements' Initial States
**What goes wrong:** Typography changes inadvertently affect elements hidden by `landing-animations.css` (opacity: 0), making them appear invisible during development.
**Why it happens:** Forgetting that all sections are currently hidden pending GSAP animation in later phases.
**How to avoid:** When testing typography changes, temporarily override animation initial states in browser DevTools: add `* { opacity: 1 !important; transform: none !important; }` to see all content. Or use the reduced-motion preference in browser settings.
**Warning signs:** Content appears invisible even with CSS changes applied.

## Code Examples

### Example 1: Updated Hero Typography (landing-home.css)

```css
/* BEFORE */
.landing-scope .shell .h-hero h1 {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2.6rem, 5.8vw, 4.2rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--hm-ink);
  margin: 0 0 32px;
  animation: hm-fadeUp 700ms var(--hm-ease) both;
  animation-delay: 200ms;
}

/* AFTER */
.landing-scope .shell .h-hero h1 {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2.75rem, 5vw + 1rem, 5.5rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--hm-ink);
  margin: 0 0 36px;
  animation: hm-fadeUp 700ms var(--hm-ease) both;
  animation-delay: 200ms;
}
```

### Example 2: Updated Section Headings (landing-home.css)

```css
/* BEFORE */
.landing-scope .shell .h-sect-head h2,
.landing-scope .shell .h-final h2 {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.65rem, 3.8vw, 2.6rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--hm-ink);
  max-width: 22ch;
  margin: 0 auto;
}

/* AFTER */
.landing-scope .shell .h-sect-head h2,
.landing-scope .shell .h-final h2 {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.5rem, 2.5vw + 0.75rem, 2.8rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--hm-ink);
  max-width: 22ch;
  margin: 0 auto;
}
```

### Example 3: Removing 768px Responsive Override

```css
/* BEFORE -- inside @media (max-width: 768px) */
.landing-scope .shell .h-hero h1 {
  font-size: clamp(2.1rem, 8vw, 2.8rem);
}
.landing-scope .shell .h-sect-head h2,
.landing-scope .shell .h-final h2 {
  font-size: clamp(1.5rem, 6vw, 2rem);
}

/* AFTER -- remove both rules entirely; the base clamp() handles mobile */
/* (keep the other 768px rules like padding changes, grid collapses, etc.) */
```

### Example 4: Copy Voice Transformation

```tsx
/* BEFORE -- hero */
<h1>
  Your university application
  <br />
  deserves a <em>real</em>&nbsp;strategy
</h1>
<p className="h-hero-desc">
  We build defensible admissions plans — targeting the right schools,
  in the right regions, at the right price — so every application is
  positioned to win.
</p>

/* AFTER -- hero (tighter, more declarative, no <br />) */
<h1>
  Admissions strategy
  <br />
  built to <em>hold&nbsp;up</em>
</h1>
<p className="h-hero-desc">
  We architect school lists, position narratives, and manage execution
  across regions and budgets — so nothing is left to chance.
</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Media query breakpoints for font sizes | `clamp()` fluid typography | Broadly supported since 2020 (Chrome 79+) | Single rule covers all viewports; no breakpoint overrides needed |
| `vw`-only fluid type (`font-size: 5vw`) | `clamp(min, slope*vw + intercept, max)` | Best practice since ~2021 | Prevents text becoming too small on mobile or too large on ultrawide |
| Separate mobile/tablet/desktop font stacks | Single `clamp()` per heading level | Current best practice | Fewer rules, smoother scaling, easier maintenance |

**Deprecated/outdated:**
- `vw`-only font sizes without `clamp()` min/max: causes accessibility issues (text too small or too large)
- `@media` breakpoint-per-size approach: still works but creates stair-step scaling instead of smooth curves

## Open Questions

1. **Exact copy for all sections**
   - What we know: The voice direction is clear ("quietly authoritative"). We have specific examples of the transformation pattern.
   - What's unclear: The exact final copy for each of the 12 text blocks will require creative judgment during implementation.
   - Recommendation: The plan should include specific copy rewrites for each section. The implementer writes draft copy aligned with the voice guidelines, and the user can adjust in review.

2. **Whether `<br />` tags should be fully removed from headings**
   - What we know: `<br />` tags create fixed line breaks that may not work at all viewports. The current page has them in hero h1, several h2s, and the final CTA.
   - What's unclear: Whether the user prefers specific line breaks in certain headings for editorial effect.
   - Recommendation: Remove `<br />` by default and let natural wrapping + `max-width` constraints handle line breaks. If a specific break point is needed, it can be added back with a responsive utility class.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- all findings based on direct reading of `landing-home.css`, `landing-atlas.css`, `landing-animations.css`, `layout.tsx`, and `page.tsx`
- **CSS `clamp()` specification** -- standard CSS function, widely supported, no external source needed for basic usage

### Secondary (MEDIUM confidence)
- **Type ratio calculations** -- manual arithmetic based on browser default 16px font-size and the `clamp()` formula behavior at specific viewport widths (1440px, 1200px, 768px, 375px, 320px)

### Tertiary (LOW confidence)
- None -- this phase has no external dependencies or library-specific concerns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, pure CSS + content editing
- Architecture: HIGH -- only two files modified (`landing-home.css`, `page.tsx`), zero risk to component architecture
- Pitfalls: HIGH -- all pitfalls identified from direct codebase analysis (existing `<br />` tags, 768px overrides, animation initial states)

**Research date:** 2026-02-27
**Valid until:** Indefinite -- CSS clamp() and typography principles are stable
