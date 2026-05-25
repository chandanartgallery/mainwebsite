'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
      overscroll: false,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
