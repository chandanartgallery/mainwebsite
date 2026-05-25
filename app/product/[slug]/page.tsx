import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabase/server';
import ProductClient from './ProductClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO Metadata dynamically
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getAdminClient();
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      name,
      description,
      short_description,
      seo_title,
      seo_description,
      seo_keywords,
      opengraph_image
    `)
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | Chandan Art Gallery',
    };
  }

  return {
    title: product.seo_title || `${product.name} | Chandan Art Gallery`,
    description: product.seo_description || product.short_description,
    keywords: product.seo_keywords || [],
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.short_description,
      images: [
        {
          url: product.opengraph_image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = getAdminClient();

  // Fetch product details
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      subcategory:subcategories(name, slug),
      product_images(*)
    `)
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch approved reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  // Fetch approved comments
  const { data: comments } = await supabase
    .from('product_comments')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  // JSON-LD Schemas
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category?.name || 'Category',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shop?category=${product.category?.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.slug}`,
      },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.product_images?.map((img: any) => img.image_url) || [],
    description: product.description || product.short_description,
    sku: product.sku || '',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price || 0,
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.slug}`,
    },
  };

  return (
    <div className="commerce-page min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      {/* Insert JSON-LD schemas inside the head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Navbar />

      <main className="flex-grow">
        <ProductClient 
          product={product} 
          initialReviews={reviews || []} 
          initialComments={comments || []}
        />
      </main>

      <Footer />
    </div>
  );
}
