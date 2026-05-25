import { getAdminClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const supabase = getAdminClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(name, slug)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="commerce-page min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="lux-container flex-grow pt-36 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Editorial digest</p>
            <h1 className="lux-section-title mt-3">Chandan Chronicles</h1>
          </div>
          <p className="lux-copy">
            Artisan interviews, framing style guides, material notes, and premium home decor ideas written for collectors and interior-conscious shoppers.
          </p>
        </div>

        {posts && posts.length > 0 && (
          <Link
            href={`/blog/${posts[0].slug}`}
            className="group mt-10 grid overflow-hidden rounded-[24px] bg-luxury-black shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="relative min-h-[24rem] overflow-hidden">
              <img
                src={posts[0].featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1100'}
                alt={posts[0].title}
                className="image-lift h-full w-full object-cover opacity-88"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/55 to-transparent lg:hidden" />
            </div>
            <div className="flex flex-col justify-between p-7 text-luxury-beige sm:p-10">
              <div>
                <p className="commerce-kicker text-luxury-gold">{posts[0].category?.name || 'Decor guidance'}</p>
                <h2 className="mt-4 font-serif text-4xl leading-none sm:text-6xl">{posts[0].title}</h2>
                <p className="mt-6 line-clamp-3 text-sm leading-8 text-luxury-beige/68">
                  {posts[0].seo_description || `${posts[0].content.slice(0, 220)}...`}
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-luxury-beige/64">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-luxury-gold" />
                  {posts[0].reading_time} min read
                </span>
                <span className="flex items-center gap-2 font-black uppercase tracking-[0.14em] text-luxury-gold">
                  Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        )}

        <div className="product-grid mt-10">
          {(!posts || posts.length <= 1) ? (
            posts?.length === 0 && <p className="col-span-full text-center text-sm text-stone-600 dark:text-stone-400">No chronicles published yet.</p>
          ) : (
            posts.slice(1).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="lux-card group overflow-hidden rounded-[22px] p-3 transition duration-500 hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden rounded-[18px] bg-stone-100 dark:bg-stone-900">
                  <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=700'}
                    alt={post.title}
                    className="image-lift h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-luxury-gold">
                    {post.category?.name || 'Chronicles'} · {post.reading_time} min
                  </p>
                  <h3 className="mt-3 line-clamp-2 font-serif text-2xl leading-tight text-luxury-charcoal transition group-hover:text-luxury-gold dark:text-luxury-beige">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-stone-700 dark:text-stone-400">
                    {post.seo_description || `${post.content.slice(0, 130)}...`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
