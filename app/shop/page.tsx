'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Heart, SlidersHorizontal, Grid, List, Search, Loader, 
  ArrowUpDown, Check, RefreshCcw, Sparkles, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { parseMaterials, parseColors, DEFAULT_MATERIALS, DEFAULT_COLORS } from '@/lib/productOptions';
import SmartImage from '@/components/ui/SmartImage';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [products, setProducts] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Load categories and wishlist
  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Load products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange, selectedMaterial, selectedColor, sortBy]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id);
    if (data) {
      setWishlistIds(data.map((item) => item.product_id));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          short_description,
          dimensions,
          material,
          color,
          is_customizable,
          is_featured,
          is_trending,
          is_best_seller,
          product_images (
            image_url,
            is_primary
          )
        `);

      // Category filter
      if (selectedCategory !== 'all') {
        // Resolve category ID first or query direct slug
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single();
        if (catData) {
          query = query.eq('category_id', catData.id);
        }
      }

      // Search query filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Price filter
      query = query.lte('price', priceRange);

      // Sort
      if (sortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else {
        // Default featured sorting
        query = query.order('is_featured', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      const fetchedProducts = data || [];
      setCatalogProducts(fetchedProducts);
      const filteredByOptions = fetchedProducts.filter((prod: any) => {
        const productMaterials = parseMaterials(prod.material).map((m) => m.value);
        const productColors = parseColors(prod.color).map((c) => c.label);
        const matchesMaterial = selectedMaterial === 'all' || productMaterials.includes(selectedMaterial);
        const matchesColor = selectedColor === 'all' || productColors.includes(selectedColor);
        return matchesMaterial && matchesColor;
      });
      setProducts(filteredByOptions);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const isWishlisted = wishlistIds.includes(productId);
    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setWishlistIds(wishlistIds.filter(id => id !== productId));
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        setWishlistIds([...wishlistIds, productId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange(5000);
    setSelectedMaterial('all');
    setSelectedColor('all');
    setSortBy('featured');
    router.push('/shop');
  };

  const materialOptions = Array.from(
    new Set(catalogProducts.flatMap((prod: any) => parseMaterials(prod.material).map((m) => m.value)))
  );
  const colorOptions = Array.from(
    new Set(catalogProducts.flatMap((prod: any) => parseColors(prod.color).map((c) => c.label)))
  );
  const availableMaterials = materialOptions.length > 0 ? materialOptions : DEFAULT_MATERIALS.map((m) => m.value);
  const availableColors = colorOptions.length > 0 ? colorOptions : DEFAULT_COLORS.map((c) => c.label);

  return (
    <div className="commerce-page min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="lux-container flex-grow pt-36 pb-20">
        {/* Header Title */}
        <div className="mb-12 grid gap-5 lg:grid-cols-[0.9fr_1fr] lg:items-end">
          <div>
          <span className="lux-eyebrow">The gallery index</span>
          <h1 className="lux-section-title mt-3">
            The Bespoke Collections
          </h1>
          </div>
          <p className="lux-copy max-w-xl lg:justify-self-end">
            Curated custom framing, religious shadow boxes, acrylic depth work, and quiet home decor pieces selected for warm interiors.
          </p>
        </div>

        {/* Search and Filters Toggle Bar */}
        <div className="commerce-surface mb-8 flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center px-4 py-3 border border-black/10 dark:border-white/10 rounded-[12px] text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-white/70 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
              Filters
            </button>
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="lux-input w-full sm:w-72 px-4 py-3 pl-10 rounded-[12px] text-xs font-semibold"
              />
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-stone-500" />
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-1.5 text-xs text-stone-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-luxury-black dark:text-white font-semibold focus:outline-none focus:ring-0 text-xs cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="latest">Newest Arrivals</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="p-3 border border-black/10 dark:border-white/10 rounded-[12px] text-stone-500 hover:text-luxury-gold duration-200 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-1/4 flex-shrink-0 space-y-6">
            <div className="commerce-surface sticky top-28 space-y-7 p-6">
              
              {/* Category Filter */}
              <div>
                  <h4 className="font-serif text-xl text-luxury-black dark:text-white border-b border-black/10 dark:border-white/10 pb-3 mb-4">
                  Category
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                      selectedCategory === 'all'
                        ? 'bg-luxury-gold/15 text-luxury-gold-dark font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <span>All Collections</span>
                    {selectedCategory === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                        selectedCategory === cat.slug
                          ? 'bg-luxury-gold/15 text-luxury-gold-dark font-semibold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                  <h4 className="font-serif text-xl text-luxury-black dark:text-white border-b border-black/10 dark:border-white/10 pb-3 mb-4">
                  Price Limit (Up to)
                </h4>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-[12px] appearance-none cursor-pointer accent-luxury-gold"
                />
                <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400 font-semibold mt-2">
                  <span>₹500</span>
                  <span className="text-luxury-gold-dark text-xs">₹{priceRange.toLocaleString()}</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Material Filter */}
              <div>
                  <h4 className="font-serif text-xl text-luxury-black dark:text-white border-b border-black/10 dark:border-white/10 pb-3 mb-4">
                  Material
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedMaterial('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                      selectedMaterial === 'all'
                        ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <span>All Materials</span>
                    {selectedMaterial === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {availableMaterials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                        selectedMaterial === mat
                          ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <span>{mat}</span>
                      {selectedMaterial === mat && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                  <h4 className="font-serif text-xl text-luxury-black dark:text-white border-b border-black/10 dark:border-white/10 pb-3 mb-4">
                  Finish / Color
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                      selectedColor === 'all'
                        ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <span>All Finishes</span>
                    {selectedColor === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-colors duration-200 flex justify-between items-center ${
                        selectedColor === color
                          ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <span>{color}</span>
                      {selectedColor === color && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Product Grid Area */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 text-stone-600">
                <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-2" />
                <span className="text-xs uppercase tracking-widest">Loading frames...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="commerce-surface p-10 text-center sm:p-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-luxury-black dark:text-white mb-2">No Frames Found</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any products matching your current search criteria. Try adjusting your filters or resetting them.
                </p>
                <button
                  onClick={resetFilters}
                  className="lux-button lux-button-primary mt-6"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((prod) => {
                  const image = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400';
                  const isWishlisted = wishlistIds.includes(prod.id);
                  
                  return (
                    <div 
                      key={prod.id} 
                      className="commerce-module group relative flex h-full flex-col overflow-hidden p-3"
                    >
                      {/* Product Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 select-none">
                        {prod.is_featured && (
                          <span className="commerce-label dark:bg-luxury-gold dark:text-luxury-black">
                            Featured
                          </span>
                        )}
                        {prod.is_best_seller && (
                          <span className="commerce-label bg-luxury-gold text-zinc-950">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Wishlist Heart Toggle */}
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-[12px] border border-black/10 dark:border-white/10 hover:text-luxury-gold text-stone-400 transition-colors duration-200 cursor-pointer"
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      {/* Card Image */}
                      <Link href={`/product/${prod.slug}`} className="relative block h-72 overflow-hidden rounded-[18px] bg-stone-100 dark:bg-stone-900">
                        <SmartImage
                          src={image}
                          fallbackSrc="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=900"
                          alt={prod.name}
                          className="image-lift h-full w-full object-cover"
                          containerClassName="h-full w-full"
                          fallbackLabel="Artwork preview unavailable"
                        />
                      </Link>

                      {/* Card Details */}
                      <div className="px-3 py-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-widest font-bold flex items-center space-x-1.5">
                            <span>{prod.dimensions}</span>
                            {prod.is_customizable && (
                              <>
                                <span>•</span>
                                <span className="text-luxury-gold-dark flex items-center">
                                  <Sparkles className="w-3 h-3 mr-0.5" /> Custom
                                </span>
                              </>
                            )}
                          </div>
                          
                          <Link href={`/product/${prod.slug}`} className="block mt-1">
                            <h3 className="font-serif text-xl text-luxury-black dark:text-white hover:text-luxury-gold transition-colors duration-200 line-clamp-1">
                              {prod.name}
                            </h3>
                          </Link>

                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                            {prod.short_description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-stone-600 dark:text-stone-400 block uppercase tracking-wider">Starting Price</span>
                            <span className="text-lg font-extrabold text-luxury-black dark:text-luxury-beige">
                              ₹{prod.price ? prod.price.toLocaleString() : 'Price on request'}
                            </span>
                          </div>
                          
                          <Link
                            href={`/product/${prod.slug}`}
                            className="inline-flex items-center text-xs font-bold text-luxury-gold hover:text-luxury-gold-dark tracking-wider"
                          >
                            Details
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-full sm:max-w-xs bg-luxury-offwhite dark:bg-luxury-black shadow-2xl z-50 p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
                <h3 className="font-serif text-lg text-luxury-black dark:text-white uppercase tracking-wider">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-serif text-sm text-luxury-black dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Category
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                      className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                        selectedCategory === 'all' ? 'bg-luxury-gold/15 text-luxury-gold-dark font-semibold' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      All Collections
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedCategory === cat.slug ? 'bg-luxury-gold/15 text-luxury-gold-dark font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="font-serif text-sm text-luxury-black dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Price Limit (Up to)
                  </h4>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-[12px] appearance-none cursor-pointer accent-luxury-gold"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-1">
                    <span>₹500</span>
                    <span className="text-luxury-gold-dark text-xs">₹{priceRange.toLocaleString()}</span>
                    <span>₹10,000</span>
                  </div>
                </div>

                {/* Material Filter */}
                <div>
                  <h4 className="font-serif text-sm text-luxury-black dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Material
                  </h4>
                  <div className="space-y-1">
                    {availableMaterials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => { setSelectedMaterial(mat === selectedMaterial ? 'all' : mat); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedMaterial === mat ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="font-serif text-sm text-luxury-black dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Finish / Color
                  </h4>
                  <div className="space-y-1">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color === selectedColor ? 'all' : color); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedColor === color ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                  className="w-full py-3 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-black font-bold rounded-[12px] text-xs uppercase tracking-wider duration-200 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center min-h-[60vh] bg-luxury-offwhite text-gray-500">
        <Loader className="w-8 h-8 animate-spin text-luxury-gold" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
