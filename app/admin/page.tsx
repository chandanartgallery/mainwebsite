import { getAdminClient, getServerClient } from '@/lib/supabase/server';
import AdminClient from './AdminClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {

  const isDev = process.env.NODE_ENV === 'development';
  const adminSupabase = getAdminClient();

  // ── Auth guard — skipped in development ───────────
  let adminEmail  = 'dev@localhost';
  let adminName   = 'Dev Admin';
  let adminAvatar: string | null = null;

  if (!isDev) {
    const userSupabase = await getServerClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] px-4 text-center">
          <div className="max-w-md w-full border border-[rgba(255,255,255,0.08)] bg-[rgba(22,25,34,0.98)] rounded-2xl p-10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[rgba(185,154,100,0.12)] flex items-center justify-center mx-auto mb-5">
              <span className="text-[#b99a64] text-xl font-serif">✦</span>
            </div>
            <h1 className="font-serif text-2xl text-white uppercase tracking-wider mb-2">Access Restricted</h1>
            <p className="text-xs text-[#7a6a56] leading-relaxed mb-7">
              This control panel is reserved for authorized Chandan Art Gallery administrators only. Please sign in with an admin account.
            </p>
            <Link href="/" className="inline-flex px-6 py-3 bg-[#b99a64] text-[#090807] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d4b87a] transition-colors">
              Return to Storefront
            </Link>
          </div>
        </div>
      );
    }

    adminEmail  = user!.email || '';
    adminName   = user!.user_metadata?.full_name || user!.email || 'Admin';
    adminAvatar = user!.user_metadata?.avatar_url || null;
  }

  // ── Fetch panel data ───────────────────────────────

  const { data: categories } = await adminSupabase
    .from('categories')
    .select('id, name');

  const { data: products } = await adminSupabase
    .from('products')
    .select(`*, category:categories(name), product_images(image_url, is_primary, display_order)`)
    .order('created_at', { ascending: false });

  const { data: inquiries } = await adminSupabase
    .from('inquiries')
    .select(`*, product:products(name, slug)`)
    .order('created_at', { ascending: false });

  const { data: pendingReviews } = await adminSupabase
    .from('reviews')
    .select(`*, product:products(name)`)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  const { data: pendingComments } = await adminSupabase
    .from('product_comments')
    .select(`*, product:products(name)`)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  const { data: events } = await adminSupabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  const { data: blogPosts } = await adminSupabase
    .from('blog_posts')
    .select(`*, category:blog_categories(name)`)
    .order('created_at', { ascending: false });

  const { data: blogCategories } = await adminSupabase
    .from('blog_categories')
    .select('id, name');

  const { data: allProfiles } = await adminSupabase
    .from('profiles')
    .select('id, role, full_name, email, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const { data: approvedReviews } = await adminSupabase
    .from('reviews')
    .select(`*, product:products(name)`)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const { data: vouchers } = await adminSupabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminClient
      adminEmail={adminEmail}
      adminName={adminName}
      adminAvatar={adminAvatar}
      categories={categories || []}
      initialProducts={products || []}
      initialInquiries={inquiries || []}
      initialReviews={pendingReviews || []}
      initialApprovedReviews={approvedReviews || []}
      initialComments={pendingComments || []}
      events={events || []}
      initialBlogPosts={blogPosts || []}
      blogCategories={blogCategories || []}
      allProfiles={allProfiles || []}
      initialVouchers={vouchers || []}
    />
  );
}
