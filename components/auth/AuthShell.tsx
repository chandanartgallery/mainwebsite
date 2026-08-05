'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  panelNote,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  panelNote?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[100svh] flex-col bg-[#f7f7f5] dark:bg-neutral-950 lg:flex-row">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-neutral-950 text-white lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(196,165,116,0.22),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(255,255,255,0.06),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
          }}
        />

        <Link
          href="/"
          className="relative z-10 font-sans text-[1.35rem] tracking-[-0.02em] text-white transition hover:opacity-80"
        >
          Chandan Art Gallery
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#c4a574]">
            Handcrafted. Timeless. Yours.
          </p>
          <h2 className="mt-5 font-sans text-[clamp(2rem,3.2vw,2.85rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
            Art in every frame — sized to your wall.
          </h2>
          <p className="mt-5 text-sm leading-6 text-white/55">
            {panelNote ||
              'Sign in to save wishlists, track inquiries, and continue custom framing orders on WhatsApp.'}
          </p>
        </div>

        <p className="relative z-10 text-[0.7rem] tracking-[0.04em] text-white/35">
          New Delhi · Custom wood framing
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>

          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            <p className="font-sans text-[1.05rem] tracking-[-0.02em] text-neutral-950 dark:text-white">
              Chandan Art Gallery
            </p>
            <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#a8895a]">
              Handcrafted. Timeless. Yours.
            </p>
          </div>

          <h1 className="font-sans text-[1.85rem] font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
