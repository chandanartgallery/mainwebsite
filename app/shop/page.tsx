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

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [products, setProducts] = useState<any[]>([]);
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

      // Material filter
      if (selectedMaterial !== 'all') {
        query = query.eq('material', selectedMaterial);
      }

      // Color filter
      if (selectedColor !== 'all') {
        query = query.eq('color', selectedColor);
      }

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
      setProducts(data || []);
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

  const materials = ['Solid Pine Wood', 'Teak Wood', 'Premium Cast Plexiglass', 'Seasoned Mango Wood', 'Seasoned MDF'];
  const colors = ['Walnut Brown', 'Gold & Crimson', 'Crystal Clear', 'Distressed White Wash', 'Matte Black'];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
        {/* Header Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-luxury-black dark:text-luxury-beige uppercase tracking-wide">
            The Bespoke Collections
          </h1>
          <p className="mt-2 text-xs tracking-widest text-gray-500 uppercase">
            Curated custom framing, religious shadow boxes, and home decor items.
          </p>
        </div>

        {/* Search and Filters Toggle Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
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
                className="w-full sm:w-64 px-4 py-2 pl-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-luxury-black dark:text-white font-semibold focus:outline-none focus:ring-0 text-xs uppercase cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="latest">Newest Arrivals</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="p-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-400 hover:text-luxury-gold duration-200 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-1/4 flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Category Filter */}
              <div>
                <h4 className="font-serif text-sm text-luxury-black dark:text-white border-b border-gray-50 dark:border-zinc-800 pb-2 mb-3 uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
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
                      className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
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
                <h4 className="font-serif text-sm text-luxury-black dark:text-white border-b border-gray-50 dark:border-zinc-800 pb-2 mb-3 uppercase tracking-wider">
                  Price Limit (Up to)
                </h4>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-1">
                  <span>₹500</span>
                  <span className="text-luxury-gold-dark text-xs">₹{priceRange.toLocaleString()}</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Material Filter */}
              <div>
                <h4 className="font-serif text-sm text-luxury-black dark:text-white border-b border-gray-50 dark:border-zinc-800 pb-2 mb-3 uppercase tracking-wider">
                  Material
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedMaterial('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
                      selectedMaterial === 'all'
                        ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <span>All Materials</span>
                    {selectedMaterial === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
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
                <h4 className="font-serif text-sm text-luxury-black dark:text-white border-b border-gray-50 dark:border-zinc-800 pb-2 mb-3 uppercase tracking-wider">
                  Finish / Color
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
                      selectedColor === 'all'
                        ? 'bg-gray-100 text-luxury-black dark:bg-zinc-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <span>All Finishes</span>
                    {selectedColor === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors duration-200 flex justify-between items-center ${
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
              <div className="flex flex-col justify-center items-center py-20 text-gray-500">
                <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-2" />
                <span className="text-xs uppercase tracking-widest">Loading frames...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-16 text-center shadow-sm">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-luxury-black dark:text-white mb-2">No Frames Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any products matching your current search criteria. Try adjusting your filters or resetting them.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-luxury-gold-dark cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const image = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400';
                  const isWishlisted = wishlistIds.includes(prod.id);
                  
                  return (
                    <div 
                      key={prod.id} 
                      className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
                    >
                      {/* Product Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 select-none">
                        {prod.is_featured && (
                          <span className="bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                        {prod.is_best_seller && (
                          <span className="bg-amber-500 text-zinc-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Wishlist Heart Toggle */}
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute top-3 right-3 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-100 dark:border-zinc-800 hover:text-red-500 text-gray-400 transition-colors duration-200 cursor-pointer"
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      {/* Card Image */}
                      <Link href={`/product/${prod.slug}`} className="block overflow-hidden bg-gray-50 h-64 relative">
                        <img
                          src={image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      {/* Card Details */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center space-x-1.5">
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
                            <h3 className="font-serif text-base text-luxury-black dark:text-white hover:text-luxury-gold transition-colors duration-200 line-clamp-1">
                              {prod.name}
                            </h3>
                          </Link>

                          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                            {prod.short_description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800/80 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase">Starting Price</span>
                            <span className="font-bold text-luxury-black dark:text-luxury-beige text-base">
                              ₹{prod.price ? prod.price.toLocaleString() : 'Price on request'}
                            </span>
                          </div>
                          
                          <Link
                            href={`/product/${prod.slug}`}
                            className="inline-flex items-center text-xs font-bold text-luxury-gold hover:text-luxury-gold-dark uppercase tracking-wider hover:underline"
                          >
                            Explore Details
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
              className="fixed top-0 left-0 h-full w-full sm:max-w-xs bg-white dark:bg-zinc-900 shadow-2xl z-50 p-6 overflow-y-auto lg:hidden"
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
                      className={`w-full text-left text-xs py-2 px-2.5 rounded-md ${
                        selectedCategory === 'all' ? 'bg-luxury-gold/15 text-luxury-gold-dark font-semibold' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      All Collections
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-md ${
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
                    className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
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
                    {materials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => { setSelectedMaterial(mat === selectedMaterial ? 'all' : mat); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-md ${
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
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color === selectedColor ? 'all' : color); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-md ${
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
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider duration-200 cursor-pointer"
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
