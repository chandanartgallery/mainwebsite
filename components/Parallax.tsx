'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical travel in px (positive = moves down as you scroll) */
  offset?: number;
  speed?: number;
}

/** Parallax wrapper — element drifts relative to scroll progress. */
export function Parallax({ children, className = '', offset = 80, speed = 1 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset * speed, -offset * speed]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Scale so parallax crop doesn't show edges */
  scale?: number;
  speed?: number;
}

/** Full-bleed image that parallax-scrolls inside a clipped container. */
export function ParallaxImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  scale = 1.2,
  speed = 1,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-12 * speed}%`, `${12 * speed}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover will-change-transform ${imgClassName}`}
        style={reduce ? { scale } : { y, scale }}
        draggable={false}
      />
    </div>
  );
}

export function useParallaxY(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

export default Parallax;
