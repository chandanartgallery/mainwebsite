'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { 
  User, Heart, MessageSquare, LogOut, ArrowRight, 
  Trash2, Mail, Phone, Calendar, Loader, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
      
      // Update in Supabase profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update in Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl }
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
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;
      setWishlist(wishlist.filter(item => item.id !== wishlistId));
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

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[60vh] bg-luxury-offwhite dark:bg-luxury-black text-gray-500">
        <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-2" />
        <span className="text-sm tracking-widest uppercase">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12 w-full">
        <Link 
        href="/" 
        className="inline-flex items-center text-xs tracking-wider text-gray-500 hover:text-luxury-gold transition-colors duration-200 mb-8 uppercase"
      >
        <ArrowRight className="w-3.5 h-3.5 mr-1 rotate-180" /> Back to Home
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {(avatarUrl || user.user_metadata?.avatar_url) ? (
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 hover:border-luxury-gold transition-colors duration-300">
                  <img 
                    src={avatarUrl || user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-luxury-beige dark:bg-zinc-800 flex items-center justify-center text-luxury-charcoal dark:text-luxury-beige text-2xl font-semibold mb-4 border border-luxury-gold/30">
                  {fullName ? fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="font-serif text-lg text-luxury-black dark:text-luxury-beige">{fullName || 'User'}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-2">{user.email}</p>
              {role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-luxury-gold/20 text-luxury-gold-dark border border-luxury-gold/30 uppercase tracking-widest">
                  Admin
                </span>
              )}
            </div>

            <div className="mt-8 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800/40'
                }`}
              >
                <User className="w-4 h-4 mr-3" />
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Heart className="w-4 h-4 mr-3" />
                Wishlist ({wishlist.length})
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === 'inquiries'
                    ? 'bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800/40'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Inquiries ({inquiries.length})
              </button>

              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-200 mt-4 border border-dashed border-luxury-gold/50"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 mt-8 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm min-h-[50vh]">
            
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <h2 className="text-2xl font-serif text-luxury-black dark:text-luxury-beige">Profile Details</h2>
                  {!editingProfile && (
                    <button 
                      onClick={() => setEditingProfile(true)}
                      className="text-xs font-semibold text-luxury-gold hover:text-luxury-gold-dark transition-colors duration-200 cursor-pointer uppercase tracking-wider"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div className="pb-2">
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Profile Photo</label>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-luxury-gold/30 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 relative">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-luxury-gold/20 text-luxury-gold font-bold uppercase text-xs">
                              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-luxury-gold/15 file:text-luxury-gold hover:file:bg-luxury-gold/20 file:cursor-pointer"
                          />
                          {uploadingAvatar && <Loader className="w-4 h-4 animate-spin text-luxury-gold" />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-luxury-black dark:bg-luxury-gold dark:text-luxury-black hover:bg-luxury-gold disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-medium text-luxury-black dark:text-white">{fullName || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Mail className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-medium text-luxury-black dark:text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone Number</p>
                        <p className="text-sm font-medium text-luxury-black dark:text-white">{phone || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-medium text-luxury-black dark:text-white">
                          {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-serif text-luxury-black dark:text-luxury-beige pb-4 border-b border-gray-100 dark:border-zinc-800">Your Wishlist</h2>
                
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Your wishlist is empty</p>
                    <Link href="/shop" className="mt-4 text-xs font-semibold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-wider">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => {
                      const product = item.products;
                      const image = product?.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300';
                      return (
                        <div key={item.id} className="flex border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-50 relative overflow-hidden">
                            <img src={image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <h4 className="font-serif text-sm text-luxury-black dark:text-white line-clamp-1">{product?.name}</h4>
                              <p className="text-xs font-semibold text-luxury-gold mt-1">₹{product?.price ? product.price.toLocaleString() : 'Price on request'}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <Link 
                                href={`/product/${product?.slug}`}
                                className="text-[10px] font-semibold text-luxury-black dark:text-luxury-beige uppercase tracking-wider hover:underline"
                              >
                                View Details
                              </Link>
                              <button 
                                onClick={() => handleRemoveFromWishlist(item.id)}
                                className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-serif text-luxury-black dark:text-luxury-beige pb-4 border-b border-gray-100 dark:border-zinc-800">Inquiry History</h2>
                
                {inquiries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">You haven't made any inquiries yet</p>
                    <p className="text-xs text-gray-400 mt-1">Products you inquire about via WhatsApp or form will show up here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              inquiry.type === 'whatsapp' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                            }`}>
                              {inquiry.type}
                            </span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            inquiry.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                              : inquiry.status === 'replied'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                        
                        {inquiry.products && (
                          <div className="text-xs font-semibold text-gray-400">
                            Product: <Link href={`/product/${inquiry.products.slug}`} className="text-luxury-gold hover:underline">{inquiry.products.name}</Link>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{inquiry.message}"</p>
                        
                        <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-50 dark:border-zinc-800 flex justify-between">
                          <span>Inquiry ID: {inquiry.id.slice(0, 8)}...</span>
                          <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center min-h-[60vh] bg-luxury-offwhite dark:bg-luxury-black text-gray-500">
        <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-2" />
        <span className="text-sm tracking-widest uppercase">Loading Profile...</span>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
