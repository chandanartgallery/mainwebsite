'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, Heart, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';

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

  const columns = [
    {
      title: 'Collections',
      links: [
        ['Photo Frames', '/shop?category=photo-frames'],
        ['Custom Photo Frames', '/shop?category=custom-photo-frames'],
        ['Acrylic Frames', '/shop?category=acrylic-frames'],
        ['Canvas Prints', '/shop?category=canvas-prints'],
        ['Religious Frames', '/shop?category=religious-frames'],
        ['Home Decor', '/shop?category=home-decor'],
      ],
    },
    {
      title: 'Gallery',
      links: [
        ['Home Store', '/'],
        ['Journal', '/blog'],
        ['Our Heritage', '/about'],
        ['Get in Touch', '/contact'],
        ['FAQ', '/faq'],
      ],
    },
    {
      title: 'Care',
      links: [
        ['Privacy Policy', '/privacy'],
        ['Terms of Service', '/terms'],
        ['Returns & Customizations', '/returns'],
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-luxury-black text-luxury-beige">
      <div className="lux-container py-16 sm:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_1.25fr_0.95fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-luxury-beige text-[0.72rem] font-black tracking-[0.18em] text-luxury-black">
                CAG
              </span>
              <span>
                <span className="block font-serif text-2xl">Chandan Art Gallery</span>
                <span className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-luxury-gold">New Delhi studio</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-luxury-beige/62">
              Bespoke wood framing, devotional art, acrylic depth pieces, and canvas editions for homes that value restraint, memory, and material honesty.
            </p>
            <div className="mt-7 flex gap-2">
              <a href="https://instagram.com" className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 transition hover:border-luxury-gold/40 hover:text-luxury-gold" title="Instagram">
                <Camera className="h-4 w-4" />
              </a>
              <a href="https://wa.me/918468845759" className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 transition hover:border-luxury-gold/40 hover:text-luxury-gold" title="WhatsApp">
                <MessageSquare className="h-4 w-4" />
              </a>
              <a href="mailto:support@chandanartgallery.com" className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 transition hover:border-luxury-gold/40 hover:text-luxury-gold" title="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[0.66rem] font-black uppercase tracking-[0.22em] text-luxury-gold">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map(([name, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-luxury-beige/62 transition hover:text-luxury-beige">
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur">
            <h3 className="font-serif text-3xl">Private journal</h3>
            <p className="mt-3 text-sm leading-7 text-luxury-beige/62">
              Styling notes, heritage stories, and first previews of limited studio releases.
            </p>
            {subscribed ? (
              <div className="mt-6 rounded-[18px] border border-luxury-gold/30 bg-luxury-gold/10 p-4 text-sm text-luxury-gold">
                Thank you for subscribing to our journal.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-6 flex rounded-[12px] border border-white/12 bg-black/20 p-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="min-w-0 flex-1 rounded-[12px] bg-transparent px-4 text-sm text-luxury-beige outline-none placeholder:text-luxury-beige/36"
                />
                <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-luxury-beige text-luxury-black transition hover:bg-luxury-gold">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-6 pt-8 text-xs text-luxury-beige/55 md:grid-cols-3 md:items-center">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-luxury-gold" />
            <span>+91 8468845759</span>
          </div>
          <div className="flex items-center gap-2 md:justify-center">
            <MapPin className="h-3.5 w-3.5 text-luxury-gold" />
            <span>New Delhi, India</span>
          </div>
          <div className="flex items-center gap-1 md:justify-end">
            <span>© {new Date().getFullYear()} Chandan Art Gallery. Made with</span>
            <Heart className="h-3 w-3 fill-luxury-gold text-luxury-gold" />
          </div>
        </div>
      </div>
    </footer>
  );
}
