'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Heart, ArrowRight, Star, 
  HelpCircle, ChevronDown, MessageSquare, Mail, Play, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

interface HomeClientProps {
  banners: any[];
  categories: any[];
  featuredProducts: any[];
  testimonials: any[];
}

export default function HomeClient({ banners, categories, featuredProducts, testimonials }: HomeClientProps) {
  const { addToast } = useUIStore();
  // Banner slider index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback banner if none are returned
  const slides = banners.length > 0 ? banners : [
    {
      id: 'default-1',
      title: 'Bespoke Framing, Handcrafted Heritage',
      subtitle: 'Premium Teakwood Photo Frames & Spiritual Mandir Sculptures Built for Your Home.',
      image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1920',
      link_url: '/shop'
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the "Buy on WhatsApp" process work?',
      a: 'We craft our frames on a bespoke, custom basis to match your specific sizing and colors. When you click "Buy on WhatsApp", our system packages your choices into a neat link description. You are redirected to chat with our lead curator who will finalize the frame dimensions, print choices, and secure shipping layout before starting.'
    },
    {
      q: 'What types of wood do you source for your frames?',
      a: 'We strictly employ raw, premium seasoned New Zealand pine wood, authentic Rajasthani teak wood, and natural seasoned mango wood. We never use cheap composites or synthetic vinyl wraps for our primary collections. Every texture and grain is real.'
    },
    {
      q: 'Can I request a custom size not listed on the product page?',
      a: 'Absolutely. We specialize in custom gallery-wall collections. You can request any size from small desk portraits (4x6 inches) up to massive lounge canvas backdrops (60x80 inches). Simply state your dimensions during our WhatsApp consultation.'
    },
    {
      q: 'Do you ship fragile items (like acrylic stands & glass fronts) safely?',
      a: 'Yes, we ship nationwide across India. Every order is packaged using five-ply corrugated cartons, layered bubble wrapping, and corner guards to ensure zero breakage. If any damage does occur in transit, we will replace the item free of charge.'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative h-screen bg-luxury-black text-white overflow-hidden select-none">
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => {
            if (index !== currentSlide) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/75 to-transparent z-10" />
                <img 
                  src={slide.image_url} 
                  alt={slide.title} 
                  className="w-full h-full object-cover opacity-80"
                />

                {/* Content */}
                <div className="absolute inset-0 flex items-center z-20">
                  <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="flex items-center space-x-2 text-luxury-gold uppercase tracking-widest text-xs font-semibold"
                      >
                        <Sparkles className="w-4.5 h-4.5" />
                        <span>Ultra-Premium Indian Woodworks</span>
                      </motion.div>

                      <motion.h2
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-4xl sm:text-6xl font-serif leading-tight tracking-wide text-luxury-beige"
                      >
                        {slide.title}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="text-sm text-gray-300 leading-relaxed max-w-md font-sans"
                      >
                        {slide.subtitle}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.8 }}
                        className="pt-4"
                      >
                        <Link 
                          href={slide.link_url || '/shop'}
                          className="inline-flex items-center px-7 py-4 bg-luxury-gold hover:bg-luxury-beige text-luxury-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:shadow-luxury-gold/15"
                        >
                          Explore Collections
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? 'bg-luxury-gold w-8' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. PREMIUM BRAND PILLARS */}
      <section className="bg-white dark:bg-zinc-950 py-16 border-b border-gray-100 dark:border-zinc-900 select-none">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 border-r border-gray-50 dark:border-zinc-900 last:border-0 pr-4">
            <div className="p-3 bg-luxury-gold/10 dark:bg-luxury-gold/5 rounded-2xl text-luxury-gold flex-shrink-0">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-luxury-black dark:text-white mb-1.5 font-sans">
                True Artisan Handcrafting
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Every photo frame and CNC jali cutting is individually assembled by our traditional Rajasthani wood artisans.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 border-r border-gray-50 dark:border-zinc-900 last:border-0 pr-4">
            <div className="p-3 bg-luxury-gold/10 dark:bg-luxury-gold/5 rounded-2xl text-luxury-gold flex-shrink-0">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-luxury-black dark:text-white mb-1.5 font-sans">
                UV Anti-Glare Protection
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                We employ thick premium cast plexiglass and museum-grade acrylic sheet layer to isolate dust and prevent UV yellowing.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-luxury-gold/10 dark:bg-luxury-gold/5 rounded-2xl text-luxury-gold flex-shrink-0">
              <MessageSquare className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-luxury-black dark:text-white mb-1.5 font-sans">
                Bespoke WhatsApp Curation
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Direct contact ensures proper sizes, mock render reviews, and customizable layouts before secure logistics dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES SHOWCASE */}
      <section className="py-24 bg-luxury-offwhite dark:bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">Curated Layouts</span>
            <h3 className="text-3xl sm:text-4xl font-serif text-luxury-black dark:text-white uppercase tracking-wider mt-2.5 font-light">
              Explore Our <span className="italic font-light text-luxury-gold">Core Disciplines</span>
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 tracking-widest uppercase mt-2 max-w-lg mx-auto leading-relaxed">
              Select a bespoke framing collection to browse architectural-grade custom finishes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const sizes = ['col-span-1', 'col-span-1', 'col-span-1', 'col-span-1 sm:col-span-2 lg:col-span-1'];
              const classStr = `bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/50 rounded-none overflow-hidden group hover:shadow-xl transition-all duration-500 relative aspect-[4/3] flex flex-col justify-end ${sizes[idx % 4]}`;
              
              return (
                <Link 
                  key={cat.id} 
                  href={`/shop?category=${cat.slug}`}
                  className={classStr}
                >
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent z-10" />
                  
                  <div className="p-6 z-20 relative text-white">
                    <h4 className="font-serif text-lg text-luxury-beige uppercase tracking-wide line-clamp-1 font-light">{cat.name}</h4>
                    <p className="text-[10px] text-gray-300 mt-1 line-clamp-1 font-sans font-light tracking-wide">{cat.description}</p>
                    <span className="inline-flex items-center text-[9px] uppercase tracking-[0.25em] font-bold text-luxury-gold mt-4 group-hover:text-white transition-colors duration-300">
                      Explore Collection <ArrowRight className="w-3 h-3 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CURATED ARTISAN HIGHLIGHTS */}
      <section className="py-24 bg-white dark:bg-zinc-950 border-t border-b border-stone-200/40 dark:border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-16 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">Collector Favorites</span>
              <h3 className="text-3xl sm:text-4xl font-serif text-luxury-black dark:text-white uppercase tracking-wider mt-2.5 font-light">
                Featured <span className="italic font-light text-luxury-gold">Wood Sculptures</span>
              </h3>
            </div>
            <Link 
              href="/shop" 
              className="inline-flex items-center text-xs font-bold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-[0.2em] group border-b border-luxury-gold/30 pb-1"
            >
              View Full Gallery <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 duration-200" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length === 0 ? (
              <p className="text-xs text-gray-400 italic col-span-4 text-center">Loading custom artworks...</p>
            ) : (
              featuredProducts.map((prod) => {
                const img = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400';
                
                return (
                  <div 
                    key={prod.id} 
                    className="bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800/80 rounded-none overflow-hidden group hover:shadow-lg transition-all duration-500 flex flex-col h-full relative"
                  >
                    {prod.is_best_seller && (
                      <span className="absolute top-3 left-3 z-10 bg-luxury-gold text-zinc-950 text-[8px] font-bold px-2.5 py-1 rounded-none uppercase tracking-widest font-sans">
                        Bestseller
                      </span>
                    )}

                    <Link href={`/product/${prod.slug}`} className="block aspect-[4/5] bg-gray-50 overflow-hidden relative">
                      <img 
                        src={img} 
                        alt={prod.name} 
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </Link>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 dark:text-zinc-500 block uppercase tracking-widest font-semibold font-sans">{prod.dimensions}</span>
                        <Link href={`/product/${prod.slug}`} className="block mt-1.5">
                          <h4 className="font-serif text-sm font-medium text-luxury-black dark:text-white group-hover:text-luxury-gold duration-200 transition-colors line-clamp-1">
                            {prod.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-sans font-light">
                          {prod.short_description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-100 dark:border-zinc-800/80 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest block font-sans">Est. Price</span>
                          <span className="font-bold text-luxury-black dark:text-luxury-beige text-xs font-sans">
                            ₹{prod.price ? prod.price.toLocaleString() : 'Price on request'}
                          </span>
                        </div>
                        <Link 
                          href={`/product/${prod.slug}`}
                          className="text-[9px] font-bold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-widest font-sans border-b border-transparent hover:border-luxury-gold duration-300 pb-0.5"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL CAROUSEL */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-luxury-offwhite dark:bg-luxury-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold">Collector Reviews</span>
            <h3 className="text-3xl font-serif text-luxury-black dark:text-white uppercase tracking-wide mt-1.5 mb-12">
              Endorsed by Connoisseurs
            </h3>

            <div className="space-y-6">
              <div className="flex justify-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg sm:text-xl font-serif text-luxury-charcoal dark:text-luxury-beige italic leading-relaxed">
                "{testimonials[0].comment}"
              </p>
              <div className="flex items-center justify-center space-x-3 mt-8">
                {testimonials[0].avatar_url && (
                  <img 
                    src={testimonials[0].avatar_url} 
                    alt={testimonials[0].name} 
                    className="w-10 h-10 rounded-full object-cover border border-luxury-gold/30"
                  />
                )}
                <div className="text-left">
                  <h4 className="text-xs font-bold text-luxury-black dark:text-white uppercase font-sans tracking-wide">{testimonials[0].name}</h4>
                  <p className="text-[10px] text-gray-400 font-sans">{testimonials[0].role || 'Art Enthusiast'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="py-24 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1" /> Help & Support
            </span>
            <h3 className="text-3xl font-serif text-luxury-black dark:text-white uppercase tracking-wide mt-1.5">
              Frequently Queried Items
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              
              return (
                <div 
                  key={idx} 
                  className="border border-gray-100 dark:border-zinc-800/80 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-5 bg-gray-50/20 hover:bg-gray-50/50 dark:bg-transparent dark:hover:bg-zinc-900/40 text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-luxury-charcoal dark:text-white uppercase tracking-wide">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-luxury-gold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 border-t border-gray-50 dark:border-zinc-800 text-xs text-gray-500 leading-relaxed font-sans bg-white dark:bg-zinc-950">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. LUXURY NEWSLETTER */}
      <section className="relative py-24 bg-luxury-black overflow-hidden text-white">
<div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-luxury-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-luxury-walnut/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 relative">
          <div className="inline-flex p-3 bg-luxury-gold/15 border border-luxury-gold/20 text-luxury-gold rounded-full mb-6">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-serif text-luxury-beige uppercase tracking-wide mb-3">Join the Heritage Circle</h3>
          <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto mb-8 font-light">
            Receive exclusive early collection previews, architectural styling insights, and special festive invitations.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); addToast('Thank you for subscribing to our premium newsletter!', 'success'); }} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 px-4.5 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/65 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-luxury-gold font-sans"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-luxury-gold hover:bg-luxury-beige text-luxury-black text-xs font-bold rounded-xl uppercase tracking-widest transition-colors font-sans cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
