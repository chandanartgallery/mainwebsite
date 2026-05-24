'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, ArrowRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categories = [
    { name: 'Photo Frames', href: '/shop?category=photo-frames' },
    { name: 'Custom Photo Frames', href: '/shop?category=custom-photo-frames' },
    { name: 'Acrylic Frames', href: '/shop?category=acrylic-frames' },
    { name: 'Canvas Prints', href: '/shop?category=canvas-prints' },
    { name: 'Religious Frames', href: '/shop?category=religious-frames' },
    { name: 'Home Decor', href: '/shop?category=home-decor' },
  ];

  const quickLinks = [
    { name: 'Home Store', href: '/' },
    { name: 'Journal', href: '/blog' },
    { name: 'Our Heritage', href: '/about' },
    { name: 'Get in Touch', href: '/contact' },
  ];

  const policyLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Returns & Customizations', href: '/returns' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <footer className="bg-zinc-950 text-gray-400 border-t border-zinc-900 pt-16 pb-12 w-full mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl text-white tracking-wide">Chandan Art Gallery</h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              For three generations, Chandan Art Gallery has preserved traditional Indian craftsmanship through bespoke premium framing, heritage wood carvings, and fine home decor. Evolving from a local luxury supplier to a global curated experience.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://instagram.com" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-luxury-gold hover:text-zinc-950 duration-200" title="Instagram">
                <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://facebook.com" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-luxury-gold hover:text-zinc-950 duration-200" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="https://twitter.com" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-luxury-gold hover:text-zinc-950 duration-200" title="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href} className="hover:text-luxury-gold transition-colors duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-luxury-gold transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-luxury-gold transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm text-white uppercase tracking-wider">The Journal Subscription</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subscribe to receive styling advice, heritage stories, and priority access to limited edition launches.
            </p>
            {subscribed ? (
              <div className="bg-zinc-900 border border-luxury-gold/30 rounded-lg p-3 text-xs text-luxury-gold font-medium">
                Thank you for subscribing to our journal!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-luxury-gold"
                />
                <button type="submit" className="absolute right-1 top-1 bg-luxury-gold hover:bg-luxury-gold-dark duration-200 text-zinc-950 p-1.5 rounded-md cursor-pointer">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <div className="flex items-center space-x-2 text-xs text-zinc-400 pt-2 border-t border-zinc-900">
              <Phone className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Support: +91 8468845759</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1">
            <span>© {new Date().getFullYear()} Chandan Art Gallery. All rights reserved. Made with</span>
            <Heart className="w-3 h-3 text-luxury-gold fill-luxury-gold inline mx-0.5" />
            <span>in New Delhi, India.</span>
          </div>

          {/* Boutique Inquiry */}
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="tracking-widest text-[9px] uppercase font-semibold text-zinc-400">Boutique Art Ordering</span>
            <div className="flex space-x-1.5 font-bold tracking-widest text-[10px] uppercase bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
              <span className="text-luxury-gold flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp Direct
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
