'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { useReducedMotion } from 'framer-motion';

interface AnimeRevealProps {
  children: React.ReactNode;
  className?: string;
  /** CSS selector for staggered children inside */
  staggerSelector?: string;
  delay?: number;
  y?: number;
}

/** Scroll-triggered fade/slide using anime.js */
export default function AnimeReveal({
  children,
  className = '',
  staggerSelector,
  delay = 0,
  y = 36,
}: AnimeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) {
      if (el) el.style.opacity = '1';
      return;
    }

    el.style.opacity = '0';
    const targets = staggerSelector
      ? Array.from(el.querySelectorAll(staggerSelector))
      : [el];

    if (staggerSelector) {
      targets.forEach((t) => {
        (t as HTMLElement).style.opacity = '0';
      });
      el.style.opacity = '1';
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        animate(targets, {
          opacity: [0, 1],
          translateY: [y, 0],
          delay: staggerSelector ? stagger(70, { start: delay }) : delay,
          duration: 900,
          ease: 'out(3)',
        });
        io.disconnect();
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, reduce, staggerSelector, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
