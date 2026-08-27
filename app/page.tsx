import { getAdminClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getAdminClient();

  // Fetch Banners
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  // Fetch Featured Products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        image_url,
        is_primary
      )
    `)
    .eq('is_featured', true)
    .limit(4);

  // Fetch Testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .limit(3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Enhanced LocalBusiness schema for Delhi location
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://chandanartgallery.in/#business',
    'name': 'Chandan Art Gallery',
    'image': `${siteUrl}/og-image.jpg`,
    'description': 'Premium handcrafted wooden photo frames, religious frames, and traditional Indian handicrafts in Delhi. Custom photo frames made by skilled artisans.',
    'url': siteUrl,
    'telephone': '+918468845759',
    'email': 'chandanartgallery919@gmail.com',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Delhi',
      'addressRegion': 'Delhi',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 28.6139,
      'longitude': 77.2090
    },
    'openingHours': 'Mo-Sa 09:00-19:00',
    'priceRange': '₹₹',
    'currenciesAccepted': 'INR',
    'paymentAccepted': 'WhatsApp Order, Cash on Delivery',
    'areaServed': {
      '@type': 'City',
      'name': 'Delhi'
    },
    'serviceArea': {
      '@type': 'Country',
      'name': 'India'
    },
    'sameAs': [
      'https://wa.me/918468845759'
    ],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Handcrafted Frame Collections',
      'itemListElement': [
        {
          '@type': 'OfferCatalog',
          'name': 'Handcrafted Photo Frames',
          'description': 'Premium wooden photo frames crafted by skilled artisans'
        },
        {
          '@type': 'OfferCatalog', 
          'name': 'Religious Frames',
          'description': 'Traditional religious art frames and spiritual decor'
        },
        {
          '@type': 'OfferCatalog',
          'name': 'Custom Wooden Frames',
          'description': 'Bespoke wooden frames made to your specifications'
        }
      ]
    }
  };

  // WebSite schema for search box
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Chandan Art Gallery',
    'alternateName': 'Chandan Art Gallery Delhi',
    'url': siteUrl,
    'description': 'Handcrafted photo frames and religious art in Delhi',
    'inLanguage': 'en-IN',
    'about': {
      '@type': 'Thing',
      'name': 'Handcrafted Photo Frames'
    },
    'keywords': 'handcrafted photo frames, religious frames, wooden frames Delhi, custom photo frames, traditional handicrafts',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/shop?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
  // FAQPage JSON-LD with enhanced content
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does the "Buy on WhatsApp" process work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We craft our frames on a bespoke, custom basis to match your specific sizing and colors. When you click "Buy on WhatsApp", our system packages your choices into a neat link description. You are redirected to chat with our lead curator who will finalize the frame dimensions, print choices, and secure shipping layout before starting.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What types of wood do you source for your frames?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We strictly employ raw, premium seasoned New Zealand pine wood, authentic Rajasthani teak wood, and natural seasoned mango wood. We never use cheap composites or synthetic vinyl wraps for our primary collections. Every texture and grain is real.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I request a custom size not listed on the product page?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Absolutely. We specialize in custom gallery-wall collections. You can request any size from small desk portraits (4x6 inches) up to massive lounge canvas backdrops (60x80 inches). Simply state your dimensions during our WhatsApp consultation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do you ship fragile items (like acrylic stands & glass fronts) safely?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, we ship nationwide across India. Every order is packaged using five-ply corrugated cartons, layered bubble wrapping, and corner guards to ensure zero breakage. If any damage does occur in transit, we will replace the item free of charge.'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Enhanced JSON-LD schemas for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />
      <main className="flex-grow">
        <HomeClient 
          banners={banners || []} 
          categories={categories || []} 
          featuredProducts={products || []} 
          testimonials={testimonials || []} 
        />
      </main>
      <Footer />
    </div>
  );
}
