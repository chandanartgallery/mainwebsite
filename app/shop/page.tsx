'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Heart, SlidersHorizontal, Search, Loader, 
  ArrowUpDown, ArrowUpRight, Check, RefreshCcw, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LuxSelect from '@/components/ui/LuxSelect';
import { parseMaterials, parseColors, DEFAULT_MATERIALS, DEFAULT_COLORS } from '@/lib/productOptions';
import SmartImage from '@/components/ui/SmartImage';
import SplitText from '@/components/SplitText';

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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="lux-container flex-grow pt-24 pb-16">
        <div className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <SplitText
            text="Shop"
            tag="h1"
            splitType="chars"
            delay={40}
            duration={0.7}
            ease="power3.out"
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0}
            textAlign="left"
            className="lux-section-title !block text-neutral-900 dark:text-neutral-50"
          />
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Custom frames, acrylic pieces, canvas prints, and religious art.
          </p>
        </div>

        <div className="mb-6 flex flex-col items-stretch justify-between gap-3 border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
              Filters
            </button>
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="lux-input w-full sm:w-72 px-3 py-2 pl-9 rounded-md text-xs"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <LuxSelect
                label="Sort:"
                value={sortBy}
                onChange={setSortBy}
                placement="bottom-right"
                panelClassName="min-w-[190px]"
                options={[
                  { value: 'featured',   label: 'Featured' },
                  { value: 'price-low',  label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'latest',     label: 'Newest' },
                ]}
              />
            </div>
            <button
              onClick={resetFilters}
              className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white duration-200 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-6 border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
                  Category
                </h4>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                      selectedCategory === 'all'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>All</span>
                    {selectedCategory === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left text-xs font-medium py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategory === cat.slug
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
                  Price up to
                </h4>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded appearance-none cursor-pointer accent-neutral-900"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 font-medium mt-2">
                  <span>₹500</span>
                  <span className="text-neutral-900 dark:text-neutral-100">₹{priceRange.toLocaleString()}</span>
                  <span>₹10,000</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
                  Material
                </h4>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedMaterial('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                      selectedMaterial === 'all'
                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>All</span>
                    {selectedMaterial === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {availableMaterials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedMaterial === mat
                          ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{mat}</span>
                      {selectedMaterial === mat && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
                  Finish
                </h4>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                      selectedColor === 'all'
                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>All</span>
                    {selectedColor === 'all' && <Check className="w-3 h-3" />}
                  </button>
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedColor === color
                          ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
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
              <div className="flex flex-col justify-center items-center py-20 text-neutral-500">
                <Loader className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs">Loading…</span>
              </div>
            ) : products.length === 0 ? (
              <div className="border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900 sm:p-14">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No products found</h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your filters or search.
                </p>
                <button onClick={resetFilters} className="lux-button lux-button-primary mt-6">
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((prod) => {
                  const image = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400';
                  const isWishlisted = wishlistIds.includes(prod.id);
                  
                  return (
                    <div key={prod.id} className="group relative flex h-full flex-col">
                      <div className="absolute left-3 top-3 z-20 flex flex-col gap-1">
                        {prod.is_featured && <span className="commerce-label">Featured</span>}
                        {prod.is_best_seller && <span className="commerce-label">Bestseller</span>}
                      </div>

                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute right-3 top-3 z-20 bg-white/95 p-2 text-neutral-400 opacity-100 transition-colors hover:text-neutral-900 sm:opacity-0 sm:group-hover:opacity-100 dark:bg-neutral-900/90 dark:hover:text-white cursor-pointer"
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      <Link
                        href={`/product/${prod.slug}`}
                        className="relative block aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900"
                      >
                        <div className="absolute inset-0 origin-center will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]">
                          <SmartImage
                            src={image}
                            fallbackSrc="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=900"
                            alt={prod.name}
                            className="object-cover"
                            containerClassName="h-full w-full"
                            fallbackLabel="Artwork preview unavailable"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-neutral-950/0 transition-colors duration-500 ease-out group-hover:bg-neutral-950/35" />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between px-4 pb-4 text-xs font-semibold uppercase tracking-[0.14em] text-white opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                          View piece
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>

                      <div className="mt-4 flex min-h-[5rem] flex-col">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-400">
                          {prod.dimensions}
                          {prod.is_customizable && ' · Custom'}
                        </p>
                        <Link href={`/product/${prod.slug}`} className="mt-1 block">
                          <h3 className="line-clamp-2 font-sans text-lg leading-snug text-neutral-900 transition group-hover:opacity-70 dark:text-white">
                            {prod.name}
                          </h3>
                        </Link>
                        <p className="mt-auto pt-2 text-sm font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                          ₹{prod.price ? prod.price.toLocaleString('en-IN') : 'Price on request'}
                        </p>
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
              className="fixed top-0 left-0 h-full w-full sm:max-w-xs bg-neutral-50 dark:bg-neutral-950 shadow-2xl z-50 p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
                <h3 className="font-sans text-lg text-neutral-900 dark:text-white uppercase tracking-wider">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-sans text-sm text-neutral-900 dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Category
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                      className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                        selectedCategory === 'all' ? 'bg-neutral-900/15 text-neutral-700 font-semibold' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      All Collections
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedCategory === cat.slug ? 'bg-neutral-900/15 text-neutral-700 font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="font-sans text-sm text-neutral-900 dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Price Limit (Up to)
                  </h4>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-[12px] appearance-none cursor-pointer accent-neutral-900"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-1">
                    <span>₹500</span>
                    <span className="text-neutral-700 text-xs">₹{priceRange.toLocaleString()}</span>
                    <span>₹10,000</span>
                  </div>
                </div>

                {/* Material Filter */}
                <div>
                  <h4 className="font-sans text-sm text-neutral-900 dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Material
                  </h4>
                  <div className="space-y-1">
                    {availableMaterials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => { setSelectedMaterial(mat === selectedMaterial ? 'all' : mat); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedMaterial === mat ? 'bg-gray-100 text-neutral-900 dark:bg-zinc-800 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="font-sans text-sm text-neutral-900 dark:text-white pb-2 mb-3 uppercase tracking-wider border-b border-gray-50 dark:border-zinc-800">
                    Finish / Color
                  </h4>
                  <div className="space-y-1">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color === selectedColor ? 'all' : color); setShowMobileFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-[8px] ${
                          selectedColor === color ? 'bg-gray-100 text-neutral-900 dark:bg-zinc-800 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-900 text-white hover:text-neutral-900 font-bold rounded-[12px] text-xs uppercase tracking-wider duration-200 cursor-pointer"
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
      <div className="flex-1 flex justify-center items-center min-h-[60vh] bg-neutral-50 text-gray-500">
        <Loader className="w-8 h-8 animate-spin text-neutral-600" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
