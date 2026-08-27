import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, PackageCheck, Ruler, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Shopping Terms | Chandan Art Gallery Delhi',
  description: 'Review the terms and conditions for ordering handcrafted photo frames, religious art, and custom wooden frames from Chandan Art Gallery in Delhi. Clear ordering and shipping policies.',
  keywords: [
    "terms of service",
    "shopping terms", 
    "order policies",
    "custom frame terms",
    "Chandan Art Gallery policies",
    "handcrafted frame terms",
    "Delhi art gallery terms",
    "WhatsApp ordering terms"
  ],
  openGraph: {
    title: "Terms of Service - Shopping Terms | Chandan Art Gallery Delhi",
    description: "Review the terms and conditions for ordering handcrafted photo frames and custom wooden art.",
    type: "website",
    url: "https://chandanartgallery.in/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Chandan Art Gallery Delhi", 
    description: "Review our terms and conditions for ordering custom handcrafted frames.",
  },
  alternates: {
    canonical: "https://chandanartgallery.in/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const terms = [
  {
    icon: CheckCircle2,
    title: 'Order Confirmation',
    body: 'Orders are finalized through WhatsApp or direct studio communication. Product availability, dimensions, finish, and final quotation are confirmed before production begins.',
  },
  {
    icon: Truck,
    title: 'Shipping and Delivery',
    body: 'We ship across India using protective packaging. Delivery timelines depend on customization complexity, destination, and courier availability.',
  },
  {
    icon: Ruler,
    title: 'Custom Changes',
    body: 'Custom dimensions, finish changes, and layout revisions may affect price and lead time. Production starts after final approval from the customer.',
  },
  {
    icon: PackageCheck,
    title: 'Accounts and reviews',
    body: 'You must be signed in to submit product reviews. Reviews are subject to moderation. Misuse of accounts, spam, or abusive content may result in removal and account restriction.',
  },
  {
    icon: PackageCheck,
    title: 'After-Sales Support',
    body: 'Damage, defect, or adjustment requests are reviewed by our team with repair, replacement, or resolution guidance based on the order type.',
  },
];

export default function TermsPage() {
  // WebPage JSON-LD Schema
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://chandanartgallery.in/terms#webpage',
    'name': 'Terms of Service - Chandan Art Gallery Delhi',
    'description': 'Terms and conditions for ordering handcrafted photo frames and custom wooden art from Delhi\'s premier art gallery.',
    'url': 'https://chandanartgallery.in/terms',
    'inLanguage': 'en-IN',
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Chandan Art Gallery',
      'url': 'https://chandanartgallery.in'
    },
    'about': {
      '@type': 'Thing',
      'name': 'Terms of Service and Shopping Policies'
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Terms of Service JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      
      <Navbar />
      <main className="lux-container flex-grow pt-24 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Shopping terms</p>
            <h1 className="lux-section-title mt-3">Terms of Service</h1>
          </div>
          <p className="lux-copy">
            Practical terms for a premium ecommerce experience where products are often bespoke and confirmed with a curator before dispatch.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {terms.map(({ icon: Icon, title, body }) => (
            <section key={title} className="lux-card rounded-[22px] p-7">
              <Icon className="h-6 w-6 text-neutral-600" />
              <h2 className="mt-5 font-sans text-3xl text-neutral-800 dark:text-neutral-100">{title}</h2>
              <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
