'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';
import { 
  Heart, ShoppingBag, MessageSquare, ChevronRight, 
  Sparkles, Star, Plus, Minus, ShieldCheck, 
  Truck, ArrowLeftRight, HelpCircle, Loader2, Send, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Recaptcha from '@/components/ui/Recaptcha';
import { parseMaterials, parseColors, formatDimensionsForSpecs } from '@/lib/productOptions';
import {
  parseProductConfig,
  parseSizesExtended,
  sizesToDisplayExtended,
  type TrustBadge,
} from '@/lib/productConfig';
import SmartImage from '@/components/ui/SmartImage';

interface ProductClientProps {
  product: any;
  initialReviews: any[];
  initialComments: any[];
}

export default function ProductClient({ product, initialReviews, initialComments }: ProductClientProps) {
  const { addItem } = useCartStore();
  const { setCartOpen, addToast } = useUIStore();
  const { user, role } = useAuthStore();

  // Active image gallery state
  const images = [...(product.product_images || [])].sort(
    (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const primaryImg = images.find((i: any) => i.is_primary)?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600';
  const [activeImage, setActiveImage] = useState(primaryImg);
  const productFallbackImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200';

  // Zoom on hover state
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const containerRef = useRef<HTMLDivElement>(null);

  const pageConfig = parseProductConfig(product.product_config, product.category?.slug);
  const sizes = sizesToDisplayExtended(parseSizesExtended(product.dimensions));
  const materials = parseMaterials(product.material);
  const colorOptions = parseColors(product.color);

  const TrustIcon = ({ icon }: { icon: TrustBadge['icon'] }) => {
    const cls = 'w-5 h-5 text-neutral-600 mb-1.5';
    switch (icon) {
      case 'shield':
        return <ShieldCheck className={cls} />;
      case 'authentic':
        return <ArrowLeftRight className={cls} />;
      case 'heart':
        return <Heart className={cls} />;
      case 'star':
        return <Star className={cls} />;
      default:
        return <Truck className={cls} />;
    }
  };

  // Variant selections
  const [selectedSize, setSelectedSize] = useState(() => sizes[0]?.value || '12 x 15 inches');
  const [selectedFrame, setSelectedFrame] = useState(() => materials[0]?.value || 'Solid Pine Wood');
  const [selectedFinish, setSelectedFinish] = useState(() => colorOptions[0]?.label || 'Walnut Brown');
  const [quantity, setQuantity] = useState(1);

  // Reviews and comments lists
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [comments, setComments] = useState<any[]>(initialComments);

  // Modal / Review form state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState(user?.user_metadata?.full_name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Comment posting state
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{id: string, hasReplies: boolean, replyCount: number} | null>(null);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Price calculations based on variants
  const getVariantPriceModifier = () => {
    let mod = 0;
    // Size modifiers
    const activeSize = sizes.find(sz => sz.value === selectedSize);
    if (activeSize) {
      mod += activeSize.priceModifier;
    }

    const activeMaterial = materials.find((m) => m.value === selectedFrame);
    if (activeMaterial) mod += activeMaterial.modifier;

    const activeColor = colorOptions.find((c) => c.label === selectedFinish);
    if (activeColor) mod += activeColor.modifier;

    return mod;
  };

  const currentSinglePrice = (product.price || 0) + getVariantPriceModifier();
  const totalPrice = currentSinglePrice * quantity;

  // Sync wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();
      if (data) setIsWishlisted(true);
    };
    checkWishlist();
  }, [user, product.id]);

  const toggleWishlist = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsWishlisted(false);
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Hover Zoom Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    const variantDesc = `Size: ${selectedSize} | Frame: ${selectedFrame} | Finish: ${selectedFinish}`;
    addItem({
      id: `${product.id}-${selectedSize}-${selectedFrame}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentSinglePrice,
      imageUrl: activeImage,
      variant: variantDesc,
    }, quantity);

    setCartOpen(true);
    addToast('Added to cart.', 'success');
  };

  // Direct Buy on WhatsApp checkout for single product
  const handleWhatsAppBuy = async () => {
    try {
      const siteUrl = window.location.origin;
      const variantDesc = `Size: ${selectedSize} | Frame: ${selectedFrame} | Finish: ${selectedFinish}`;

      let msg = `Hello Chandan Art Gallery,\n\nI'm interested in buying this customized product:\n\n`;
      msg += `Product: ${product.name}\n`;
      msg += `Quantity: ${quantity}\n`;
      msg += `Specifications: ${variantDesc}\n`;
      msg += `Price: ₹${totalPrice.toLocaleString()}\n`;
      msg += `Link: ${siteUrl}/product/${product.slug}\n\n`;
      msg += `Please confirm availability and framing customization options.`;

      // Log inquiry in database
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          productId: product.id,
          name: user?.user_metadata?.full_name || 'Guest User',
          email: user?.email || '',
          message: msg,
          type: 'whatsapp'
        })
      });

      // Redirect to WhatsApp
      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8468845759';
      const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      addToast('Opening WhatsApp to complete your order.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to log WhatsApp checkout.', 'error');
    }
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!user) {
      setReviewError('You must be signed in to submit a review.');
      window.location.href = `/login?next=${encodeURIComponent(`/product/${product.slug}`)}`;
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setReviewError('Please write a review of at least 10 characters.');
      return;
    }

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setReviewError('Please complete the reCAPTCHA verification.');
      return;
    }

    setReviewSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          userName:
            reviewName.trim() ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Member',
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          recaptchaToken,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Review submission failed');
      }

      setReviewSuccess(true);
      setReviewComment('');
      setReviewTitle('');
      setRecaptchaToken(null);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess(false);
      }, 3000);
    } catch (err: any) {
      setReviewError(err.message || 'Something went wrong.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Post Comment / Question Handler
  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const commentText = parentId ? replyText : newComment;
    if (!commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const uName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
      
      const { data, error } = await supabase
        .from('product_comments')
        .insert({
          product_id: product.id,
          user_id: user.id,
          user_name: uName,
          comment: commentText,
          parent_id: parentId,
          is_approved: role === 'admin' // Admins auto-approved
        })
        .select()
        .single();

      if (error) throw error;

      if (role === 'admin' || data.is_approved) {
        setComments([...comments, data]);
        addToast('Comment posted successfully.', 'success');
      } else {
        addToast('Your comment has been submitted and is pending approval.', 'info');
      }

      if (parentId) {
        setReplyText('');
        setReplyingToId(null);
      } else {
        setNewComment('');
      }
    } catch (err: any) {
      console.error(err);
      addToast('Failed to post comment.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (commentId: string) => {
    const replies = comments.filter(c => c.parent_id === commentId);
    setCommentToDelete({
      id: commentId,
      hasReplies: replies.length > 0,
      replyCount: replies.length
    });
    setDeleteModalOpen(true);
  };

  // Execute the actual deletion (unified for both users and admins)
  const executeCommentDelete = async () => {
    if (!user || !commentToDelete) return;
    
    setDeleteModalOpen(false);
    setDeletingCommentId(commentToDelete.id);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Delete operation timed out');
      setDeletingCommentId(null);
      setCommentToDelete(null);
      addToast('Delete operation timed out. Please try again.', 'error');
    }, 15000);
    
    try {
      console.log('Starting comment deletion process for:', commentToDelete.id);
      console.log('Current user:', user.id, 'Role:', role);
      
      const targetComment = comments.find(c => c.id === commentToDelete.id);
      const replies = comments.filter(c => c.parent_id === commentToDelete.id);
      
      console.log('Target comment:', targetComment);
      console.log('Found replies to delete:', replies.length);
      
      // Check permissions
      const canDelete = role === 'admin' || targetComment?.user_id === user.id;
      if (!canDelete) {
        throw new Error('You can only delete your own comments.');
      }
      
      // Delete all replies first (if any) - admin can delete any reply, users only delete replies to their own comments
      if (replies.length > 0) {
        console.log('Deleting replies first...');
        for (const reply of replies) {
          console.log(`Deleting reply ${reply.id}...`);
          
          // For replies, we don't restrict by user_id since we're deleting all replies to the parent comment
          const { error: replyError } = await supabase
            .from('product_comments')
            .delete()
            .eq('id', reply.id);
            
          if (replyError) {
            console.error(`Error deleting reply ${reply.id}:`, replyError);
            // Continue with other replies even if one fails
          } else {
            console.log(`Successfully deleted reply ${reply.id}`);
          }
        }
      }
      
      // Then delete the main comment
      console.log(`Deleting main comment ${commentToDelete.id}...`);
      
      let deleteQuery = supabase
        .from('product_comments')
        .delete()
        .eq('id', commentToDelete.id);
      
      // Only add user_id filter for regular users (not admins)
      if (role !== 'admin') {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      }
      
      const { error, data } = await deleteQuery.select();
        
      console.log('Delete response:', { error, data });
        
      if (error) {
        console.error('Delete error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No comment was deleted. You may not have permission to delete this comment.');
      }
      
      // Clear timeout on success
      clearTimeout(timeoutId);
      
      // Remove from local state (parent comment and all its replies)
      setComments(prevComments => 
        prevComments.filter(c => c.id !== commentToDelete.id && c.parent_id !== commentToDelete.id)
      );
      
      const deletedCount = 1 + replies.length;
      const action = role === 'admin' ? 'Admin deleted' : 'Successfully deleted';
      addToast(`${action} ${deletedCount} comment${deletedCount > 1 ? 's' : ''}.`, 'success');
      
    } catch (err: any) {
      console.error('Failed to delete comment - full error:', err);
      
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Provide specific error messages
      let errorMessage = 'Failed to delete comment.';
      if (err.message?.includes('permission') || err.message?.includes('only delete your own') || err.code === 'RLS_ERROR') {
        errorMessage = 'You can only delete your own comments.';
      } else if (err.code === 'PGRST116') {
        errorMessage = 'Comment not found or already deleted.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      addToast(errorMessage, 'error');
    } finally {
      // Always clear loading state
      console.log('Clearing loading state');
      setDeletingCommentId(null);
      setCommentToDelete(null);
    }
  };

  // Review summaries
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const starPercentages = [5, 4, 3, 2, 1].map((star) => {
    if (reviews.length === 0) return 0;
    const count = reviews.filter((r) => r.rating === star).length;
    return Math.round((count / reviews.length) * 100);
  });

  return (
    <div className="lux-container pt-24 pb-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-neutral-500 select-none sm:gap-2">
        <Link href="/" className="shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-white">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/shop" className="shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-white">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="max-w-[9rem] truncate transition-colors hover:text-neutral-900 dark:hover:text-white sm:max-w-none"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-neutral-800 dark:text-neutral-200">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr] gap-10 lg:gap-14 mb-16">
        {/* Left Column: Gallery */}
        <div className="space-y-3">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-[4/5] cursor-crosshair overflow-hidden border border-neutral-200 bg-neutral-50 select-none dark:border-neutral-800 dark:bg-neutral-900"
          >
            <SmartImage
              src={activeImage}
              fallbackSrc={productFallbackImage}
              alt={product.name}
              className="h-full w-full object-cover transition-opacity duration-300"
              containerClassName="h-full w-full"
              fallbackLabel="Artwork preview unavailable"
            />
            {/* Zoom Overlay */}
            <div 
              style={zoomStyle} 
              className="absolute inset-0 pointer-events-none rounded-[24px] bg-no-repeat"
            />

            {/* Float Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
              {product.is_featured && (
                <span className="commerce-label dark:bg-white dark:text-neutral-950">
                  {pageConfig.badgeLabels.featured}
                </span>
              )}
              {product.is_trending && (
                <span className="commerce-label bg-luxury-walnut text-white">
                  {pageConfig.badgeLabels.trending}
                </span>
              )}
              {product.is_best_seller && (
                <span className="commerce-label bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                  {pageConfig.badgeLabels.bestSeller}
                </span>
              )}
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-zinc-900/95 p-2.5 rounded-[12px] border border-gray-100 dark:border-zinc-800 shadow-sm hover:text-red-500 text-gray-400 transition-colors duration-200 cursor-pointer disabled:opacity-50"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-1">
              {images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-20 bg-white dark:bg-zinc-950 border rounded-[12px] overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-200 p-0.5 ${
                    activeImage === img.image_url 
                      ? 'border-neutral-300 ring-1 ring-neutral-400' 
                      : 'border-gray-100 dark:border-zinc-800/80'
                  }`}
                >
                  <SmartImage
                    src={img.image_url}
                    fallbackSrc={productFallbackImage}
                    alt={`${product.name} thumbnail`}
                    className="h-full w-full rounded-[12px] object-cover"
                    containerClassName="h-full w-full rounded-[12px]"
                    fallbackLabel="Preview unavailable"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Premium Customizations */}
        <div className="commerce-surface flex flex-col justify-between space-y-7 p-5 sm:p-8">
          <div>
            {/* Tagline */}
            <div className="flex items-center space-x-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{pageConfig.tagline}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-sans text-3xl leading-tight text-neutral-900 dark:text-white sm:text-5xl">
              {product.name}
            </h1>

            {/* Star Rating Summary */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(averageRating))
                        ? 'fill-current'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                {averageRating} ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>

            {/* Short description */}
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-8 mb-8 border-b border-black/10 dark:border-white/10 pb-6">
              {product.short_description || product.description}
            </p>

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Size Customizer */}
              {pageConfig.showDimensions && sizes.length > 0 && (
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  {pageConfig.sectionLabels.dimensions}
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {sizes.map((sz) => (
                    <button
                      key={sz.value}
                      onClick={() => setSelectedSize(sz.value)}
                      className={`p-3 border rounded-[12px] flex flex-col items-center justify-center transition-all duration-200 text-xs font-semibold cursor-pointer ${
                        selectedSize === sz.value
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white/15 dark:text-white'
                          : 'border-black/10 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-white/35'
                      }`}
                    >
                      <span>{sz.label}</span>
                      <span
                        className={`text-[10px] font-normal mt-0.5 ${
                          selectedSize === sz.value
                            ? 'text-white/70 dark:text-white/70'
                            : 'text-stone-600 dark:text-neutral-400'
                        }`}
                      >
                        {sz.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Material Customizer */}
              {pageConfig.showMaterials && materials.length > 0 && (
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  {pageConfig.sectionLabels.materials}
                </span>
                <div className={`grid gap-2.5 ${materials.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                  {materials.map((mat) => (
                    <button
                      key={mat.value}
                      onClick={() => setSelectedFrame(mat.value)}
                      className={`p-3 border rounded-[12px] flex flex-col items-center justify-center transition-all duration-200 text-xs font-semibold cursor-pointer ${
                        selectedFrame === mat.value
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white/15 dark:text-white'
                          : 'border-black/10 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-white/35'
                      }`}
                    >
                      <span>{mat.label}</span>
                      <span
                        className={`text-[10px] font-normal mt-0.5 ${
                          selectedFrame === mat.value
                            ? 'text-white/70 dark:text-white/70'
                            : 'text-stone-600 dark:text-neutral-400'
                        }`}
                      >
                        {mat.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Finish/Color Selection */}
              {pageConfig.showColors && colorOptions.length > 0 && (
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  {pageConfig.sectionLabels.colors}
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((fin) => (
                    <button
                      key={fin.label}
                      onClick={() => setSelectedFinish(fin.label)}
                      className={`px-3 py-2 border rounded-[12px] text-xs font-semibold cursor-pointer transition-all duration-200 ${
                        selectedFinish === fin.label
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white/15 dark:text-white'
                          : 'border-black/10 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-white/35'
                      }`}
                    >
                      {fin.label}
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Pricing and CTAs */}
          <div className="border-t border-black/10 dark:border-white/10 pt-6 mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 block">Total Est. Price</span>
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-[12px] bg-gray-50/50 dark:bg-zinc-950/20 px-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-neutral-600 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-neutral-800 dark:text-white select-none">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:text-neutral-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleAddToCart}
                className="lux-button lux-button-secondary w-full"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </button>

              <button
                onClick={handleWhatsAppBuy}
                className="lux-button lux-button-primary w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Buy on WhatsApp
              </button>
            </div>

            {/* Extra Info Accordion */}
            {pageConfig.trustBadges.length > 0 && (
            <div className={`grid gap-4 text-center border-t border-b border-gray-100 dark:border-zinc-800/60 py-5 my-2 ${
              pageConfig.trustBadges.length === 2 ? 'grid-cols-2' : pageConfig.trustBadges.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
            }`}>
              {pageConfig.trustBadges.map((badge, i) => (
                <div key={i} className="flex flex-col items-center">
                  <TrustIcon icon={badge.icon} />
                  <span className="text-[10px] font-bold text-neutral-800 dark:text-white uppercase">{badge.title}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{badge.subtitle}</span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra Technical Specs / Details */}
      <div className="border-b border-black/10 dark:border-white/10 pb-16 mb-16">
        <h3 className="font-sans text-3xl text-neutral-900 dark:text-white mb-6 sm:text-4xl">{pageConfig.storyTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-700 dark:text-stone-400 leading-relaxed">
          <p>
            {product.description || 'Every piece at Chandan Art Gallery is crafted on a custom, order-by-order basis. By sourcing natural teak and pine woods, our frames represent the absolute apex of home decor art. The anti-glare museum acrylic shields your photos from UV rays and details are finalized in real time on WhatsApp with our design team.'}
          </p>
          <div className="commerce-surface space-y-2.5 p-5 text-xs">
            <div className="flex justify-between border-b border-gray-50 dark:border-zinc-800/40 pb-1.5">
              <span className="font-bold text-stone-600 dark:text-stone-400 uppercase">Base Dimensions</span>
              <span className="text-neutral-800 dark:text-white">{formatDimensionsForSpecs(product.dimensions)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-zinc-800/40 pb-1.5">
              <span className="font-bold text-gray-400 uppercase">Core Material</span>
              <span className="text-neutral-800 dark:text-white">{selectedFrame}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-zinc-800/40 pb-1.5">
              <span className="font-bold text-gray-400 uppercase">Core Finish</span>
              <span className="text-neutral-800 dark:text-white">{selectedFinish}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-zinc-800/40 pb-1.5">
              <span className="font-bold text-gray-400 uppercase">Weight Range</span>
              <span className="text-neutral-800 dark:text-white">{product.weight || '1.5 kg'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-400 uppercase">Customizable?</span>
              <span className={`font-bold ${product.is_customizable ? 'text-neutral-600' : 'text-gray-400'}`}>
                {product.is_customizable ? pageConfig.customizableYesText : pageConfig.customizableNoText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-b border-black/10 dark:border-white/10 pb-16 mb-16" id="reviews">
        {/* Rating Summaries */}
        <div>
          <h3 className="font-sans text-2xl text-neutral-900 dark:text-white mb-3">Client Reviews</h3>
          <div className="flex items-baseline space-x-2.5 mb-5">
            <span className="text-5xl font-bold font-sans text-neutral-900 dark:text-neutral-100">{averageRating}</span>
            <span className="text-xs text-gray-400 uppercase font-semibold">Out of 5.0</span>
          </div>

          <div className="flex items-center text-amber-400 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'
                }`} 
              />
            ))}
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="flex items-center text-xs text-gray-400">
                <span className="w-3 font-semibold mr-1.5">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-current mr-2" />
                <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-[12px] overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900" 
                    style={{ width: `${starPercentages[idx]}%` }}
                  />
                </div>
                <span className="w-8 text-right font-semibold ml-2.5">{starPercentages[idx]}%</span>
              </div>
            ))}
          </div>

          {/* Submit review CTA */}
          <button
            onClick={() => {
              if (!user) {
                window.location.href = `/login?next=${encodeURIComponent(`/product/${product.slug}`)}`;
                return;
              }
              setReviewName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
              setReviewModalOpen(true);
            }}
            className="mt-8 w-full py-3 px-4 border border-neutral-300 text-neutral-700 dark:border-neutral-300 dark:text-neutral-100 hover:bg-neutral-900/5 rounded-[12px] text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            {user ? 'Submit an Honest Review' : 'Sign in to Write a Review'}
          </button>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-8 rounded-[18px] text-center">
              <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">No reviews approved yet.</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to submit your customized purchase experience!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 p-6 rounded-[18px] relative"
              >
                {/* Rating stars */}
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h4 className="text-sm font-sans text-neutral-900 dark:text-white font-bold">{rev.title || 'Verified Buyer'}</h4>
                    <span className="text-[10px] text-gray-400 block mt-0.5">By {rev.user_name} | {new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current' : 'text-gray-100 dark:text-zinc-800'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Discussion / Comments Section */}
      <div className="max-w-4xl">
        <h3 className="font-sans text-2xl text-neutral-900 dark:text-white mb-2">Curator Discussions & Q&A</h3>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">
          Logged-in members can leave inquiries. Approved comments and replies will display below.
        </p>

        {/* Comment Entry form */}
        {user ? (
          <form onSubmit={(e) => handleCommentSubmit(e, null)} className="mb-10 space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Leave a Question or Thought
            </span>
            <div className="flex gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask about customization details, mounting guidance, or shipping times..."
                rows={3}
                className="flex-1 p-4 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-[12px] text-xs text-neutral-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="self-end px-5 py-4 bg-neutral-900 text-white text-xs font-bold rounded-[12px] uppercase tracking-wider flex items-center hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-zinc-950/20 p-5 rounded-[18px] border border-gray-100 dark:border-zinc-800/60 text-center mb-10">
            <p className="text-xs text-gray-500">
              Please{' '}
              <Link href="/login" className="font-bold text-neutral-800 hover:underline dark:text-neutral-200">Sign In</Link>
              {' '}to join the discussion and post customization inquiries.
            </p>
          </div>
        )}

        {/* Comments Listing with Nested Replies */}
        <div className="space-y-6">
          {comments.filter(c => !c.parent_id).length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-6">No discussions started yet. Ask a question above!</p>
          ) : (
            comments.filter(c => !c.parent_id).map((cmt) => {
              const replies = comments.filter((c) => c.parent_id === cmt.id);
              
              return (
                <div key={cmt.id} className="border-l-2 border-neutral-300/30 pl-5 space-y-4">
                  {/* Primary Comment */}
                  <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-[12px] border border-gray-50 dark:border-zinc-800/40 relative">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-bold text-neutral-800 dark:text-white">{cmt.user_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{new Date(cmt.created_at).toLocaleDateString()}</span>
                        {/* Delete button - show for comment author OR admin */}
                        {user && (user.id === cmt.user_id || role === 'admin') && (
                          <button
                            onClick={() => showDeleteConfirmation(cmt.id)}
                            disabled={deletingCommentId === cmt.id}
                            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title={role === 'admin' ? 'Delete comment (Admin)' : 'Delete your comment'}
                          >
                            {deletingCommentId === cmt.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{cmt.comment}</p>

                    {/* Reply CTA for Logged in Users */}
                    {user && replyingToId !== cmt.id && (
                      <button
                        onClick={() => setReplyingToId(cmt.id)}
                        className="text-[10px] font-bold text-neutral-600 hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Reply to this question
                      </button>
                    )}

                    {/* Embedded Reply Form */}
                    {replyingToId === cmt.id && (
                      <form onSubmit={(e) => handleCommentSubmit(e, cmt.id)} className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your response..."
                          rows={2}
                          className="w-full p-3 border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 rounded-[12px] text-xs text-neutral-800 dark:text-white"
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            type="button"
                            onClick={() => { setReplyingToId(null); setReplyText(''); }}
                            className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="px-4 py-1.5 bg-neutral-900 text-white text-[10px] font-bold rounded-[12px] uppercase tracking-wider disabled:opacity-40 cursor-pointer dark:bg-white dark:text-neutral-950"
                          >
                            Post Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Replies (Admin & Users) */}
                  {replies.length > 0 && (
                    <div className="ml-6 space-y-3.5">
                      {replies.map((reply) => {
                        // Check if the reply author is admin (either matched by database flags or manually if the profile matches)
                        // In seed, we check if the role is admin.
                        // Let's check user's role on the profiles if we had it, but here we can check reply.role or manually flag 'admin'
                        // Since we don't have user profiles joined in product_comments, we check if the user is admin. Or if reply user's ID matches admin ID.
                        // Wait! A smart trick: if the name is 'Admin Curator' or if the reply id matches database seed values
                        const isAdminReply = reply.user_name.toLowerCase().includes('admin') || reply.user_name.toLowerCase().includes('curator');
                        
                        return (
                          <div 
                            key={reply.id} 
                            className={`p-4.5 rounded-[12px] border relative ${
                              isAdminReply
                                ? 'bg-neutral-900/5 border-neutral-300/40'
                                : 'bg-gray-50/40 border-gray-50/60 dark:bg-zinc-950/20 dark:border-zinc-800/40'
                            }`}
                          >
                            <div className="flex justify-between items-baseline mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-neutral-800 dark:text-white">
                                  {reply.user_name}
                                </span>
                                {isAdminReply && (
                                  <span className="bg-neutral-900/25 text-neutral-700 text-[8px] font-bold px-1.5 py-0.5 rounded-[8px] uppercase tracking-wider border border-neutral-300/20">
                                    Curator
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                                {/* Delete button for replies - show for reply author OR admin */}
                                {user && (user.id === reply.user_id || role === 'admin') && (
                                  <button
                                    onClick={() => showDeleteConfirmation(reply.id)}
                                    disabled={deletingCommentId === reply.id}
                                    className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                    title={role === 'admin' ? 'Delete reply (Admin)' : 'Delete your reply'}
                                  >
                                    {deletingCommentId === reply.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{reply.comment}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && commentToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800">
                {/* Modal Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Delete Comment
                    </h3>
                    <p className="text-sm text-neutral-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="mb-6">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Are you sure you want to delete this comment?
                    {commentToDelete.hasReplies && (
                      <span className="block mt-2 font-medium text-orange-600 dark:text-orange-400">
                        This will also delete {commentToDelete.replyCount} {commentToDelete.replyCount === 1 ? 'reply' : 'replies'}.
                      </span>
                    )}
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeCommentDelete}
                    className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete{commentToDelete.hasReplies ? ` ${1 + commentToDelete.replyCount} Comments` : ' Comment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Submission Modal Dialog */}
      <AnimatePresence>
        {reviewModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModalOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-[18px] shadow-2xl z-50 p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-sans text-2xl text-neutral-900 dark:text-white mb-1">Write your Review</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                Your experience helps our local framing artisans.
              </p>

              {reviewSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 p-5 rounded-[12px] text-center">
                  <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h4 className="font-bold text-sm">Review Submitted Successfully!</h4>
                  <p className="text-xs mt-1">Thank you. Your review is currently undergoing curation check and will display shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-[12px]">
                      {reviewError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Display Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4.5 py-3 border border-gray-200 dark:border-zinc-800 rounded-[12px] text-xs bg-gray-50/50 dark:bg-zinc-950/20 text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      />
                      <p className="mt-1 text-[0.65rem] text-neutral-400">Signed in as {user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Rating *</label>
                      <div className="flex space-x-1 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="text-gray-200 hover:text-amber-400 transition-colors duration-150 cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-gray-200 dark:text-zinc-800'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Review Title</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Stunning craftsmanship!"
                      className="w-full px-4.5 py-3 border border-gray-200 dark:border-zinc-800 rounded-[12px] text-xs bg-gray-50/50 dark:bg-zinc-950/20 text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Review Comment *</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe your wood finish, frame alignment, standoff quality, or general feedback..."
                      rows={4}
                      className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-[12px] text-xs bg-gray-50/50 dark:bg-zinc-950/20 text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>

                  {/* reCAPTCHA component */}
                  {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                    <Recaptcha onChange={setRecaptchaToken} />
                  )}

                  <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-800 rounded-[12px] text-xs font-bold text-gray-400 uppercase cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 py-3 px-4 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors text-xs font-bold rounded-[12px] uppercase tracking-wider flex justify-center items-center cursor-pointer"
                    >
                      {reviewSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                      Publish Review
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
