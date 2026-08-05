'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-5 text-center text-neutral-900">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm text-neutral-500">
          A critical error occurred. Please refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
        {error?.digest ? (
          <p className="mt-4 text-[10px] text-neutral-400">Ref: {error.digest}</p>
        ) : null}
      </body>
    </html>
  );
}
