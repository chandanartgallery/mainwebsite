import { getAdminClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const revalidate = 3600; // revalidate every hour

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
    .order('created_at', { ascending: true });

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

  // Organization JSON-LD
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Chandan Art Gallery',
    'url': siteUrl,
    'logo': `${siteUrl}/favicon.ico`,
    'sameAs': [
      'https://instagram.com',
      'https://facebook.com'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+918468845759',
      'contactType': 'customer support',
      'areaServed': 'IN',
      'availableLanguage': ['en', 'hi']
    }
  };

  // FAQPage JSON-LD
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
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      {/* Insert JSON-LD schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
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
