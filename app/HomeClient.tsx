'use client';

import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, Minus, Plus, Quote } from 'lucide-react';
import ProductCard3D from '@/components/ProductCard3D';
import AnimeReveal from '@/components/AnimeReveal';
import SplitText from '@/components/SplitText';
import AccordionGallery from '@/components/AccordionGallery';
import CurvedLoop from '@/components/CurvedLoop';
import CircularGallery from '@/components/CircularGallery';
import ScrollReveal from '@/components/ScrollReveal';
import FadeContent from '@/components/FadeContent';
import TrueFocus from '@/components/TrueFocus';
import TiltedCard from '@/components/TiltedCard';
import CardSwap, { Card } from '@/components/CardSwap';
import CountUp from '@/components/CountUp';
import GradualBlur from '@/components/GradualBlur';
import FlowingMenu from '@/components/FlowingMenu';
import { useMediaQuery, useIsDarkTheme } from '@/lib/useMediaQuery';

interface HomeClientProps {
  banners: any[];
  categories: any[];
  featuredProducts: any[];
  testimonials: any[];
}

const fallbackCategoryMedia: Record<string, string> = {
  'photo-frames': 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/16/1.jpg',
  'custom-photo-frames': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1400',
  'acrylic-frames': 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/12/1.png',
  'canvas-prints': 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/13/1.png',
  'religious-frames': 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/18/1.png',
  'decorative-trays':
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
  'home-decor':
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/19/1.png',
  'personalized-gifts':
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/17/1.png',
  household:
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
};

const fallbackArt = 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png';

function resolveCategoryImage(slug: string): string {
  return fallbackCategoryMedia[slug] ?? fallbackArt;
}

const studioImages = [
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/18/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/11/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/19/1.png',
];

const fallbackTestimonials = [
  {
    name: 'Ananya R.',
    role: 'Delhi',
    comment: 'The walnut frame arrived perfectly sized for our living room wall. WhatsApp ordering was simple.',
  },
  {
    name: 'Vikram S.',
    role: 'Jaipur',
    comment: 'Custom dimensions, clean finish, careful packing. Exactly what we asked for.',
  },
  {
    name: 'Meera K.',
    role: 'Mumbai',
    comment: 'Our mandir frame feels intentional — proportion and wood tone matched the space.',
  },
];

const faqs = [
  {
    q: 'How does WhatsApp ordering work?',
    a: 'Pick a piece, choose options, send the order note on WhatsApp. We confirm size, finish, price, and shipping before production.',
  },
  {
    q: 'Which woods do you use?',
    a: 'Seasoned pine, teak, mango wood, and selected hardwoods by finish.',
  },
  {
    q: 'Can I request a custom size?',
    a: 'Yes — most frames and canvases are made to your dimensions after a short consult.',
  },
  {
    q: 'How are fragile pieces shipped?',
    a: 'Layered protection and reinforced packaging. Damage cases get repair or replacement.',
  },
];

export default function HomeClient({
  banners: _banners,
  categories,
  featuredProducts,
  testimonials,
}: HomeClientProps) {
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isDark = useIsDarkTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroRef = useRef<HTMLElement>(null);
  const quotes = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1.24, 1]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.4]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const accordionItems = useMemo(() => {
    const mapped = categories.map((cat) => {
      const isHousehold =
        cat.slug === 'decorative-trays' ||
        cat.slug === 'household' ||
        cat.name?.toLowerCase().includes('tray') ||
        cat.name?.toLowerCase() === 'household';

      return {
        image: resolveCategoryImage(cat.slug),
        label: isHousehold ? 'Household' : cat.name,
        link: `/shop?category=${cat.slug}`,
        alt: isHousehold ? 'Household' : cat.name,
        slug: cat.slug,
        priority: isHousehold ? 0 : cat.slug === 'canvas-prints' ? 99 : 1,
      };
    });

    // Prefer Household; drop Canvas Prints from the browse wall
    return mapped
      .filter((item) => item.slug !== 'canvas-prints')
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6)
      .map(({ image, label, link, alt }) => ({ image, label, link, alt }));
  }, [categories]);

  const flowingItems = useMemo(
    () => [
      {
        link: '/shop',
        text: 'Shop bestsellers',
        image: featuredProducts[0]?.product_images?.[0]?.image_url || 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
      },
      {
        link: '/shop?category=custom-photo-frames',
        text: 'Request custom size',
        image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png',
      },
      {
        link: 'https://wa.me/918468845759',
        text: 'Order on WhatsApp',
        image: '/whatsapp.svg',
      },
      {
        link: '/shop?category=home-decor',
        text: 'Mandir & Home Decor',
        image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/19/1.png',
      },
      {
        link: '/shop?category=religious-frames',
        text: 'Devotional pieces',
        image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/18/1.png',
      },
    ],
    [featuredProducts],
  );

  const circularItems = useMemo(() => {
    const fromProducts = featuredProducts.slice(0, 8).map((p) => ({
      image: p.product_images?.[0]?.image_url || fallbackArt,
      text: p.name,
    }));
    if (fromProducts.length >= 4) return fromProducts;
    return Object.entries(fallbackCategoryMedia).map(([slug, image]) => ({
      image,
      text: slug.replace(/-/g, ' '),
    }));
  }, [featuredProducts]);

  const featured = featuredProducts.slice(0, 6);

  return (
    <div className="bg-[#f7f7f5] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[520px] overflow-hidden bg-neutral-950 sm:min-h-[640px]">
        <motion.div
          className="absolute inset-0 origin-center will-change-transform"
          style={
            reduce
              ? undefined
              : { y: heroImgY, scale: heroImgScale, opacity: heroFade }
          }
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/background.png"
              alt=""
              className="h-full w-full object-cover object-[68%_center] sm:object-center"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_42%,rgba(0,0,0,0.25)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-28"
          style={reduce ? undefined : { y: heroTextY }}
        >
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16, letterSpacing: '0.35em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.2em' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#c4a574] sm:mb-6 sm:text-[0.72rem] sm:tracking-[0.2em]"
          >
            Handcrafted. Timeless. Yours.
          </motion.p>

          <SplitText
            text="Art in Every Frame."
            tag="h1"
            splitType="chars"
            delay={100}
            duration={0.6}
            ease="power3.out"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0}
            rootMargin="0px"
            textAlign="left"
          className="!block max-w-[11ch] font-sans text-[clamp(2.1rem,9vw,4.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white sm:max-w-[12ch]"
          />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-lg font-sans text-[0.9rem] leading-relaxed text-white/80 sm:mt-6 sm:text-base"
          >
            Luxury Photo Frames &amp; Bespoke Wall Art
            <br />
            Designed to Elevate Your Space.
          </motion.p>          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-row flex-wrap items-center gap-3 sm:mt-10"
          >
            <Link
              href="/shop"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 bg-white px-5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-950 transition hover:bg-neutral-200 sm:h-12 sm:px-7"
            >
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#collections"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 border border-white/35 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/10 sm:h-12 sm:px-7"
            >
              Explore
            </Link>
          </motion.div>
        </motion.div>

        {!reduce && (
          <GradualBlur
            target="parent"
            position="bottom"
            height="7rem"
            strength={2}
            divCount={5}
            curve="bezier"
            opacity={0.9}
            zIndex={5}
            className="pointer-events-none"
          />
        )}
      </section>

      {/* INDEX — visual accordion browse */}
      <section
        id="collections"
        className="border-b border-neutral-200 bg-[#f7f7f5] py-16 dark:border-neutral-800 dark:bg-neutral-950 sm:py-24"
      >
        <div className="mb-4 px-5 sm:px-8 lg:px-12">
          <AnimeReveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              01 — Collections
            </p>
            <h2 className="mt-3 font-sans text-3xl tracking-tight sm:text-5xl">Browse</h2>
          </AnimeReveal>
        </div>

        <FadeContent blur duration={900} className="mt-8 px-5 sm:px-8 lg:px-12">
          {accordionItems.length > 0 ? (
            <AccordionGallery
              items={accordionItems}
              defaultIndex={Math.min(1, accordionItems.length - 1)}
              height={isMobile ? 480 : 520}
              gap={isMobile ? 6 : 8}
              radius={0}
              expandRatio={isMobile ? 0.42 : 0.48}
              orientation="horizontal"
              duration={0.55}
              ease="power3.out"
              parallax={0.45}
              tilt={isMobile ? 0 : 6}
              trigger="hover"
              showLabels
              grayscale={false}
              accentColor="#ffffff"
              overlayColor="#0a0a0a"
              textColor="#ffffff"
              className="w-full"
            />
          ) : (
            <p className="text-sm text-neutral-500">No collections yet.</p>
          )}
        </FadeContent>
      </section>

      {/* MATERIALS — CurvedLoop */}
      <section className="overflow-hidden border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <CurvedLoop
          marqueeText="Custom Framing · Photo Frames · Religious Art · Mandir Decor · Decorative Trays · Acrylic Frames · Canvas Prints · Sacred Idols · Wooden Art ·"
          speed={2.4}
          curveAmount={isMobile ? 24 : 48}
          direction="left"
          interactive
          className="fill-neutral-700 dark:fill-neutral-300"
        />
      </section>

      {/* FEATURED — uniform ProductCard3D grid */}
      <section className="bg-white py-16 dark:bg-neutral-950 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <AnimeReveal className="mb-12 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                02 — Featured
              </p>
              <h2 className="mt-3 font-sans text-3xl tracking-tight sm:text-5xl">Selected pieces</h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-11 w-fit cursor-pointer items-center gap-2 border border-neutral-900 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-900"
            >
              Open shop <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </AnimeReveal>

          {featured.length === 0 ? (
            <p className="text-sm text-neutral-500">No featured products yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((prod, i) => (
                <AnimeReveal key={prod.id} delay={i * 60} y={32}>
                  <ProductCard3D
                    href={`/product/${prod.slug}`}
                    image={prod.product_images?.[0]?.image_url || fallbackArt}
                    name={prod.name}
                    price={prod.price}
                    meta={prod.dimensions}
                    badge={
                      prod.is_best_seller
                        ? 'Bestseller'
                        : prod.is_featured
                          ? 'Featured'
                          : null
                    }
                  />
                </AnimeReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="overflow-hidden bg-[#f7f7f5] py-16 dark:bg-neutral-900 sm:py-20">
        <div className="mb-8 px-5 text-center sm:px-8 lg:px-12">
          <AnimeReveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              03 — Lookbook
            </p>
            <h2 className="mt-3 font-sans text-3xl tracking-tight sm:text-4xl">Drag the orbit</h2>
          </AnimeReveal>
        </div>
        <div className="h-[300px] w-full sm:h-[420px] md:h-[520px]">
          <CircularGallery
            key={isDark ? 'lookbook-dark' : 'lookbook-light'}
            items={circularItems}
            bend={isMobile ? 1.4 : 2.4}
            textColor={isDark ? '#ffffff' : '#171717'}
            borderRadius={0.02}
            font={isMobile ? '500 16px Poppins, ui-sans-serif, system-ui, sans-serif' : '500 22px Poppins, ui-sans-serif, system-ui, sans-serif'}
            scrollSpeed={1.8}
            scrollEase={0.06}
          />
        </div>
      </section>

      {/* START PATHS — actions, not category browse */}
      <section className="bg-neutral-950">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-12">
          <AnimeReveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/40">
              04 — Start here
            </p>
            <h2 className="mt-3 font-sans text-3xl text-white sm:text-4xl">Ways into the studio</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
              Not another category wall — these are next steps: shop, custom size, WhatsApp order, or
              a project quote. Preview a path, then go.
            </p>
          </AnimeReveal>
        </div>
        <div className="h-[min(48vh,360px)] w-full border-t border-white/10 sm:h-[min(62vh,480px)]">
          <FlowingMenu
            items={flowingItems}
            speed={18}
            textColor="#fafafa"
            bgColor="#0a0a0a"
            marqueeBgColor="#fafafa"
            marqueeTextColor="#0a0a0a"
            borderColor="#262626"
          />
        </div>
      </section>

      {/* STUDIO — TiltedCard + in-room image */}
      <section className="overflow-hidden bg-white dark:bg-neutral-950">
        <div className="grid items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-24">
          <div className="relative mx-auto flex w-full max-w-lg justify-center py-4">
            <div className="relative h-[280px] w-full sm:h-[400px]">
              <div className="absolute left-0 top-6 z-[1] w-[58%] -rotate-6 sm:left-2">
                <TiltedCard
                  imageSrc={studioImages[0]}
                  altText="Studio work"
                  captionText="Workshop"
                  containerHeight={isMobile ? '200px' : '260px'}
                  containerWidth="100%"
                  imageHeight={isMobile ? '200px' : '260px'}
                  imageWidth="100%"
                  scaleOnHover={1.06}
                  rotateAmplitude={10}
                  showMobileWarning={false}
                  showTooltip={!isMobile}
                />
              </div>
              <div className="absolute right-0 top-0 z-[2] w-[62%] rotate-3 sm:right-2">
                <TiltedCard
                  imageSrc={studioImages[1]}
                  altText="Timber detail"
                  captionText="Timber"
                  containerHeight={isMobile ? '210px' : '280px'}
                  containerWidth="100%"
                  imageHeight={isMobile ? '210px' : '280px'}
                  imageWidth="100%"
                  scaleOnHover={1.06}
                  rotateAmplitude={10}
                  showMobileWarning={false}
                  showTooltip={!isMobile}
                />
              </div>
              <div className="absolute bottom-0 left-[18%] z-[3] w-[55%] -rotate-2">
                <TiltedCard
                  imageSrc={studioImages[2]}
                  altText="Finished frame"
                  captionText="Finish"
                  containerHeight={isMobile ? '170px' : '220px'}
                  containerWidth="100%"
                  imageHeight={isMobile ? '170px' : '220px'}
                  imageWidth="100%"
                  scaleOnHover={1.06}
                  rotateAmplitude={10}
                  showMobileWarning={false}
                  showTooltip={!isMobile}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              05 — Studio
            </p>
            <ScrollReveal
              baseOpacity={0.12}
              enableBlur
              baseRotation={2}
              blurStrength={5}
              containerClassName="mt-4"
              textClassName="font-sans text-3xl leading-snug tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-[2.75rem]"
            >
              Built to the wall, not the warehouse. Size, wood, and finish locked before anything
              leaves the bench.
            </ScrollReveal>
            <FadeContent delay={200} className="mt-8">
              <Link
                href="/about"
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
              >
                About the studio <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeContent>
          </div>
        </div>

        <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1800"
            alt="Framed work in a living space"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <div className="relative z-10 flex h-full items-end px-5 pb-12 sm:px-8 lg:px-12">
            <div className="max-w-md text-white">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                In the room
              </p>
              <p className="mt-3 font-sans text-2xl leading-snug sm:text-3xl">
                Frames meant to settle into your wall — not compete with it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS — TrueFocus */}
      <section className="border-y border-neutral-200 bg-[#f7f7f5] py-16 dark:border-neutral-800 dark:bg-neutral-900 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <AnimeReveal className="mb-10 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              06 — Process
            </p>
            <div className="mt-8 flex justify-center overflow-visible">
              <TrueFocus
                sentence="Choose Confirm Receive"
                manualMode={false}
                blurAmount={5}
                animationDuration={0.5}
                pauseBetweenAnimations={1.15}
              />
            </div>            <p className="mx-auto mt-8 max-w-md text-sm leading-6 text-neutral-500">
              Pick online, confirm on WhatsApp, receive made-to-order — packed for glass and acrylic.
            </p>
          </AnimeReveal>

          <div className="mt-14 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-10 dark:border-neutral-800 sm:gap-6">
            {[
              { to: 12, label: 'Years framing', suffix: '+' },
              { to: 500, label: 'Custom pieces', suffix: '+' },
              { to: 28, label: 'Cities shipped', suffix: '' },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 text-center">
                <p className="font-sans text-2xl tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  <CountUp to={stat.to} duration={2.2} className="inline" />
                  {stat.suffix}
                </p>
                <p className="mt-2 text-[0.58rem] font-semibold uppercase leading-snug tracking-[0.1em] text-neutral-400 sm:text-[0.7rem] sm:tracking-[0.14em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — CardSwap */}
      <section className="relative overflow-hidden bg-neutral-950 py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-12">
          <AnimeReveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/40">
              07 — Voices
            </p>
            <h2 className="mt-3 font-sans text-3xl sm:text-5xl">From the wall</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
              Clients on finish, packing, and WhatsApp ordering — cards cycle on their own.
            </p>
          </AnimeReveal>

          <div className="relative mx-auto h-[340px] w-full max-w-[min(100%,520px)] sm:h-[420px] lg:mx-0 lg:justify-self-end">
            <CardSwap
              width={isMobile ? 300 : 400}
              height={isMobile ? 280 : 340}
              cardDistance={isMobile ? 36 : 48}
              verticalDistance={isMobile ? 42 : 55}
              delay={4500}
              pauseOnHover
              skewAmount={isMobile ? 2 : 4}
              easing="elastic"
            >
              {quotes.slice(0, 4).map((t, i) => (
                <Card
                  key={`${t.name}-${i}`}
                  customClass="!rounded-none !border-white/15 !bg-neutral-900 flex flex-col overflow-hidden p-5 sm:p-8"
                >
                  <Quote className="h-5 w-5 text-white/35" />
                  <p className="mt-4 flex-1 font-sans text-base leading-snug text-white/90 sm:mt-5 sm:text-xl">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <p className="mt-5 text-sm text-white/45 sm:mt-6">
                    {t.name}
                    {t.role ? ` · ${t.role}` : ''}
                  </p>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f7f7f5] py-16 dark:bg-neutral-900 sm:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.38fr_0.62fr] lg:gap-16 lg:px-12">
          <AnimeReveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              08 — FAQ
            </p>
            <h2 className="mt-3 font-sans text-3xl leading-tight sm:text-5xl">
              Before you
              <br />
              order
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
              Ordering, materials, and shipping — answered briefly.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
            >
              Still unsure? Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimeReveal>

          <div className="divide-y divide-neutral-300 dark:divide-neutral-700">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div key={faq.q} className="group">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="flex w-full cursor-pointer items-start gap-5 py-6 text-left sm:gap-8"
                  >
                    <span className="mt-1 font-mono text-[0.7rem] tabular-nums text-neutral-400">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-sans text-xl leading-snug transition sm:text-2xl ${
                          open
                            ? 'text-neutral-950 dark:text-white'
                            : 'text-neutral-700 group-hover:text-neutral-950 dark:text-neutral-300 dark:group-hover:text-white'
                        }`}
                      >
                        {faq.q}
                      </span>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 text-sm leading-7 text-neutral-500">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center border transition ${
                        open
                          ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                          : 'border-neutral-300 text-neutral-500 dark:border-neutral-600'
                      }`}
                    >
                      {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
