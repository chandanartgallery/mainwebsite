import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Chandan Art Gallery - Premium Handcrafted Photo Frames Delhi',
  description: 'Learn about Chandan Art Gallery Delhi - your trusted source for premium handcrafted wooden photo frames, religious art, and custom frames since years. Skilled artisans creating traditional Indian handicrafts with modern craftsmanship.',
  keywords: [
    'Chandan Art Gallery Delhi',
    'handcrafted photo frames Delhi',
    'custom frame makers Delhi',
    'religious frames artisans',
    'wooden handicrafts Delhi',
    'traditional Indian art',
    'custom framing studio Delhi',
    'photo frame craftsmen'
  ],
  openGraph: {
    title: 'About Chandan Art Gallery - Premium Handcrafted Photo Frames Delhi',
    description: 'Premium handcrafted wooden photo frames and religious art in Delhi. Skilled artisans creating custom frames with traditional techniques.',
    images: [
      {
        url: 'https://chandanartgallery.in/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Chandan Art Gallery Delhi',
      },
    ],
  },
  alternates: {
    canonical: 'https://chandanartgallery.in/about',
  },
};

export default function AboutPage() {
  // About page schema markup
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About Chandan Art Gallery',
    'description': 'Learn about our handcrafted photo frames and religious art business in Delhi',
    'url': 'https://chandanartgallery.in/about',
    'mainEntity': {
      '@type': 'LocalBusiness',
      'name': 'Chandan Art Gallery',
      'description': 'Premium handcrafted wooden photo frames, religious frames, and traditional Indian handicrafts in Delhi',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Delhi',
        'addressCountry': 'IN'
      },
      'telephone': '+918468845759',
      'url': 'https://chandanartgallery.in'
    },
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://chandanartgallery.in'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'About',
          'item': 'https://chandanartgallery.in/about'
        }
      ]
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5] dark:bg-neutral-950">
      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      
      <Navbar />
      <main className="flex-grow">
        <AboutClient />
      </main>
      <Footer />
    </div>
  );
}
