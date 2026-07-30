'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Gem,
  type LucideIcon,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import SmartImage from '@/components/ui/SmartImage';
import BlurText from '@/components/ui/BlurText';

interface HomeClientProps {
  banners: any[];
  categories: any[];
  featuredProducts: any[];
  testimonials: any[];
}

const fallbackSlides = [
  {
    id: 'default-1',
    title: 'Bespoke frames for homes with memory.',
    subtitle: 'Solid timber frames, acrylic showcases, canvas editions, and devotional art finished through one-to-one curator dialogue.',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1920',
    link_url: '/shop',
  },
  {
    id: 'default-2',
    title: 'Quiet craft, made with real wood.',
    subtitle: 'Museum-grade protection, warm Indian materials, and restrained details for considered interiors.',
    image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1920',
    link_url: '/shop?category=custom-photo-frames',
  },
];

const fallbackCategoryMedia: Record<string, string> = {
  'photo-frames': 'https://images.unsplash.com/photo-1591129841117-3adfd313a6dd?q=80&w=1400',
  'custom-photo-frames': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1400',
  'acrylic-frames': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1400',
  'canvas-prints': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988f1?q=80&w=1400',
  'religious-frames': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1400',
};

const fallbackArtworkMedia = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=900';

const faqs = [
  {
    q: 'How does the WhatsApp ordering process work?',
    a: 'Choose a piece, select your preferred options, and send the curated order note to our studio. A specialist confirms dimensions, finish, pricing, and shipping before production begins.',
  },
  {
    q: 'Which woods do you use?',
    a: 'Our core collections use seasoned pine, teak, mango wood, and selected hardwood profiles depending on the finish and structural requirement.',
  },
  {
    q: 'Can I request a custom size?',
    a: 'Yes. Most frame and canvas formats can be tailored from desk portraits to large wall compositions after a quick consultation.',
  },
  {
    q: 'How are fragile pieces shipped?',
    a: 'Orders are packed with layered protection, reinforced corners, and courier-ready cartons. Damage cases are handled with repair or replacement support.',
  },
];

const pillars: Array<{ title: string; copy: string; Icon: LucideIcon }> = [
  { title: 'Real materials', copy: 'Seasoned hardwood profiles, refined finishes, and honest grain.', Icon: Trees },
  { title: 'Museum protection', copy: 'Premium acrylic, UV-conscious detailing, and careful assembly.', Icon: ShieldCheck },
  { title: 'Curator led', copy: 'No cold checkout. Every custom order is confirmed by a specialist.', Icon: MessageSquare },
];

export default function HomeClient({ banners, categories, featuredProducts, testimonials }: HomeClientProps) {
  const { addToast } = useUIStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loadedSlides, setLoadedSlides] = useState<Record<string, boolean>>({});
  const slides = banners.length > 0 ? banners : fallbackSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[100svh] overflow-hidden bg-luxury-black text-luxury-beige">
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => {
            if (index !== currentSlide) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <SmartImage
                  src={slide.image_url}
                  alt={slide.title}
                  className={`h-full w-full object-cover transition duration-700 ${loadedSlides[slide.id] ? 'opacity-78 blur-0' : 'opacity-0 blur-sm'}`}
                  containerClassName="h-full w-full"
                  priority
                  onLoaded={() => setLoadedSlides((prev) => ({ ...prev, [slide.id]: true }))}
                  fallbackLabel="Hero media unavailable"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,8,7,0.92),rgba(9,8,7,0.55)_43%,rgba(9,8,7,0.12)),linear-gradient(0deg,rgba(9,8,7,0.72),transparent_45%)]" />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!loadedSlides[slides[currentSlide]?.id] && (
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(18,15,12,0.98),rgba(30,24,19,0.94))]" aria-hidden="true" />
        )}

        <div className="lux-container relative z-10 flex min-h-[100svh] items-end pb-16 pt-36 sm:pb-20">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.95fr)_22rem] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              <div className="lux-eyebrow mb-5 flex items-center gap-2 text-luxury-gold">
                <Sparkles className="h-4 w-4" />
                Chandan Art Gallery
              </div>
              <BlurText
                key={slides[currentSlide].id}
                text={slides[currentSlide].title}
                animateBy="words"
                direction="top"
                delay={110}
                stepDuration={0.42}
                className="lux-title hero-title-readable text-luxury-beige"
              />
              <p className="mt-7 max-w-xl text-base leading-8 text-luxury-beige/76 sm:text-lg">
                {slides[currentSlide].subtitle}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={slides[currentSlide].link_url || '/shop'} className="lux-button lux-button-primary bg-luxury-beige text-luxury-black">
                  Explore collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="lux-button border border-white/20 bg-white/10 text-luxury-beige backdrop-blur hover:bg-white/15">
                  Studio consultation
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="hidden rounded-[22px] border border-white/14 bg-white/10 p-5 shadow-2xl backdrop-blur-xl lg:block"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-luxury-black/30">
                <SmartImage
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=900"
                  alt="Warm framed interior"
                  className="h-full w-full object-cover"
                  containerClassName="h-full w-full"
                  fallbackLabel="Studio visual unavailable"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-5">
                <div>
                  <p className="font-serif text-xl text-luxury-beige">Hand-finished in India</p>
                  <p className="mt-1 text-xs leading-relaxed text-luxury-beige/60">Each order is reviewed before it enters production.</p>
                </div>
                <span className="rounded-[12px] border border-luxury-gold/35 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-luxury-gold">
                  Bespoke
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-[12px] transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-luxury-gold' : 'w-2.5 bg-white/40'}`}
                aria-label={`Show slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-luxury-offwhite py-12 dark:bg-luxury-black">
        <div className="lux-container grid gap-8 border-b border-black/10 py-8 dark:border-white/10 md:grid-cols-3 md:gap-px md:divide-x md:divide-black/10 md:dark:divide-white/10">
          {pillars.map(({ title, copy, Icon }) => (
            <div key={title} className="px-1 md:px-7">
              <Icon className="mb-5 h-5 w-5 text-luxury-gold" />
              <h2 className="font-serif text-2xl text-luxury-charcoal dark:text-luxury-beige">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="lux-container">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              <p className="lux-eyebrow">Curated disciplines</p>
              <h2 className="lux-section-title mt-3">Materials, memories, and sacred spaces.</h2>
            </div>
            <p className="lux-copy max-w-xl lg:justify-self-end">
              A restrained catalog for homes that prefer warmth over spectacle: framed photographs, devotional art, acrylic depth, and canvas surfaces chosen with care.
            </p>
          </div>

          <div className="grid auto-rows-[21rem] grid-cols-1 gap-4 md:grid-cols-6">
            {categories.slice(0, 5).map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-[22px] bg-luxury-black shadow-2xl ${
                  idx === 0 ? 'md:col-span-3 md:row-span-2' : idx === 1 ? 'md:col-span-3' : 'md:col-span-2'
                }`}
              >
                <SmartImage
                  src={cat.image_url || fallbackCategoryMedia[cat.slug] || fallbackArtworkMedia}
                  fallbackSrc={fallbackCategoryMedia[cat.slug] || fallbackArtworkMedia}
                  alt={cat.name}
                  className="image-lift h-full w-full object-cover opacity-86"
                  containerClassName="h-full w-full"
                  fallbackLabel="Collection media unavailable"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/88 via-luxury-black/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-luxury-gold">Collection</span>
                  <h3 className="mt-2 font-serif text-3xl text-luxury-beige">{cat.name}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-luxury-beige/65">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-luxury-charcoal py-20 text-luxury-beige dark:bg-[#0c0a08] sm:py-28">
        <div className="lux-container">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="lux-eyebrow text-luxury-gold">Collector favorites</p>
              <h2 className="lux-section-title mt-3 text-luxury-beige">Objects with a quieter presence.</h2>
            </div>
            <Link href="/shop" className="lux-button border border-white/15 bg-white/8 text-luxury-beige hover:bg-white/12">
              View gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.length === 0 ? (
              <p className="col-span-full text-center text-sm text-luxury-beige/60">Loading custom artworks...</p>
            ) : (
              featuredProducts.map((prod) => {
                const img = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=700';
                return (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    className="group rounded-[18px] border border-white/12 bg-[#1f1b17]/82 p-3 text-luxury-beige shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-0.5 hover:border-luxury-gold/32 hover:bg-[#28231d]/88"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-black/20">
                      <SmartImage
                        src={img}
                        fallbackSrc={fallbackArtworkMedia}
                        alt={prod.name}
                        className="image-lift h-full w-full object-cover"
                        containerClassName="h-full w-full"
                        fallbackLabel="Artwork preview unavailable"
                      />
                      {prod.is_best_seller && (
                        <span className="commerce-label absolute left-4 top-4 bg-luxury-beige text-luxury-black">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <div className="px-2 py-5">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-luxury-gold">{prod.dimensions}</p>
                      <h3 className="mt-2 font-serif text-xl leading-tight text-luxury-beige">{prod.name}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-luxury-beige/74">{prod.short_description}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-sm font-extrabold">{prod.price ? `₹${prod.price.toLocaleString()}` : 'Price on request'}</span>
                        <ArrowRight className="h-4 w-4 text-luxury-gold transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="lux-container grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[24px] bg-luxury-black">
            <SmartImage
              src="https://images.unsplash.com/photo-1600210491369-e753d80a41f3?q=80&w=1400"
              alt="Premium framed interior"
              className="h-full min-h-[34rem] w-full object-cover opacity-82"
              containerClassName="h-full min-h-[34rem] w-full"
              fallbackLabel="Interior preview unavailable"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/82 via-transparent to-transparent" />
            <div className="absolute bottom-0 max-w-xl p-8 sm:p-10">
              <p className="lux-eyebrow text-luxury-gold">The studio method</p>
              <h2 className="mt-3 font-serif text-4xl leading-none text-luxury-beige sm:text-6xl">Slow decisions. Better walls.</h2>
              <p className="mt-5 text-sm leading-7 text-luxury-beige/68">
                We treat proportion, finish, photo scale, and room mood as one composition before your frame is made.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {testimonials.length > 0 && (
              <div className="commerce-module p-8">
                <div className="mb-6 flex gap-1 text-luxury-gold">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="font-serif text-3xl leading-snug text-luxury-charcoal dark:text-luxury-beige">
                  "{testimonials[0].comment}"
                </p>
                <div className="mt-7 flex items-center gap-3">
                  {testimonials[0].avatar_url && (
                    <SmartImage
                      src={testimonials[0].avatar_url}
                      alt={testimonials[0].name}
                      className="h-11 w-11 rounded-[12px] object-cover"
                      containerClassName="h-11 w-11 rounded-[12px]"
                      fallbackLabel="User"
                    />
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-luxury-charcoal dark:text-luxury-beige">{testimonials[0].name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{testimonials[0].role || 'Collector'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="commerce-module p-8">
              <Gem className="mb-5 h-6 w-6 text-luxury-gold" />
              <h3 className="font-serif text-3xl text-luxury-charcoal dark:text-luxury-beige">Designed for direct curation.</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                Product pages preserve the familiar flow, but the purchase moment stays personal through WhatsApp confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/35 py-20 dark:border-white/10 dark:bg-white/[0.035]">
        <div className="lux-container grid gap-12 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="lux-eyebrow">Questions</p>
            <h2 className="lux-section-title mt-3">Before the first consultation.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="commerce-module overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-5 p-6 text-left"
                  >
                    <span className="font-serif text-xl text-luxury-charcoal dark:text-luxury-beige">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-luxury-gold transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-black/10 px-6 py-5 text-sm leading-7 text-stone-600 dark:border-white/10 dark:text-stone-400">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-luxury-black py-20 text-luxury-beige sm:py-24">
        <div className="lux-container grid gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="lux-eyebrow text-luxury-gold">Private notes</p>
            <h2 className="mt-3 font-serif text-4xl leading-none text-luxury-beige sm:text-6xl">Join the heritage circle.</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToast('Thank you for subscribing to our journal.', 'success');
            }}
            className="flex flex-col gap-3 rounded-[12px] border border-white/12 bg-white/8 p-2 backdrop-blur sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-luxury-gold" />
              <input
                type="email"
                required
                placeholder="Email address"
                className="h-14 w-full rounded-[12px] border border-transparent bg-transparent pl-12 pr-5 text-sm text-luxury-beige outline-none placeholder:text-luxury-beige/38"
              />
            </div>
            <button type="submit" className="lux-button bg-luxury-beige text-luxury-black">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
