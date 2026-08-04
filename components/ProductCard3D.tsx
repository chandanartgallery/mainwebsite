'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';

interface ProductCard3DProps {
  href: string;
  image: string;
  name: string;
  price?: number | null;
  meta?: string;
  badge?: string | null;
}

/** Responsive 3D tilt product card — fills parent aspect box. */
export default function ProductCard3D({
  href,
  image,
  name,
  price,
  meta,
  badge,
}: ProductCard3DProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 220,
    damping: 22,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 220,
    damping: 22,
  });
  const glareX = useTransform(mx, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(my, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 55%)`;

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group flex h-full cursor-pointer flex-col"
      style={{ perspective: 900 }}
    >
      <motion.div
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          draggable={false}
        />
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glareBg }}
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 bg-neutral-950 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white">
            {badge}
          </span>
        )}
      </motion.div>
      <div className="mt-4 flex min-h-[4.5rem] flex-col">
        {meta && (
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-400">
            {meta}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-snug text-neutral-900 transition group-hover:opacity-70 dark:text-neutral-50">
          {name}
        </h3>
        <p className="mt-auto pt-2 text-sm font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
          {price != null ? `₹${price.toLocaleString('en-IN')}` : 'Price on request'}
        </p>
      </div>
    </Link>
  );
}
