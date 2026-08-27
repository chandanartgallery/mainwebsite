import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Truck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Policy - Safe Delivery Across India | Chandan Art Gallery Delhi',
  description: 'Learn about shipping timelines, packaging, and delivery options for handcrafted photo frames and wooden art from Delhi. Safe nationwide delivery with protective packaging for custom frames.',
  keywords: [
    "shipping policy",
    "frame delivery India",
    "custom frame shipping", 
    "protective packaging",
    "Delhi art gallery shipping",
    "handcrafted frame delivery",
    "nationwide shipping India",
    "safe art delivery"
  ],
  openGraph: {
    title: "Shipping Policy - Safe Delivery | Chandan Art Gallery Delhi",
    description: "Safe nationwide delivery of handcrafted photo frames and wooden art with protective packaging.",
    type: "website", 
    url: "https://chandanartgallery.in/shipping",
  },
  twitter: {
    card: "summary",
    title: "Shipping Policy | Chandan Art Gallery Delhi",
    description: "Safe nationwide delivery of custom frames with protective packaging.",
  },
  alternates: {
    canonical: "https://chandanartgallery.in/shipping",
  },
  robots: {
    index: true,
    follow: true,
  },
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
  // WebPage JSON-LD Schema  
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://chandanartgallery.in/shipping#webpage',
    'name': 'Shipping Policy - Chandan Art Gallery Delhi',
    'description': 'Safe nationwide delivery of handcrafted photo frames and wooden art with protective packaging and reliable shipping.',
    'url': 'https://chandanartgallery.in/shipping',
    'inLanguage': 'en-IN',
    'isPartOf': {
      '@type': 'WebSite', 
      'name': 'Chandan Art Gallery',
      'url': 'https://chandanartgallery.in'
    },
    'about': {
      '@type': 'Thing',
      'name': 'Shipping Policy and Delivery Information'
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Shipping Policy JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      
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
