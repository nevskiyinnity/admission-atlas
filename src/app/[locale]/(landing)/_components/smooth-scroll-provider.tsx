'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-registration';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Desktop-only: skip Lenis on touch devices and reduced-motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // Connect Lenis scroll updates to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (single RAF loop)
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
