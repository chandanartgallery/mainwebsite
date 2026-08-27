// @ts-nocheck
import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabase/server';
import ShopClient from './ShopClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const revalidate = 300; // 5 minutes ISR

export const metadata: Metadata = {
  title: "Handcrafted Photo Frames & Religious Art Collection | Chandan Art Gallery Delhi",
  description: "Browse our premium collection of handcrafted wooden photo frames, religious frames, decorative trays, and custom frames in Delhi. Traditional Indian handicrafts made by skilled artisans with WhatsApp ordering.",
  keywords: [
    "handcrafted photo frames Delhi",
    "religious photo frames",
    "wooden photo frames",
    "custom photo frames Delhi", 
    "handmade wooden art",
    "traditional Indian handicrafts",
    "decorative frames",
    "photo frames in Delhi",
    "wooden handicrafts",
    "custom wooden frames",
    "religious frames Delhi",
    "artisan crafted frames"
  ],
  openGraph: {
    title: "Handcrafted Photo Frames Collection | Chandan Art Gallery Delhi",
    description: "Premium handcrafted wooden photo frames and religious art in Delhi. Browse our collection of custom frames made by skilled artisans.",
    images: [
      {
        url: "https://chandanartgallery.in/og-shop.jpg",
        width: 1200,
        height: 630,
        alt: "Chandan Art Gallery Photo Frames Collection",
      },
    ],
  },
  alternates: {
    canonical: "https://chandanartgallery.in/shop",
  },
};

export default async function ShopPage() {
  let products = [];
  let categories = [];

  try {
    const supabase = getAdminClient();
    
    // Set a timeout for the entire operation
    const fetchWithTimeout = async (promise, timeoutMs = 5000) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      );
      return Promise.race([promise, timeoutPromise]);
    };

    console.log('Shop: Starting data fetch with timeout...');
    
    // Fetch categories first (faster, smaller query)
    const categoriesResult = await fetchWithTimeout(
      supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true })
    );

    if (categoriesResult.error) {
      console.error('Categories error:', categoriesResult.error);
    } else {
      categories = categoriesResult.data || [];
      console.log(`Fetched ${categories.length} categories`);
    }

    // Fetch products with a simpler query first
    const productsResult = await fetchWithTimeout(
      supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          short_description,
          dimensions,
          material,
          color,
          is_customizable,
          is_featured,
          is_trending,
          is_best_seller,
          category_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(30) // Further reduce limit
    );

    if (productsResult.error) {
      console.error('Products error:', productsResult.error);
      products = []; // Continue with empty products rather than failing
    } else {
      console.log(`Fetched ${productsResult.data?.length || 0} products`);
      
      // Fetch images for the products we got
      const productIds = (productsResult.data || []).map(p => p.id);
      let imagesResult = { data: [] };
      
      if (productIds.length > 0) {
        try {
          imagesResult = await fetchWithTimeout(
            supabase
              .from('product_images')
              .select('product_id, image_url, is_primary, display_order')
              .in('product_id', productIds)
              .order('is_primary', { ascending: false })
              .order('display_order', { ascending: true })
          );
          
          if (imagesResult.error) {
            console.error('Images error:', imagesResult.error);
            imagesResult = { data: [] };
          }
        } catch (err) {
          console.error('Images timeout:', err);
          imagesResult = { data: [] };
        }
      }

      // Merge images with products
      products = (productsResult.data || []).map(product => ({
        ...product,
        product_images: (imagesResult.data || []).filter(img => img.product_id === product.id)
      }));
    }

    console.log(`Shop: Completed data fetch - ${products.length} products, ${categories.length} categories`);

  } catch (error) {
    console.error('Shop page critical error:', error);
    // Don't throw - render with empty data instead
    products = [];
    categories = [];
  }

  // Schema markup for the shop page
  const shopSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Handcrafted Photo Frames Collection',
    'description': 'Premium collection of handcrafted wooden photo frames, religious frames, and decorative art pieces from Chandan Art Gallery Delhi',
    'url': 'https://chandanartgallery.in/shop',
    'mainEntity': {
      '@type': 'ItemList',
      'name': 'Photo Frames Collection',
      'description': 'Handcrafted photo frames and religious art',
      'numberOfItems': products.length,
      'itemListElement': products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': product.name,
          'url': `https://chandanartgallery.in/product/${product.slug}`,
          'description': product.short_description,
          'image': product.product_images?.[0]?.image_url,
          'offers': {
            '@type': 'Offer',
            'priceCurrency': 'INR',
            'price': product.price || 0,
            'availability': 'https://schema.org/InStock'
          }
        }
      }))
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
          'name': 'Shop',
          'item': 'https://chandanartgallery.in/shop'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />
      
      <Navbar />
      <main className="flex-grow">
        <ShopClient
          initialProducts={products}
          initialCategories={categories}
        />
      </main>
      <Footer />
    </div>
  );
}