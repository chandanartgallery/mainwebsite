import { getAdminClient, getServerClient } from '@/lib/supabase/server';
import AdminClient from './AdminClient';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {

  // Get server-side Supabase client with authentic user JWT
  const userSupabase = await getServerClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Retrieve user profile to confirm role === 'admin'
  const adminSupabase = getAdminClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    // Elegant curator only screen
    return (
      <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
        <Navbar />
        <main className="flex-grow flex flex-col justify-center items-center pt-36 pb-24 px-4 text-center">
          <div className="max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-8 rounded-2xl shadow-sm">
            <span className="text-3xl">🏺</span>
            <h1 className="font-serif text-2xl text-luxury-black dark:text-white uppercase tracking-wider mt-4 mb-2">
              Gallery Curator Verification Required
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-sans">
              This terminal is reserved for Chandan Art Gallery curators and admins. If you are a curator, please sign in with an authorized administrator account.
            </p>
            <Link 
              href="/"
              className="inline-flex px-6 py-3 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              Return to Storefront
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Admin is fully authorized! Fetch initial data for admin operations:
  
  // 1. Fetch categories for product forms
  const { data: categories } = await adminSupabase
    .from('categories')
    .select('id, name');

  // 2. Fetch products for CRUD list
  const { data: products } = await adminSupabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      product_images(image_url, is_primary)
    `)
    .order('created_at', { ascending: false });

  // 3. Fetch inquiries
  const { data: inquiries } = await adminSupabase
    .from('inquiries')
    .select(`
      *,
      product:products(name, slug)
    `)
    .order('created_at', { ascending: false });

  // 4. Fetch pending reviews for moderation
  const { data: pendingReviews } = await adminSupabase
    .from('reviews')
    .select(`
      *,
      product:products(name)
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  // 5. Fetch pending comments for moderation
  const { data: pendingComments } = await adminSupabase
    .from('product_comments')
    .select(`
      *,
      product:products(name)
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  // 6. Gather analytics events (last 14 days)
  const { data: events } = await adminSupabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  // 7. Fetch blog posts for the Blog CMS tab
  const { data: blogPosts } = await adminSupabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(name)
    `)
    .order('created_at', { ascending: false });

  // 8. Fetch blog categories for selection in form
  const { data: blogCategories } = await adminSupabase
    .from('blog_categories')
    .select('id, name');

  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow pt-36">
        <AdminClient 
          categories={categories || []}
          initialProducts={products || []}
          initialInquiries={inquiries || []}
          initialReviews={pendingReviews || []}
          initialComments={pendingComments || []}
          events={events || []}
          initialBlogPosts={blogPosts || []}
          blogCategories={blogCategories || []}
        />
      </main>
      <Footer />
    </div>
  );
}
