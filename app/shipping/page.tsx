import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Truck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping Policy | Chandan Art Gallery',
  description:
    'Delivery timelines, packaging, and shipping information for custom frames and art from Chandan Art Gallery, New Delhi.',
};

const sections = [
  {
    title: 'Made to order',
    body: 'Most pieces are custom-sized or finished after confirmation. Shipping timelines begin once size, material, and payment details are confirmed on WhatsApp or by email.',
  },
  {
    title: 'Coverage',
    body: 'We ship across India. Delivery estimates and courier options are shared during order confirmation based on destination and package size.',
  },
  {
    title: 'Packaging',
    body: 'Frames and artworks are packed for transit with protective materials. Please inspect packages on arrival and report transit damage promptly with photos.',
  },
  {
    title: 'Delays',
    body: 'Courier delays, weather, or festival periods may affect delivery. We will update you if a confirmed order is delayed beyond the estimate shared at confirmation.',
  },
  {
    title: 'Returns and damage',
    body: 'See our Returns policy for damaged or incorrect items. Custom made-to-order pieces may have limited return eligibility once production has started.',
  },
];

export default function ShippingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="lux-container flex-grow pb-20 pt-28">
        <div className="max-w-2xl border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
            <Truck className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <h1 className="font-sans text-3xl text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            Shipping Policy
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            How we deliver custom framing and art across India.
          </p>
        </div>
        <div className="mt-10 max-w-2xl space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                {section.body}
              </p>
            </section>
          ))}
          <p className="text-sm text-neutral-500">
            Questions?{' '}
            <Link href="/contact" className="underline underline-offset-2">
              Contact us
            </Link>{' '}
            or see{' '}
            <Link href="/returns" className="underline underline-offset-2">
              Returns
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
