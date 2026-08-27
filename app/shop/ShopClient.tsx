'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid3X3, List, Star, Heart } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';

interface ProductImage {
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  short_description: string;
  dimensions?: string;
  material?: string;
  color?: string;
  is_customizable: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  category_id: number;
  created_at: string;
  product_images: ProductImage[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ShopClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ShopClient({ initialProducts, initialCategories }: ShopClientProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      const category = categories.find(cat => cat.slug === selectedCategory);
      if (category) {
        filtered = filtered.filter(product => product.category_id === category.id);
      }
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, categories]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPrimaryImage = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.product_images?.[0]?.image_url || 
           'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800';
  };

  return (
    <div className="lux-container py-28">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Handcrafted Photo Frames Collection
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Browse our premium collection of handcrafted wooden photo frames, religious frames, and decorative art pieces made by skilled artisans in Delhi.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <span className="ml-4 text-sm text-neutral-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            No products found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
            className="text-neutral-900 dark:text-neutral-100 underline hover:no-underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex gap-6 p-6' : ''
              }`}
            >
              {/* Product Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                <Link href={`/product/${product.slug}`}>
                  <SmartImage
                    src={getPrimaryImage(product)}
                    alt={`${product.name} - Handcrafted Photo Frame | Chandan Art Gallery Delhi`}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_featured && (
                    <span className="bg-yellow-500 text-yellow-50 text-xs px-2 py-1 rounded-md font-medium">
                      Featured
                    </span>
                  )}
                  {product.is_trending && (
                    <span className="bg-red-500 text-red-50 text-xs px-2 py-1 rounded-md font-medium">
                      Trending
                    </span>
                  )}
                  {product.is_best_seller && (
                    <span className="bg-green-500 text-green-50 text-xs px-2 py-1 rounded-md font-medium">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      wishlist.has(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-neutral-600 hover:text-red-500'
                    }`} 
                  />
                </button>

                {product.is_customizable && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-blue-500 text-blue-50 text-xs px-2 py-1 rounded-md font-medium">
                      Customizable
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                {product.short_description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                    {product.short_description}
                  </p>
                )}

                {/* Product Details */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-neutral-500">
                  {product.material && (
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      {product.material}
                    </span>
                  )}
                  {product.dimensions && (
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      {product.dimensions}
                    </span>
                  )}
                  {product.color && (
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      {product.color}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatPrice(product.price || 0)}
                  </span>
                  
                  <Link
                    href={`/product/${product.slug}`}
                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}