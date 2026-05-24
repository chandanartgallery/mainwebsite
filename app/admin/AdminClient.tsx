'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import {
  parseMaterials,
  parseColors,
  serializeMaterials,
  serializeColors,
  DEFAULT_MATERIALS,
  DEFAULT_COLORS,
  type MaterialOption,
  type ColorOption,
} from '@/lib/productOptions';
import {
  DEFAULT_PRODUCT_CONFIG,
  parseProductConfig,
  parseSizesExtended,
  serializeSizesExtended,
  type ProductPageConfig,
  type ExtendedSizeOption,
} from '@/lib/productConfig';
import { 
  Sparkles, TrendingUp, ShoppingBag, MessageSquare, 
  Check, Trash2, Plus, Edit, PlusCircle, CheckSquare, 
  AlertCircle, Star, MessageCircle, BarChart3, ListOrdered 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminClientProps {
  categories: any[];
  initialProducts: any[];
  initialInquiries: any[];
  initialReviews: any[];
  initialComments: any[];
  events: any[];
  initialBlogPosts: any[];
  blogCategories: any[];
}

export default function AdminClient({ 
  categories, initialProducts, initialInquiries, 
  initialReviews, initialComments, events,
  initialBlogPosts, blogCategories
}: AdminClientProps) {
  const { addToast } = useUIStore();

  // Tab control state
  const [activeTab, setActiveTab] = useState<'analytics' | 'inquiries' | 'inventory' | 'moderation' | 'blog'>('analytics');

  // Interactive lists states
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [comments, setComments] = useState<any[]>(initialComments);

  // CRUD product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Form fields
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'blog'; id: string } | null>(null);

  // Comment Curator Reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [curatorReplyText, setCuratorReplyText] = useState('');

  // Blog states
  const [blogPosts, setBlogPosts] = useState<any[]>(initialBlogPosts);
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

  // Operations loading (split so image upload doesn't block save)
  const [loading, setLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Process Analytics metrics dynamically
  const totalViews = events.filter(e => e.event_type === 'page_view' || e.event_type === 'product_click').length;
  const totalClicks = events.filter(e => e.event_type === 'whatsapp_click').length;
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Process chart records
  const trafficData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const matchViews = events.filter(e => {
      const eDate = new Date(e.created_at);
      return eDate.toDateString() === d.toDateString() && (e.event_type === 'page_view' || e.event_type === 'product_click');
    }).length;
    const matchClicks = events.filter(e => {
      const eDate = new Date(e.created_at);
      return eDate.toDateString() === d.toDateString() && e.event_type === 'whatsapp_click';
    }).length;

    return { date: dateStr, views: matchViews, clicks: matchClicks };
  }).reverse();

  // Devices metrics aggregation
  const devicesMap: any = {};
  events.forEach(e => {
    if (e.device) {
      devicesMap[e.device] = (devicesMap[e.device] || 0) + 1;
    }
  });
  const deviceData = Object.keys(devicesMap).map(k => ({ name: k, value: devicesMap[k] }));
  if (deviceData.length === 0) {
    deviceData.push({ name: 'Desktop Client', value: 1 });
  }

  // Searches aggregation
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

  // Inquiry actions
  const handleInquiryStatus = async (id: string, newStatus: 'replied' | 'closed') => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update status');

      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      addToast('Inquiry status updated.', 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Failed to update inquiry status.', 'error');
    }
  };

  // Review approval moderation
  const handleReviewAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', id, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Review action failed');
      setReviews(reviews.filter(r => r.id !== id));
      addToast(action === 'approve' ? 'Review approved.' : 'Review removed.', 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Review action failed.', 'error');
    }
  };

  // Comment approval moderation
  const handleCommentAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comment', id, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Comment action failed');
      setComments(comments.filter(c => c.id !== id));
      addToast(action === 'approve' ? 'Comment approved.' : 'Comment removed.', 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Comment action failed.', 'error');
    }
  };

  // Curator Reply directly on comment moderation card
  const handleCuratorReply = async (e: React.FormEvent, comment: any) => {
    e.preventDefault();
    if (!curatorReplyText.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          id: comment.id,
          action: 'reply',
          reply: curatorReplyText,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to post reply');

      setComments(comments.filter(c => c.id !== comment.id));
      setCuratorReplyText('');
      setReplyingCommentId(null);
      addToast('Curator reply posted and comment approved.', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to post reply.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Product Inventory CRUD Actions
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
      setProdName('');
      setProdSku('');
      setProdDescription('');
      setProdShortDescription('');
      setProdPrice(1500);
      setSizesList([{ value: '12 x 15 inches', modifier: 0, label: '12 x 15 in', tag: 'Standard' }]);
      setMaterialsList([...DEFAULT_MATERIALS]);
      setColorsList([...DEFAULT_COLORS]);
      setPageConfig({ ...DEFAULT_PRODUCT_CONFIG });
      setGalleryImages(['']);
      setProdWeight('1.5 kg');
      setProdCategoryId(categories[0]?.id || '');
      setProdIsCustomizable(true);
      setProdIsFeatured(false);
      setProdIsTrending(false);
      setProdIsBestSeller(false);
      setProdTags('');
      setProdSeoTitle('');
      setProdSeoDescription('');
      setProdImageUrl('');
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

      const tagsArray = prodTags.split(',').map((t) => t.trim()).filter(Boolean);

      const productPayload = {
        name: prodName,
        slug: pSlug,
        sku: prodSku || null,
        description: prodDescription,
        short_description: prodShortDescription,
        price: prodPrice,
        dimensions: serializeSizesExtended(sizesList),
        material: serializeMaterials(materialsList),
        color: serializeColors(colorsList),
        weight: prodWeight,
        category_id: prodCategoryId || null,
        tags: tagsArray,
        is_customizable: prodIsCustomizable,
        is_featured: prodIsFeatured,
        is_trending: prodIsTrending,
        is_best_seller: prodIsBestSeller,
        seo_title: prodSeoTitle || null,
        seo_description: prodSeoDescription || null,
        product_config: pageConfig,
      };

      const imageUrls = galleryImages.map((u) => u.trim()).filter(Boolean);
      if (imageUrls.length === 0 && prodImageUrl) imageUrls.push(prodImageUrl);

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            product: productPayload,
            imageUrls,
            previousSlug: editingProduct.slug,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Update failed');
        addToast('Product modified successfully.', 'success');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: productPayload, imageUrls }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Create failed');
        addToast('New bespoke product launched.', 'success');
      }

      await refreshProducts();
      setShowProductModal(false);
    } catch (err: any) {
      console.error(err);
      addToast('Product action failed: ' + err.message, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleProductDelete = async (id: string) => {
    setDeleteConfirm({ type: 'product', id });
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
        setProducts(products.filter((p) => p.id !== id));
        addToast('Product retired successfully.', 'success');
      } else {
        const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Delete failed');
        setBlogPosts(blogPosts.filter((b) => b.id !== id));
        addToast('Chronicle retired successfully.', 'success');
      }
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Delete failed.', 'error');
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
      if (!res.ok) throw new Error(result.error || 'Failed to update featured status');

      setProducts(products.map((p) => (p.id === productId ? { ...p, is_featured: newFeatured } : p)));
      addToast(newFeatured ? 'Product marked as featured.' : 'Featured flag removed.', 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Failed to update featured status.', 'error');
    }
  };

  // Blog Chronicles CRUD Actions
  const handleOpenBlogForm = (post: any | null = null) => {
    setEditingBlogPost(post);
    if (post) {
      setBlogTitle(post.title);
      setBlogSlug(post.slug);
      setBlogContent(post.content || '');
      setBlogCategoryId(post.category_id || blogCategories[0]?.id || '');
      setBlogReadingTime(post.reading_time || 5);
      setBlogFeaturedImage(post.featured_image || '');
      setBlogTags(post.tags ? post.tags.join(', ') : '');
      setBlogSeoTitle(post.seo_title || '');
      setBlogSeoDescription(post.seo_description || '');
      setBlogIsPublished(post.is_published ?? true);
    } else {
      setBlogTitle('');
      setBlogSlug('');
      setBlogContent('');
      setBlogCategoryId(blogCategories[0]?.id || '');
      setBlogReadingTime(5);
      setBlogFeaturedImage('');
      setBlogTags('');
      setBlogSeoTitle('');
      setBlogSeoDescription('');
      setBlogIsPublished(true);
    }
    setShowBlogModal(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const generatedSlug = blogSlug.trim() || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tagsArray = blogTags.split(',').map(t => t.trim()).filter(t => t);
      const blogPayload = {
        title: blogTitle,
        slug: generatedSlug,
        content: blogContent,
        category_id: blogCategoryId || null,
        reading_time: blogReadingTime,
        featured_image: blogFeaturedImage || null,
        tags: tagsArray,
        seo_title: blogSeoTitle || null,
        seo_description: blogSeoDescription || null,
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
        addToast('Chronicle updated successfully.', 'success');
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post: blogPayload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Create failed');
        addToast('New chronicle published.', 'success');
      }

      await refreshBlogPosts();
      setShowBlogModal(false);
    } catch (err: any) {
      console.error(err);
      addToast('Blog action failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogDelete = async (id: string) => {
    setDeleteConfirm({ type: 'blog', id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-luxury-gold font-semibold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chandan Art Gallery Curators</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-luxury-black dark:text-white uppercase tracking-wider">
            Curator Control Terminal
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1.5 border-b border-gray-100 dark:border-zinc-800/60 pb-1.5">
          {[
            { id: 'analytics', label: 'Analytics Insights', icon: BarChart3 },
            { id: 'inquiries', label: 'Inquiries Logs', icon: MessageSquare },
            { id: 'inventory', label: 'Art Inventory', icon: ShoppingBag },
            { id: 'moderation', label: 'Moderation Portal', icon: ListOrdered },
            { id: 'blog', label: 'Blog CMS', icon: Edit }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black' 
                    : 'text-gray-400 hover:text-luxury-gold'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-2" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Render Window */}
      <div className="min-h-[55vh]">
        {/* A. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stat summaries bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400 block font-bold mb-2">Total Page Views</span>
                <span className="text-4xl font-bold font-serif text-luxury-black dark:text-luxury-beige">{totalViews}</span>
                <span className="text-[10px] text-gray-400 mt-2">Active click events over last 14 days</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400 block font-bold mb-2">WhatsApp Checkouts</span>
                <span className="text-4xl font-bold font-serif text-luxury-black dark:text-luxury-beige">{totalClicks}</span>
                <span className="text-[10px] text-luxury-gold-dark mt-2 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> WhatsApp checkout intent rate
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400 block font-bold mb-2">Overall Conversion Rate</span>
                <span className="text-4xl font-bold font-serif text-luxury-black dark:text-luxury-beige">{conversionRate}%</span>
                <span className="text-[10px] text-gray-400 mt-2">Calculated visitor-to-click index</span>
              </div>
            </div>

            {/* Recharts graphs */}
            <AnalyticsCharts 
              trafficData={trafficData} 
              deviceData={deviceData} 
              topSearches={topSearches} 
            />
          </div>
        )}

        {/* B. INQUIRIES LOGS TAB */}
        {activeTab === 'inquiries' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/20">
              <h3 className="font-serif text-base text-luxury-black dark:text-white uppercase tracking-wider">WhatsApp & Form Inquiry Queue</h3>
              <span className="bg-luxury-gold/15 text-luxury-gold-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {inquiries.filter(i => i.status === 'pending').length} Action Required
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 uppercase tracking-widest font-bold bg-gray-50/20 dark:bg-zinc-950/10">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Requested Artwork</th>
                    <th className="p-4">Inquiry Summary</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 italic">No inquiries logs captured in queue.</td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-950/10 transition-colors">
                        <td className="p-4">
                          <span className="block font-bold text-luxury-charcoal dark:text-white">{inq.name}</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{inq.email || 'No email provided'}</span>
                          <span className="block text-[10px] text-gray-400">{inq.phone || 'No phone provided'}</span>
                        </td>
                        <td className="p-4">
                          {inq.product ? (
                            <Link href={`/product/${inq.product.slug}`} className="font-semibold text-luxury-gold hover:underline line-clamp-1">
                              {inq.product.name}
                            </Link>
                          ) : (
                            <span className="text-gray-400 italic">Multiple items / general inquiry</span>
                          )}
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="line-clamp-2 text-gray-500 font-sans leading-relaxed">{inq.message}</p>
                        </td>
                        <td className="p-4 text-gray-400">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            inq.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300' 
                              : inq.status === 'replied'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                          }`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {inq.status === 'pending' && (
                            <button
                              onClick={() => handleInquiryStatus(inq.id, 'replied')}
                              className="p-1.5 border border-blue-200 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              title="Mark as Replied"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {inq.status !== 'closed' && (
                            <button
                              onClick={() => handleInquiryStatus(inq.id, 'closed')}
                              className="p-1.5 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title="Resolve / Mark Closed"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* C. INVENTORY CRUD TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Launch Product button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenProductForm(null)}
                className="inline-flex items-center px-5 py-3 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-luxury-gold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Launch New Bespoke Artwork
              </button>
            </div>

            {/* Inventory Listing */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 uppercase tracking-widest font-bold bg-gray-50/20 dark:bg-zinc-950/10">
                      <th className="p-4">Artwork Details</th>
                      <th className="p-4">SKU / Code</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Specifications</th>
                      <th className="p-4">Base Price</th>
                      <th className="p-4 text-center">Status Badges</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">No products launched in active gallery database.</td>
                      </tr>
                    ) : (
                      products.map((prod) => {
                        const img = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200';
                        
                        return (
                          <tr key={prod.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-950/10 transition-colors">
                            <td className="p-4 flex items-center space-x-3.5">
                              <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-zinc-800" />
                              <div>
                                <span className="block font-bold text-luxury-charcoal dark:text-white line-clamp-1">{prod.name}</span>
                                <span className="text-[10px] text-gray-400">{prod.dimensions}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-500 uppercase font-mono">
                              {prod.sku || 'N/A'}
                            </td>
                            <td className="p-4 text-luxury-charcoal dark:text-gray-300 font-semibold">
                              {prod.category?.name || 'Unassigned'}
                            </td>
                            <td className="p-4 text-gray-400">
                              <span className="block">{prod.material}</span>
                              <span className="block text-[10px]">{prod.color}</span>
                            </td>
                            <td className="p-4 font-bold text-luxury-black dark:text-luxury-beige">
                              ₹{prod.price?.toLocaleString()}
                            </td>
                            <td className="p-4 text-center space-y-1">
                              {prod.is_customizable && (
                                <span className="inline-block bg-luxury-gold/15 text-luxury-gold-dark text-[8px] font-bold px-2 py-0.5 rounded-full uppercase mr-1">Customizable</span>
                              )}
                              {prod.is_featured && (
                                <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase mr-1">Featured</span>
                              )}
                              {prod.is_best_seller && (
                                <span className="inline-block bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Bestseller</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button
                                onClick={() => handleProductFeatureToggle(prod.id, prod.is_featured)}
                                className={`p-1.5 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                  prod.is_featured 
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-500 dark:border-yellow-950/30 dark:bg-yellow-950/20 dark:text-yellow-400' 
                                    : 'border-gray-200 dark:border-zinc-800 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
                                }`}
                                title={prod.is_featured ? 'Remove from Featured' : 'Feature this Artwork'}
                              >
                                <Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleOpenProductForm(prod)}
                                className="p-1.5 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-luxury-gold rounded-lg cursor-pointer"
                                title="Edit Specifications"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleProductDelete(prod.id)}
                                className="p-1.5 border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer"
                                title="Retire Artwork"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* D. MODERATION PORTAL TAB */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Reviews Moderation */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-luxury-black dark:text-white uppercase tracking-wider flex items-center">
                <Star className="w-4 h-4 text-luxury-gold mr-2 fill-current" />
                Pending Client Reviews ({reviews.length})
              </h3>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-6 rounded-2xl text-center text-xs text-gray-400 italic">
                    All review approvals up to date.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 p-5 rounded-2xl space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Product: {rev.product?.name}</span>
                          <h4 className="text-xs font-bold text-luxury-charcoal dark:text-white mt-0.5">{rev.title || 'Client review'}</h4>
                          <span className="text-[10px] text-gray-400">By {rev.user_name} | {new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-100 dark:text-zinc-850'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans">{rev.comment}</p>
                      
                      <div className="flex space-x-2 pt-2 justify-end border-t border-gray-50 dark:border-zinc-850">
                        <button
                          onClick={() => handleReviewAction(rev.id, 'reject')}
                          className="px-3.5 py-1.5 border border-red-100 text-red-500 hover:bg-red-50 text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReviewAction(rev.id, 'approve')}
                          className="px-3.5 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center hover:bg-emerald-600 cursor-pointer"
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comments Moderation with Curator Reply actions */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-luxury-black dark:text-white uppercase tracking-wider flex items-center">
                <MessageCircle className="w-4 h-4 text-luxury-gold mr-2" />
                Pending Discussions ({comments.length})
              </h3>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-6 rounded-2xl text-center text-xs text-gray-400 italic">
                    All discussion queries moderate.
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 p-5 rounded-2xl space-y-3 relative">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Product Q&A: {cmt.product?.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">By {cmt.user_name} | {new Date(cmt.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans bg-gray-50/50 dark:bg-zinc-950/20 p-3.5 rounded-lg border border-gray-50 dark:border-zinc-850">
                        {cmt.comment}
                      </p>

                      {replyingCommentId === cmt.id ? (
                        <form onSubmit={(e) => handleCuratorReply(e, cmt)} className="space-y-2 pt-2 border-t border-gray-50 dark:border-zinc-850">
                          <label className="block text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Curator Official Reply *</label>
                          <textarea
                            required
                            value={curatorReplyText}
                            onChange={(e) => setCuratorReplyText(e.target.value)}
                            placeholder="Write curator guidance..."
                            rows={3}
                            className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => { setReplyingCommentId(null); setCuratorReplyText(''); }}
                              className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-4.5 py-1.5 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Post reply & approve original
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex space-x-2 pt-2 justify-end border-t border-gray-50 dark:border-zinc-850">
                          <button
                            onClick={() => handleCommentAction(cmt.id, 'reject')}
                            className="px-3.5 py-1.5 border border-red-100 text-red-500 hover:bg-red-50 text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setReplyingCommentId(cmt.id)}
                            className="px-3.5 py-1.5 border border-luxury-gold text-luxury-gold-dark text-[10px] font-bold rounded-lg uppercase tracking-wide hover:bg-luxury-gold/5 cursor-pointer"
                          >
                            Reply as Curator
                          </button>
                          <button
                            onClick={() => handleCommentAction(cmt.id, 'approve')}
                            className="px-3.5 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center hover:bg-emerald-600 cursor-pointer"
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* E. BLOG CMS TAB */}
        {activeTab === 'blog' && (
          <div className="space-y-6 animate-fade-in">
            {/* Launch Article Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenBlogForm(null)}
                className="inline-flex items-center px-5 py-3 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-luxury-gold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Write New Chronicle
              </button>
            </div>

            {/* Blogs Listing Table */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 uppercase tracking-widest font-bold bg-gray-50/20 dark:bg-zinc-950/10">
                      <th className="p-4">Chronicle Info</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Reading Metric</th>
                      <th className="p-4">Tags</th>
                      <th className="p-4">Published Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
                    {blogPosts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">No chronicles created in active blog database.</td>
                      </tr>
                    ) : (
                      blogPosts.map((post: any) => {
                        const img = post.featured_image || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=200';
                        return (
                          <tr key={post.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-950/10 transition-colors">
                            <td className="p-4 flex items-center space-x-3.5">
                              <img src={img} alt="" className="w-10.5 h-10.5 object-cover rounded-lg border border-gray-100 dark:border-zinc-800" />
                              <div className="max-w-xs">
                                <span className="block font-bold text-luxury-charcoal dark:text-white line-clamp-1">{post.title}</span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">/{post.slug}</span>
                              </div>
                            </td>
                            <td className="p-4 text-luxury-charcoal dark:text-gray-300 font-semibold">
                              {post.category?.name || 'Home Decor'}
                            </td>
                            <td className="p-4 text-gray-400 font-medium">
                              {post.reading_time || 5} Min Read
                            </td>
                            <td className="p-4 text-gray-400 max-w-[120px] truncate">
                              {post.tags ? post.tags.join(', ') : 'N/A'}
                            </td>
                            <td className="p-4 text-gray-400">
                              {new Date(post.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                post.is_published
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' 
                                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {post.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button
                                onClick={() => handleOpenBlogForm(post)}
                                className="p-1.5 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-luxury-gold rounded-lg cursor-pointer"
                                title="Edit Chronicle"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleBlogDelete(post.id)}
                                className="p-1.5 border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer"
                                title="Delete Chronicle"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Launch / Edit Blog Modal */}
      <AnimatePresence>
        {showBlogModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlogModal(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-2xl z-50 p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-serif text-2xl text-luxury-black dark:text-white mb-1">
                {editingBlogPost ? 'Edit Editorial Chronicle' : 'Publish New Editorial Chronicle'}
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                Curate luxury framing stories, traditional trends, and designer guidelines.
              </p>

              <form onSubmit={handleBlogSubmit} className="space-y-4 text-xs">
                
                {/* 1. Title & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Chronicle Title *</label>
                    <input
                      type="text"
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="e.g. Traditional Wall Decor Trends"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">URL Slug (leave blank to auto-generate)</label>
                    <input
                      type="text"
                      value={blogSlug}
                      onChange={(e) => setBlogSlug(e.target.value)}
                      placeholder="traditional-wall-decor-trends"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Content */}
                <div>
                  <label className="block font-semibold uppercase text-gray-400 mb-1">Editorial Content (Separate paragraphs with blank lines) *</label>
                  <textarea
                    required
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Write the full chronicle story..."
                    rows={8}
                    className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                {/* 3. Category & Reading Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Chronicle Category *</label>
                    <select
                      value={blogCategoryId}
                      onChange={(e) => setBlogCategoryId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    >
                      {blogCategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Estimated Reading Time (Minutes) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={blogReadingTime}
                      onChange={(e) => setBlogReadingTime(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Image & Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Thumbnail/Cover Image URL</label>
                    <input
                      type="url"
                      value={blogFeaturedImage}
                      onChange={(e) => setBlogFeaturedImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Comma-separated Tags</label>
                    <input
                      type="text"
                      value={blogTags}
                      onChange={(e) => setBlogTags(e.target.value)}
                      placeholder="traditional, home decor, framing tips"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. SEO Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">SEO Title Tag (optional)</label>
                    <input
                      type="text"
                      value={blogSeoTitle}
                      onChange={(e) => setBlogSeoTitle(e.target.value)}
                      placeholder="Meta title tag"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">SEO Description Tag (optional)</label>
                    <input
                      type="text"
                      value={blogSeoDescription}
                      onChange={(e) => setBlogSeoDescription(e.target.value)}
                      placeholder="Meta description summary"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 6. Publication toggle */}
                <div className="flex space-x-6 py-2">
                  <label className="flex items-center space-x-2 text-luxury-charcoal dark:text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blogIsPublished}
                      onChange={(e) => setBlogIsPublished(e.target.checked)}
                      className="accent-luxury-gold w-4 h-4 rounded"
                    />
                    <span>Publish Immediately (If unchecked, will be saved as Draft)</span>
                  </label>
                </div>

                {/* Modal footer buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setShowBlogModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-400 uppercase cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !blogTitle || !blogContent}
                    className="flex-1 py-3 px-4 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black hover:bg-luxury-gold dark:hover:bg-luxury-beige transition-colors text-xs font-bold rounded-xl uppercase tracking-wider flex justify-center items-center cursor-pointer"
                  >
                    {editingBlogPost ? 'Update Chronicle' : 'Publish Chronicle'}
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CRUD Launch / Edit Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-2xl z-50 p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-serif text-2xl text-luxury-black dark:text-white mb-1">
                {editingProduct ? 'Edit Bespoke Artwork specifications' : 'Launch New Bespoke Artwork'}
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                Configure everything buyers see on the product page — gallery, options, labels, and trust badges.
              </p>

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                
                {/* 1. Name & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Artwork Name *</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. Classic Walnut Frame"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      placeholder="CAG-WF-009"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Short & Full Description */}
                <div>
                  <label className="block font-semibold uppercase text-gray-400 mb-1">Short Description *</label>
                  <input
                    type="text"
                    required
                    value={prodShortDescription}
                    onChange={(e) => setProdShortDescription(e.target.value)}
                    placeholder="Brief 1-sentence storefront visual prompt"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-400 mb-1">Artistic Story / Full Description</label>
                  <textarea
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Rich structural details about frame grains, Rajasthan mounting craftsmanship, and anti-glare museum acrylic specs..."
                    rows={4}
                    className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                  />
                </div>

                {/* 3. Price & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Base Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Discipline Category *</label>
                    <select
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Storefront page display — matches product detail page */}
                <div className="space-y-3 border border-luxury-gold/20 bg-luxury-gold/5 p-4 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-luxury-gold tracking-widest">Storefront page (what buyers see)</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Gold tagline above title</label>
                      <input
                        type="text"
                        value={pageConfig.tagline}
                        onChange={(e) => setPageConfig({ ...pageConfig, tagline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Story section heading</label>
                      <input
                        type="text"
                        value={pageConfig.storyTitle}
                        onChange={(e) => setPageConfig({ ...pageConfig, storyTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Dimensions label</label>
                      <input
                        type="text"
                        value={pageConfig.sectionLabels.dimensions}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            sectionLabels: { ...pageConfig.sectionLabels, dimensions: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white text-[11px] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Materials label</label>
                      <input
                        type="text"
                        value={pageConfig.sectionLabels.materials}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            sectionLabels: { ...pageConfig.sectionLabels, materials: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white text-[11px] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Colors label</label>
                      <input
                        type="text"
                        value={pageConfig.sectionLabels.colors}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            sectionLabels: { ...pageConfig.sectionLabels, colors: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pageConfig.showDimensions} onChange={(e) => setPageConfig({ ...pageConfig, showDimensions: e.target.checked })} className="accent-luxury-gold" />
                      <span className="text-xs">Show dimensions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pageConfig.showMaterials} onChange={(e) => setPageConfig({ ...pageConfig, showMaterials: e.target.checked })} className="accent-luxury-gold" />
                      <span className="text-xs">Show materials</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pageConfig.showColors} onChange={(e) => setPageConfig({ ...pageConfig, showColors: e.target.checked })} className="accent-luxury-gold" />
                      <span className="text-xs">Show colors</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Customizable = Yes text</label>
                      <input
                        type="text"
                        value={pageConfig.customizableYesText}
                        onChange={(e) => setPageConfig({ ...pageConfig, customizableYesText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Customizable = No text</label>
                      <input
                        type="text"
                        value={pageConfig.customizableNoText}
                        onChange={(e) => setPageConfig({ ...pageConfig, customizableNoText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold uppercase text-gray-400">Trust badges (3 icons below price)</label>
                      <button
                        type="button"
                        onClick={() =>
                          setPageConfig({
                            ...pageConfig,
                            trustBadges: [...pageConfig.trustBadges, { icon: 'truck', title: '', subtitle: '' }],
                          })
                        }
                        className="text-[10px] font-bold uppercase text-luxury-gold hover:underline cursor-pointer"
                      >
                        + Add badge
                      </button>
                    </div>
                    {pageConfig.trustBadges.map((badge, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <select
                          value={badge.icon}
                          onChange={(e) => {
                            const updated = [...pageConfig.trustBadges];
                            updated[index] = { ...updated[index], icon: e.target.value as typeof badge.icon };
                            setPageConfig({ ...pageConfig, trustBadges: updated });
                          }}
                          className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                        >
                          <option value="truck">Delivery</option>
                          <option value="shield">Shield</option>
                          <option value="authentic">Authentic</option>
                          <option value="heart">Heart</option>
                          <option value="star">Star</option>
                        </select>
                        <input
                          type="text"
                          value={badge.title}
                          placeholder="Title"
                          onChange={(e) => {
                            const updated = [...pageConfig.trustBadges];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setPageConfig({ ...pageConfig, trustBadges: updated });
                          }}
                          className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                        />
                        <input
                          type="text"
                          value={badge.subtitle}
                          placeholder="Subtitle"
                          onChange={(e) => {
                            const updated = [...pageConfig.trustBadges];
                            updated[index] = { ...updated[index], subtitle: e.target.value };
                            setPageConfig({ ...pageConfig, trustBadges: updated });
                          }}
                          className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                        />
                        {pageConfig.trustBadges.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPageConfig({
                                ...pageConfig,
                                trustBadges: pageConfig.trustBadges.filter((_, i) => i !== index),
                              })
                            }
                            className="text-red-500 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Featured badge text</label>
                      <input
                        type="text"
                        value={pageConfig.badgeLabels.featured}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            badgeLabels: { ...pageConfig.badgeLabels, featured: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Bestseller badge text</label>
                      <input
                        type="text"
                        value={pageConfig.badgeLabels.bestSeller}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            badgeLabels: { ...pageConfig.badgeLabels, bestSeller: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-gray-400 mb-1">Trending badge text</label>
                      <input
                        type="text"
                        value={pageConfig.badgeLabels.trending}
                        onChange={(e) =>
                          setPageConfig({
                            ...pageConfig,
                            badgeLabels: { ...pageConfig.badgeLabels, trending: e.target.value },
                          })
                        }
                        className="w-full px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950/40 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery images */}
                <div className="space-y-2 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <label className="block font-semibold uppercase text-gray-400">Product gallery images</label>
                    <button
                      type="button"
                      onClick={() => setGalleryImages([...galleryImages, ''])}
                      className="text-[10px] font-bold uppercase text-luxury-gold hover:underline cursor-pointer"
                    >
                      + Add image
                    </button>
                  </div>
                  {galleryImages.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const updated = [...galleryImages];
                          updated[index] = e.target.value;
                          setGalleryImages(updated);
                          if (index === 0) setProdImageUrl(e.target.value);
                        }}
                        placeholder="Image URL (first = primary)"
                        className="flex-grow px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="text-[10px] max-w-[120px]"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingImage(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('bucket', 'product-images');
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || 'Upload failed');
                            const updated = [...galleryImages];
                            updated[index] = result.publicUrl;
                            setGalleryImages(updated);
                            if (index === 0) setProdImageUrl(result.publicUrl);
                            addToast('Gallery image uploaded.', 'success');
                          } catch (err: any) {
                            addToast(err.message || 'Upload failed', 'error');
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                      {galleryImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                          className="text-red-500 font-bold cursor-pointer px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4. Sizes List and Price Modifiers */}
                <div className="space-y-2 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold uppercase text-gray-400">Dimension options (card label, value, tag, ₹ modifier) *</label>
                    <button
                      type="button"
                      onClick={() => setSizesList([...sizesList, { value: '', label: '', tag: 'Standard', modifier: 0 }])}
                      className="text-[10px] font-bold uppercase text-luxury-gold hover:underline cursor-pointer"
                    >
                      + Add Size Option
                    </button>
                  </div>
                  {sizesList.map((sz, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-center">
                      <input
                        type="text"
                        value={sz.label || ''}
                        onChange={(e) => {
                          const updated = [...sizesList];
                          updated[index].label = e.target.value;
                          setSizesList(updated);
                        }}
                        placeholder="Card label (12 x 15 in)"
                        className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={sz.value}
                        onChange={(e) => {
                          const updated = [...sizesList];
                          updated[index].value = e.target.value;
                          setSizesList(updated);
                        }}
                        placeholder="Value (12 x 15 inches)"
                        className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={sz.tag || ''}
                        onChange={(e) => {
                          const updated = [...sizesList];
                          updated[index].tag = e.target.value;
                          setSizesList(updated);
                        }}
                        placeholder="Tag (Standard)"
                        className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        required
                        value={sz.modifier}
                        onChange={(e) => {
                          const updated = [...sizesList];
                          updated[index].modifier = Number(e.target.value);
                          setSizesList(updated);
                        }}
                        placeholder="₹ mod"
                        className="px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      {sizesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSizesList(sizesList.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-600 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 5. Frame materials (matches product detail page) */}
                <div className="space-y-2 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold uppercase text-gray-400">Frame Wood / Material Options *</label>
                    <button
                      type="button"
                      onClick={() => setMaterialsList([...materialsList, { label: '', value: '', tag: 'Natural', modifier: 0 }])}
                      className="text-[10px] font-bold uppercase text-luxury-gold hover:underline cursor-pointer"
                    >
                      + Add Material
                    </button>
                  </div>
                  {materialsList.map((mat, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={mat.label}
                        onChange={(e) => {
                          const updated = [...materialsList];
                          updated[index].label = e.target.value;
                          setMaterialsList(updated);
                        }}
                        placeholder="Label (Pine Wood)"
                        className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={mat.value}
                        onChange={(e) => {
                          const updated = [...materialsList];
                          updated[index].value = e.target.value;
                          setMaterialsList(updated);
                        }}
                        placeholder="Value (Solid Pine Wood)"
                        className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={mat.tag}
                        onChange={(e) => {
                          const updated = [...materialsList];
                          updated[index].tag = e.target.value;
                          setMaterialsList(updated);
                        }}
                        placeholder="Tag (Natural / + ₹800)"
                        className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={mat.modifier}
                          onChange={(e) => {
                            const updated = [...materialsList];
                            updated[index].modifier = Number(e.target.value);
                            setMaterialsList(updated);
                          }}
                          placeholder="₹ mod"
                          className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                        />
                        {materialsList.length > 1 && (
                          <button type="button" onClick={() => setMaterialsList(materialsList.filter((_, i) => i !== index))} className="text-red-500 font-bold cursor-pointer">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5b. Color finish options */}
                <div className="space-y-2 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold uppercase text-gray-400">Premium Color Finish Options *</label>
                    <button
                      type="button"
                      onClick={() => setColorsList([...colorsList, { label: '', modifier: 0 }])}
                      className="text-[10px] font-bold uppercase text-luxury-gold hover:underline cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                  {colorsList.map((col, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        value={col.label}
                        onChange={(e) => {
                          const updated = [...colorsList];
                          updated[index].label = e.target.value;
                          setColorsList(updated);
                        }}
                        placeholder="e.g. Walnut Brown"
                        className="flex-grow px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        value={col.modifier}
                        onChange={(e) => {
                          const updated = [...colorsList];
                          updated[index].modifier = Number(e.target.value);
                          setColorsList(updated);
                        }}
                        placeholder="Price mod"
                        className="w-32 px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                      />
                      {colorsList.length > 1 && (
                        <button type="button" onClick={() => setColorsList(colorsList.filter((_, i) => i !== index))} className="text-red-500 font-bold cursor-pointer">×</button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-400 mb-1">Weight Range</label>
                  <input
                    type="text"
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                  />
                </div>

                {/* Tags & SEO */}
                <div className="grid grid-cols-1 gap-3 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-xl">
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={prodTags}
                      onChange={(e) => setProdTags(e.target.value)}
                      placeholder="walnut, frame, modern"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={prodSeoTitle}
                      onChange={(e) => setProdSeoTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-gray-400 mb-1">SEO Description</label>
                    <input
                      type="text"
                      value={prodSeoDescription}
                      onChange={(e) => setProdSeoDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20 text-luxury-charcoal dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Option Badges toggles */}
                <div className="flex space-x-6 py-2">
                  <label className="flex items-center space-x-2 text-luxury-charcoal dark:text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsCustomizable}
                      onChange={(e) => setProdIsCustomizable(e.target.checked)}
                      className="accent-luxury-gold w-4 h-4 rounded"
                    />
                    <span>Flag Customizable</span>
                  </label>

                  <label className="flex items-center space-x-2 text-luxury-charcoal dark:text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="accent-luxury-gold w-4 h-4 rounded"
                    />
                    <span>Flag Featured Carousel</span>
                  </label>

                  <label className="flex items-center space-x-2 text-luxury-charcoal dark:text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsTrending}
                      onChange={(e) => setProdIsTrending(e.target.checked)}
                      className="accent-luxury-gold w-4 h-4 rounded"
                    />
                    <span>Flag Trending</span>
                  </label>

                  <label className="flex items-center space-x-2 text-luxury-charcoal dark:text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsBestSeller}
                      onChange={(e) => setProdIsBestSeller(e.target.checked)}
                      className="accent-luxury-gold w-4 h-4 rounded"
                    />
                    <span>Flag Best Seller Badge</span>
                  </label>
                </div>

                {uploadingImage && (
                  <p className="text-xs text-luxury-gold animate-pulse">Uploading image…</p>
                )}

                {/* Modal footer buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-400 uppercase cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct || uploadingImage || !prodName || !prodSku}
                    className="flex-1 py-3 px-4 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black hover:bg-luxury-gold dark:hover:bg-luxury-beige transition-colors text-xs font-bold rounded-xl uppercase tracking-wider flex justify-center items-center cursor-pointer disabled:opacity-50"
                  >
                    {savingProduct ? 'Saving…' : editingProduct ? 'Commit specifications' : 'Launch Artwork'}
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black z-[60] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[61] p-6"
            >
              <h4 className="font-serif text-xl text-luxury-black dark:text-white mb-2">Confirm deletion</h4>
              <p className="text-sm text-gray-500 mb-6">
                This action is irreversible. Are you sure you want to proceed?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase cursor-pointer hover:bg-red-700"
                >
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
