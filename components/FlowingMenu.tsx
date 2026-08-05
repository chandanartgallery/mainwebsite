'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useMediaQuery } from '@/lib/useMediaQuery';

interface MenuItemData {
  link: string;
  text: string;
  image: string;
}

interface FlowingMenuProps {
  items?: MenuItemData[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

interface MenuItemProps extends MenuItemData {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
  isTouch: boolean;
  isActive: boolean;
  onActivate: () => void;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = '#fff',
}) => {
  // Phones / tablets: no hover — use tap-to-preview instead
  const isTouch = useMediaQuery('(hover: none), (pointer: coarse)');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Lower duration = faster marquee (GSAP duration is seconds per loop)
  const effectiveSpeed = isTouch ? Math.max(5, speed * 0.4) : speed;

  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={effectiveSpeed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
            isTouch={isTouch}
            isActive={activeIndex === idx}
            onActivate={() => setActiveIndex(idx)}
          />
        ))}
      </nav>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
  isTouch,
  isActive,
  onActivate,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const openRef = useRef(false);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ): 'top' | 'bottom' => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const openMarquee = useCallback((edge: 'top' | 'bottom' = 'top') => {
    if (!marqueeRef.current || !marqueeInnerRef.current || openRef.current) return;
    openRef.current = true;
    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  }, []);

  const closeMarquee = useCallback((edge: 'top' | 'bottom' = 'bottom') => {
    if (!marqueeRef.current || !marqueeInnerRef.current || !openRef.current) return;
    openRef.current = false;
    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  }, []);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / Math.max(contentWidth, 1)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  // Sync open/close with active state on touch devices
  useEffect(() => {
    if (!isTouch) return;
    if (isActive) openMarquee('top');
    else closeMarquee('bottom');
  }, [isActive, isTouch, openMarquee, closeMarquee]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouch) return;
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );
    openMarquee(edge);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouch) return;
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );
    closeMarquee(edge);
  };

  const handleClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isTouch) return;
    // First tap: preview marquee. Second tap on same item: follow link.
    if (!isActive) {
      ev.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center"
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[clamp(1.05rem,3.8vh,2.25rem)] sm:text-[4vh]"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ color: textColor }}
        aria-expanded={isTouch ? isActive : undefined}
      >
        {text}
      </a>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
        aria-hidden
      >
        <div className="h-full w-fit flex will-change-transform" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div
              className="marquee-part flex items-center flex-shrink-0"
              key={idx}
              style={{ color: marqueeTextColor }}
            >
              <span className="whitespace-nowrap uppercase font-normal text-[clamp(1.05rem,3.8vh,2.25rem)] sm:text-[4vh] leading-[1] px-[1vw]">
                {text}
              </span>
              <div
                className="w-[140px] sm:w-[200px] h-[5.5vh] sm:h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
