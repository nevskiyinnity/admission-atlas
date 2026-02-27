# Pitfalls Research

**Domain:** Animated landing page in Next.js 14 App Router with GSAP/ScrollTrigger
**Researched:** 2026-02-27
**Confidence:** HIGH (Context7 + official GSAP docs + verified community sources)

## Critical Pitfalls

### Pitfall 1: GSAP Strict Mode Double-Mount Breaks `from` Tweens

**What goes wrong:**
React 18 strict mode (enabled by default in development) mounts, unmounts, and remounts every component on first render. GSAP `from()` tweens set an element's properties to the "from" values, then animate to the original values. On the second mount, the "original" values are now the "from" values from the first run, so the animation does nothing or produces visual glitches. ScrollTrigger instances also double-register, creating duplicate scroll listeners and ghost triggers.

**Why it happens:**
Developers use raw `useEffect` or `useLayoutEffect` with manual GSAP calls instead of the `useGSAP()` hook. Without the hook's built-in `gsap.context()` wrapper, animations from the first mount are not reverted before the second mount runs, leaving stale state.

**How to avoid:**
- Use `@gsap/react`'s `useGSAP()` hook exclusively. It wraps animations in `gsap.context()` and automatically reverts all GSAP instances (tweens, timelines, ScrollTriggers, SplitText) on unmount.
- Register the hook: `gsap.registerPlugin(useGSAP)` to avoid React version discrepancies.
- Pass a `scope` ref to confine selector-text queries to the component's DOM subtree.
- Never use raw `useEffect` for GSAP animations.

```tsx
// CORRECT
const container = useRef<HTMLDivElement>(null);
useGSAP(() => {
  gsap.from('.box', { opacity: 0, y: 50 });
}, { scope: container });

// WRONG - will break in strict mode
useEffect(() => {
  gsap.from('.box', { opacity: 0, y: 50 });
  return () => { /* manual cleanup is error-prone */ };
}, []);
```

**Warning signs:**
- Animations play twice or not at all in development
- Console shows "GSAP target not found" on second mount
- ScrollTrigger markers appear in duplicate
- Animations work in production (strict mode off) but fail in dev

**Phase to address:**
Phase 1 (Foundation) -- establish the `useGSAP` pattern in the very first animated component. All subsequent phases inherit this pattern.

---

### Pitfall 2: ScrollTrigger Hydration Mismatch from Server-Rendered DOM

**What goes wrong:**
ScrollTrigger's `pin: true` wraps the pinned element in an extra `<div>` at runtime. The server-rendered HTML has no such wrapper. React's hydration compares server HTML against client DOM and throws a hydration mismatch error. Similarly, ScrollTrigger adds inline styles to `<body>` and pinned elements that do not exist in the server-rendered markup.

**Why it happens:**
The landing page is currently a pure Server Component. Adding GSAP means introducing Client Component boundaries. If the Client Component renders children that were server-rendered with a different DOM structure than what ScrollTrigger produces client-side, hydration fails.

**How to avoid:**
- Use thin Client Component wrappers (`'use client'`) that receive Server Component content as `children` props rather than importing server components inside client components.
- Avoid ScrollTrigger `pin` on elements whose DOM structure is rendered on the server. If pinning is required, render the pinned section entirely inside a Client Component.
- Never run ScrollTrigger calculations during SSR. The `useGSAP()` hook uses `useIsomorphicLayoutEffect` internally, which safely no-ops during SSR.
- For responsive ScrollTrigger setups, perform all `window`/`matchMedia` checks inside `useGSAP`, never at module scope.

**Warning signs:**
- Console errors: "Hydration failed because the server rendered HTML didn't match the client"
- Visual flash where elements jump position after hydration
- Elements appear in final animated state briefly before resetting

**Phase to address:**
Phase 1 (Foundation) -- define the Client/Server Component boundary architecture before building any animations.

---

### Pitfall 3: FOUC (Flash of Unstyled/Original Content) on Animated Elements

**What goes wrong:**
Elements that will be animated (e.g., faded in from `opacity: 0`) render at full opacity in the server-rendered HTML, flash visibly, then snap to `opacity: 0` when GSAP initializes, then animate in. The user sees: content visible -> content disappears -> content fades in. This is especially jarring above the fold.

**Why it happens:**
The initial CSS state on the server does not match the GSAP "from" state. GSAP only runs client-side, so the server renders elements in their default visible state. The gap between HTML paint and GSAP initialization creates the flash.

**How to avoid:**
- Set initial styles in CSS that match GSAP's "from" values: if GSAP will animate `from({ opacity: 0, y: 50 })`, the element's CSS should start at `opacity: 0; transform: translateY(50px)`.
- Use a CSS class like `.will-animate { opacity: 0; }` applied in the server-rendered JSX, then let GSAP animate from those values.
- For hero/above-the-fold elements, use CSS `@keyframes` for the initial entrance and GSAP only for scroll-driven animations below the fold.
- Never rely on GSAP alone to set initial state on elements that are visible before JS loads.

```css
/* Server-safe initial state */
.h-hero-reveal { opacity: 0; transform: translateY(2rem); }

@media (prefers-reduced-motion: reduce) {
  .h-hero-reveal { opacity: 1; transform: none; }
}
```

**Warning signs:**
- Content flashes or jumps on initial page load
- Lighthouse flags CLS > 0.1
- Elements are briefly visible then disappear before animating in

**Phase to address:**
Phase 1 (Foundation) for the pattern; Phase 2 (Hero) for the above-the-fold implementation.

---

### Pitfall 4: ScrollTrigger Stale Instances After Route Navigation

**What goes wrong:**
When navigating away from the landing page (e.g., to `/team` or `/contact`) and back, ScrollTrigger instances from the previous visit are not properly killed. Stale instances accumulate, causing incorrect scroll positions, animations that trigger at wrong scroll points, laggy scrolling, and memory leaks that grow with each navigation.

**Why it happens:**
Next.js App Router does not fully unmount and remount components on soft navigation the way a full page reload would. If ScrollTrigger instances are created outside the `useGSAP` hook's cleanup scope (e.g., in event handlers, setTimeout callbacks, or imperative code), they survive navigation and pile up.

**How to avoid:**
- All ScrollTrigger instances must be created inside `useGSAP()` so they are automatically reverted on unmount.
- For ScrollTriggers created outside the initial render (e.g., in event handlers), manually add them to the context: `contextSafe(() => { ... })`.
- Call `ScrollTrigger.refresh()` when layout changes after async content loads or after route transitions.
- Never create ScrollTrigger instances at module scope or in global event listeners.
- Set `revertOnUpdate: true` in `useGSAP` when dependencies change to ensure full cleanup.

**Warning signs:**
- Animations fire at wrong scroll positions after navigating back to the page
- Memory usage increases with each page visit (check DevTools Performance monitor)
- Multiple sets of ScrollTrigger markers visible
- Scroll performance degrades over time

**Phase to address:**
Phase 1 (Foundation) for architecture; final phase (Polish) for verification with navigation testing.

---

### Pitfall 5: Layout Thrashing from Read-Write Cycles in Scroll Handlers

**What goes wrong:**
Custom scroll handlers that read layout properties (e.g., `getBoundingClientRect()`, `offsetTop`, `scrollHeight`) and then write to the DOM (e.g., setting `style.transform`) force the browser into a forced synchronous layout cycle on every frame. At 60fps, this means 60 forced layouts per second, causing severe jank, dropped frames, and janky scrolling -- especially on pages with many animated sections.

**Why it happens:**
Developers implement custom parallax or scroll effects with `addEventListener('scroll', ...)` and interleave reads and writes. Each write invalidates layout; each subsequent read forces the browser to recalculate layout before it can return a value.

**How to avoid:**
- Use GSAP ScrollTrigger instead of raw scroll listeners. ScrollTrigger batches reads and writes efficiently and uses `requestAnimationFrame` internally.
- If custom scroll logic is necessary, batch all reads first, then all writes, within a single `requestAnimationFrame` callback.
- Stick to `transform` and `opacity` for animations -- these properties skip layout and paint, going straight to the compositor.
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` in scroll handlers.
- Use `will-change: transform` sparingly (only on actively animating elements, remove after animation completes).

**Warning signs:**
- Chrome DevTools Performance panel shows purple "Layout" bars on every frame during scroll
- "Forced reflow while executing JavaScript" console warnings
- FPS drops below 30 during scroll
- Lighthouse flags poor INP (Interaction to Next Paint)

**Phase to address:**
Every phase that adds scroll-driven animation. Code review checkpoint before each phase merge.

---

### Pitfall 6: Ignoring `prefers-reduced-motion` -- Accessibility and Legal Risk

**What goes wrong:**
Scroll animations, parallax effects, and entrance animations play at full intensity for users with vestibular disorders, motion sensitivity, or who simply prefer reduced motion. This causes physical discomfort (nausea, dizziness, headaches) and violates WCAG 2.1 SC 2.3.3 (Animation from Interactions). Beyond ethics, this creates legal liability -- the European Accessibility Act (2025) and similar regulations mandate compliance.

**Why it happens:**
Teams treat `prefers-reduced-motion` as a "nice to have" and plan to add it at the end. By that point, motion is deeply integrated into the design, and the reduced-motion fallback becomes a stripped-down, broken-looking version rather than an intentionally designed alternative experience.

**How to avoid:**
- Design the reduced-motion experience first. Every animation decision should answer: "What does this look like with motion off?"
- Implement a global `prefers-reduced-motion` check at the GSAP level:

```tsx
useGSAP(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Set all elements to their final state, no animation
    gsap.set('.animated-element', { clearProps: 'all' });
    return;
  }
  // Full animations here
});
```

- Use `gsap.matchMedia()` to create separate animation tracks for reduced-motion:

```tsx
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Full scroll animations
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  // Instant state, or very subtle crossfade only
});
```

- CSS animations should also respect the preference:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Never use `animation-duration: 0` (some browsers skip the animation entirely, preventing `animationend` events from firing). Use `0.01ms` instead.

**Warning signs:**
- No `prefers-reduced-motion` media queries in the CSS
- GSAP code has no matchMedia or reduced-motion checks
- Accessibility audit fails on SC 2.3.3
- No reduced-motion QA testing in the test plan

**Phase to address:**
Phase 1 (Foundation) -- establish the `gsap.matchMedia()` wrapper pattern. Every subsequent phase must include reduced-motion variants as part of the definition of done.

---

### Pitfall 7: Over-Animation -- When Premium Becomes Annoying

**What goes wrong:**
Every element has an entrance animation. Every scroll position triggers something. Every hover has a magnetic effect. The page feels like a tech demo, not a premium brand. Users wait for animations to finish before they can read content. Conversion rates drop because the motion competes with the message. The "wow" factor on first visit becomes irritation on repeat visits.

**Why it happens:**
The team conflates "animation quality" with "animation quantity." Once GSAP is set up, it is easy to animate everything. There is no design constraint limiting how many things move. Each section is animated in isolation without considering the cumulative experience of scrolling through the entire page.

**How to avoid:**
- Enforce the "2-4 hero moments" rule: pick 2-4 scroll positions where animation creates genuine impact (hero entrance, a key stat reveal, the dark section transition, final CTA). Everything else should be subtle or static.
- Apply the 3-second rule: no animation should prevent content access for more than 300ms. Total animation duration for any single viewport should not exceed 3 seconds.
- Use animation duration guidelines: 100-300ms for micro-interactions (hover, button press), 300-500ms for entrance reveals, 500-800ms for major choreographed sequences. Nothing longer except background ambient effects.
- Scroll the entire page from top to bottom and ask: "Does this feel like an Apple product page or a CodePen showcase?" If the latter, remove 50% of the animations.
- Repeat-visit test: visit the page 5 times in a row. Animations that delight on visit 1 but annoy on visit 3 should be toned down or trigger only on first visit.

**Warning signs:**
- Page scroll takes > 15 seconds because animations are blocking content
- Users are scrolling past animated sections before animations finish
- Heatmaps show users bouncing from animation-heavy sections
- Stakeholders say "cool" but actual users say "slow"
- Every PR adds more animations but none removes any

**Phase to address:**
Phase 3 (Section animations) and final phase (Polish). Requires a full-page scroll review after all sections are animated. Set an explicit "animation budget" before starting.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Animating `left`/`top` instead of `transform` | Simpler mental model | 10x worse performance, layout thrashing on every frame | Never |
| Using `'use client'` on the entire page component | Quick setup, everything "just works" | Entire page becomes a Client Component -- loses SSR, increases bundle, Server Components cannot be children | Never for this project |
| Inline ScrollTrigger config without `useGSAP` | Faster prototyping | Memory leaks, strict mode bugs, stale instances on navigation | Only in throwaway prototypes |
| Hardcoded pixel values in ScrollTrigger `start`/`end` | Quick positioning | Breaks on resize, different screen sizes, orientation changes | Never -- use relative values like `"top center"` |
| Using `will-change` on many elements permanently | Quick GPU acceleration | Excessive GPU memory, layer explosion, slower compositing, mobile crashes | Only on actively animating elements, remove after animation |
| `dvh` units for layout dimensions | Adaptive to address bar | Constant layout recalculation, CLS on scroll, jank | Never for layout; only for very specific decorative elements |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GSAP + Next.js App Router | Importing GSAP in a Server Component | GSAP must only be imported in files with `'use client'` directive. Create thin Client Component wrappers. |
| ScrollTrigger + `pin: true` | Pinning server-rendered elements | Render pinned sections entirely inside Client Components to avoid hydration DOM mismatch. |
| GSAP + React Server Components (children pattern) | Importing Server Components inside Client Components | Pass Server Component content as `{children}` props to Client Component wrappers. |
| ScrollTrigger + Dynamic content | Creating ScrollTriggers before content is loaded | Call `ScrollTrigger.refresh()` after images/fonts/async content loads. Use `invalidateOnRefresh: true`. |
| GSAP + next/font | Animating text before fonts load | Fonts use `display: 'swap'` which causes layout shift. Wait for fonts or animate only transform/opacity, not text dimensions. |
| Lenis/smooth-scroll + ScrollTrigger | Using both without connecting them | If using Lenis for smooth scrolling, you must connect it to ScrollTrigger's scroll proxy. Otherwise ScrollTrigger reads the wrong scroll position. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many GPU layers | Chrome task manager shows high GPU memory; mobile browsers crash or stutter | Limit `will-change` to < 10 elements at a time; remove after animation completes | > 20 promoted layers on mobile |
| Scroll listener per section | FPS drops during scroll; DevTools shows many event listeners | Use a single ScrollTrigger.batch() for similar elements; avoid `addEventListener('scroll')` | > 8 individual scroll listeners |
| Animating non-compositable properties | Purple "Layout" bars in Performance panel; jank during animation | Only animate `transform` and `opacity`; never animate layout-triggering properties | Any device, immediately noticeable |
| Large SVG path animations | Main thread spikes; dropped frames during SVG stroke-dashoffset animations | Simplify SVG paths (< 200 points); use `will-change: stroke-dashoffset` only during animation | Complex SVGs on mobile |
| Unoptimized parallax with `background-attachment: fixed` | Broken on iOS Safari; forces full-page repaint on every scroll frame | Use `transform: translateY()` with ScrollTrigger instead of CSS `background-attachment: fixed` | All iOS devices, most Android |
| Not debouncing `ScrollTrigger.refresh()` on resize | Multiple expensive layout recalculations during window resize | ScrollTrigger handles resize internally; do not call `refresh()` on resize events manually | Rapid resize / orientation change |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scroll-jacking (overriding native scroll behavior) | Users lose control of scroll speed/direction; rage-quit on trackpad/touch | Preserve native scroll; use ScrollTrigger `scrub` to tie animation to scroll position without hijacking scroll itself |
| Entrance animations that block content reading | Users wait 2-3 seconds before they can read the hero headline | Hero text should be readable within 500ms. Stagger decorative elements, not content. |
| Parallax on text content | Text becomes unreadable during scroll; accessibility failure | Parallax only on decorative/background elements; text stays in normal document flow |
| Hover effects on touch devices | Effects rely on `:hover` which behaves unpredictably on touch | Use `@media (hover: hover)` to gate hover effects; provide tap alternatives for touch |
| Animations that replay on scroll-up | User scrolls up to re-read content and animations replay, obscuring text | Use `ScrollTrigger({ once: true })` for entrance animations; only repeatable for scrub-linked effects |
| Magnetic button effect too aggressive | Cursor-following buttons are disorienting; users miss click targets | Limit magnetic pull to 10-15px max offset; disable on touch devices entirely |

## "Looks Done But Isn't" Checklist

- [ ] **Reduced motion:** Toggle `prefers-reduced-motion: reduce` in DevTools and verify every section is usable -- verify content is visible, no blank sections
- [ ] **Mobile Safari viewport:** Test hero section on iPhone with Safari toolbar visible and hidden -- verify no content is cut off, no layout jump
- [ ] **Navigation round-trip:** Navigate to `/team`, back to `/`, to `/contact`, back to `/` -- verify no duplicate animations, no ScrollTrigger markers, no performance degradation
- [ ] **Fast scroll:** Scroll from top to bottom rapidly (mousewheel spam) -- verify no visual glitches, no stuck animations, no elements left in mid-animation state
- [ ] **Refresh mid-page:** Scroll to middle of page, cmd+R -- verify ScrollTrigger positions recalculate correctly, no animation state mismatch
- [ ] **Tab focus:** Tab through the entire page with keyboard -- verify focus indicators are visible and not hidden behind animated elements
- [ ] **Print/Reader mode:** Check page in print view and Safari Reader -- verify content is readable without JS
- [ ] **Slow 3G:** Throttle to Slow 3G in DevTools -- verify page is usable before JS loads (content visible, not hidden by `.will-animate { opacity: 0 }` with no JS to reveal it)
- [ ] **Landscape mobile:** Rotate to landscape on mobile -- verify ScrollTrigger positions refresh correctly via `invalidateOnRefresh`
- [ ] **CLS check:** Run Lighthouse with "Clear storage" -- verify CLS < 0.1 (animations must not cause layout shifts)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hydration mismatch from ScrollTrigger pin | LOW | Move pinned section into a dedicated Client Component; use Suspense boundary if needed |
| Memory leak from stale ScrollTriggers | MEDIUM | Audit all GSAP code; migrate from raw useEffect to useGSAP; add `contextSafe` wrappers for imperative code |
| FOUC on hero elements | LOW | Add CSS initial states matching GSAP from-values; add noscript fallback styles |
| Over-animation causing conversion drop | MEDIUM | Conduct animation audit; remove bottom 50% of animations by impact; A/B test |
| Layout thrashing from custom scroll code | MEDIUM | Replace custom scroll handlers with ScrollTrigger; profile with DevTools Performance |
| `prefers-reduced-motion` not implemented | HIGH (if late) | Must be retrofitted into every animated component; far cheaper to build in from Phase 1 |
| Full-page Client Component (lost SSR) | HIGH | Requires re-architecture into Server Component parent + Client Component islands; significant refactor |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Strict mode double-mount | Phase 1: Foundation | `useGSAP` in every animated component; no raw `useEffect` for GSAP |
| Hydration mismatch | Phase 1: Foundation | Zero hydration warnings in dev console after component architecture is set |
| FOUC on hero | Phase 2: Hero animations | Lighthouse CLS < 0.1; no visible flash on throttled connection |
| ScrollTrigger stale instances | Phase 1: Foundation + Final: Polish | Navigation round-trip test passes; memory stable across 10 navigations |
| Layout thrashing | Every animation phase | DevTools Performance recording shows no forced layouts during scroll |
| `prefers-reduced-motion` | Phase 1: Foundation (pattern); every phase (implementation) | Full page usable with reduced motion; no blank/hidden sections |
| Over-animation | Phase 3: Section animations + Final: Polish | Full-page scroll review; < 5 major animation moments; content readable within 500ms |
| GPU layer explosion | Phase 3: Section animations | Chrome Layers panel shows < 15 promoted layers during scroll |
| Mobile viewport units | Phase 2: Hero | Hero renders correctly on iOS Safari with toolbar visible/hidden |
| Scroll hijacking | Every phase | Native scroll behavior preserved; no `scroll-snap` or scroll override |
| Hover on touch devices | Phase 3+: Micro-interactions | `@media (hover: hover)` gates all hover effects; verified on real touch device |

## Sources

**HIGH confidence (Context7 / official documentation):**
- [GSAP React documentation - useGSAP hook](https://gsap.com/resources/React/) -- cleanup, strict mode, SSR safety
- [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger) -- pin, invalidateOnRefresh, matchMedia, normalizeScroll
- [Next.js App Router composition patterns (v14)](https://github.com/vercel/next.js/blob/v14.3.0-canary.87/docs/02-app/01-building-your-application/03-rendering/04-composition-patterns.mdx) -- Client/Server Component boundaries

**MEDIUM confidence (verified across multiple sources):**
- [GSAP community: hydration error in Next.js 15](https://gsap.com/community/forums/topic/43281-hydration-error-in-nextjs-15/) -- pin-related hydration mismatch
- [GSAP community: useGSAP hook cleanup with ScrollTrigger](https://gsap.com/community/forums/topic/40747-usegsap-hook-cleanup-does-not-appear-to-be-working-with-scroll-trigger/)
- [Medium: Optimizing GSAP in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) -- memory leaks, cleanup
- [web.dev: Optimize CLS](https://web.dev/articles/optimize-cls) -- animation-caused layout shifts
- [web.dev: Animation and motion accessibility](https://web.dev/learn/accessibility/motion) -- reduced motion patterns
- [W3C WCAG 2.1 SC 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) -- animation from interactions
- [CSS-Tricks: prefers-reduced-motion](https://css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/) -- implementation patterns
- [Bram.us: Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/) -- svh/dvh/lvh units
- [NN/g: Animation Duration](https://www.nngroup.com/articles/animation-duration/) -- timing guidelines
- [Medium: Web animations killing conversions (2026)](https://medium.com/@R.H_Rizvi/why-your-beautiful-web-animations-are-killing-conversions-and-motion-isnt-the-problem-46f1a791c629) -- over-animation patterns
- [DEV Community: High-performance web animation](https://dev.to/kolonatalie/high-performance-web-animation-gsap-webgl-and-the-secret-to-60fps-2l1g) -- GPU layer management

---
*Pitfalls research for: Admission Atlas animated landing page redesign (Next.js 14 + GSAP/ScrollTrigger)*
*Researched: 2026-02-27*
