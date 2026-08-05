'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor,
  glowColor,
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = '',
}) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<FocusRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (manualMode) return;
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000,
    );
    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    const update = () => {
      const parent = containerRef.current;
      const active = wordRefs.current[currentIndex];
      if (!parent || !active) return;
      const parentRect = parent.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
    };

    update();
    window.addEventListener('resize', update);
    const fonts = document.fonts?.ready?.then(update);
    return () => {
      window.removeEventListener('resize', update);
      void fonts;
    };
  }, [currentIndex, words.length]);

  const handleMouseEnter = (index: number) => {
    if (!manualMode) return;
    setLastActiveIndex(index);
    setCurrentIndex(index);
  };

  const handleMouseLeave = () => {
    if (!manualMode || lastActiveIndex == null) return;
    setCurrentIndex(lastActiveIndex);
  };

  const cornerStyle = borderColor
    ? {
        borderColor,
        filter: glowColor ? `drop-shadow(0 0 6px ${glowColor})` : undefined,
      }
    : undefined;

  const cornerClass = borderColor
    ? 'absolute h-4 w-4 rounded-[2px] border-[2.5px]'
    : 'absolute h-4 w-4 rounded-[2px] border-[2.5px] border-neutral-950 dark:border-white';

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-wrap items-center justify-center gap-4 px-4 py-5 font-sans ${className}`}
      style={{ outline: 'none', userSelect: 'none' }}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={`${word}-${index}`}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            className="relative cursor-pointer font-sans text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-neutral-950 dark:text-white"
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
              outline: 'none',
              userSelect: 'none',
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-10 box-border border-0"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: focusRect.width > 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className={`${cornerClass} -left-2.5 -top-2.5 border-b-0 border-r-0`}
          style={cornerStyle}
        />
        <span
          className={`${cornerClass} -right-2.5 -top-2.5 border-b-0 border-l-0`}
          style={cornerStyle}
        />
        <span
          className={`${cornerClass} -bottom-2.5 -left-2.5 border-r-0 border-t-0`}
          style={cornerStyle}
        />
        <span
          className={`${cornerClass} -bottom-2.5 -right-2.5 border-l-0 border-t-0`}
          style={cornerStyle}
        />
      </motion.div>
    </div>
  );
};

export default TrueFocus;
