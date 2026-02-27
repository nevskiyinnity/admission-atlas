# Feature Research

**Domain:** Apple Design Award-caliber landing page redesign (scroll-driven animation, micro-interactions, typography, visual effects)
**Researched:** 2026-02-27
**Confidence:** MEDIUM-HIGH (multiple web sources cross-referenced; some techniques verified via GSAP/Codrops official docs)

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors assume exist on any premium landing page in 2025/2026. Missing these and the page feels like a template, not a crafted product.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Scroll-triggered reveal animations** | Every premium site reveals content as you scroll. Static pages feel broken. Apple, Linear, Stripe, Vercel all do this. | MEDIUM | Use GSAP ScrollTrigger with `IntersectionObserver`-style triggers. Animate elements in with `opacity` + `transform` (translateY 20-40px). Stagger children 50-80ms apart. These are S-Tier compositor animations (transform + opacity) so performance is guaranteed. |
| **Smooth eased transitions on hover states** | Buttons, cards, and links that respond instantly feel alive. No transition = amateur. | LOW | CSS `transition: 160-300ms` on `transform`, `box-shadow`, `color`. Use the existing `--hm-ease` cubic-bezier. Already partially implemented in nav links. Extend to all interactive elements. |
| **Responsive motion (prefers-reduced-motion)** | Accessibility requirement and increasingly enforced by design communities. Users who disable motion must get a functional, elegant page. | LOW | Wrap all animations in `@media (prefers-reduced-motion: no-preference)`. GSAP has `ScrollTrigger.matchMedia()` for this. Reduce or eliminate transforms; keep opacity fades as minimal alternative. |
| **Buttery smooth scrolling** | Jank during scroll is immediately noticeable, especially on animation-heavy pages. | MEDIUM | GSAP ScrollSmoother provides GPU-accelerated smoothing. Alternative: CSS `scroll-behavior: smooth` for anchor links only. Avoid fighting native scroll on mobile (see Anti-Features). |
| **Floating/sticky navigation with backdrop blur** | Already implemented. Standard pattern on every premium SaaS and luxury site. | LOW | Already exists (`.h-nav` with `backdrop-filter: blur(20px)`). Preserve. Consider adding scroll-aware opacity/shadow changes (more prominent shadow after scrolling past hero). |
| **Typography hierarchy with deliberate contrast** | Premium pages use dramatic size differences between display headings and body text. Current contrast is good but not dramatic enough. | LOW | Increase hero heading size to 4.5-6rem (desktop). Body stays 1-1.1rem. The ratio should be at least 4:1 between display and body. Use `clamp()` for fluid scaling. |
| **Section visual separation** | Sections must feel like distinct environments, not stacked divs with padding. | MEDIUM | Combine color shifts (light/dark), subtle background texture changes, and transition elements (gradient fades, angled dividers, or overlapping layers). The dark outcomes section already does this but needs more atmosphere. |
| **Loading performance (LCP < 2.5s, CLS < 0.1)** | Core Web Vitals are table stakes for any production page. Animation-heavy pages that fail these metrics are disqualified. | MEDIUM | Lazy-load GSAP and animation code below the fold. Use `will-change: transform` sparingly on animated elements. Avoid animating `width`, `height`, `box-shadow` (these trigger layout/paint). Stick to S-Tier properties: `transform`, `opacity`, `clip-path`, `filter`. |
| **Grain/texture overlay** | Already implemented. Adds analog warmth that distinguishes premium pages from flat SaaS templates. | LOW | Already exists (`.h-grain`). Maintain. Consider subtle variation per section (different opacity in dark vs light sections). |

### Differentiators (Competitive Advantage)

Features that separate a well-made page from one that gets screenshotted and shared. These are what make the page feel "quietly authoritative."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Orchestrated hero entrance sequence** | First 2-3 seconds define perception. A choreographed sequence (background orbs fade in, headline reveals word-by-word, supporting text follows, CTA buttons arrive last) communicates intentionality. Apple product pages and Linear both nail this. | HIGH | Use GSAP timeline with precise delays. Sequence: (1) background orbs scale from 0 to full with blur clearing, ~400ms; (2) headline text reveals via clip-path mask, staggered by word, ~600ms; (3) description fades up, ~200ms; (4) CTA buttons arrive with slight spring, ~200ms. Total: ~1.4s. Must feel inevitable, not decorative. |
| **Text reveal animations (clip-path masking)** | The single most impactful typography technique. Text sliding up from behind an invisible edge creates drama without distraction. Used on Apple product pages, Awwwards SOTD winners, and every serious agency site. | MEDIUM | GSAP SplitText (now free, ~7kb) splits headings into words/lines. Each word animates `clip-path: inset(0 0 100% 0)` to `inset(0)` combined with `translateY(100%)` to `translateY(0)`. Stagger 40-60ms per word. The built-in masking feature (SplitText 3.13+) handles overflow clipping automatically without manual wrapper divs. |
| **Magnetic button effect** | Buttons that subtly pull toward the cursor within a ~50px radius feel tactile and premium. Used on Linear, many Awwwards winners, and luxury brand sites. Creates a sense that the interface is alive and aware. | MEDIUM | Track `mousemove` position relative to button center. Apply `transform: translate(dx, dy)` where dx/dy are clamped to ~8-12px max displacement. Use lerp (linear interpolation) for smooth tracking. Reset with eased transition on `mouseleave`. Apply only to primary CTAs (not every link). |
| **Card tilt/perspective on hover** | Bento grid cards that respond to cursor position with subtle 3D tilt (+/- 3-5 degrees) and a gradient highlight following the cursor feel physical. | MEDIUM | Apply `perspective: 800px` on parent, then `rotateX/rotateY` based on cursor position within card. Keep rotation subtle (max 4-5 degrees). Add a radial gradient pseudo-element that follows cursor position for a light/sheen effect. Use `will-change: transform` on the card. Libraries: Vanilla Tilt.js (~4kb) or custom implementation (~30 lines). |
| **Parallax depth on background elements** | Hero orbs and decorative elements moving at different scroll speeds (0.3x-0.7x page speed) creates spatial depth. Not the old "whole background moves" parallax -- specific elements at specific rates. | MEDIUM | GSAP ScrollTrigger with `scrub: true` on background elements. Hero orbs move at 0.4x scroll speed. Decorative geometry at 0.6x. Content stays at 1x. Keep the ratio subtle (never more than 0.5x difference from content). Only apply to elements already visually separated from content. |
| **Animated gradient mesh / aurora background** | Slow-moving, organic gradient blobs behind the hero and CTA sections create atmosphere without imagery. Stripe pioneered this with their WebGL gradient; simpler CSS-only versions work well for most cases. | MEDIUM-HIGH | Two approaches: (1) **CSS-only** -- 3-4 radial gradients with `background-position` animated via `@keyframes`, cycling over 15-25s. Uses existing palette (navy, gold, teal at low opacity). Cheap to render via compositor. (2) **WebGL** -- A la Stripe's minigl (~10kb), renders noise-driven gradients on canvas. Better visual quality but adds JS weight. **Recommendation: CSS-only for hero, CSS-only for CTA.** WebGL is overkill for this context and adds bundle complexity for marginal visual gain. |
| **Dark section atmospheric transition** | The outcomes section should feel like entering a different space -- not just "background turns dark." Use gradient bleed from the previous section, subtle shift in grain texture density, and a slight parallax offset to create the sensation of depth. | MEDIUM | Gradient overlay at top of dark section: `linear-gradient(to bottom, var(--hm-bg), var(--hm-navy-deep))` spanning ~120px. Increase grain opacity in dark section (0.35 vs 0.28). Add subtle animated glow elements (radial gradients pulsing at 8-12s intervals). Consider a slight `scale(1.02)` on the dark section background to create an enveloping effect. |
| **Staggered scroll reveals with choreography** | Not just "fade up on scroll" -- reveal sequences where a section heading appears, then the kicker animates, then cards stagger in from left to right with 80ms delays. Each section has its own choreographed entrance. | HIGH | GSAP ScrollTrigger timelines per section. Define a timeline: kicker slides in (200ms) -> heading reveals via clip-path (400ms) -> description fades up (200ms) -> cards stagger in (80ms each). Use `scrub: false` with `toggleActions: "play none none none"` so animations play once on entry. Total per-section: ~1.2s. |
| **Subtle SVG geometry accents** | Small animated SVG elements (rotating diamond shapes, pulsing rings, drifting dots) placed as decorative accents near section headings and between content blocks. These give visual rhythm without demanding attention. | LOW-MEDIUM | SVG elements animated with CSS `@keyframes` (rotate over 20s, scale-pulse over 8s). Position with `absolute` within section containers. Use the existing diamond icon pattern (`&#x25C7;`) from outcomes section. Keep them subtle: 8-12% opacity, small scale (16-32px). |
| **FAQ accordion with smooth height animation** | Current `<details>` elements need animated open/close. The native behavior is a jarring snap. Smooth height transition communicates polish. | MEDIUM | Cannot animate native `<details>` height reliably across browsers. Options: (1) Use GSAP `auto` height animation on a custom accordion component (Client Component). (2) CSS `grid-template-rows: 0fr` to `1fr` trick (works in modern browsers, no JS needed). Recommendation: CSS `grid-template-rows` approach first (zero JS cost), fall back to GSAP if cross-browser issues arise. |
| **Scroll-progress indicator** | A thin line at the top of the viewport (or integrated into the nav) that fills as the user scrolls. Communicates page depth and progress. | LOW | GSAP ScrollTrigger can drive a `scaleX` transform on a fixed element. Or pure CSS with `scroll-timeline` (modern browsers only). Recommendation: GSAP approach for cross-browser reliability. 2px height, gold accent color, positioned under the nav bar. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look impressive in demos but actively hurt the experience in production. **Deliberately do not build these.**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Custom scroll hijacking / ScrollSmoother on mobile** | "Make scrolling feel premium everywhere" | Fighting native scroll on mobile/trackpad causes motion sickness, accessibility violations, and breaks expected scroll behavior. Users have muscle memory for how scroll works on their device. ScrollSmoother on touch devices feels wrong. Chrome's scroll performance case study explicitly warns against this. | Use GSAP ScrollSmoother on desktop only, with `matchMedia` to disable on touch devices. Let mobile use native scroll. Animate on scroll position, not scroll velocity. |
| **Page preloader / loading screen** | "Create anticipation with a branded loading animation" | Adds perceived load time. Users see a blank screen or spinner before content -- the opposite of fast. Google penalizes pages with delayed content rendering (LCP). Premium sites in 2025 load instantly and animate content in-place. | Animate the hero entrance sequence after content paints. The choreographed reveal IS the "loading" animation, but content is already rendered in the DOM (SSR). No actual delay, just orchestrated appearance. |
| **Particle systems / Three.js / heavy WebGL** | "Add ambient floating particles or 3D elements for visual depth" | Massive bundle size (Three.js is ~150kb gzipped). GPU-intensive, drains battery on laptops and mobile. Creates accessibility nightmares. Overkill for a service landing page. The Stripe gradient (10kb WebGL) worked because it was custom and minimal; a full 3D scene is not that. | Use CSS-animated SVG elements or CSS gradient blobs. 5-10 subtle SVG shapes animated with CSS `@keyframes` create ambient movement at near-zero performance cost. The visual difference on a text-heavy page is negligible vs. a full particle system. |
| **Continuous / looping animations everywhere** | "Make the page feel alive with constant motion" | Continuous animation fatigues users, creates distraction from content, wastes battery, and triggers motion sensitivity. Blur effects in particular scale sharply in GPU cost with radius and layer size. Awwwards winners use motion sparingly -- it draws attention because it is rare on the page. | Use motion at decision points: entry reveals (play once), hover states (user-initiated), and transition moments. Static between interactions. The page should feel calm and confident, not anxious. |
| **Horizontal scroll sections** | "Pin a section and scroll cards horizontally for a unique feel" | Breaks scroll predictability. Users don't know how long the section is or how to navigate. Trackpad behavior differs from mouse wheel. Mobile experience is particularly poor. Accessibility tools struggle with axis changes. | Keep vertical scroll. Use staggered card reveals or a well-designed grid (the bento layout already handles this). If horizontal showcase is truly needed, make it a contained carousel with visible navigation, not a scroll-driven axis change. |
| **Parallax on text content** | "Move headings at different speeds from body text for depth" | Text at different scroll speeds becomes hard to read. Creates cognitive dissonance between content layers. Accessibility tools cannot track content that moves unpredictably. | Apply parallax only to decorative, non-content elements (orbs, geometry, background gradients). Content elements (headings, body, cards) scroll at exactly 1x speed. |
| **Over-designed cursor effects (custom cursor, trails, halos)** | "Replace the default cursor with a branded one for premium feel" | Breaks expected interaction patterns. Custom cursors have latency compared to native. Cursor trails are purely decorative and feel dated (2019 trend). Accessibility tools rely on system cursor. | Use cursor: pointer on interactive elements. Magnetic button effects create cursor-awareness without replacing the cursor itself. If any cursor enhancement, limit it to a subtle dot that appears near buttons (not replacing the system cursor). |
| **Scroll-linked video playback** | "Play a video as the user scrolls, Apple AirPods Pro style" | Requires downloading 5-30MB of video frames (or hundreds of image frames). Massive bandwidth cost. Mobile data usage concern. Complex to implement reliably. Only justified for product showcase pages (Apple selling a $249 product), not service pages. | Use CSS/SVG animation for visual storytelling. Scroll-linked SVG path drawing or morphing achieves a similar "reveal through scroll" effect at 1/100th the bandwidth. |
| **Everything animated at once** | "Animate all elements for visual richness" | When everything moves, nothing has importance. Premium pages use animation to guide attention hierarchically. Apple's pages have large static regions punctuated by specific animated moments. The contrast between stillness and motion is what creates impact. | Animate only: (1) section entry reveals, (2) the hero sequence, (3) hover states on interactive elements, (4) one or two "signature" moments (dark section transition, final CTA glow). Everything else stays still. |

## Feature Dependencies

```
[GSAP Core + ScrollTrigger]
    |
    +--requires--> [Client Component boundaries in Next.js page]
    |                  |
    |                  +--requires--> [Server/Client component split architecture]
    |
    +--enables--> [Scroll-triggered reveals]
    |                 +--enhances--> [Staggered choreography per section]
    |
    +--enables--> [Hero entrance sequence]
    |                 +--requires--> [GSAP SplitText] (for text clip-path reveals)
    |
    +--enables--> [Parallax depth on background elements]
    |
    +--enables--> [Scroll-progress indicator]

[CSS-only animations]
    |
    +--enables--> [Gradient mesh / aurora backgrounds]
    +--enables--> [SVG geometry accents]
    +--enables--> [Grain texture overlay] (already exists)
    +--enables--> [FAQ accordion height animation] (grid-template-rows approach)
    +--enables--> [Hover transitions] (already partial)

[Magnetic button effect]
    +--requires--> [Client Component wrapper for CTA buttons]
    +--conflicts--> [Custom cursor replacement] (anti-feature)

[Card tilt/perspective]
    +--requires--> [Client Component wrapper for bento grid]
    +--enhances--> [Bento card hover states]

[Dark section atmospheric transition]
    +--requires--> [Scroll-triggered reveals] (for coordinated entry)
    +--enhances--> [Section visual separation]

[Text reveal animations]
    +--requires--> [GSAP SplitText plugin]
    +--requires--> [Client Component wrapper for heading elements]
    +--enhances--> [Hero entrance sequence]
    +--enhances--> [Staggered scroll reveals]
```

### Dependency Notes

- **GSAP Core is the foundation:** Nearly every differentiator depends on GSAP + ScrollTrigger. This is the first integration decision and first implementation task. All GSAP plugins (ScrollTrigger, SplitText, ScrollSmoother) are now free following Webflow's acquisition.
- **Client Component boundaries must be surgical:** The page is currently a Server Component. Adding GSAP means introducing Client Component wrappers. Design these as thin wrappers (`<AnimatedSection>`, `<MagneticButton>`, `<TiltCard>`) that accept children as Server Component JSX. Do not convert the entire page to a Client Component.
- **CSS-only features are independent:** Gradient backgrounds, SVG accents, grain overlays, and basic hover transitions can be implemented without GSAP, without Client Components, and without any JavaScript. These can ship first as a CSS-only polish pass before GSAP integration.
- **Magnetic buttons conflict with custom cursors:** Both try to create cursor awareness. Magnetic effect is subtler, more functional, and does not break accessibility. Do not combine with cursor replacement.

## MVP Definition

### Launch With (v1) -- CSS Foundation

Minimum viable redesign -- what delivers premium perception without GSAP complexity.

- [ ] **Typography scale upgrade** -- Increase hero heading contrast ratio to 4:1+ vs body text. `clamp()` fluid sizing.
- [ ] **Enhanced hover transitions** -- All buttons, cards, links get polished transition timing (160-300ms, custom ease).
- [ ] **Section separation polish** -- Gradient overlaps between sections, dark section atmospheric entry with gradient bleed.
- [ ] **Animated gradient background** -- CSS-only aurora/mesh effect behind hero and final CTA sections.
- [ ] **SVG geometry accents** -- 4-6 subtle decorative elements placed at section headings.
- [ ] **FAQ smooth accordion** -- CSS `grid-template-rows` animation for `<details>` elements.
- [ ] **prefers-reduced-motion** -- Wrap all motion in appropriate media query.

### Add After Validation (v1.x) -- GSAP Integration

Features that require GSAP and Client Component architecture.

- [ ] **GSAP + ScrollTrigger integration** -- Install GSAP, create thin Client Component wrappers.
- [ ] **Scroll-triggered reveal animations** -- All sections animate in on scroll with staggered timing.
- [ ] **Hero entrance sequence** -- Choreographed timeline: orbs, headline (SplitText), description, CTAs.
- [ ] **Text reveal animations** -- SplitText clip-path reveals on section headings.
- [ ] **Parallax depth on decorative elements** -- Hero orbs and geometry at 0.4-0.6x scroll speed.
- [ ] **Staggered section choreography** -- Per-section GSAP timelines with ordered reveals.
- [ ] **Scroll-progress indicator** -- Gold accent bar under nav, driven by ScrollTrigger.

### Future Consideration (v2+)

Features to defer until core animation system is proven stable.

- [ ] **Magnetic button effect** -- Requires per-button Client Component and careful mobile handling.
- [ ] **Card tilt/perspective** -- Requires per-card Client Component and performance validation on mobile.
- [ ] **Dark section atmospheric enhancement** -- Animated glow elements, parallax offset on dark background.
- [ ] **ScrollSmoother (desktop only)** -- Smooth scroll normalization. Must be disabled on touch devices.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Scroll-triggered reveal animations | HIGH | MEDIUM | P1 |
| Hero entrance sequence | HIGH | HIGH | P1 |
| Text reveal animations (SplitText) | HIGH | MEDIUM | P1 |
| Typography scale upgrade | HIGH | LOW | P1 |
| Enhanced hover transitions | MEDIUM | LOW | P1 |
| Section separation polish | MEDIUM | LOW | P1 |
| prefers-reduced-motion | HIGH | LOW | P1 |
| Animated gradient background | MEDIUM | MEDIUM | P2 |
| Staggered section choreography | MEDIUM | HIGH | P2 |
| Parallax depth on decorative elements | MEDIUM | MEDIUM | P2 |
| SVG geometry accents | LOW | LOW | P2 |
| FAQ smooth accordion | LOW | LOW | P2 |
| Scroll-progress indicator | LOW | LOW | P2 |
| Dark section atmospheric transition | MEDIUM | MEDIUM | P2 |
| Magnetic button effect | MEDIUM | MEDIUM | P3 |
| Card tilt/perspective | LOW | MEDIUM | P3 |
| ScrollSmoother (desktop) | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for the redesign to feel award-caliber
- P2: Should have, adds significant polish
- P3: Nice to have, implement if time permits

## Competitor Feature Analysis

| Feature | Apple Product Pages | Linear | Stripe | Vercel | Our Approach |
|---------|-------------------|--------|--------|--------|--------------|
| Scroll-driven reveals | Image-sequence canvas playback scrubbed to scroll position. Extremely heavy (hundreds of frames). | Fade-up with stagger on scroll. Clean and fast. | IntersectionObserver triggers, not scrubbed. One-shot animations. | Minimal. Subtle fades only. Relies on content clarity. | GSAP ScrollTrigger one-shot reveals with stagger. Not scrubbed (play once on entry). Linear's approach. |
| Hero animation | Canvas video sequence. Product rotates as you scroll. | Gradient glow pulse + headline fade-in. Confident, fast. | WebGL gradient mesh background, text fades in. | Near-instant. Text appears immediately, subtle gradient shift. | Choreographed GSAP timeline: orbs -> SplitText headline -> description -> CTAs. ~1.4s total. |
| Typography treatment | Large display type, often San Francisco Pro. Sticky text sections that pin and scroll away. | Clean, medium-contrast. Variable weight transitions. | Clean, high contrast. Not especially dramatic. | Geist font, large but restrained. | High-contrast display type (4:1+ vs body). SplitText clip-path reveals on headings. Closest to Apple's drama with Linear's restraint. |
| Background effects | Product photography on black. No abstract effects. | Gradient glows, beam/ray effects, aurora. | WebGL mesh gradient (~10kb custom). | Subtle gradients, dot grid patterns. | CSS-only animated gradient mesh (no WebGL overhead). 3-4 radial gradients cycling over 15-25s. |
| Micro-interactions | Minimal on marketing pages. Product-focused. | Magnetic elements, glow on hover, subtle scale. | Gradient shifts on hover. Clean. | Almost none. Content-first. | Magnetic buttons on primary CTAs. Card tilt on bento grid. Glow accent on hover for pricing cards. |
| Dark sections | Full dark pages for Pro products. Atmospheric. | Gradient-lit dark sections with glow. | Dark footer with gradient transition. | Dark by default. Theme switching. | Dark outcomes section with gradient bleed transition, increased grain, subtle pulsing glow accents. |
| Performance approach | Heavy but targeted (specific product pages only). | Lightweight. Fast loads, minimal JS for animations. | Custom minimal WebGL. Small footprint. | Extremely fast. Almost no animation JS. | GSAP (~25kb core + 10kb ScrollTrigger + 7kb SplitText, tree-shakeable). CSS-first where possible. Lazy-load animation code below fold. |
| "Quietly authoritative" quality | Achieved through product photography + precision. Content does the work. | Achieved through restraint + one or two signature moments. | Achieved through the gradient -- one memorable element. | Achieved through speed + typography + near-total absence of decoration. | Achieve through: (1) choreographed hero sequence as signature moment, (2) typographic drama, (3) restrained use of animation (quality over quantity), (4) dark section as atmospheric shift. |

## What Makes "Quietly Authoritative"

Based on analyzing Apple, Linear, Stripe, and Vercel landing pages plus Awwwards SOTD winners, the "quietly authoritative" quality comes from specific patterns:

1. **Restraint over abundance.** Award-winning pages animate 20-30% of elements, not 100%. The contrast between still and moving content is what creates impact. When everything moves, nothing matters.

2. **Deliberate timing.** Animations use easing curves that feel inevitable -- not bouncy, not linear. `cubic-bezier(0.22, 1, 0.36, 1)` (the existing `--hm-ease`) is correct. Durations of 400-800ms for reveals, 150-300ms for hover states. Never faster than 100ms (feels glitchy) or slower than 1200ms (feels sluggish).

3. **Typography as the hero.** Large, confident headings with generous whitespace communicate authority more than any animation. The text itself should be the most visually dominant element, not the effects around it.

4. **One signature moment.** Stripe has the gradient. Linear has the glow. Apple has the scroll-video. The best pages have one thing you remember, not twelve. For Admission Atlas, this should be the hero entrance sequence.

5. **Generous negative space.** Luxury brands universally use 2-3x more whitespace than standard SaaS sites. Sections should breathe. Padding of 120-160px between major sections, not 60-80px.

6. **Color restraint.** Limit the palette to 2-3 colors maximum. The existing navy/gold/teal palette is correct -- use gold sparingly as an accent, navy as the authority color, teal as the secondary. Never use all three at full saturation simultaneously.

7. **Motion that serves hierarchy.** Animation should guide the eye in reading order: kicker -> heading -> body -> CTA. Never animate elements that compete for attention simultaneously.

## Sources

- [Let's Make One of Those Fancy Scrolling Animations Used on Apple Product Pages - CSS-Tricks](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
- [GSAP ScrollTrigger Official Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP SplitText Official Docs](https://gsap.com/docs/v3/Plugins/SplitText/)
- [The Web Animation Performance Tier List - Motion Magazine](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Scroll-Driven Animations Performance Case Study - Chrome for Developers](https://developer.chrome.com/blog/scroll-animation-performance-case-study)
- [From SplitText to MorphSVG: Creative GSAP Demos - Codrops](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)
- [7 Must-Know GSAP Animation Tips - Codrops](https://tympanus.net/codrops/2025/09/03/7-must-know-gsap-animation-tips-for-creative-developers/)
- [Creating 3D Scroll-Driven Text Animations with CSS and GSAP - Codrops](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/)
- [How to Create the Stripe Website Gradient Effect - Kevin Hufnagl](https://kevinhufnagl.com/how-to-stripe-website-gradient-effect/)
- [Stripe Connect: Behind the Front-End Experience](https://stripe.com/blog/connect-front-end-experience)
- [Magnetic Buttons - Codrops](https://tympanus.net/codrops/2020/08/05/magnetic-buttons/)
- [Luxury Website Design Patterns - Mediaboom](https://mediaboom.com/news/luxury-website-design/)
- [Luxury Brand Website Design - Webflow Blog](https://webflow.com/blog/luxury-brand-websites)
- [Animation Performance and Frame Rate - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [Kinetic Typography: Complete Guide 2026 - IK Agency](https://www.ikagency.com/graphic-design-typography/kinetic-typography/)
- [Web Design Trends 2026 - Really Good Designs](https://reallygooddesigns.com/web-design-trends-2026/)
- [Best Animation Websites - Awwwards](https://www.awwwards.com/websites/animation/)
- [Best Framer Motion Websites - Awwwards](https://www.awwwards.com/websites/motion/)
- [Parallax Scrolling Best Practices - Clay](https://clay.global/blog/web-design-guide/parallax-scrolling)
- [CSS Aurora Effect - DEV Community](https://dev.to/oobleck/css-aurora-effect-569n)
- [Building a Layered Zoom Scroll Effect with GSAP - Codrops](https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/)

---
*Feature research for: Apple Design Award-caliber landing page redesign*
*Researched: 2026-02-27*
