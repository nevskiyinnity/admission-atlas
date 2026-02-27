'use client';

import { useRef } from 'react';
import './gsap-registration'; // side-effect import ensures plugins registered

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Phase 1: identity wrapper — no animation logic yet
  // Later phases will add useGSAP() here for scroll-triggered reveals

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
