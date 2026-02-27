'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, SplitText } from './gsap-registration';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const container = containerRef.current;
        if (!container) return;

        const section = container.querySelector('section');
        if (!section) return;

        // Immediately reveal the section container (clear CSS initial state)
        // CSS sets opacity:0 + translateY(24px) for FOUC prevention;
        // we clear it instantly so children can animate individually
        gsap.set(section, { opacity: 1, y: 0 });

        // ── Query animatable children ──
        const kicker = section.querySelector('.h-kicker');
        const headings = section.querySelectorAll('h2');
        const sub = section.querySelector('.h-sect-sub');

        // Description paragraph: .h-sect-sub OR direct p inside callout-inner/final
        // (callout has p inside .h-callout-inner, final CTA has p as direct child)
        const descP =
          sub ||
          section.querySelector('.h-callout-inner > p') ||
          section.querySelector(':scope > p');

        // Content elements: query all possible types, take whichever exists
        const contentEls =
          section.querySelectorAll('.h-bento-card').length
            ? section.querySelectorAll('.h-bento-card')
            : section.querySelectorAll('.h-tl-step').length
              ? section.querySelectorAll('.h-tl-step')
              : section.querySelectorAll('.h-outcome').length
                ? section.querySelectorAll('.h-outcome')
                : section.querySelectorAll('.h-plan-card').length
                  ? section.querySelectorAll('.h-plan-card')
                  : section.querySelectorAll('.h-faq-item').length
                    ? section.querySelectorAll('.h-faq-item')
                    : section.querySelectorAll('.h-metric').length
                      ? section.querySelectorAll('.h-metric')
                      : null;

        // CTA button (for callout and final CTA sections)
        const ctaBtn =
          section.querySelector('.h-btn-light') ||
          section.querySelector(':scope > .h-btn-primary');

        // ── Metrics section: simple stagger, no timeline needed ──
        if (section.classList.contains('h-metrics')) {
          const metrics = section.querySelectorAll('.h-metric');
          if (metrics.length) {
            gsap.from(metrics, {
              y: 24,
              opacity: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            });
          }
          return;
        }

        // ── Standard section: choreographed timeline ──
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out', duration: 0.6 },
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });

        let pos = 0;

        // 1. Kicker label
        if (kicker) {
          tl.from(kicker, { y: 16, opacity: 0, duration: 0.4 }, pos);
          pos += 0.1;
        }

        // 2. Heading words (SplitText clip-path reveal)
        headings.forEach((h2) => {
          const split = SplitText.create(h2, { type: 'words' });
          tl.from(
            split.words,
            {
              clipPath: 'inset(0 100% 0 0)',
              duration: 0.5,
              stagger: 0.04,
            },
            pos
          );
          pos += 0.2;
        });

        // 3. Description paragraph
        if (descP) {
          tl.from(descP, { y: 24, opacity: 0 }, pos);
          pos += 0.2;
        }

        // 4. Content elements (cards, steps, outcomes, etc.)
        if (contentEls && contentEls.length) {
          tl.from(contentEls, { y: 24, opacity: 0, stagger: 0.08 }, pos);
          pos += 0.15;
        }

        // 5. CTA button (callout and final CTA sections)
        if (ctaBtn) {
          tl.from(
            ctaBtn,
            { y: 24, opacity: 0, duration: 0.5, ease: 'back.out(1.4)' },
            pos
          );
        }

        // useGSAP context auto-reverts SplitText + kills ScrollTriggers on unmount
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
