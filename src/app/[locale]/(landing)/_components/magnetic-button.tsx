'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from './gsap-registration';

interface MagneticButtonProps {
  children: React.ReactNode;
}

export function MagneticButton({ children }: MagneticButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(hover: hover)', () => {
        const el = wrapRef.current;
        if (!el) return;

        const RADIUS = 50;
        const STRENGTH = 0.4;

        const xTo = gsap.quickTo(el, 'x', {
          duration: 0.6,
          ease: 'power3.out',
        });
        const yTo = gsap.quickTo(el, 'y', {
          duration: 0.6,
          ease: 'power3.out',
        });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS) {
            xTo(dx * STRENGTH);
            yTo(dy * STRENGTH);
          } else {
            xTo(0);
            yTo(0);
          }
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          el.removeEventListener('mousemove', handleMouseMove);
          el.removeEventListener('mouseleave', handleMouseLeave);
        };
      });
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
}
