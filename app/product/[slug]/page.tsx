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
      opengraph_image,
      price
    `)
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | Chandan Art Gallery',
    };
  }

  const productTitle = product.seo_title || `${product.name} - Handcrafted Photo Frame | Chandan Art Gallery Delhi`;
  const productDescription = product.seo_description || 
    `${product.short_description || product.description} Premium handcrafted frame from Delhi's premier art gallery. Custom sizes available. Order on WhatsApp.`;

  return {
    title: productTitle,
    description: productDescription,
    keywords: [
      ...(product.seo_keywords || []),
      `${product.name}`,
      "handcrafted frames",
      "custom photo frames Delhi",
      "wooden frames Delhi", 
      "religious frames",
      "handmade art Delhi",
      "bespoke frames India",
      "premium photo frames"
    ],
    openGraph: {
      title: productTitle,
      description: productDescription,
      type: "website",
      url: `https://chandanartgallery.in/product/${slug}`,
      images: [
        {
          url: product.opengraph_image || `https://chandanartgallery.in/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${product.name} - Handcrafted Photo Frame | Chandan Art Gallery`,
        },
      ],
      siteName: "Chandan Art Gallery",
    },
    twitter: {
      card: "summary_large_image",
      title: productTitle,
      description: productDescription,
      images: [product.opengraph_image || `https://chandanartgallery.in/og-image.jpg`],
    },
    alternates: {
      canonical: `https://chandanartgallery.in/product/${slug}`,
    },
    other: {
      "product:price:amount": product.price?.toString() || "0",
      "product:price:currency": "INR",
      "product:availability": "in stock",
      "product:condition": "new",
      "product:retailer_item_id": slug,
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
  // Enhanced Breadcrumb JSON-LD Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `https://chandanartgallery.in/product/${product.slug}#breadcrumb`,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://chandanartgallery.in',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': 'https://chandanartgallery.in/shop',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://chandanartgallery.in/product/${product.slug}`,
      },
    ],
  };

  // Enhanced Product JSON-LD Schema
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://chandanartgallery.in/product/${product.slug}#product`,
    'name': product.name,
    'description': product.description || product.short_description,
    'image': product.product_images?.map((img: any) => img.image_url) || [],
    'sku': product.sku || product.slug,
    'mpn': product.slug,
    'brand': {
      '@type': 'Brand',
      'name': 'Chandan Art Gallery'
    },
    'manufacturer': {
      '@type': 'Organization',
      'name': 'Chandan Art Gallery',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Delhi',
        'addressRegion': 'Delhi',
        'addressCountry': 'IN'
      }
    },
    'category': 'Photo Frames',
    'material': 'Wood',
    'artMedium': 'Handcraft',
    'artform': 'Traditional Indian Handicraft',
    'offers': {
      '@type': 'Offer',
      '@id': `https://chandanartgallery.in/product/${product.slug}#offer`,
      'priceCurrency': 'INR', 
      'price': product.price || 0,
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'url': `https://chandanartgallery.in/product/${product.slug}`,
      'seller': {
        '@type': 'LocalBusiness',
        'name': 'Chandan Art Gallery',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Delhi',
          'addressRegion': 'Delhi', 
          'addressCountry': 'IN'
        }
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'India'
      },
      'deliveryLeadTime': {
        '@type': 'QuantitativeValue',
        'minValue': 7,
        'maxValue': 21,
        'unitCode': 'DAY'
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'currency': 'INR',
          'value': '0'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'IN'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'businessDays': {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          },
          'cutoffTime': '18:00',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 2,
            'maxValue': 7,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue', 
            'minValue': 3,
            'maxValue': 14,
            'unitCode': 'DAY'
          }
        }
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        '@id': 'https://chandanartgallery.in/returns#policy',
        'applicableCountry': 'IN',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 7,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/CustomerResponsible',
        'additionalProperty': {
          '@type': 'PropertyValue',
          'name': 'Custom Product Note',
          'value': 'Made-to-order products have limited return eligibility. Transit damage is covered with photo evidence.'
        }
      }
    },
    'aggregateRating': reviews && reviews.length > 0 ? {
      '@type': 'AggregateRating',
      'ratingValue': (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1),
      'reviewCount': reviews.length,
      'bestRating': 5,
      'worstRating': 1
    } : undefined,
    'review': reviews && reviews.length > 0 ? reviews.slice(0, 5).map((review: any) => ({
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': 5,
        'worstRating': 1
      },
      'author': {
        '@type': 'Person',
        'name': review.reviewer_name || 'Anonymous'
      },
      'reviewBody': review.comment,
      'datePublished': review.created_at
    })) : undefined
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
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
