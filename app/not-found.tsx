'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Home, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full text-center relative space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* The Luxury Double-Framed Canvas */}
            <div className="lux-card relative mx-auto max-w-sm p-12 border-[12px] border-double border-neutral-300 shadow-2xl rounded-[18px] group overflow-hidden select-none">
              {/* Inner framing shadow lines */}
              <div className="absolute inset-0 border border-neutral-300/20 dark:border-neutral-100/10 pointer-events-none" />
              
              {/* Classic Gold Frame Corner Details */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-neutral-300/80" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-neutral-300/80" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-neutral-300/80" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-neutral-300/80" />

              <div className="space-y-4">
                <div className="flex justify-center text-neutral-600">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h1 className="text-6xl sm:text-7xl font-serif text-neutral-900 dark:text-neutral-100 tracking-widest font-extralight select-none leading-none">
                  404
                </h1>
                <div className="w-16 h-[1px] bg-neutral-900/60 mx-auto" />
                <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-neutral-700 font-sans select-none">
                  Lost in Framing
                </h2>
              </div>
            </div>
            
            {/* Context branding text */}
            <div className="space-y-3 px-4">
              <h3 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-white">
                Slipped Past the Curator's Touch
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-400 leading-relaxed max-w-md mx-auto font-sans">
                This page is not available, but the gallery, shop, and consultation paths are still ready.
              </p>
            </div>
          </motion.div>

          {/* Elegant Luxury Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-6"
          >
            <Link
              href="/shop"
              className="lux-button lux-button-primary"
            >
              <Compass className="w-4 h-4 mr-2" />
              Explore Shop
            </Link>
            <Link
              href="/"
              className="lux-button lux-button-secondary"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
