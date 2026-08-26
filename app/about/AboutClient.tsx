'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SplitText from '@/components/SplitText';
import ScrollReveal from '@/components/ScrollReveal';
import FadeContent from '@/components/FadeContent';
import CountUp from '@/components/CountUp';
import CircularGallery from '@/components/CircularGallery';
import Stack from '@/components/Stack';
import PixelTransition from '@/components/PixelTransition';
import GlareHover from '@/components/GlareHover';
import { useIsDarkTheme } from '@/lib/useMediaQuery';

const galleryItems = [
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png',
    text: 'Workshop',
  },
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
    text: 'Interiors',
  },
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/11/1.png',
    text: 'Timber',
  },
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/13/1.png',
    text: 'Canvas',
  },
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/18/1.png',
    text: 'Devotion',
  },
  {
    image: 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/16/1.jpg',
    text: 'Frames',
  },
];

const stackCards = [
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/18/1.png',
].map((src, i) => (
  <img
    key={i}
    src={src}
    alt=""
    className="pointer-events-none h-full w-full object-cover rounded-xl"
    draggable={false}
  />
));

export default function AboutClient() {
  const isDark = useIsDarkTheme();

  return (
    <div className="bg-[#f7f7f5] dark:bg-neutral-950">
      <section className="mx-auto max-w-[1400px] px-5 pb-10 pt-28 sm:px-8 lg:px-12">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Chandan Art Gallery · New Delhi
        </p>
        <SplitText
          text="A framing studio built around proportion."
          tag="h1"
          splitType="words"
          delay={70}
          duration={0.85}
          ease="power3.out"
          from={{ opacity: 0, y: 36 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.05}
          textAlign="left"
          className="mt-5 max-w-4xl !block font-sans text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-neutral-900 dark:text-white"
        />
        <FadeContent delay={150} className="mt-6 max-w-xl">
          <p className="text-base leading-7 text-neutral-500 dark:text-neutral-400">
            Custom wood frames, acrylic, canvas, and religious art — confirmed on WhatsApp before
            anything leaves the bench.
          </p>
        </FadeContent>
      </section>

      <section className="h-[380px] w-full sm:h-[460px]">
        <CircularGallery
          key={isDark ? 'gallery-dark' : 'gallery-light'}
          items={galleryItems}
          bend={2.2}
          textColor={isDark ? '#ffffff' : '#171717'}
          borderRadius={0.02}
          font="500 20px Poppins, ui-sans-serif, system-ui, sans-serif"
          scrollSpeed={1.6}
        />
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-24">
        <div className="relative mx-auto h-[360px] w-[270px] sm:h-[420px] sm:w-[310px]">
          <Stack
            cards={stackCards}
            randomRotation
            sendToBackOnClick
            autoplay
            autoplayDelay={3200}
            pauseOnHover
          />
        </div>
        <div>
          <ScrollReveal
            baseOpacity={0.15}
            enableBlur
            baseRotation={2}
            blurStrength={4}
            textClassName="font-sans text-3xl leading-snug text-neutral-900 dark:text-white sm:text-4xl"
          >
            From desk portraits to wall-scale compositions, every piece is sized to your space — not
            a warehouse default.
          </ScrollReveal>
          <FadeContent className="mt-8 space-y-4 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
            <p>
              Materials include seasoned pine, teak, mango wood, and selected hardwoods. Finishes
              are confirmed with you before production starts.
            </p>
            <p>
              Browse online, then lock size, wood, price, and shipping on WhatsApp. We ship across
              India with protective packaging for glass and acrylic.
            </p>
          </FadeContent>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white py-14 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-[1400px] grid-cols-3 gap-3 px-5 sm:gap-6 sm:px-8 lg:px-12">
          {[
            { to: 12, label: 'Years', suffix: '+' },
            { to: 500, label: 'Custom frames', suffix: '+' },
            { to: 5, label: 'Collections', suffix: '' },
          ].map((s) => (
            <div key={s.label} className="min-w-0 text-center">
              <p className="font-sans text-2xl text-neutral-900 dark:text-white sm:text-5xl">
                <CountUp to={s.to} duration={2} className="inline" />
                {s.suffix}
              </p>
              <p className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:text-[0.65rem] sm:tracking-[0.16em]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:px-12 lg:py-20">
        <GlareHover
          width="100%"
          height="100%"
          background="transparent"
          borderRadius="0"
          borderColor="transparent"
          glareOpacity={0.35}
          glareSize={280}
          className="!border-0"
          style={{ minHeight: 280 }}
        >
          <PixelTransition
            firstContent={
              <img
                src="https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/10/1.png"
                alt="Frame detail"
                className="h-full w-full object-cover"
              />
            }
            secondContent={
              <div className="flex h-full w-full items-center justify-center bg-neutral-950 p-8 text-center">
                <p className="font-sans text-2xl text-white">What we make</p>
              </div>
            }
            gridSize={8}
            pixelColor="#0a0a0a"
            animationStepDuration={0.35}
            aspectRatio="75%"
            className="w-full"
          />
        </GlareHover>

        <FadeContent className="flex flex-col justify-center space-y-4 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          <h3 className="font-sans text-2xl text-neutral-900 dark:text-white">How ordering works</h3>
          <p>
            Pick a piece in the shop, choose options, and send the order note on WhatsApp. A
            specialist reviews size, finish, and shipping before production.
          </p>
          <Link
            href="/shop"
            className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
          >
            Browse the shop <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-neutral-500 underline-offset-4 hover:underline"
          >
            Contact the studio <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeContent>
      </section>
    </div>
  );
}
