'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import {
  parseMaterials, parseColors, serializeMaterials, serializeColors,
  DEFAULT_MATERIALS, DEFAULT_COLORS, type MaterialOption, type ColorOption,
} from '@/lib/productOptions';
import {
  DEFAULT_PRODUCT_CONFIG, parseProductConfig, parseSizesExtended,
  serializeSizesExtended, type ProductPageConfig, type ExtendedSizeOption,
} from '@/lib/productConfig';
import {
  BarChart3, ShoppingBag, MessageSquare, Star, MessageCircle,
  Edit, PlusCircle, Trash2, Check, CheckSquare, AlertCircle,
  Menu, X, ExternalLink, TrendingUp, Users, Settings, BookOpen,
  ListOrdered, LogOut, ChevronRight, Package, Eye, Clock,
  Home, Bell, Moon, Sun, Search, Filter, MoreVertical,
  ArrowUpRight, ArrowDownRight, Layers, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// -----------------------------------------------------
// Types
// -----------------------------------------------------
type AdminSection =
  | 'dashboard'
  | 'analytics'
  | 'inventory'
  | 'inquiries'
  | 'moderation'
  | 'blog'
  | 'users'
  | 'settings';

interface AdminClientProps {
  adminEmail: string;
  adminName: string;
  adminAvatar: string | null;
  categories: any[];
  initialProducts: any[];
  initialInquiries: any[];
  initialReviews: any[];
  initialApprovedReviews: any[];
  initialComments: any[];
  events: any[];
  initialBlogPosts: any[];
  blogCategories: any[];
  allProfiles: any[];
}

// -----------------------------------------------------
// Sidebar nav items
// -----------------------------------------------------
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'inventory', label: 'Art Inventory', icon: Package },
      { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'blog', label: 'Blog CMS', icon: BookOpen },
      { id: 'moderation', label: 'Moderation', icon: ListOrdered },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'settings', label: 'Site Settings', icon: Settings },
    ],
  },
];


export default function AdminClient({
  adminEmail, adminName, adminAvatar,
  categories, initialProducts, initialInquiries,
  initialReviews, initialApprovedReviews, initialComments,
  events, initialBlogPosts, blogCategories, allProfiles,
}: AdminClientProps) {
  const { addToast } = useUIStore();

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  // Data states
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [approvedReviews, setApprovedReviews] = useState<any[]>(initialApprovedReviews);
  const [comments, setComments] = useState<any[]>(initialComments);
  const [blogPosts, setBlogPosts] = useState<any[]>(initialBlogPosts);
  const [profiles, setProfiles] = useState<any[]>(allProfiles);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodShortDescription, setProdShortDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(1000);
  const [sizesList, setSizesList] = useState<ExtendedSizeOption[]>([
    { value: '12 x 15 inches', modifier: 0, label: '12 x 15 in', tag: 'Standard' },
  ]);
  const [pageConfig, setPageConfig] = useState<ProductPageConfig>({ ...DEFAULT_PRODUCT_CONFIG });
  const [galleryImages, setGalleryImages] = useState<string[]>(['']);
  const [materialsList, setMaterialsList] = useState<MaterialOption[]>([...DEFAULT_MATERIALS]);
  const [colorsList, setColorsList] = useState<ColorOption[]>([...DEFAULT_COLORS]);
  const [prodWeight, setProdWeight] = useState('1.5 kg');
  const [prodCategoryId, setProdCategoryId] = useState(categories[0]?.id || '');
  const [prodIsCustomizable, setProdIsCustomizable] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodTags, setProdTags] = useState('');
  const [prodSeoTitle, setProdSeoTitle] = useState('');
  const [prodSeoDescription, setProdSeoDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'blog' | 'review'; id: string } | null>(null);

  // Blog modal state
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<any | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategoryId, setBlogCategoryId] = useState(blogCategories[0]?.id || '');
  const [blogReadingTime, setBlogReadingTime] = useState(5);
  const [blogFeaturedImage, setBlogFeaturedImage] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogSeoTitle, setBlogSeoTitle] = useState('');
  const [blogSeoDescription, setBlogSeoDescription] = useState('');
  const [blogIsPublished, setBlogIsPublished] = useState(true);

  // Reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [curatorReplyText, setCuratorReplyText] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Settings state
  const [settingsTab, setSettingsTab] = useState<'general' | 'seo' | 'notifications'>('general');


  // --- Analytics computations -----------------------
  const totalViews = events.filter(e =>
    e.event_type === 'page_view' || e.event_type === 'product_click'
  ).length;
  const totalClicks = events.filter(e => e.event_type === 'whatsapp_click').length;
  const conversionRate = totalViews > 0
    ? ((totalClicks / totalViews) * 100).toFixed(1)
    : '0.0';

  const trafficData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const matchViews = events.filter(e => {
      const eDate = new Date(e.created_at);
      return eDate.toDateString() === d.toDateString() &&
        (e.event_type === 'page_view' || e.event_type === 'product_click');
    }).length;
    const matchClicks = events.filter(e => {
      const eDate = new Date(e.created_at);
      return eDate.toDateString() === d.toDateString() && e.event_type === 'whatsapp_click';
    }).length;
    return { date: dateStr, views: matchViews, clicks: matchClicks };
  }).reverse();

  const devicesMap: any = {};
  events.forEach(e => {
    if (e.device) devicesMap[e.device] = (devicesMap[e.device] || 0) + 1;
  });
  const deviceData = Object.keys(devicesMap).map(k => ({ name: k, value: devicesMap[k] }));
  if (deviceData.length === 0) deviceData.push({ name: 'Desktop Client', value: 1 });

  const searchMap: any = {};
  events.forEach(e => {
    if (e.event_type === 'search' && e.search_query) {
      searchMap[e.search_query] = (searchMap[e.search_query] || 0) + 1;
    }
  });
  const topSearches = Object.keys(searchMap)
    .map(k => ({ query: k, count: searchMap[k] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- Refresh helpers -----------------------------
  const refreshProducts = async () => {
    const res = await fetch('/api/products');
    const result = await res.json();
    if (res.ok && result.data) setProducts(result.data);
  };

  const refreshBlogPosts = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    const { data } = await supabase
      .from('blog_posts')
      .select('*, category:blog_categories(name)')
      .order('created_at', { ascending: false });
    if (data) setBlogPosts(data);
  };

  // --- Theme toggle --------------------------------
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  // --- Nav helper ----------------------------------
  const navigate = (section: AdminSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };


  // --- Inquiry actions -----------------------------
  const handleInquiryStatus = async (id: string, newStatus: 'replied' | 'closed') => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
      addToast('Inquiry status updated.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Failed to update inquiry.', 'error');
    }
  };

  // --- Moderation actions --------------------------
  const handleReviewAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', id, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      setReviews(reviews.filter(r => r.id !== id));
      addToast(action === 'approve' ? 'Review approved.' : 'Review removed.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Review action failed.', 'error');
    }
  };

  const handleCommentAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comment', id, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      setComments(comments.filter(c => c.id !== id));
      addToast(action === 'approve' ? 'Comment approved.' : 'Comment removed.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Comment action failed.', 'error');
    }
  };

  const handleCuratorReply = async (e: React.FormEvent, comment: any) => {
    e.preventDefault();
    if (!curatorReplyText.trim()) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comment', id: comment.id, action: 'reply', reply: curatorReplyText }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      setComments(comments.filter(c => c.id !== comment.id));
      setCuratorReplyText('');
      setReplyingCommentId(null);
      addToast('Curator reply posted.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to post reply.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductFeatureToggle = async (productId: string, currentFeatured: boolean) => {
    try {
      const newFeatured = !currentFeatured;
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feature', id: productId, featured: newFeatured }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      setProducts(products.map(p => p.id === productId ? { ...p, is_featured: newFeatured } : p));
      addToast(newFeatured ? 'Product featured.' : 'Featured flag removed.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Failed to update.', 'error');
    }
  };


  // --- Product CRUD --------------------------------
  const handleOpenProductForm = (product: any | null = null) => {
    setEditingProduct(product);
    if (product) {
      setProdName(product.name);
      setProdSku(product.sku || '');
      setProdDescription(product.description || '');
      setProdShortDescription(product.short_description || '');
      setProdPrice(product.price || 0);
      setSizesList(parseSizesExtended(product.dimensions));
      setMaterialsList(parseMaterials(product.material));
      setColorsList(parseColors(product.color));
      setPageConfig(parseProductConfig(product.product_config));
      const imgs = (product.product_images || [])
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((i: any) => i.image_url);
      setGalleryImages(imgs.length > 0 ? imgs : ['']);
      setProdWeight(product.weight || '');
      setProdCategoryId(product.category_id || categories[0]?.id || '');
      setProdIsCustomizable(product.is_customizable || false);
      setProdIsFeatured(product.is_featured || false);
      setProdIsTrending(product.is_trending || false);
      setProdIsBestSeller(product.is_best_seller || false);
      setProdTags(product.tags ? product.tags.join(', ') : '');
      setProdSeoTitle(product.seo_title || '');
      setProdSeoDescription(product.seo_description || '');
      setProdImageUrl(imgs[0] || '');
    } else {
      setProdName(''); setProdSku(''); setProdDescription('');
      setProdShortDescription(''); setProdPrice(1500);
      setSizesList([{ value: '12 x 15 inches', modifier: 0, label: '12 x 15 in', tag: 'Standard' }]);
      setMaterialsList([...DEFAULT_MATERIALS]);
      setColorsList([...DEFAULT_COLORS]);
      setPageConfig({ ...DEFAULT_PRODUCT_CONFIG });
      setGalleryImages(['']); setProdWeight('1.5 kg');
      setProdCategoryId(categories[0]?.id || '');
      setProdIsCustomizable(true); setProdIsFeatured(false);
      setProdIsTrending(false); setProdIsBestSeller(false);
      setProdTags(''); setProdSeoTitle(''); setProdSeoDescription(''); setProdImageUrl('');
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const pSlug = editingProduct
        ? editingProduct.slug
        : prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tagsArray = prodTags.split(',').map(t => t.trim()).filter(Boolean);
      const productPayload = {
        name: prodName, slug: pSlug, sku: prodSku || null,
        description: prodDescription, short_description: prodShortDescription,
        price: prodPrice, dimensions: serializeSizesExtended(sizesList),
        material: serializeMaterials(materialsList), color: serializeColors(colorsList),
        weight: prodWeight, category_id: prodCategoryId || null, tags: tagsArray,
        is_customizable: prodIsCustomizable, is_featured: prodIsFeatured,
        is_trending: prodIsTrending, is_best_seller: prodIsBestSeller,
        seo_title: prodSeoTitle || null, seo_description: prodSeoDescription || null,
        product_config: pageConfig,
      };
      const imageUrls = galleryImages.map(u => u.trim()).filter(Boolean);
      if (imageUrls.length === 0 && prodImageUrl) imageUrls.push(prodImageUrl);

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, product: productPayload, imageUrls, previousSlug: editingProduct.slug }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Update failed');
        addToast('Product updated.', 'success');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: productPayload, imageUrls }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Create failed');
        addToast('Product launched.', 'success');
      }
      await refreshProducts();
      setShowProductModal(false);
    } catch (err: any) {
      addToast('Product action failed: ' + err.message, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      if (type === 'product') {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Delete failed');
        setProducts(products.filter(p => p.id !== id));
        addToast('Product deleted.', 'success');
      } else if (type === 'blog') {
        const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Delete failed');
        setBlogPosts(blogPosts.filter(b => b.id !== id));
        addToast('Blog post deleted.', 'success');
      } else if (type === 'review') {
        const res = await fetch('/api/admin/moderation', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'review', id, action: 'reject' }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Delete failed');
        setApprovedReviews(approvedReviews.filter(r => r.id !== id));
        addToast('Review removed.', 'success');
      }
    } catch (e: any) {
      addToast(e.message || 'Delete failed.', 'error');
    }
  };


  // --- Blog CRUD -----------------------------------
  const handleOpenBlogForm = (post: any | null = null) => {
    setEditingBlogPost(post);
    if (post) {
      setBlogTitle(post.title); setBlogSlug(post.slug);
      setBlogContent(post.content || '');
      setBlogCategoryId(post.category_id || blogCategories[0]?.id || '');
      setBlogReadingTime(post.reading_time || 5);
      setBlogFeaturedImage(post.featured_image || '');
      setBlogTags(post.tags ? post.tags.join(', ') : '');
      setBlogSeoTitle(post.seo_title || ''); setBlogSeoDescription(post.seo_description || '');
      setBlogIsPublished(post.is_published ?? true);
    } else {
      setBlogTitle(''); setBlogSlug(''); setBlogContent('');
      setBlogCategoryId(blogCategories[0]?.id || ''); setBlogReadingTime(5);
      setBlogFeaturedImage(''); setBlogTags('');
      setBlogSeoTitle(''); setBlogSeoDescription(''); setBlogIsPublished(true);
    }
    setShowBlogModal(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const generatedSlug = blogSlug.trim() ||
        blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tagsArray = blogTags.split(',').map(t => t.trim()).filter(t => t);
      const blogPayload = {
        title: blogTitle, slug: generatedSlug, content: blogContent,
        category_id: blogCategoryId || null, reading_time: blogReadingTime,
        featured_image: blogFeaturedImage || null, tags: tagsArray,
        seo_title: blogSeoTitle || null, seo_description: blogSeoDescription || null,
        is_published: blogIsPublished,
      };
      if (editingBlogPost) {
        const res = await fetch('/api/blog', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBlogPost.id, post: blogPayload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Update failed');
        addToast('Blog post updated.', 'success');
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post: blogPayload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Create failed');
        addToast('Blog post published.', 'success');
      }
      await refreshBlogPosts();
      setShowBlogModal(false);
    } catch (err: any) {
      addToast('Blog action failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- User role update ----------------------------
  const handleRoleChange = async (profileId: string, newRole: 'user' | 'admin') => {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, role: newRole } : p));
      addToast(`Role updated to ${newRole}.`, 'success');
    } catch (e: any) {
      addToast(e.message || 'Role update failed.', 'error');
    }
  };


  // --- Pending badge counts -------------------------
  const pendingCount = reviews.length + comments.length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;

  const sectionTitle: Record<AdminSection, string> = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    inventory: 'Art Inventory',
    inquiries: 'Inquiries',
    moderation: 'Moderation',
    blog: 'Blog CMS',
    users: 'User Management',
    settings: 'Site Settings',
  };

  // -------------------------------------------------
  // SIDEBAR component (shared for desktop + mobile)
  // -------------------------------------------------
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(185,154,100,0.14)]">
        <div className="w-8 h-8 rounded-lg bg-[#b99a64] flex items-center justify-center flex-shrink-0">
          <span className="text-[#090807] font-serif font-bold text-sm">C</span>
        </div>
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="min-w-0">
            <p className="text-[0.72rem] font-bold text-white truncate leading-tight">Chandan Art Gallery</p>
            <p className="text-[0.58rem] text-[#7a6a56] uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {(sidebarOpen || mobileSidebarOpen) && (
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[#4a3f35] px-2 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const badge =
                  item.id === 'moderation' ? pendingCount :
                  item.id === 'inquiries' ? pendingInquiries : 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id as AdminSection)}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 group ${
                      isActive
                        ? 'bg-[rgba(185,154,100,0.16)] text-[#b99a64]'
                        : 'text-[#7a6a56] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#c8b48c]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#b99a64]' : 'text-[#5a4f44]'}`} />
                    {(sidebarOpen || mobileSidebarOpen) && (
                      <>
                        <span className="text-[0.78rem] font-semibold flex-1 truncate">{item.label}</span>
                        {badge > 0 && (
                          <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-[#b99a64] text-[#090807] text-[0.58rem] font-black flex items-center justify-center">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: view site + admin info */}
      <div className="border-t border-[rgba(185,154,100,0.14)] p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[#5a4f44] hover:text-[#c8b48c] hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileSidebarOpen) && (
            <span className="text-[0.78rem] font-semibold flex-1">View Storefront</span>
          )}
          {(sidebarOpen || mobileSidebarOpen) && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
        </Link>
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg">
            {adminAvatar ? (
              <img src={adminAvatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-[#b99a64]/40" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#b99a64]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#b99a64] text-[0.62rem] font-bold">{adminName[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-semibold text-[#c8b48c] truncate">{adminName}</p>
              <p className="text-[0.58rem] text-[#4a3f35] truncate">{adminEmail}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // -------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0b09] text-white">

      {/* -- Desktop Sidebar --------------------------- */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-[rgba(185,154,100,0.1)] bg-[#100e0c] transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-[3.75rem]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* -- Mobile Sidebar Overlay --------------------- */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-[#100e0c] border-r border-[rgba(185,154,100,0.1)] z-50 md:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* -- Main Content Area -------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-[rgba(185,154,100,0.1)] bg-[#100e0c]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(v => !v)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#7a6a56] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-[#7a6a56] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[0.7rem]">
              <span className="text-[#4a3f35]">Admin</span>
              <ChevronRight className="w-3 h-3 text-[#4a3f35]" />
              <span className="text-[#c8b48c] font-semibold">{sectionTitle[activeSection]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pending alerts badge */}
            {(pendingCount > 0 || pendingInquiries > 0) && (
              <button
                onClick={() => navigate('moderation')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(185,154,100,0.12)] text-[#b99a64] text-[0.65rem] font-bold uppercase tracking-wide hover:bg-[rgba(185,154,100,0.18)] transition"
              >
                <Bell className="w-3.5 h-3.5" />
                {pendingCount + pendingInquiries} pending
              </button>
            )}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a6a56] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[#0d0b09]">
          <div className="p-6 max-w-screen-xl mx-auto">


            {/* -------------------------------------------
                DASHBOARD SECTION
            -------------------------------------------- */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-white mb-0.5">Welcome back, {adminName.split(' ')[0]}</h2>
                  <p className="text-[0.78rem] text-[#5a4f44]">Here's what's happening in your gallery today.</p>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Products', value: products.length, icon: Package, trend: null, color: '#b99a64' },
                    { label: 'Page Views', value: totalViews, icon: Eye, trend: '+12%', up: true, color: '#6ea8cc' },
                    { label: 'WhatsApp Clicks', value: totalClicks, icon: TrendingUp, trend: null, color: '#7fc6a4' },
                    { label: 'Pending Actions', value: pendingCount + pendingInquiries, icon: Bell, trend: null, color: pendingCount + pendingInquiries > 0 ? '#e8835a' : '#7a6a56' },
                  ].map(card => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-4 hover:border-[rgba(185,154,100,0.22)] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                            <Icon className="w-4 h-4" style={{ color: card.color }} />
                          </div>
                          {card.trend && (
                            <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded ${(card as any).up ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                              {card.trend}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-white mb-0.5">{card.value}</p>
                        <p className="text-[0.68rem] text-[#5a4f44] uppercase tracking-wider">{card.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div>
                  <h3 className="text-[0.72rem] font-bold uppercase tracking-widest text-[#5a4f44] mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Add Product', icon: Package, action: () => { navigate('inventory'); setTimeout(() => handleOpenProductForm(null), 100); }, color: '#b99a64' },
                      { label: 'Write Article', icon: BookOpen, action: () => { navigate('blog'); setTimeout(() => handleOpenBlogForm(null), 100); }, color: '#6ea8cc' },
                      { label: 'View Inquiries', icon: MessageSquare, action: () => navigate('inquiries'), color: '#7fc6a4' },
                      { label: 'Moderate Content', icon: ListOrdered, action: () => navigate('moderation'), color: '#e8835a' },
                    ].map(qa => {
                      const Icon = qa.icon;
                      return (
                        <button
                          key={qa.label}
                          onClick={qa.action}
                          className="flex items-center gap-3 p-4 bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl hover:border-[rgba(185,154,100,0.22)] hover:bg-[#1a1713] transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${qa.color}18` }}>
                            <Icon className="w-4 h-4" style={{ color: qa.color }} />
                          </div>
                          <span className="text-[0.78rem] font-semibold text-[#c8b48c]">{qa.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent activity split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent products */}
                  <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[0.72rem] font-bold uppercase tracking-widest text-[#5a4f44]">Recent Products</h3>
                      <button onClick={() => navigate('inventory')} className="text-[0.65rem] text-[#b99a64] hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {products.slice(0, 5).map(p => {
                        const img = p.product_images?.[0]?.image_url;
                        return (
                          <div key={p.id} className="flex items-center gap-3 py-1.5">
                            {img && <img src={img} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-[rgba(185,154,100,0.12)]" />}
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.75rem] font-semibold text-[#d4c8b7] truncate">{p.name}</p>
                              <p className="text-[0.62rem] text-[#5a4f44]">?{p.price?.toLocaleString()}</p>
                            </div>
                            {p.is_featured && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(185,154,100,0.12)] text-[#b99a64]">Featured</span>}
                          </div>
                        );
                      })}
                      {products.length === 0 && <p className="text-[0.72rem] text-[#4a3f35] italic">No products yet.</p>}
                    </div>
                  </div>

                  {/* Recent inquiries */}
                  <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[0.72rem] font-bold uppercase tracking-widest text-[#5a4f44]">Recent Inquiries</h3>
                      <button onClick={() => navigate('inquiries')} className="text-[0.65rem] text-[#b99a64] hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {inquiries.slice(0, 5).map(inq => (
                        <div key={inq.id} className="flex items-center gap-3 py-1.5 border-b border-[rgba(185,154,100,0.06)] last:border-0">
                          <div className="w-8 h-8 rounded-full bg-[rgba(185,154,100,0.1)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#b99a64] text-[0.68rem] font-bold">{inq.name?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.75rem] font-semibold text-[#d4c8b7] truncate">{inq.name}</p>
                            <p className="text-[0.62rem] text-[#5a4f44] truncate">{inq.message?.slice(0, 40)}�</p>
                          </div>
                          <span className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            inq.status === 'pending' ? 'bg-amber-900/40 text-amber-400' :
                            inq.status === 'replied' ? 'bg-emerald-900/40 text-emerald-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>{inq.status}</span>
                        </div>
                      ))}
                      {inquiries.length === 0 && <p className="text-[0.72rem] text-[#4a3f35] italic">No inquiries yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                ANALYTICS SECTION
            -------------------------------------------- */}
            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-white mb-0.5">Analytics & Insights</h2>
                  <p className="text-[0.78rem] text-[#5a4f44]">Traffic, conversions, and search behaviour over the last 14 days.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Page Views', value: totalViews, sub: 'page_view + product_click events', color: '#6ea8cc' },
                    { label: 'WhatsApp Clicks', value: totalClicks, sub: 'checkout intent rate', color: '#7fc6a4' },
                    { label: 'Conversion Rate', value: `${conversionRate}%`, sub: 'visitor ? click index', color: '#b99a64' },
                  ].map(m => (
                    <div key={m.label} className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest mb-2" style={{ color: m.color }}>{m.label}</p>
                      <p className="text-3xl font-bold text-white mb-1">{m.value}</p>
                      <p className="text-[0.65rem] text-[#4a3f35]">{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Charts � rendered inside a themed wrapper that overrides globals */}
                <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5">
                  <AnalyticsCharts trafficData={trafficData} deviceData={deviceData} topSearches={topSearches} />
                </div>
              </div>
            )}


            {/* -------------------------------------------
                INVENTORY SECTION
            -------------------------------------------- */}
            {activeSection === 'inventory' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-serif text-2xl text-white mb-0.5">Art Inventory</h2>
                    <p className="text-[0.78rem] text-[#5a4f44]">{products.length} products in the gallery database.</p>
                  </div>
                  <button
                    onClick={() => handleOpenProductForm(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#b99a64] text-[#090807] text-[0.72rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4b87a] transition-colors flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[rgba(185,154,100,0.1)] bg-[#1a1713]">
                          {['Artwork', 'SKU', 'Category', 'Price', 'Flags', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[0.6rem] font-bold uppercase tracking-widest text-[#5a4f44] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-[0.78rem] text-[#4a3f35] italic">No products yet.</td></tr>
                        ) : products.map(prod => {
                          const img = (prod.product_images || [])
                            .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]?.image_url
                            || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200';
                          return (
                            <tr key={prod.id} className="border-b border-[rgba(185,154,100,0.06)] hover:bg-[rgba(185,154,100,0.03)] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border border-[rgba(185,154,100,0.12)] flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#d4c8b7] truncate max-w-[180px]">{prod.name}</p>
                                    <p className="text-[0.62rem] text-[#5a4f44] truncate max-w-[180px]">{prod.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-[#7a6a56]">{prod.sku || '�'}</td>
                              <td className="px-4 py-3 text-[#9a8a76] font-semibold">{prod.category?.name || '�'}</td>
                              <td className="px-4 py-3 font-bold text-[#c8b48c]">?{prod.price?.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {prod.is_featured && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(185,154,100,0.14)] text-[#b99a64]">Featured</span>}
                                  {prod.is_best_seller && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(185,154,100,0.14)] text-[#b99a64]">Bestseller</span>}
                                  {prod.is_trending && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(110,168,204,0.14)] text-[#6ea8cc]">Trending</span>}
                                  {prod.is_customizable && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(127,198,164,0.14)] text-[#7fc6a4]">Custom</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleProductFeatureToggle(prod.id, prod.is_featured)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${prod.is_featured ? 'bg-[rgba(185,154,100,0.2)] text-[#b99a64]' : 'text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)]'}`}
                                    title={prod.is_featured ? 'Unfeature' : 'Feature'}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenProductForm(prod)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ type: 'product', id: prod.id })}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                INQUIRIES SECTION
            -------------------------------------------- */}
            {activeSection === 'inquiries' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-serif text-2xl text-white mb-0.5">Customer Inquiries</h2>
                    <p className="text-[0.78rem] text-[#5a4f44]">{pendingInquiries} pending � {inquiries.length} total</p>
                  </div>
                  {/* Filter tabs */}
                  <div className="flex gap-1.5">
                    {['all', 'pending', 'replied', 'closed'].map(f => (
                      <button key={f} className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wide text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors capitalize">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[rgba(185,154,100,0.1)] bg-[#1a1713]">
                          {['Customer', 'Product', 'Message', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[0.6rem] font-bold uppercase tracking-widest text-[#5a4f44] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-[0.78rem] text-[#4a3f35] italic">No inquiries yet.</td></tr>
                        ) : inquiries.map(inq => (
                          <tr key={inq.id} className="border-b border-[rgba(185,154,100,0.06)] hover:bg-[rgba(185,154,100,0.03)] transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[#d4c8b7]">{inq.name}</p>
                              <p className="text-[0.62rem] text-[#5a4f44]">{inq.email || inq.phone || '�'}</p>
                            </td>
                            <td className="px-4 py-3">
                              {inq.product ? (
                                <Link href={`/product/${inq.product.slug}`} target="_blank" className="text-[#b99a64] hover:underline truncate max-w-[120px] block">
                                  {inq.product.name}
                                </Link>
                              ) : <span className="text-[#5a4f44] italic">General</span>}
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className="text-[#9a8a76] line-clamp-2 leading-relaxed">{inq.message}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-[rgba(185,154,100,0.1)] text-[#b99a64] uppercase">{inq.type || 'form'}</span>
                            </td>
                            <td className="px-4 py-3 text-[#5a4f44] whitespace-nowrap">{new Date(inq.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase ${
                                inq.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                                inq.status === 'replied' ? 'bg-emerald-900/30 text-emerald-400' :
                                'bg-zinc-800 text-zinc-400'
                              }`}>{inq.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {inq.status === 'pending' && (
                                  <button
                                    onClick={() => handleInquiryStatus(inq.id, 'replied')}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                                    title="Mark replied"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {inq.status !== 'closed' && (
                                  <button
                                    onClick={() => handleInquiryStatus(inq.id, 'closed')}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors"
                                    title="Close"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                MODERATION SECTION
            -------------------------------------------- */}
            {activeSection === 'moderation' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-white mb-0.5">Moderation Portal</h2>
                  <p className="text-[0.78rem] text-[#5a4f44]">{reviews.length} reviews � {comments.length} comments awaiting approval.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Pending Reviews */}
                  <div className="space-y-3">
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44] flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-[#b99a64]" />
                      Pending Reviews ({reviews.length})
                    </h3>
                    {reviews.length === 0 ? (
                      <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-6 text-center text-[0.72rem] text-[#4a3f35] italic">All caught up.</div>
                    ) : reviews.map(rev => (
                      <div key={rev.id} className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.65rem] text-[#5a4f44] uppercase tracking-wider">{rev.product?.name}</p>
                            <p className="text-[0.78rem] font-semibold text-[#d4c8b7]">{rev.title || 'Client review'}</p>
                            <p className="text-[0.65rem] text-[#5a4f44]">By {rev.user_name} � {new Date(rev.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex text-amber-400 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-[#3a3028]'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[0.75rem] text-[#9a8a76] leading-relaxed bg-[#1a1713] p-3 rounded-lg">{rev.comment}</p>
                        <div className="flex justify-end gap-2 pt-1">
                          <button onClick={() => handleReviewAction(rev.id, 'reject')} className="px-3 py-1.5 border border-red-800/50 text-red-400 hover:bg-red-900/20 text-[0.65rem] font-bold rounded-lg uppercase transition-colors">Reject</button>
                          <button onClick={() => handleReviewAction(rev.id, 'approve')} className="px-3 py-1.5 bg-emerald-600 text-white text-[0.65rem] font-bold rounded-lg uppercase hover:bg-emerald-500 transition-colors flex items-center gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Approved Reviews table */}
                    {approvedReviews.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44] mb-3">Live Reviews ({approvedReviews.length})</h3>
                        <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl overflow-hidden">
                          {approvedReviews.slice(0, 8).map((rev, i) => (
                            <div key={rev.id} className={`flex items-center gap-3 px-4 py-3 ${i < approvedReviews.length - 1 ? 'border-b border-[rgba(185,154,100,0.06)]' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-[0.72rem] font-semibold text-[#c8b48c] truncate">{rev.product?.name}</p>
                                <p className="text-[0.62rem] text-[#5a4f44]">{rev.user_name} � {Array.from({length: rev.rating}).map(() => '?').join('')}</p>
                              </div>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'review', id: rev.id })}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0"
                                title="Remove review"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pending Comments */}
                  <div className="space-y-3">
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44] flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#b99a64]" />
                      Pending Comments ({comments.length})
                    </h3>
                    {comments.length === 0 ? (
                      <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-6 text-center text-[0.72rem] text-[#4a3f35] italic">All caught up.</div>
                    ) : comments.map(cmt => (
                      <div key={cmt.id} className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-3">
                        <div>
                          <p className="text-[0.65rem] text-[#5a4f44] uppercase tracking-wider">{cmt.product?.name}</p>
                          <p className="text-[0.65rem] text-[#5a4f44]">{cmt.user_name} � {new Date(cmt.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-[0.75rem] text-[#9a8a76] leading-relaxed bg-[#1a1713] p-3 rounded-lg">{cmt.comment}</p>
                        {replyingCommentId === cmt.id ? (
                          <form onSubmit={e => handleCuratorReply(e, cmt)} className="space-y-2 border-t border-[rgba(185,154,100,0.08)] pt-3">
                            <label className="text-[0.6rem] font-bold uppercase text-[#b99a64] tracking-widest">Curator Reply</label>
                            <textarea
                              required value={curatorReplyText}
                              onChange={e => setCuratorReplyText(e.target.value)}
                              rows={3} placeholder="Write your reply�"
                              className="w-full p-3 border border-[rgba(185,154,100,0.15)] rounded-lg text-xs bg-[#1a1713] text-[#d4c8b7] focus:outline-none focus:border-[#b99a64] resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setReplyingCommentId(null); setCuratorReplyText(''); }} className="px-3 py-1.5 text-[0.65rem] font-bold text-[#5a4f44] uppercase hover:text-[#9a8a76]">Cancel</button>
                              <button type="submit" disabled={loading} className="px-4 py-1.5 bg-[#b99a64] text-[#090807] text-[0.65rem] font-bold rounded-lg uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-50">Post & Approve</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-end gap-2 pt-1 border-t border-[rgba(185,154,100,0.08)]">
                            <button onClick={() => handleCommentAction(cmt.id, 'reject')} className="px-3 py-1.5 border border-red-800/50 text-red-400 hover:bg-red-900/20 text-[0.65rem] font-bold rounded-lg uppercase transition-colors">Reject</button>
                            <button onClick={() => setReplyingCommentId(cmt.id)} className="px-3 py-1.5 border border-[rgba(185,154,100,0.3)] text-[#b99a64] text-[0.65rem] font-bold rounded-lg uppercase hover:bg-[rgba(185,154,100,0.08)] transition-colors">Reply</button>
                            <button onClick={() => handleCommentAction(cmt.id, 'approve')} className="px-3 py-1.5 bg-emerald-600 text-white text-[0.65rem] font-bold rounded-lg uppercase hover:bg-emerald-500 transition-colors flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                BLOG CMS SECTION
            -------------------------------------------- */}
            {activeSection === 'blog' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-serif text-2xl text-white mb-0.5">Blog CMS</h2>
                    <p className="text-[0.78rem] text-[#5a4f44]">{blogPosts.filter(b => b.is_published).length} published � {blogPosts.filter(b => !b.is_published).length} drafts</p>
                  </div>
                  <button
                    onClick={() => handleOpenBlogForm(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#b99a64] text-[#090807] text-[0.72rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4b87a] transition-colors flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Article
                  </button>
                </div>

                <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[rgba(185,154,100,0.1)] bg-[#1a1713]">
                          {['Post', 'Category', 'Reading time', 'Tags', 'Date', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[0.6rem] font-bold uppercase tracking-widest text-[#5a4f44] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {blogPosts.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-[0.78rem] text-[#4a3f35] italic">No blog posts yet.</td></tr>
                        ) : blogPosts.map(post => {
                          const img = post.featured_image;
                          return (
                            <tr key={post.id} className="border-b border-[rgba(185,154,100,0.06)] hover:bg-[rgba(185,154,100,0.03)] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {img && <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border border-[rgba(185,154,100,0.12)] flex-shrink-0" />}
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#d4c8b7] truncate max-w-[200px]">{post.title}</p>
                                    <p className="text-[0.62rem] text-[#5a4f44]">/{post.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#9a8a76]">{post.category?.name || '�'}</td>
                              <td className="px-4 py-3 text-[#5a4f44]">{post.reading_time || 5} min</td>
                              <td className="px-4 py-3 max-w-[120px] truncate text-[#5a4f44]">{post.tags?.join(', ') || '�'}</td>
                              <td className="px-4 py-3 text-[#5a4f44] whitespace-nowrap">{new Date(post.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase ${post.is_published ? 'bg-emerald-900/30 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                  {post.is_published ? 'Live' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Link href={`/blog/${post.slug}`} target="_blank" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button onClick={() => handleOpenBlogForm(post)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors">
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setDeleteConfirm({ type: 'blog', id: post.id })} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-red-400 hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                USERS SECTION
            -------------------------------------------- */}
            {activeSection === 'users' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-2xl text-white mb-0.5">User Management</h2>
                  <p className="text-[0.78rem] text-[#5a4f44]">{profiles.length} registered profiles � {profiles.filter(p => p.role === 'admin').length} admins</p>
                </div>

                <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[rgba(185,154,100,0.1)] bg-[#1a1713]">
                          {['User ID', 'Role', 'Registered', 'Last Updated', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[0.6rem] font-bold uppercase tracking-widest text-[#5a4f44] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-[0.78rem] text-[#4a3f35] italic">No profiles found.</td></tr>
                        ) : profiles.map(p => (
                          <tr key={p.id} className="border-b border-[rgba(185,154,100,0.06)] hover:bg-[rgba(185,154,100,0.03)] transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-mono text-[0.65rem] text-[#7a6a56] truncate max-w-[200px]">{p.id}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase ${p.role === 'admin' ? 'bg-[rgba(185,154,100,0.18)] text-[#b99a64]' : 'bg-zinc-800 text-zinc-400'}`}>
                                {p.role || 'user'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#5a4f44] whitespace-nowrap">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : '�'}
                            </td>
                            <td className="px-4 py-3 text-[#5a4f44] whitespace-nowrap">
                              {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '�'}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={p.role || 'user'}
                                onChange={e => handleRoleChange(p.id, e.target.value as 'user' | 'admin')}
                                className="px-2 py-1.5 bg-[#1a1713] border border-[rgba(185,154,100,0.15)] text-[#9a8a76] text-[0.65rem] rounded-lg focus:outline-none focus:border-[#b99a64]"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {/* -------------------------------------------
                SITE SETTINGS SECTION
            -------------------------------------------- */}
            {activeSection === 'settings' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-2xl text-white mb-0.5">Site Settings</h2>
                  <p className="text-[0.78rem] text-[#5a4f44]">Manage site-wide configuration and navigation.</p>
                </div>

                {/* Settings sub-tabs */}
                <div className="flex gap-1.5 p-1 bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl w-fit">
                  {(['general', 'seo', 'notifications'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setSettingsTab(t)}
                      className={`px-4 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-wide transition-all ${settingsTab === t ? 'bg-[rgba(185,154,100,0.18)] text-[#b99a64]' : 'text-[#5a4f44] hover:text-[#9a8a76]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {settingsTab === 'general' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5 space-y-4">
                      <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44]">Gallery Info</h3>
                      {[
                        { label: 'Gallery Name', placeholder: 'Chandan Art Gallery', type: 'text' },
                        { label: 'Contact Email', placeholder: 'chandanartgallery919@gmail.com', type: 'email' },
                        { label: 'WhatsApp Number', placeholder: '+91 XXXXXXXXXX', type: 'text' },
                        { label: 'Business Address', placeholder: 'New Delhi, India', type: 'text' },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5a4f44] block mb-1.5">{f.label}</label>
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] text-xs rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]"
                          />
                        </div>
                      ))}
                      <p className="text-[0.65rem] text-[#4a3f35] italic">Note: These fields are for reference. Update your actual environment variables to apply changes.</p>
                    </div>

                    <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5 space-y-4">
                      <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44]">Navigation Links</h3>
                      {[
                        { label: 'View Shop', href: '/shop' },
                        { label: 'View Blog', href: '/blog' },
                        { label: 'View About', href: '/about' },
                        { label: 'View Contact', href: '/contact' },
                        { label: 'View FAQ', href: '/faq' },
                        { label: 'Privacy Policy', href: '/privacy' },
                        { label: 'Terms of Service', href: '/terms' },
                        { label: 'Returns', href: '/returns' },
                      ].map(lnk => (
                        <Link
                          key={lnk.href}
                          href={lnk.href}
                          target="_blank"
                          className="flex items-center justify-between py-2 border-b border-[rgba(185,154,100,0.06)] last:border-0 text-[0.75rem] text-[#9a8a76] hover:text-[#b99a64] transition-colors group"
                        >
                          <span>{lnk.label}</span>
                          <span className="flex items-center gap-1 text-[#5a4f44] group-hover:text-[#b99a64]">
                            <span className="text-[0.62rem]">{lnk.href}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === 'seo' && (
                  <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5 space-y-4 max-w-xl">
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44]">Global SEO Defaults</h3>
                    {[
                      { label: 'Site Title', placeholder: 'Chandan Art Gallery | Luxury Custom Framing�' },
                      { label: 'Meta Description', placeholder: 'Curated collection of handcrafted wood photo frames�' },
                      { label: 'OG Image URL', placeholder: 'https://�' },
                      { label: 'Canonical Domain', placeholder: 'https://chandanartgallery.com' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-[0.62rem] font-bold uppercase tracking-widest text-[#5a4f44] block mb-1.5">{f.label}</label>
                        <input
                          type="text"
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] text-xs rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]"
                        />
                      </div>
                    ))}
                    <p className="text-[0.65rem] text-[#4a3f35] italic">Apply these changes in <code className="text-[#7a6a56]">app/layout.tsx</code> metadata export.</p>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="bg-[#161310] border border-[rgba(185,154,100,0.1)] rounded-xl p-5 space-y-4 max-w-xl">
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5a4f44]">Email Notifications</h3>
                    {[
                      { label: 'New Inquiry Alert', desc: 'Receive an email when a contact form is submitted', enabled: true },
                      { label: 'New Review Pending', desc: 'Notify when a review is awaiting moderation', enabled: false },
                      { label: 'WhatsApp Click Alert', desc: 'Log WhatsApp checkout events to email daily', enabled: false },
                    ].map(n => (
                      <div key={n.label} className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(185,154,100,0.06)] last:border-0">
                        <div>
                          <p className="text-[0.75rem] font-semibold text-[#c8b48c]">{n.label}</p>
                          <p className="text-[0.65rem] text-[#5a4f44]">{n.desc}</p>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative flex-shrink-0 cursor-pointer ${n.enabled ? 'bg-[#b99a64]' : 'bg-[#2a2520]'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${n.enabled ? 'left-[calc(100%-1.1rem)]' : 'left-0.5'}`} />
                        </div>
                      </div>
                    ))}
                    <p className="text-[0.65rem] text-[#4a3f35] italic">Configure via <code className="text-[#7a6a56]">RESEND_API_KEY</code> in your environment variables.</p>
                  </div>
                )}
              </div>
            )}




          </div>{/* end p-6 */}
        </main>
      </div>{/* end main content */}

      {/* ═══════════════════════════════════════════
          DELETE CONFIRM MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/70 z-[60]" />
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#161310] border border-[rgba(185,154,100,0.2)] rounded-2xl shadow-2xl z-[61] p-6"
            >
              <h4 className="font-serif text-xl text-white mb-2">Confirm Deletion</h4>
              <p className="text-[0.78rem] text-[#7a6a56] mb-6 leading-relaxed">
                This action is permanent and cannot be undone. Are you sure you want to proceed?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-[rgba(185,154,100,0.15)] rounded-xl text-xs font-bold text-[#7a6a56] uppercase hover:text-[#b99a64] transition-colors"
                >Cancel</button>
                <button onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-red-500 transition-colors"
                >Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════════
          BLOG MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBlogModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}}
              onClick={() => setShowBlogModal(false)}
              className="fixed inset-0 bg-black z-50" />
            <motion.div initial={{opacity:0,scale:0.97,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:16}}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#161310] border border-[rgba(185,154,100,0.18)] rounded-2xl shadow-2xl z-[51] p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl text-white">{editingBlogPost ? 'Edit Article' : 'New Article'}</h3>
                  <p className="text-[0.65rem] text-[#5a4f44] uppercase tracking-widest mt-0.5">Blog CMS</p>
                </div>
                <button onClick={() => setShowBlogModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBlogSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Title *</label>
                    <input type="text" required value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="Article title"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Slug (auto if blank)</label>
                    <input type="text" value={blogSlug} onChange={e => setBlogSlug(e.target.value)} placeholder="url-slug"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Content *</label>
                  <textarea required value={blogContent} onChange={e => setBlogContent(e.target.value)} rows={7}
                    placeholder="Full article text (separate paragraphs with blank lines)…"
                    className="w-full p-3 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] leading-relaxed resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Category</label>
                    <select value={blogCategoryId} onChange={e => setBlogCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]">
                      {blogCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Reading Time (min)</label>
                    <input type="number" min={1} value={blogReadingTime} onChange={e => setBlogReadingTime(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Featured Image URL</label>
                    <input type="url" value={blogFeaturedImage} onChange={e => setBlogFeaturedImage(e.target.value)} placeholder="https://…"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Tags (comma separated)</label>
                    <input type="text" value={blogTags} onChange={e => setBlogTags(e.target.value)} placeholder="home decor, frames, tips"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">SEO Title</label>
                    <input type="text" value={blogSeoTitle} onChange={e => setBlogSeoTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">SEO Description</label>
                    <input type="text" value={blogSeoDescription} onChange={e => setBlogSeoDescription(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={blogIsPublished} onChange={e => setBlogIsPublished(e.target.checked)} className="accent-[#b99a64] w-4 h-4 rounded" />
                  <span className="text-[0.75rem] font-semibold text-[#c8b48c]">Publish immediately (unchecked = draft)</span>
                </label>

                <div className="flex gap-3 pt-2 border-t border-[rgba(185,154,100,0.1)]">
                  <button type="button" onClick={() => setShowBlogModal(false)} className="flex-1 py-2.5 border border-[rgba(185,154,100,0.15)] rounded-xl text-xs font-bold text-[#7a6a56] uppercase hover:text-[#b99a64] transition-colors">Discard</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[#b99a64] text-[#090807] rounded-xl text-xs font-bold uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
                    {loading ? 'Saving…' : editingBlogPost ? 'Update Article' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════════
          PRODUCT MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}}
              onClick={() => setShowProductModal(false)}
              className="fixed inset-0 bg-black z-50" />
            <motion.div initial={{opacity:0,scale:0.97,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:16}}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#161310] border border-[rgba(185,154,100,0.18)] rounded-2xl shadow-2xl z-[51] p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl text-white">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                  <p className="text-[0.65rem] text-[#5a4f44] uppercase tracking-widest mt-0.5">Art Inventory</p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5a4f44] hover:text-[#b99a64] hover:bg-[rgba(185,154,100,0.08)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Artwork Name *</label>
                    <input required type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Classic Walnut Frame"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">SKU *</label>
                    <input required type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="CAG-WF-001"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Short Description *</label>
                  <input required type="text" value={prodShortDescription} onChange={e => setProdShortDescription(e.target.value)} placeholder="1-line storefront description"
                    className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                </div>

                <div>
                  <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Full Description</label>
                  <textarea value={prodDescription} onChange={e => setProdDescription(e.target.value)} rows={4}
                    placeholder="Detailed artwork story and specifications…"
                    className="w-full p-3 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] resize-none" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Base Price (INR) *</label>
                    <input required type="number" value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Category</label>
                    <select value={prodCategoryId} onChange={e => setProdCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Weight</label>
                    <input type="text" value={prodWeight} onChange={e => setProdWeight(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                </div>

                {/* Gallery images */}
                <div className="border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.6rem] font-bold uppercase text-[#5a4f44]">Gallery Images</label>
                    <button type="button" onClick={() => setGalleryImages([...galleryImages, ''])}
                      className="text-[0.65rem] font-bold text-[#b99a64] hover:underline">+ Add Image</button>
                  </div>
                  {galleryImages.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="url" value={url} placeholder="Image URL (first = primary)"
                        onChange={e => { const u=[...galleryImages]; u[i]=e.target.value; setGalleryImages(u); if(i===0) setProdImageUrl(e.target.value); }}
                        className="flex-1 px-3 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                      <input type="file" accept="image/*" className="text-[0.65rem] text-[#7a6a56] max-w-[120px]"
                        onChange={async e => {
                          const file = e.target.files?.[0]; if (!file) return;
                          try { setUploadingImage(true);
                            const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'product-images');
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            const r = await res.json(); if (!res.ok) throw new Error(r.error);
                            const u=[...galleryImages]; u[i]=r.publicUrl; setGalleryImages(u);
                            if(i===0) setProdImageUrl(r.publicUrl);
                            addToast('Image uploaded.', 'success');
                          } catch(err:any) { addToast(err.message||'Upload failed','error'); }
                          finally { setUploadingImage(false); }
                        }} />
                      {galleryImages.length > 1 && (
                        <button type="button" onClick={() => setGalleryImages(galleryImages.filter((_,j)=>j!==i))} className="text-red-400 font-bold px-1">×</button>
                      )}
                    </div>
                  ))}
                  {uploadingImage && <p className="text-[0.65rem] text-[#b99a64] animate-pulse">Uploading…</p>}
                </div>

                {/* Dimension options */}
                <div className="border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.6rem] font-bold uppercase text-[#5a4f44]">Dimension Options</label>
                    <button type="button" onClick={() => setSizesList([...sizesList, { value:'', modifier:0, label:'', tag:'Standard' }])}
                      className="text-[0.65rem] font-bold text-[#b99a64] hover:underline">+ Add Size</button>
                  </div>
                  {sizesList.map((sz, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                      <input type="text" value={sz.label||''} onChange={e=>{const u=[...sizesList];u[i]={...u[i],label:e.target.value};setSizesList(u);}} placeholder="Label"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="text" required value={sz.value} onChange={e=>{const u=[...sizesList];u[i]={...u[i],value:e.target.value};setSizesList(u);}} placeholder="12 x 15 inches"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="text" value={sz.tag||''} onChange={e=>{const u=[...sizesList];u[i]={...u[i],tag:e.target.value};setSizesList(u);}} placeholder="Tag"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="number" value={sz.modifier} onChange={e=>{const u=[...sizesList];u[i]={...u[i],modifier:Number(e.target.value)};setSizesList(u);}} placeholder="₹ mod"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] text-[0.72rem]" />
                      {sizesList.length > 1 && (
                        <button type="button" onClick={() => setSizesList(sizesList.filter((_,j)=>j!==i))} className="text-red-400 font-bold text-sm">×</button>
                      )}
                    </div>
                  ))}
                </div>


                {/* Materials */}
                <div className="border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.6rem] font-bold uppercase text-[#5a4f44]">Frame Materials</label>
                    <button type="button" onClick={() => setMaterialsList([...materialsList, { label:'', value:'', tag:'Natural', modifier:0 }])}
                      className="text-[0.65rem] font-bold text-[#b99a64] hover:underline">+ Add Material</button>
                  </div>
                  {materialsList.map((mat, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2">
                      <input type="text" required value={mat.label} onChange={e=>{const u=[...materialsList];u[i]={...u[i],label:e.target.value};setMaterialsList(u);}} placeholder="Pine Wood"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="text" required value={mat.value} onChange={e=>{const u=[...materialsList];u[i]={...u[i],value:e.target.value};setMaterialsList(u);}} placeholder="Solid Pine Wood"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="text" value={mat.tag} onChange={e=>{const u=[...materialsList];u[i]={...u[i],tag:e.target.value};setMaterialsList(u);}} placeholder="Tag"
                        className="px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <div className="flex gap-2">
                        <input type="number" value={mat.modifier} onChange={e=>{const u=[...materialsList];u[i]={...u[i],modifier:Number(e.target.value)};setMaterialsList(u);}} placeholder="₹"
                          className="flex-1 px-2 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] text-[0.72rem]" />
                        {materialsList.length > 1 && (
                          <button type="button" onClick={() => setMaterialsList(materialsList.filter((_,j)=>j!==i))} className="text-red-400 font-bold px-1">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Colors */}
                <div className="border border-[rgba(185,154,100,0.1)] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.6rem] font-bold uppercase text-[#5a4f44]">Color Finishes</label>
                    <button type="button" onClick={() => setColorsList([...colorsList, { label:'', modifier:0 }])}
                      className="text-[0.65rem] font-bold text-[#b99a64] hover:underline">+ Add Color</button>
                  </div>
                  {colorsList.map((col, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" required value={col.label} onChange={e=>{const u=[...colorsList];u[i]={...u[i],label:e.target.value};setColorsList(u);}} placeholder="Walnut Brown"
                        className="flex-1 px-3 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35] text-[0.72rem]" />
                      <input type="number" value={col.modifier} onChange={e=>{const u=[...colorsList];u[i]={...u[i],modifier:Number(e.target.value)};setColorsList(u);}} placeholder="₹ mod"
                        className="w-24 px-3 py-2 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] text-[0.72rem]" />
                      {colorsList.length > 1 && (
                        <button type="button" onClick={() => setColorsList(colorsList.filter((_,j)=>j!==i))} className="text-red-400 font-bold px-1">×</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags & SEO */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">Tags (comma separated)</label>
                    <input type="text" value={prodTags} onChange={e => setProdTags(e.target.value)} placeholder="walnut, frame, modern"
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64] placeholder-[#4a3f35]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">SEO Title</label>
                    <input type="text" value={prodSeoTitle} onChange={e => setProdSeoTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold uppercase text-[#5a4f44] mb-1.5">SEO Description</label>
                    <input type="text" value={prodSeoDescription} onChange={e => setProdSeoDescription(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1713] border border-[rgba(185,154,100,0.12)] text-[#d4c8b7] rounded-lg focus:outline-none focus:border-[#b99a64]" />
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-4 py-2">
                  {[
                    { label: 'Customizable', val: prodIsCustomizable, set: setProdIsCustomizable },
                    { label: 'Featured', val: prodIsFeatured, set: setProdIsFeatured },
                    { label: 'Trending', val: prodIsTrending, set: setProdIsTrending },
                    { label: 'Best Seller', val: prodIsBestSeller, set: setProdIsBestSeller },
                  ].map(f => (
                    <label key={f.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={f.val} onChange={e => f.set(e.target.checked)} className="accent-[#b99a64] w-4 h-4 rounded" />
                      <span className="text-[0.75rem] font-semibold text-[#c8b48c]">{f.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-2 border-t border-[rgba(185,154,100,0.1)]">
                  <button type="button" onClick={() => setShowProductModal(false)}
                    className="flex-1 py-2.5 border border-[rgba(185,154,100,0.15)] rounded-xl text-xs font-bold text-[#7a6a56] uppercase hover:text-[#b99a64] transition-colors">
                    Discard
                  </button>
                  <button type="submit" disabled={savingProduct || uploadingImage || !prodName || !prodSku}
                    className="flex-1 py-2.5 bg-[#b99a64] text-[#090807] rounded-xl text-xs font-bold uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
                    {savingProduct ? 'Saving…' : editingProduct ? 'Update Product' : 'Launch Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
