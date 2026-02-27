# Phase 1: Motion Foundation - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Install GSAP 3.14 + ScrollTrigger + SplitText + @gsap/react + Lenis. Create Client Component islands architecture. Add CSS initial states and prefers-reduced-motion support. Page must render identically to today after this phase — zero visual change.

</domain>

<decisions>
## Implementation Decisions

### Animation Stack
- GSAP 3.14.2 + @gsap/react 2.1.2 for animation engine
- ScrollTrigger + SplitText plugins (now free post-Webflow acquisition)
- Lenis 1.3.17 for smooth scroll (NOT GSAP ScrollSmoother — conflicts with existing .landing-scope CSS)
- Total bundle: ~29KB gzipped

### Smooth Scroll
- Lenis active on desktop only — disable on touch devices via matchMedia
- Sync Lenis with GSAP ticker for ScrollTrigger compatibility
- Keep native scroll on mobile (don't fight native behavior)

### Client Component Architecture
- page.tsx stays Server Component — no changes to the page shell
- Create thin Client Component wrappers (AnimatedSection, SmoothScrollProvider)
- Each animated section becomes an island that accepts children as React.ReactNode
- No React Context for animation state — ScrollTrigger's global registry handles coordination

### GSAP Registration
- Single gsap-registration.ts file at module scope for plugin registration
- All islands import this as side-effect — ES module semantics guarantee single execution
- Always use useGSAP() hook, never raw useEffect for animation code

### CSS Initial States
- New landing-animations.css file (separate from landing-home.css)
- Set opacity: 0, transform: translateY(24px) on elements that will animate in
- prefers-reduced-motion media query resets all initial states to visible
- This prevents FOUC while respecting accessibility

### Claude's Discretion
- Exact file organization for animation utilities
- Whether to create a shared hooks file or co-locate with components
- Lenis configuration parameters (lerp, duration, etc.)
- Exact Client Component wrapper API design

</decisions>

<specifics>
## Specific Ideas

- Research strongly recommends Lenis over ScrollSmoother because ScrollSmoother wraps entire DOM in fixed container, conflicting with existing .landing-scope architecture
- useGSAP hook from @gsap/react handles React 18 strict mode cleanup automatically via gsap.context()
- CSS initial states MUST match GSAP from() values exactly to prevent FOUC

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-motion-foundation*
*Context gathered: 2026-02-27*
