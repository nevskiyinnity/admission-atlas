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

        // Find all h2 headings inside this section
        const headings = container.querySelectorAll('h2');

        headings.forEach((h2) => {
          const split = SplitText.create(h2, { type: 'words' });

          gsap.from(split.words, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.5,
            stagger: 0.04,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: h2,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        });

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
