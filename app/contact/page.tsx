import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Chandan Art Gallery Delhi - Custom Photo Frame Orders & Inquiries',
  description: 'Get in touch with Chandan Art Gallery Delhi for custom photo frame orders, religious art inquiries, and handicraft questions. WhatsApp ordering available. Located in Delhi, India serving nationwide.',
  keywords: [
    'contact Chandan Art Gallery',
    'custom photo frame orders Delhi',
    'religious frames Delhi contact',
    'wooden handicrafts inquiry',
    'photo frame orders WhatsApp',
    'Delhi handicrafts contact',
    'custom framing Delhi',
    'handcrafted frames inquiry'
  ],
  openGraph: {
    title: 'Contact Chandan Art Gallery Delhi - Custom Photo Frame Orders',
    description: 'Contact us for custom photo frame orders and religious art inquiries. WhatsApp ordering available from Delhi, India.',
    images: [
      {
        url: 'https://chandanartgallery.in/og-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Chandan Art Gallery Delhi',
      },
    ],
  },
  alternates: {
    canonical: 'https://chandanartgallery.in/contact',
  },
};

export default function ContactPage() {
  // Contact page schema markup
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact Chandan Art Gallery',
    'description': 'Contact information for Chandan Art Gallery Delhi - handcrafted photo frames and religious art',
    'url': 'https://chandanartgallery.in/contact',
    'mainEntity': {
      '@type': 'LocalBusiness',
      'name': 'Chandan Art Gallery',
      'telephone': '+918468845759',
      'email': 'chandanartgallery919@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Delhi',
        'addressCountry': 'IN'
      },
      'url': 'https://chandanartgallery.in',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+918468845759',
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': ['en', 'hi']
      }
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
          'name': 'Contact',
          'item': 'https://chandanartgallery.in/contact'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      
      <Navbar />
      <main className="flex-grow">
        <ContactClient />
      </main>
      <Footer />
    </div>
  );
}