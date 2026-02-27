'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from './gsap-registration';

interface HeroEntranceProps {
  children: React.ReactNode;
}

export function HeroEntrance({ children }: HeroEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const container = containerRef.current;
        if (!container) return;

        // Query hero elements
        const orbs = container.querySelectorAll('.h-hero-orb');
        const badge = container.querySelector('.h-badge');
        const h1 = container.querySelector('h1');
        const desc = container.querySelector('.h-hero-desc');
        const actions = container.querySelectorAll('.h-hero-actions > *');

        if (!h1) return;

        // Split headline into words for clip-path reveal
        const split = SplitText.create(h1, { type: 'words' });

        // Build the entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // 1. Orbs scale in (0s)
        tl.from(orbs, {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
        }, 0);

        // 2. Badge fades up (0.15s)
        if (badge) {
          tl.from(badge, {
            y: 24,
            opacity: 0,
            duration: 0.5,
          }, 0.15);
        }

        // 3. Headline words reveal via clip-path (0.3s)
        tl.from(split.words, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 0.6,
          stagger: 0.05,
        }, 0.3);

        // 4. Description fades up (0.7s)
        if (desc) {
          tl.from(desc, {
            y: 24,
            opacity: 0,
            duration: 0.5,
          }, 0.7);
        }

        // 5. CTA buttons arrive with spring (0.9s)
        if (actions.length) {
          tl.from(actions, {
            y: 24,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
            stagger: 0.1,
          }, 0.9);
        }

        // useGSAP context auto-reverts SplitText + kills timeline on unmount
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
