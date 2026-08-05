import { getAdminClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogIndexClient from './BlogIndexClient';

export const revalidate = 3600;

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

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="lux-container flex-grow pb-16 pt-28">
        <BlogIndexClient posts={normalizedPosts} />
      </main>

      <Footer />
    </div>
  );
}
