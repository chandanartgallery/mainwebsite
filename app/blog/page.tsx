import { getAdminClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const supabase = getAdminClient();

  // Fetch published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(name, slug)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Fetch blog categories
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*');

  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        
        {/* Page Header */}
        <div className="text-center mb-16 select-none">
          <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold">The Editorial Digest</span>
          <h1 className="text-4xl sm:text-5xl font-serif text-luxury-black dark:text-white uppercase tracking-wider mt-2">
            Chandan Chronicles
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
            Artisan interviews, framing style guides, and premium home decor inspiration
          </p>
        </div>

        {/* Featured blog post (takes full width of upper area) */}
        {posts && posts.length > 0 && (
          <div className="mb-16">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 group hover:shadow-md transition-shadow duration-300">
              <Link href={`/blog/${posts[0].slug}`} className="block overflow-hidden bg-gray-50 h-80 lg:h-full relative">
                <img 
                  src={posts[0].featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800'} 
                  alt={posts[0].title}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                />
              </Link>
              <div className="p-8 sm:p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[10px] text-luxury-gold font-bold uppercase tracking-widest">
                    <span>{posts[0].category?.name || 'Decor Guidance'}</span>
                    <span>•</span>
                    <span>{posts[0].reading_time} min read</span>
                  </div>

                  <Link href={`/blog/${posts[0].slug}`} className="block">
                    <h2 className="font-serif text-2xl sm:text-3xl text-luxury-black dark:text-white group-hover:text-luxury-gold transition-colors duration-200 leading-snug">
                      {posts[0].title}
                    </h2>
                  </Link>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-3">
                    {posts[0].seo_description || posts[0].content.slice(0, 200) + '...'}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-zinc-800/60 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-sans">
                    Published {new Date(posts[0].created_at).toLocaleDateString()}
                  </span>
                  <Link 
                    href={`/blog/${posts[0].slug}`}
                    className="font-bold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-widest hover:underline"
                  >
                    Read Full Article
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Blog Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(!posts || posts.length <= 1) ? (
            posts?.length === 0 && <p className="col-span-3 text-center text-xs text-gray-400 italic">No chronicles published yet.</p>
          ) : (
            posts.slice(1).map((post) => (
              <div 
                key={post.id}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] bg-gray-50 overflow-hidden relative">
                  <img 
                    src={post.featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </Link>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[9px] text-luxury-gold font-bold uppercase tracking-widest">
                      <span>{post.category?.name || 'Chronicles'}</span>
                      <span>•</span>
                      <span>{post.reading_time} min read</span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="font-serif text-base text-luxury-black dark:text-white group-hover:text-luxury-gold transition-colors duration-200 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-2">
                      {post.seo_description || post.content.slice(0, 120) + '...'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/60 flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="font-bold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-widest"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
