'use client';

import { useRef, useEffect, useState, useMemo, useId, FC, PointerEvent } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const viewWidth = isMobile ? 520 : 1440;
  const pathY = isMobile ? 48 : 42;

  const text = useMemo(() => {
    // Wider word gaps via non-breaking spaces around separators
    const spaced = marqueeText
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s*·\s*/g, '\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0')
      .replace(/ /g, '\u00A0\u00A0');
    return spaced + '\u00A0\u00A0\u00A0';
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M0,${pathY} Q${viewWidth / 2},${pathY + curveAmount} ${viewWidth},${pathY}`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil((viewWidth * 1.6) / textLength) + 3)
        .fill(text)
        .join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    // Remeasure when text, size, or path geometry changes
    setSpacing(0);
    const id = requestAnimationFrame(() => {
      if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
    });
    return () => cancelAnimationFrame(id);
  }, [text, className, viewWidth, isMobile]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute('startOffset', initial + 'px');
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute('startOffset', newOffset + 'px');
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  const cursorStyle = interactive ? (dragRef.current ? 'grabbing' : 'grab') : 'auto';

  return (
    <div
      className="w-full overflow-hidden py-3 sm:py-4"
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        className={`block w-full h-auto select-none font-semibold leading-none ${
          isMobile ? 'text-[1.85rem]' : 'text-[clamp(1.25rem,2.6vw,1.7rem)]'
        }`}
        viewBox={`0 0 ${viewWidth} 100`}
        preserveAspectRatio="xMidYMid meet"
        style={{ aspectRatio: `${viewWidth} / 100` }}
        aria-hidden={!ready}
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text
            xmlSpace="preserve"
            className={className ?? 'fill-neutral-800'}
            style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
          >
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + 'px'} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
