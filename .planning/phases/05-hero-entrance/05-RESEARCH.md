# Phase 5: Hero Entrance Sequence - Research

**Phase:** 05-hero-entrance
**Confidence:** HIGH
**Date:** 2026-02-27

## Requirements

- **SCROLL-02**: Orchestrated hero entrance sequence — orbs scale in, headline reveals word-by-word via SplitText clip-path, description fades, CTAs arrive with spring (~1.4s total)
- **TYPE-03**: Text reveal animations on section headings — SplitText word-by-word clip-path reveals triggered on scroll

## Existing Infrastructure (from Phase 1)

- `gsap-registration.ts` already registers ScrollTrigger, SplitText, useGSAP
- `AnimatedSection` wraps all 9 sections with `containerRef` (ready for `useGSAP({ scope: containerRef })`)
- CSS initial states: `opacity: 0; transform: translateY(24px)` — GSAP `from({y: 24})` must match
- `prefers-reduced-motion` overrides in `landing-animations.css` reset all to visible
- Hero orbs have separate initial state: `opacity: 0; transform: scale(0.8)`

## Hero Structure (from page.tsx)

```
section.h-hero
  div.h-hero-orb.h-hero-orb--1
  div.h-hero-orb.h-hero-orb--2
  span.h-badge            "Strategic admissions counsel"
  h1                      "Admissions strategy built to hold up"
  p.h-hero-desc           description paragraph
  div.h-hero-actions
    Link.h-btn-primary    "Start Your Strategy"
    a.h-btn-ghost         "See the Process"
```

## SplitText API (GSAP 3.14.2)

SplitText splits text into words/chars/lines for animation. Key API:

```typescript
const split = SplitText.create("h1", { type: "words" });
// split.words = array of span elements wrapping each word

// Clip-path masking approach:
gsap.from(split.words, {
  clipPath: "inset(0 100% 0 0)",  // hidden from right
  duration: 0.6,
  stagger: 0.05,
  ease: "power3.out"
});
```

**IMPORTANT:** SplitText.create() is the modern API (3.12+). The old `new SplitText()` constructor still works but `.create()` is preferred.

**Cleanup:** SplitText must be reverted on component unmount to restore original DOM:
```typescript
// Inside useGSAP cleanup or return
split.revert();
```

## Hero Entrance Timeline

Recommended choreography (~1.4s total):

| Element | Start | Duration | Animation | Easing |
|---------|-------|----------|-----------|--------|
| Orbs | 0s | 0.8s | scale(0.8→1), opacity(0→1) | power2.out |
| Badge | 0.15s | 0.5s | opacity(0→1), y(24→0) | power3.out |
| Headline words | 0.3s | 0.6s + 0.05s stagger | clipPath inset reveal | power3.out |
| Description | 0.7s | 0.5s | opacity(0→1), y(24→0) | power3.out |
| CTA buttons | 0.9s | 0.5s + 0.1s stagger | opacity(0→1), y(24→0) | back.out(1.7) |

Total: ~1.4s from first to last element finishing.

## Section Heading Reveals (TYPE-03)

Each section h2 gets a SplitText word-by-word reveal on scroll:

```typescript
useGSAP(() => {
  const headings = containerRef.current?.querySelectorAll('h2');
  headings?.forEach(h2 => {
    const split = SplitText.create(h2, { type: "words" });
    gsap.from(split.words, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.5,
      stagger: 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: h2,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
}, { scope: containerRef });
```

## Architecture Approach

### Option: Dedicated HeroEntrance component
Create a new `_components/hero-entrance.tsx` Client Component that:
1. Wraps the hero section specifically (replacing the generic AnimatedSection on hero)
2. Uses `useGSAP()` to build the entrance timeline
3. Uses `gsap.matchMedia()` to skip animation for reduced-motion users

### Option: Heading reveal component
Create `_components/heading-reveal.tsx` or add scroll-triggered heading logic to AnimatedSection.

**Recommended:** Keep AnimatedSection generic. Create `HeroEntrance` as a dedicated component for the hero (SCROLL-02). For heading reveals (TYPE-03), either add to AnimatedSection or create a `HeadingReveal` wrapper.

## gsap.matchMedia() for Reduced Motion

```typescript
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // all animation code here — only runs when user has no motion preference
    const tl = gsap.timeline();
    // ... timeline setup
  });
}, { scope: containerRef });
```

This ensures zero animation code runs for reduced-motion users. Combined with CSS initial states (which show everything via `!important`), the page is fully visible immediately.

## Pitfalls

1. **SplitText + SSR hydration:** SplitText manipulates DOM (wraps words in spans). Must run client-side only, inside useGSAP. The `useGSAP` hook runs after hydration, so this is safe.
2. **SplitText cleanup:** Must call `split.revert()` on unmount. `useGSAP` with `gsap.context()` handles this automatically when SplitText instances are created inside the callback.
3. **clipPath browser support:** `clip-path: inset()` has Baseline 2023 support. Safe for all modern browsers.
4. **Hero initial states must match:** The CSS sets `opacity: 0; transform: translateY(24px)` on `.h-hero > *` and `opacity: 0; transform: scale(0.8)` on `.h-hero-orb`. GSAP `from()` values must match exactly.
5. **Timeline vs individual tweens:** Use a `gsap.timeline()` for the hero sequence — easier to choreograph stagger offsets and maintain timing relationships.

## Files to Modify

- `src/app/[locale]/(landing)/_components/hero-entrance.tsx` — NEW: dedicated hero Client Component
- `src/app/[locale]/(landing)/_components/animated-section.tsx` — ADD: heading reveal logic with SplitText
- `src/app/[locale]/(landing)/page.tsx` — CHANGE: swap AnimatedSection for HeroEntrance on hero section
- `src/app/[locale]/(landing)/landing-animations.css` — possible tweaks to hero initial states for clipPath

## Ready for Planning

All technical details resolved. SplitText API confirmed. Timeline choreography mapped. Architecture approach clear.
