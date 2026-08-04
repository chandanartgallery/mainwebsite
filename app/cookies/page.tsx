import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | Chandan Art Gallery',
  description:
    'How Chandan Art Gallery uses cookies and similar technologies for authentication, preferences, and site performance.',
};

const sections = [
  {
    title: 'What we use cookies for',
    body: 'We use essential cookies to keep you signed in, remember theme preference, and protect forms with security checks (such as reCAPTCHA). These are required for the site to function.',
  },
  {
    title: 'Essential cookies',
    body: 'Authentication tokens (session cookies) let us recognize your account across pages. Theme preference may be stored locally in your browser. Without these, login, wishlist, and admin tools cannot work reliably.',
  },
  {
    title: 'Analytics and performance',
    body: 'We may record anonymized or session-level interaction events (for example, inquiry submissions) to improve the shop. We do not sell cookie data to advertisers.',
  },
  {
    title: 'Third-party services',
    body: 'Embedded services such as Google reCAPTCHA, Supabase authentication, and payment or messaging redirects may set their own cookies under their policies. Review those providers if you use those features.',
  },
  {
    title: 'Managing cookies',
    body: 'You can clear or block cookies in your browser settings. Blocking essential cookies may sign you out or break checkout consultation flows. For privacy questions, see our Privacy Policy or contact support.',
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="lux-container flex-grow pb-20 pt-28">
        <div className="max-w-2xl border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Legal
          </p>
          <h1 className="mt-3 font-serif text-3xl text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm leading-7 text-neutral-500">
            Last updated: August 2026. This page explains cookies and similar storage used on
            chandanartgallery.com.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
          <aside className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <Cookie className="h-6 w-6 text-neutral-500" />
            <p className="mt-4 text-sm leading-7 text-neutral-500">
              Related:{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white">
                Terms of Service
              </Link>
              .
            </p>
          </aside>

          <div className="space-y-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <h2 className="font-serif text-xl text-neutral-900 dark:text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-500">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
