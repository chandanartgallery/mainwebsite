'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Home, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full text-center relative space-y-8">
          {/* Decorative gold vector background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-16 w-32 h-32 bg-luxury-gold/5 rounded-full blur-2xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* The Luxury Double-Framed Canvas */}
            <div className="relative mx-auto max-w-sm p-12 bg-white dark:bg-zinc-900 border-[12px] border-double border-luxury-gold shadow-2xl rounded-sm group overflow-hidden select-none">
              {/* Inner framing shadow lines */}
              <div className="absolute inset-0 border border-luxury-walnut/10 dark:border-luxury-beige/10 pointer-events-none" />
              
              {/* Classic Gold Frame Corner Details */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-luxury-gold/80" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-luxury-gold/80" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-luxury-gold/80" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-luxury-gold/80" />

              <div className="space-y-4">
                <div className="flex justify-center text-luxury-gold">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h1 className="text-6xl sm:text-7xl font-serif text-luxury-black dark:text-luxury-beige tracking-widest font-extralight select-none leading-none">
                  404
                </h1>
                <div className="w-16 h-[1px] bg-luxury-gold/60 mx-auto" />
                <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-gold-dark font-sans select-none">
                  Lost in Framing
                </h2>
              </div>
            </div>
            
            {/* Context branding text */}
            <div className="space-y-3 px-4">
              <h3 className="text-xl sm:text-2xl font-serif text-luxury-black dark:text-white uppercase tracking-wider">
                Slipped Past the Curator's Touch
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto font-sans font-light">
                Every masterpiece in our gallery is framed with meticulous handcrafting. However, the exact perspective or curation you are seeking seems to have vanished from our collection's active display.
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
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-luxury-black hover:bg-luxury-gold text-luxury-beige hover:text-luxury-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
            >
              <Compass className="w-4 h-4 mr-2" />
              Explore Shop
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-luxury-gold/50 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-black dark:text-luxury-beige text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
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
