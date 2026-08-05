'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cag-cookie-ack';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
        requestAnimationFrame(() => setMounted(true));
      }
    } catch {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setMounted(false);
    window.setTimeout(() => setVisible(false), 220);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-notice-title"
      aria-describedby="cookie-notice-desc"
      className={`fixed z-[80] bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[22rem] transition-all duration-300 ease-out ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-950/70 dark:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-neutral-200/30 dark:from-white/[0.06] dark:to-transparent"
        />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900/5 ring-1 ring-neutral-900/10 dark:bg-white/10 dark:ring-white/15">
              <Cookie className="h-4 w-4 text-neutral-700 dark:text-neutral-200" aria-hidden />
            </div>

            <div className="min-w-0 flex-1 pr-6">
              <h2
                id="cookie-notice-title"
                className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
              >
                Cookies & privacy
              </h2>
              <p
                id="cookie-notice-desc"
                className="mt-1.5 text-[0.8125rem] leading-5 text-neutral-600 dark:text-neutral-300"
              >
                We use essential cookies for sign-in, security, and preferences — nothing for ads.
              </p>
              <p className="mt-2 text-[0.75rem] text-neutral-500 dark:text-neutral-400">
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 transition hover:text-neutral-900 dark:hover:text-white"
                >
                  Cookie Policy
                </Link>
                <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">·</span>
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 transition hover:text-neutral-900 dark:hover:text-white"
                >
                  Privacy
                </Link>
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss cookie notice"
              className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-900/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="lux-button lux-button-primary mt-4 w-full"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
