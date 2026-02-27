# Phase 9: Performance & Quality Hardening - Research

**Researched:** 2026-02-27
**Domain:** Animation performance, memory management, accessibility, production quality
**Confidence:** HIGH

## Summary

Phase 9 is the final production-quality gate. The animation layer built across Phases 1-8 must now be audited for: compositor-friendly property usage, memory leak prevention, CSS/GSAP redundancy cleanup, reduced-motion completeness, and Lighthouse performance. This is an audit-and-fix phase, not a feature phase -- no new animations should be added.

The codebase is already well-structured: all GSAP animations use `useGSAP` for automatic cleanup, `gsap.matchMedia()` gates all motion behind `prefers-reduced-motion: no-preference`, and the animation property choices (transform, opacity, clip-path) are already compositor-friendly. The primary work is: (1) removing 5 redundant CSS `hm-fadeUp` animations that shadow GSAP choreography, (2) verifying zero layout-triggering properties across all animation code, (3) running a Lighthouse audit and addressing any score-dropping issues, and (4) conducting a restraint review to enforce the "2-4 hero moments" rule.

**Primary recommendation:** This phase is a systematic audit with targeted fixes -- not a rewrite. Fix the known CSS/GSAP redundancies first, then audit property usage, then Lighthouse, then the subjective restraint review.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Lighthouse performance score >= 90 with all animations active | Lighthouse CLI audit pattern; check LCP/CLS/TBT impact of animation code; potential issues: large CSS file, unoptimized keyframes, render-blocking resources |
| PERF-02 | All animations use compositor-friendly properties only (transform, opacity, clip-path, filter) -- no layout-triggering animations | Audit all CSS keyframes and GSAP `.from()/.to()` calls; known clean except hm-fadeUp keyframe (uses transform+opacity, compositor-friendly but redundant); check for any `width`, `height`, `margin`, `padding`, `top`, `left` animations |
| PERF-03 | GSAP cleanup on component unmount via useGSAP -- no memory leaks on navigation | All 6 client components already use `useGSAP` with `scope`; SmoothScrollProvider uses `useEffect` cleanup; verify by code audit that every component returns cleanup or relies on useGSAP context revert |
| PERF-04 | Lazy-load animation code for below-fold sections where beneficial | Evaluate dynamic import of AnimatedSection or conditional ScrollTrigger creation; currently all sections load at mount -- assess if code-splitting helps given the shared GSAP bundle |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| gsap | 3.14.2 | Animation engine | Installed |
| @gsap/react | 2.1.2 | useGSAP hook for React lifecycle | Installed |
| gsap/ScrollTrigger | 3.14.2 | Scroll-linked animations | Installed |
| gsap/SplitText | 3.14.2 | Text splitting for word reveals | Installed |
| lenis | 1.3.17 | Smooth scroll | Installed |

### Tooling (Available via Next.js/npx)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Lighthouse CLI | Performance scoring | `npx lighthouse URL --output=json` or Chrome DevTools |
| Chrome DevTools Performance tab | Layout shift / paint flash detection | Manual audit for layout-triggering properties |

### No New Dependencies
This phase requires zero new npm packages. All work is audit, cleanup, and optimization of existing code.

## Architecture Patterns

### Pattern 1: CSS/GSAP Redundancy Cleanup
**What:** Remove CSS `animation: hm-fadeUp` declarations from selectors where GSAP already orchestrates the entrance.
**Why:** CSS animations fire immediately on paint; GSAP animations fire on timeline/ScrollTrigger schedule. When both exist, the CSS animation completes first (700ms), then GSAP tries to animate an already-visible element -- causing a visual "double entrance" or the GSAP animation having no visible effect.

**Selectors to fix (from milestone audit):**

| Selector | Line | Issue | Fix |
|----------|------|-------|-----|
| `.h-badge` | 223 | CSS fadeUp shadows GSAP HeroEntrance badge entrance at 0.15s | Remove `animation` + `animation-delay` |
| `.h-hero h1` | 235-236 | CSS fadeUp shadows GSAP SplitText clip-path reveal at 0.3s | Remove `animation` + `animation-delay` |
| `.h-hero-desc` | 250-251 | CSS fadeUp shadows GSAP desc entrance at 0.7s | Remove `animation` + `animation-delay` |
| `.h-hero-actions` | 258-259 | CSS fadeUp shadows GSAP CTA spring entrance at 0.9s | Remove `animation` + `animation-delay` |
| `.h-metrics` | 369-370 | CSS fadeUp completes before GSAP ScrollTrigger fires (at 85% viewport) | Remove `animation` + `animation-delay` |

**Safe to keep:** The `@keyframes hm-fadeUp` definition itself and the `hm-slideDown` keyframe (used elsewhere). After removing the 5 selectors above, check if any other selector still references `hm-fadeUp` -- if none, remove the keyframe definition too.

### Pattern 2: Compositor-Friendly Property Audit
**What:** Verify every animated property across all CSS keyframes and GSAP calls is one of: `transform` (translate, scale, rotate), `opacity`, `clip-path`, `filter`.
**Why:** These four properties can be handled entirely by the GPU compositor thread without triggering layout or paint. Any animation touching `width`, `height`, `margin`, `padding`, `top`, `left`, `border`, `background-color`, `box-shadow` (non-opacity change), `font-size`, etc. forces the main thread to recalculate layout.

**Current state from code audit:**
- GSAP animations: All use `y`, `opacity`, `scale`, `scaleX`, `clipPath`, `rotationX`, `rotationY`, `x` -- ALL compositor-friendly (HIGH confidence)
- CSS keyframes `hm-fadeUp`: `opacity` + `transform` -- compositor-friendly
- CSS keyframes `hm-slideDown`: `opacity` + `transform` -- compositor-friendly
- CSS breathing meshes: `background-position` -- this triggers PAINT (not layout), acceptable for decorative pseudo-elements at low frequency (15-25s cycles)
- CSS SVG accents: `transform: rotate()` -- compositor-friendly
- CSS dark glows: `opacity` cycling -- compositor-friendly
- CSS FAQ accordion: `grid-template-rows` transition -- triggers LAYOUT but is the standard pattern for smooth height animation; acceptable as it only fires on user interaction (click), not on scroll

**Verdict:** No layout-triggering scroll animations exist. The two non-compositor properties (`background-position` on breathing meshes, `grid-template-rows` on FAQ) are interaction/low-frequency and acceptable.

### Pattern 3: useGSAP Cleanup Verification
**What:** Verify every client component properly cleans up GSAP instances on unmount.
**Current component audit:**

| Component | Cleanup Method | Status |
|-----------|---------------|--------|
| `HeroEntrance` | `useGSAP({ scope })` -- auto-reverts SplitText, kills timeline + ScrollTriggers | CLEAN |
| `AnimatedSection` | `useGSAP({ scope })` -- auto-reverts SplitText, kills timelines + ScrollTriggers | CLEAN |
| `ScrollProgressBar` | `useGSAP()` (no scope needed, single element via ref) -- auto-kills ScrollTrigger | CLEAN |
| `MagneticButton` | `useGSAP({ scope })` + explicit `removeEventListener` in matchMedia cleanup return | CLEAN |
| `TiltCard` | `useGSAP({ scope })` + explicit `removeEventListener` in matchMedia cleanup return | CLEAN |
| `SmoothScrollProvider` | `useEffect` cleanup: `gsap.ticker.remove(update)`, `lenis.destroy()`, ref nulled | CLEAN |

**Verdict:** All 6 components have proper cleanup. The `useGSAP` hook's context-based revert handles ScrollTrigger kill, SplitText revert, and tween kill automatically. MagneticButton and TiltCard correctly return cleanup functions from their `matchMedia` callbacks to remove event listeners.

### Pattern 4: Reduced-Motion Completeness
**What:** Verify that `prefers-reduced-motion: reduce` users see complete content with zero animation and zero FOUC.
**Current coverage in `landing-animations.css`:**

| Selector | What it does | Status |
|----------|-------------|--------|
| `.h-hero > *`, `.h-hero-orb`, `.h-metrics`, `.h-sect`, `.h-dark-sect`, `.h-callout`, `.h-final` | Forces `opacity:1 !important; transform:none !important; animation:none !important` | COVERED |
| `.h-hero::before`, `.h-callout-inner::after`, `.h-final::before` | Disables breathing gradient meshes | COVERED |
| `.h-accent` | Disables SVG accent animations | COVERED |
| `.h-dark-glow` | Disables dark section glow animations | COVERED |
| `h1 div`, `h2 div` | SplitText word wrappers get `clip-path:none !important; opacity:1 !important` | COVERED |
| `.h-scroll-progress` | `display:none !important` | COVERED |
| `.h-faq-body` | `transition:none !important` | COVERED |

**Gap check:** After removing CSS `hm-fadeUp` from hero elements, the CSS initial states in `landing-animations.css` still set `.h-hero > *` to `opacity:0; transform:translateY(24px)`. The reduced-motion block overrides these with `!important`. This flow remains correct -- removing the CSS animation does not affect the initial-state/reduced-motion chain.

### Pattern 5: Lighthouse Performance Strategy
**What:** Achieve Lighthouse performance score >= 90 with all animations active.
**Key metrics that animations can impact:**

| Metric | Risk from animations | Mitigation |
|--------|---------------------|------------|
| LCP (Largest Contentful Paint) | CSS animations on hero h1 could delay LCP if they start element at opacity:0 | Hero h1 has `opacity:1; transform:none` in landing-animations.css (correct); CSS initial state doesn't hide h1 itself, only children |
| CLS (Cumulative Layout Shift) | SplitText wrapping could cause layout shift if it changes element dimensions | SplitText `type:'words'` wraps inline -- no height/width change; clip-path reveal doesn't shift layout |
| TBT (Total Blocking Time) | GSAP initialization + SplitText splitting on mount | useGSAP defers to after hydration; SplitText is lightweight DOM operation |
| FCP (First Contentful Paint) | CSS file size (~1060 lines) could delay render if not cached | Next.js automatically chunks and caches CSS; not a concern |

**PERF-04 (lazy loading):** All animation components are already client-side islands that only initialize after hydration. The GSAP bundle is shared across all components via the singleton registration. Dynamic importing individual AnimatedSection instances would not meaningfully reduce initial bundle since GSAP itself (the heavy part) is needed for the hero entrance which is above-fold. Recommendation: PERF-04 is best satisfied by documenting that the current architecture already lazy-initializes ScrollTrigger-based animations (they only create tweens when scrolled into view via `toggleActions: 'play none none none'`). No code-splitting changes needed unless Lighthouse reveals a specific bundle size issue.

### Anti-Patterns to Avoid
- **Over-optimizing:** Do not add `will-change` to elements -- GSAP handles GPU promotion internally and `will-change` on too many elements wastes memory
- **Removing all CSS animations:** The `hm-slideDown` keyframe (nav badge) and breathing meshes are NOT redundant with GSAP -- only remove the 5 identified `hm-fadeUp` usages
- **Adding intersection observers alongside ScrollTrigger:** ScrollTrigger already handles visibility-based triggering; adding IO would be redundant
- **Code-splitting AnimatedSection:** The component is only ~200 lines and shares the GSAP bundle; splitting it adds async loading complexity for negligible gain

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Performance scoring | Custom metrics collection | Lighthouse CLI / DevTools | Industry standard, comparable results |
| Layout shift detection | Manual DOM measurement | Chrome DevTools "Layout Shift Regions" | Visual overlay shows exactly what shifts |
| Paint flash detection | console.log timings | Chrome DevTools "Paint Flashing" | GPU-level paint visibility |
| Memory leak detection | Manual ScrollTrigger counting | Chrome DevTools Memory tab + heap snapshots | Shows exact retained references |

## Common Pitfalls

### Pitfall 1: Removing CSS Initial States When Removing CSS Animations
**What goes wrong:** Removing `animation: hm-fadeUp` from `.h-badge` might tempt also removing the opacity/transform initial state, breaking the FOUC prevention chain.
**Why it happens:** The CSS animation and the CSS initial state serve different purposes -- animation was the old reveal mechanism, initial state prevents flash before GSAP runs.
**How to avoid:** Only remove the `animation:` and `animation-delay:` properties. The initial states are in a SEPARATE file (`landing-animations.css`) and must remain.
**Warning signs:** Elements flash visible then animate in (FOUC) after the change.

### Pitfall 2: Lighthouse Score Varies by Environment
**What goes wrong:** Local Lighthouse scores differ significantly from production or CI scores.
**Why it happens:** Local dev server has HMR overhead, unoptimized bundles, source maps. Production build is optimized.
**How to avoid:** Always run Lighthouse against `next build && next start` (production build), not `next dev`. Use incognito/guest Chrome profile to avoid extension interference.
**Warning signs:** Score swings of 20+ points between runs.

### Pitfall 3: CSS background-position Animation Flagged as Non-Compositor
**What goes wrong:** A strict audit might flag breathing gradient `background-position` shifts as violating PERF-02.
**Why it happens:** `background-position` triggers paint (not layout), which is technically not compositor-only.
**How to avoid:** Document this as an accepted exception: the breathing meshes are on pseudo-elements (`::before`/`::after`), run at 15-25s cycles (extremely low frequency), and are decorative only. They do not interfere with scroll performance. Moving them to `transform: translate()` on a separate layer would increase DOM complexity for negligible gain.
**Warning signs:** None -- this is a documentation/acceptance decision, not a bug.

### Pitfall 4: FAQ grid-template-rows Transition Flagged
**What goes wrong:** `grid-template-rows` transition triggers layout recalculation.
**Why it happens:** There is no compositor-friendly way to animate height.
**How to avoid:** Accept this as the standard pattern (CSS-only accordion). It only fires on discrete user clicks, never during scroll. Document as accepted exception alongside background-position.
**Warning signs:** None -- this is the blessed pattern from Phase 3.

## Code Examples

### Removing CSS/GSAP Redundancy (landing-home.css)
```css
/* BEFORE -- .h-badge has both CSS animation and GSAP entrance */
.landing-scope .shell .h-badge {
  /* ...existing styles... */
  animation: hm-fadeUp 700ms var(--hm-ease) both;
  animation-delay: 100ms;
}

/* AFTER -- animation removed, GSAP HeroEntrance handles reveal */
.landing-scope .shell .h-badge {
  /* ...existing styles... */
  /* animation removed -- GSAP HeroEntrance choreography handles this element */
}
```

Repeat for: `.h-hero h1` (lines 235-236), `.h-hero-desc` (lines 250-251), `.h-hero-actions` (lines 258-259), `.h-metrics` (lines 369-370).

### Lighthouse CLI Audit
```bash
# Build production, start server, run Lighthouse
npx next build && npx next start &
sleep 5
npx lighthouse http://localhost:3000 --only-categories=performance --output=json --output-path=./lighthouse-report.json
# Check score
node -e "const r = require('./lighthouse-report.json'); console.log('Performance:', r.categories.performance.score * 100)"
```

### Memory Leak Verification Protocol
```
1. Open Chrome DevTools > Memory tab
2. Navigate to landing page, wait for all animations to complete
3. Take heap snapshot (Snapshot 1)
4. Navigate away (e.g., to /team or /login)
5. Force GC (click trash can icon)
6. Take heap snapshot (Snapshot 2)
7. Compare: filter by "ScrollTrigger", "SplitText", "Lenis"
8. Zero retained instances = PASS
```

### Restraint Review Checklist
```
"2-4 Hero Moments" Rule:
The page should have 2-4 moments that feel premium/cinematic.
Everything else should be subtle, almost invisible animation.

Candidate hero moments (pick 2-4):
1. Hero entrance sequence (orbs + SplitText headline + spring CTAs)
2. Dark outcomes section atmosphere (gradient bleeds + glows)
3. Scroll-triggered heading reveals (SplitText clip-path on h2s)
4. Magnetic button pull (on primary CTAs)

Everything else (section fadeups, parallax drift, card tilt, progress bar)
should feel like natural physics, not "look at this animation."

Review: Full-page scroll at 1x speed. If anything draws attention
to itself as "animated," it should be one of the hero moments.
If a non-hero element feels flashy, reduce its duration or amplitude.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual ScrollTrigger.kill() in useEffect cleanup | useGSAP hook with context-based auto-revert | @gsap/react 2.0+ (2024) | Eliminates entire class of cleanup bugs |
| will-change CSS hints | GSAP internal GPU promotion | GSAP 3.x | No need for manual will-change; GSAP promotes to compositor automatically |
| IntersectionObserver for scroll reveals | ScrollTrigger with toggleActions | GSAP 3.0+ (2020) | Single system for all scroll-linked behavior |

## Open Questions

1. **Lighthouse baseline score unknown**
   - What we know: Architecture is sound, no obvious blockers
   - What's unclear: Current score before any Phase 9 work -- could already be >= 90
   - Recommendation: Run Lighthouse against production build as first task; if already >= 90, PERF-01 is pre-satisfied and effort shifts to documentation

2. **hm-fadeUp keyframe retention**
   - What we know: 5 selectors reference it; all 5 will be removed
   - What's unclear: Whether any other selector (not found in search) also uses it
   - Recommendation: After removing the 5 usages, grep for `hm-fadeUp` -- if zero references remain, remove the `@keyframes hm-fadeUp` definition

3. **PERF-04 lazy-loading scope**
   - What we know: Current architecture already defers animation init to post-hydration via useGSAP; ScrollTrigger only creates tweens at scroll threshold
   - What's unclear: Whether the requirement expects explicit dynamic imports or if architectural laziness counts
   - Recommendation: Document the current lazy-initialization pattern as satisfying PERF-04; only add dynamic imports if Lighthouse reveals bundle size issues

## Sources

### Primary (HIGH confidence)
- Codebase audit: All 6 client components read and analyzed for cleanup patterns, property usage, reduced-motion handling
- `landing-animations.css`: Full reduced-motion coverage verified
- `landing-home.css`: All `hm-fadeUp` usages identified (lines 223, 235, 250, 258, 369)
- Milestone audit findings: 2 CSS/GSAP redundancy issues confirmed and mapped to specific selectors

### Secondary (MEDIUM confidence)
- GSAP useGSAP auto-cleanup behavior: Verified from @gsap/react patterns in codebase (all components use `{ scope: ref }`)
- Compositor-friendly property list: Industry standard (transform, opacity, clip-path, filter) -- well-documented across MDN and Chrome DevTools docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, pure audit of existing code
- Architecture: HIGH - All patterns verified by reading actual component source
- Pitfalls: HIGH - Based on direct codebase analysis, not theoretical concerns
- CSS/GSAP redundancy: HIGH - Exact line numbers identified, fix is mechanical

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable -- no moving targets in this phase)
