import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Clock, Calendar, Tag, BookOpen, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// SEO Metadata for Single Blog Post
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getAdminClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, seo_title, seo_description, featured_image')
    .eq('slug', slug)
    .single();

  if (!post) {
    return {
      title: 'Chronicle Not Found | Chandan Art Gallery',
    };
  }

  return {
    title: post.seo_title || `${post.title} | Chandan Art Gallery Chronicles`,
    description: post.seo_description || 'Read our latest framing styling guides and interior artisan articles.',
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || 'Read our latest chronicles',
      images: [
        {
          url: post.featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200',
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const supabase = getAdminClient();

  // Fetch the active blog post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  const category = Array.isArray(post.category)
    ? post.category[0] ?? null
    : post.category;

  // Fetch related articles (same category or latest, except this one)
  const { data: related } = await supabase
    .from('blog_posts')
    .select('title, slug, featured_image, created_at')
    .eq('is_published', true)
    .neq('id', post.id)
    .limit(3);

  // Parse paragraphs from post content
  const paragraphs = post.content.split('\n\n').filter((p: string) => p.trim());

  // Generate Table of Contents based on paragraph topics or subheaders
  // We can automatically display key headings for clean readability
  const headings = paragraphs
    .filter((p: string) => p.length < 100 && (p.includes('Designing') || p.includes('spacing') || p.includes('Traditional') || p.includes('decor') || p.includes('trend') || p.includes('spacing') || p.includes('When') || p.includes('Adding') || p.includes('In 2026')))
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="lux-container flex-grow pt-24 pb-20">
        
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-xs tracking-wider text-stone-600 hover:text-neutral-600 transition-colors duration-200 mb-8 uppercase font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Chronicles
        </Link>

        {/* Blog Main Article Cover */}
        <article className="space-y-8">
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs text-neutral-600 font-bold uppercase tracking-widest">
              <span>{category?.name || 'decor inspiration'}</span>
            </div>
            <h1 className="lux-section-title max-w-5xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 pt-2 border-b border-black/10 dark:border-white/10 pb-6 text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {post.reading_time} Min Read
              </span>
              <span className="flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                Curated Publication
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative mx-auto w-full max-w-4xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <img
              src={post.featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200'}
              alt={post.title}
              className="h-48 w-full object-cover sm:h-56 md:h-72"
            />
          </div>

          {/* Reading Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8">
            
            {/* Left Sidebar: Table of Contents & Social Share */}
            <div className="hidden lg:block space-y-8 select-none">
              
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="lux-card p-5 rounded-[18px] space-y-4">
                  <h4 className="font-serif text-xs text-neutral-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-zinc-800 pb-2">
                    In this Article
                  </h4>
                  <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400 font-sans">
                    {headings.map((h: string, i: number) => (
                      <li key={i} className="hover:text-neutral-600 cursor-pointer transition-colors duration-150 flex items-start">
                        <span className="text-neutral-600 mr-1.5 font-semibold">0{i+1}</span>
                        <span className="line-clamp-1">{h.slice(0, 30)}...</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curator Shares */}
              <div className="lux-card p-5 rounded-[18px] space-y-4">
                <h4 className="font-serif text-xs text-neutral-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-zinc-800 pb-2">
                  Share Chronicle
                </h4>
                <div className="flex space-x-3 text-gray-400">
                  <button className="p-2 border border-gray-100 dark:border-zinc-800 rounded-[12px] hover:text-neutral-600 duration-150 cursor-pointer" title="Share on Twitter">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-gray-100 dark:border-zinc-800 rounded-[12px] hover:text-neutral-600 duration-150 cursor-pointer" title="Copy Link">
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Central Paragraph Content */}
            <div className="lg:col-span-3 space-y-6">
              <div className="max-w-none text-base text-stone-700 dark:text-stone-400 leading-8 font-sans space-y-6">
                {paragraphs.map((para: string, idx: number) => {
                  // Style first paragraph as editorial lead
                  const isLead = idx === 0;
                  const isSubheader = para.length < 100 && (para.includes('Designing') || para.includes('Traditional') || para.includes('When') || para.includes('In 2026'));

                  if (isSubheader) {
                    return (
                      <h3 key={idx} className="font-serif text-3xl text-neutral-900 dark:text-white pt-6 pb-2 border-b border-black/10 dark:border-white/10">
                        {para}
                      </h3>
                    );
                  }

                  return (
                    <p 
                      key={idx} 
                      className={isLead ? 'text-2xl font-serif italic text-neutral-800 dark:text-neutral-100 border-l-2 border-neutral-300 pl-5 py-2 leading-relaxed' : ''}
                    >
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Article Tag Footer */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center space-x-2.5 pt-8 border-t border-gray-100 dark:border-zinc-850 mt-10">
                  <Tag className="w-4 h-4 text-neutral-600" />
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    {post.tags.map((tg: string) => (
                      <span key={tg} className="bg-gray-150 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 px-2.5 py-1 rounded-[8px]">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </article>

        {/* Dynamic Related chronicles */}
        {related && related.length > 0 && (
          <section className="mt-24 border-t border-black/10 dark:border-white/10 pt-16">
            <h3 className="font-serif text-4xl text-neutral-900 dark:text-white mb-10 text-center select-none">
              Chronicles Continues
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((item) => (
                <div key={item.slug} className="lux-card rounded-[22px] overflow-hidden group transition-shadow duration-300">
                  <Link href={`/blog/${item.slug}`} className="block aspect-[16/10] bg-gray-50 overflow-hidden relative">
                    <img src={item.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-103 duration-300" />
                  </Link>
                  <div className="p-5">
                    <Link href={`/blog/${item.slug}`} className="block">
                      <h4 className="font-serif text-sm text-neutral-900 dark:text-white group-hover:text-neutral-600 duration-200 line-clamp-1">
                        {item.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-gray-400 mt-2 block font-sans">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
