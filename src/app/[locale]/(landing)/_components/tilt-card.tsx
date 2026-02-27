'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from './gsap-registration';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(hover: hover)', () => {
        const card = cardRef.current;
        if (!card) return;

        const MAX_ROTATION = 4;

        gsap.set(card, { transformPerspective: 800 });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
          const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

          const rotateY = gsap.utils.clamp(
            -MAX_ROTATION,
            MAX_ROTATION,
            xNorm * MAX_ROTATION * 2
          );
          const rotateX = gsap.utils.clamp(
            -MAX_ROTATION,
            MAX_ROTATION,
            -yNorm * MAX_ROTATION * 2
          );

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });

          card.style.setProperty(
            '--sheen-x',
            `${e.clientX - rect.left}px`
          );
          card.style.setProperty(
            '--sheen-y',
            `${e.clientY - rect.top}px`
          );
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: 'power3.out',
          });
          card.style.removeProperty('--sheen-x');
          card.style.removeProperty('--sheen-y');
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          card.removeEventListener('mousemove', handleMouseMove);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      });
    },
    { scope: cardRef }
  );

  return (
    <div ref={cardRef} className={className}>
      {children}
    </div>
  );
}
