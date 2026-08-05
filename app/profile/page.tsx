'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  User,
  Heart,
  MessageSquare,
  LogOut,
  ArrowLeft,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Loader,
  Sparkles,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SmartImage from '@/components/ui/SmartImage';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');
  const { user, role, loading } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'inquiries'>('profile');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (tabQuery === 'wishlist' || tabQuery === 'inquiries' || tabQuery === 'profile') {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      fetchWishlist();
      fetchInquiries();
      fetchProfileDetails();
    }
  }, [user, loading, router]);

  const fetchProfileDetails = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('phone, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    if (data) {
      if (data.phone) setPhone(data.phone);
      if (data.full_name) setFullName(data.full_name);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        product_id,
        products (
          id,
          name,
          slug,
          price,
          product_images (
            image_url
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setWishlist(data || []);
    }
  };

  const fetchInquiries = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/inquiries');
      const result = await res.json();
      if (result.success) {
        setInquiries(result.data || []);
      } else {
        console.error('Error fetching inquiries:', result.error);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'profile-avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to upload photo');

      setAvatarUrl(result.publicUrl);
      addToast('Profile photo updated.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl },
      });

      if (authError) throw authError;

      setEditingProfile(false);
      addToast('Profile updated successfully.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase.from('wishlist').delete().eq('id', wishlistId);
      if (error) throw error;
      setWishlist(wishlist.filter((item) => item.id !== wishlistId));
      addToast('Removed from wishlist.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const displayAvatar = avatarUrl || user?.user_metadata?.avatar_url;

  const navBtn = (id: typeof activeTab, label: string, icon: React.ReactNode, count?: number) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
        activeTab === id
          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {typeof count === 'number' && (
        <span
          className={`min-w-5 rounded-full px-1.5 text-center text-[0.65rem] font-semibold ${
            activeTab === id
              ? 'bg-white/20 text-white dark:bg-neutral-950/10 dark:text-neutral-950'
              : 'bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-[#f7f7f5] text-neutral-500 dark:bg-neutral-950">
        <Loader className="mb-3 h-6 w-6 animate-spin" />
        <span className="text-xs font-medium uppercase tracking-[0.16em]">Loading profile</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5] dark:bg-neutral-950">
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-5 pb-20 pt-28 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          {/* Sidebar */}
          <aside className="h-fit border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-neutral-800">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-500">
                    {(fullName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.95rem] font-semibold tracking-tight text-neutral-950 dark:text-white">
                  {fullName || 'User'}
                </p>
                <p className="mt-0.5 truncate text-[0.7rem] text-neutral-500">{user.email}</p>
                {role === 'admin' && (
                  <span className="mt-2 inline-flex rounded-md bg-neutral-950 px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white dark:bg-white dark:text-neutral-950">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              {navBtn('profile', 'Profile details', <User className="h-4 w-4 shrink-0" />)}
              {navBtn('wishlist', 'Wishlist', <Heart className="h-4 w-4 shrink-0" />, wishlist.length)}
              {navBtn(
                'inquiries',
                'Inquiries',
                <MessageSquare className="h-4 w-4 shrink-0" />,
                inquiries.length,
              )}
            </nav>

            {role === 'admin' && (
              <Link
                href="/admin"
                className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-neutral-300 px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-white/5"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                Admin dashboard
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </aside>

          {/* Main */}
          <section className="min-h-[28rem] border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        Account
                      </p>
                      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                        Profile details
                      </h1>
                    </div>
                    {!editingProfile && (
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
                      >
                        Edit profile
                      </button>
                    )}
                  </div>

                  {editingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="max-w-md space-y-5">
                      <div>
                        <label className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Profile photo
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">
                                {(fullName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            {uploadingAvatar && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Loader className="h-4 w-4 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
                            <Camera className="h-3.5 w-3.5" />
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              disabled={uploadingAvatar}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Full name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-11 w-full border border-neutral-200 bg-transparent px-3.5 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Phone number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="h-11 w-full border border-neutral-200 bg-transparent px-3.5 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex h-11 items-center justify-center bg-neutral-950 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
                        >
                          {saving ? 'Saving…' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="inline-flex h-11 items-center justify-center border border-neutral-200 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                      {[
                        { icon: User, label: 'Full name', value: fullName || 'Not specified' },
                        { icon: Mail, label: 'Email address', value: user.email || '—' },
                        { icon: Phone, label: 'Phone number', value: phone || 'Not specified' },
                        {
                          icon: Calendar,
                          label: 'Member since',
                          value: new Date(user.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-start gap-3 border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
                        >
                          <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                          <div className="min-w-0">
                            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              {row.label}
                            </p>
                            <p className="mt-1 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {row.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      Saved
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                      Wishlist
                    </h1>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Heart className="mb-3 h-8 w-8 text-neutral-300" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        Your wishlist is empty
                      </p>
                      <Link
                        href="/shop"
                        className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-950 underline-offset-4 hover:underline dark:text-white"
                      >
                        Explore products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {wishlist.map((item) => {
                        const product = item.products;
                        const image =
                          product?.product_images?.[0]?.image_url ||
                          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300';
                        return (
                          <div
                            key={item.id}
                            className="group flex overflow-hidden border border-neutral-200 bg-white transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950"
                          >
                            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                              <SmartImage
                                src={image}
                                fallbackSrc="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300"
                                alt={product?.name || 'Wishlist item'}
                                className="object-cover transition duration-500 group-hover:scale-105"
                                containerClassName="absolute inset-0 h-full w-full"
                                fallbackLabel="No image"
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-3.5">
                              <div>
                                <h3 className="line-clamp-1 text-sm font-semibold text-neutral-950 dark:text-white">
                                  {product?.name}
                                </h3>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {product?.price
                                    ? `₹${product.price.toLocaleString()}`
                                    : 'Price on request'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/product/${product?.slug}`}
                                  className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                                >
                                  View
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromWishlist(item.id)}
                                  className="p-1 text-neutral-400 transition hover:text-red-500"
                                  aria-label="Remove from wishlist"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'inquiries' && (
                <motion.div
                  key="inquiries"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      History
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                      Inquiries
                    </h1>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <MessageSquare className="mb-3 h-8 w-8 text-neutral-300" />
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        No inquiries yet
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-neutral-400">
                        WhatsApp and contact form requests will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inquiry) => (
                        <div
                          key={inquiry.id}
                          className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                              {inquiry.type}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                                inquiry.status === 'pending'
                                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                  : inquiry.status === 'replied'
                                    ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-400'
                              }`}
                            >
                              {inquiry.status}
                            </span>
                          </div>

                          {inquiry.products && (
                            <p className="mt-3 text-xs text-neutral-500">
                              Product:{' '}
                              <Link
                                href={`/product/${inquiry.products.slug}`}
                                className="font-medium text-neutral-800 hover:underline dark:text-neutral-200"
                              >
                                {inquiry.products.name}
                              </Link>
                            </p>
                          )}

                          <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {inquiry.message}
                          </p>

                          <div className="mt-3 flex justify-between border-t border-neutral-100 pt-2 text-[0.65rem] text-neutral-400 dark:border-neutral-800">
                            <span>ID {inquiry.id.slice(0, 8)}</span>
                            <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-[#f7f7f5] text-neutral-500 dark:bg-neutral-950">
          <Loader className="mb-3 h-6 w-6 animate-spin" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">Loading profile</span>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
