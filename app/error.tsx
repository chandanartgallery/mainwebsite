'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        Something went wrong
      </p>
      <h1 className="mt-3 font-sans text-2xl text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-500">
        Please try again. If the problem continues, return home or contact us on WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="lux-button lux-button-primary"
        >
          Try again
        </button>
        <Link href="/" className="lux-button lux-button-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
