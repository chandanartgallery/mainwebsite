'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';

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
      title: 'Shop',
      links: [
        ['Photo Frames', '/shop?category=photo-frames'],
        ['Custom Frames', '/shop?category=custom-photo-frames'],
        ['Acrylic Frames', '/shop?category=acrylic-frames'],
        ['Canvas Prints', '/shop?category=canvas-prints'],
        ['Religious Frames', '/shop?category=religious-frames'],
      ],
    },
    {
      title: 'Company',
      links: [
        ['Home', '/'],
        ['Journal', '/blog'],
        ['About', '/about'],
        ['Contact', '/contact'],
        ['FAQ', '/faq'],
      ],
    },
    {
      title: 'Policies',
      links: [
        ['Privacy', '/privacy'],
        ['Terms', '/terms'],
        ['Cookies', '/cookies'],
        ['Returns', '/returns'],
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
      <div className="lux-container py-12 sm:py-14">
        <div className="grid gap-10 border-b border-neutral-200 pb-10 dark:border-neutral-800 lg:grid-cols-[1.2fr_1.5fr_1fr]">
          <div>
            <Link href="/" className="brand-logotype text-xl text-neutral-900 dark:text-neutral-50">
              Chandan Art Gallery
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-500">
              Custom wood framing, canvas prints, and religious art. New Delhi, India.
            </p>
            <div className="mt-5 flex gap-3 text-neutral-500">
              <a href="https://wa.me/918468845759" className="hover:text-neutral-900 dark:hover:text-white" title="WhatsApp">
                <MessageSquare className="h-4 w-4" />
              </a>
              <a href="mailto:support@chandanartgallery.com" className="hover:text-neutral-900 dark:hover:text-white" title="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {column.links.map(([name, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white">
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Newsletter
            </h3>
            <p className="mt-3 text-sm text-neutral-500">Occasional updates on new products.</p>
            {subscribed ? (
              <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">You&apos;re subscribed. Thank you.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +91 8468845759
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> New Delhi, India
            </span>
          </div>
          <span>© {new Date().getFullYear()} Chandan Art Gallery</span>
        </div>
      </div>
    </footer>
  );
}
