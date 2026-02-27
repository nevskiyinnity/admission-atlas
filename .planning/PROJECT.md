# Admission Atlas — Landing Page Redesign

## What This Is

A complete visual and interaction redesign of the Admission Atlas landing page, elevating it from a well-made editorial template to Apple Design Award-caliber work. The page serves families considering premium university admissions counseling — the design must communicate quiet authority, precision, and depth without saying a word.

## Core Value

The landing page must make visitors feel they've found the most competent people in the room — through design craft alone, before they read a single word.

## Requirements

### Validated

<!-- Existing capabilities that work and should be preserved -->

- ✓ Floating capsule navigation with backdrop blur — existing
- ✓ Editorial luxury color palette (navy, gold, teal on warm off-white) — existing
- ✓ Responsive layout across desktop, tablet, mobile — existing
- ✓ Scoped CSS architecture (`.landing-scope` + `h-` prefix isolation) — existing
- ✓ Content sections: Hero, Metrics, Services (bento), Process (timeline), Outcomes (dark), Pricing, AI Engine callout, FAQ, Final CTA — existing
- ✓ Footer with brand and nav links — existing
- ✓ Grain texture overlay — existing
- ✓ CSS custom properties design token system — existing

### Active

<!-- What we're building — the redesign scope -->

- [ ] Scroll-driven reveal animations — elements animate into view as user scrolls, choreographed with staggered timing
- [ ] Parallax depth layering — background elements move at different scroll speeds to create spatial depth
- [ ] Hero entrance sequence — cinematic, orchestrated animation when the page first loads (not a simple fade)
- [ ] Micro-interactions on hover — magnetic buttons, card tilt effects, subtle scale/shadow responses that feel tactile
- [ ] Typography drama — larger contrast between display and body type, text reveal animations (clip-path, mask)
- [ ] Abstract visual elements — animated SVG geometry, gradient mesh backgrounds, light/glow effects that breathe
- [ ] Section transition design — seamless visual flow between sections, not just stacked blocks with margins
- [ ] Dark section elevation — the outcomes section should feel like entering a different space, with its own atmosphere
- [ ] Copy restructuring — tighter, more confident headlines; fewer words, more impact; copy that matches the design's authority
- [ ] Smooth scroll behavior — buttery page scrolling, anchor links that glide
- [ ] Motion library integration — GSAP with ScrollTrigger (or Framer Motion) for production-grade animation orchestration
- [ ] Performance optimization — animations respect `prefers-reduced-motion`, lazy-load heavy effects, maintain good Core Web Vitals

### Out of Scope

- Photography or real imagery — visual language stays abstract (geometry, gradients, typography)
- Content additions — no new sections; redesign existing content structure
- Other landing pages (team, results, contact) — this project is the home page only
- Portal/dashboard UI — authenticated app is untouched
- Backend changes — no API, database, or auth modifications
- i18n changes — internationalization system stays as-is

## Context

**Existing codebase:** Full Next.js 14 App Router application with Prisma/PostgreSQL backend, Clerk auth, multi-role portal. The landing page is one route group `(landing)` with its own CSS files, isolated from the portal UI.

**Current landing page architecture:**
- Server Component at `src/app/[locale]/(landing)/page.tsx` — pure JSX, no client-side JS
- Styling via `landing-home.css` (~1070 lines) — all CSS-only, scoped under `.landing-scope`
- Shared landing styles in `landing-atlas.css` used by team/results/contact pages
- Design tokens as CSS custom properties on `.landing-scope`
- Entry animations via CSS `@keyframes` (fadeUp, slideDown, pulse)

**Key technical consideration:** The page is currently a Server Component with zero client JavaScript. Adding GSAP/Framer Motion means introducing a Client Component boundary. This should be done surgically — keep the page structure as a Server Component and wrap interactive elements in thin Client Component wrappers.

**Design direction:** Quietly authoritative. Think a Michelin-starred restaurant's website crossed with Apple's product pages. Every pixel deliberate. Motion that feels inevitable, not decorative. The kind of page where someone screenshots it and sends it to a friend saying "look at this."

## Constraints

- **Tech stack**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS + custom CSS
- **CSS isolation**: Must maintain `.landing-scope` scoping — landing styles cannot bleed into portal
- **Shared styles**: Changes to `landing-home.css` must not break `landing-atlas.css` patterns used by team/results/contact pages
- **Accessibility**: All animations must respect `prefers-reduced-motion`; semantic HTML preserved; WCAG contrast ratios maintained
- **Performance**: Target Lighthouse performance score ≥ 90; animations should not cause layout shifts or jank
- **No photos**: Visual richness comes from abstract elements — gradients, geometry, typography, motion — not imagery

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Abstract visual language over photography | Matches quietly authoritative vibe; photos of campuses feel generic; geometry feels intentional | — Pending |
| GSAP + ScrollTrigger as motion library | Industry standard for scroll-driven animation; better performance than CSS-only for complex choreography; works well with Next.js | — Pending |
| Full copy rewrite allowed | Headlines and descriptions can be restructured to serve the design; current copy is functional but not award-caliber | — Pending |
| Keep Server Component structure with Client Component islands | Preserves SSR benefits; only interactive/animated sections become Client Components | — Pending |

---
*Last updated: 2026-02-27 after initialization*
