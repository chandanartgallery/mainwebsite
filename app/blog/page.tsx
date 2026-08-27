import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogIndexClient from './BlogIndexClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Art & Framing Blog | Chandan Art Gallery Delhi",
  description: "Discover handcrafted photo frame styles, wooden art techniques, religious frame designs, and custom framing tips from Delhi's premier art gallery. Expert insights on traditional Indian handicrafts.",
  keywords: [
    "photo frame blog",
    "wooden art techniques",
    "religious frame designs", 
    "custom framing tips",
    "handcrafted frames Delhi",
    "traditional Indian art",
    "frame making process",
    "wooden handicrafts guide",
    "art gallery insights",
    "photo frame styles"
  ],
  openGraph: {
    title: "Art & Framing Blog | Chandan Art Gallery Delhi", 
    description: "Expert insights on handcrafted photo frames, wooden art, and traditional Indian handicrafts from Delhi's premier art gallery.",
    type: "website",
    url: "https://chandanartgallery.in/blog",
    images: [
      {
        url: "https://chandanartgallery.in/og-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Chandan Art Gallery Blog - Art & Framing Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Art & Framing Blog | Chandan Art Gallery Delhi",
    description: "Expert insights on handcrafted photo frames and traditional Indian handicrafts.",
    images: ["https://chandanartgallery.in/og-blog.jpg"],
  },
  alternates: {
    canonical: "https://chandanartgallery.in/blog",
  },
};

type BlogCategory = { name?: string; slug?: string } | null;

function normalizeCategory(
  category: BlogCategory | BlogCategory[] | undefined,
): BlogCategory {
  if (!category) return null;
  return Array.isArray(category) ? category[0] ?? null : category;
}

export default async function BlogIndexPage() {
  const supabase = getAdminClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      slug,
      title,
      featured_image,
      seo_description,
      content,
      reading_time,
      category:blog_categories(name, slug)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const normalizedPosts = (posts || []).map((post) => ({
    ...post,
    category: normalizeCategory(
      post.category as BlogCategory | BlogCategory[] | undefined,
    ),
  }));

  // Blog JSON-LD Schema
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://chandanartgallery.in/blog#blog',
    'name': 'Chandan Art Gallery Blog',
    'description': 'Expert insights on handcrafted photo frames, wooden art techniques, and traditional Indian handicrafts from Delhi\'s premier art gallery.',
    'url': 'https://chandanartgallery.in/blog',
    'inLanguage': 'en-IN',
    'author': {
      '@type': 'Organization',
      'name': 'Chandan Art Gallery',
      'url': 'https://chandanartgallery.in'
    },
    'publisher': {
      '@type': 'Organization', 
      'name': 'Chandan Art Gallery',
      'url': 'https://chandanartgallery.in'
    },
    'about': {
      '@type': 'Thing',
      'name': 'Handcrafted Photo Frames and Art'
    },
    'keywords': 'photo frame blog, wooden art techniques, religious frame designs, custom framing tips, handcrafted frames Delhi',
    'blogPost': normalizedPosts.map(post => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'url': `https://chandanartgallery.in/blog/${post.slug}`,
      'description': post.seo_description || post.title,
      'image': post.featured_image || 'https://chandanartgallery.in/og-blog.jpg'
    }))
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Blog JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      
      <Navbar />

      <main className="lux-container flex-grow pb-16 pt-28">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Art & Framing Blog
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl">
            Discover expert insights on handcrafted photo frames, wooden art techniques, religious frame designs, and custom framing tips from Delhi's premier art gallery.
          </p>
        </div>
        <BlogIndexClient posts={normalizedPosts} />
      </main>

      <Footer />
    </div>
  );
}
