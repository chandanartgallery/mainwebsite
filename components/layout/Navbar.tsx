'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';
import CartDrawer from './CartDrawer';
import { 
  ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, 
  MapPin, Phone, Mail, Sparkles, MessageCircle, LogIn,
  Sun, Moon
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, role } = useAuthStore();
  const { setCartOpen } = useUIStore();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync theme and scroll listeners on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY < 50) {
        setNavVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) > 5) {
        if (diff > 0 && currentScrollY > 120) {
          setNavVisible(false);
        } else {
          setNavVisible(true);
        }
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearching(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            name,
            slug,
            price,
            product_images (
              image_url
            )
          `)
          .ilike('name', `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Photo Frames', href: '/shop?category=photo-frames' },
    { name: 'Custom Frames', href: '/shop?category=custom-photo-frames' },
    { name: 'Acrylic Prints', href: '/shop?category=acrylic-frames' },
    { name: 'Canvas Prints', href: '/shop?category=canvas-prints' },
    { name: 'Religious Art', href: '/shop?category=religious-frames' },
  ];

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-[top] duration-500 ease-in-out ${
          navVisible ? 'top-0' : '-top-36'
        }`}
      >
        {/* Top Banner Bar */}
        <div className="bg-black/70 text-luxury-beige text-[10px] font-bold py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center select-none uppercase tracking-[0.25em] relative backdrop-blur-sm border-b border-white/10">
          <div className="hidden sm:flex items-center space-x-5">
            <span className="flex items-center text-gray-400 hover:text-luxury-gold transition-colors duration-300">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-luxury-gold" /> +91 8468845759
            </span>
            <span className="flex items-center text-gray-400 hover:text-luxury-gold transition-colors duration-300">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-luxury-gold" /> info@chandanart.com
            </span>
          </div>
          <div className="flex items-center space-x-4 mx-auto sm:mx-0">
            <span className="flex items-center font-bold text-luxury-beige">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-luxury-gold animate-pulse" />
              Premium Craftsmanship & Global Scaling
            </span>
          </div>
        </div>

        {/* Main Sticky Navbar */}
        <nav
          className={`w-full transition-all duration-500 ease-in-out ${
            isScrolled
              ? 'glass-nav-scrolled shadow-lg shadow-luxury-black/5'
              : 'glass-nav border-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
              {/* Mobile Menu Icon */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-luxury-charcoal dark:text-luxury-beige p-2 cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Brand Logo */}
              <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
                <Link href="/" className="flex flex-col items-center lg:items-start group select-none">
                  <span className="font-serif text-lg sm:text-2xl font-extrabold tracking-[0.25em] uppercase text-luxury-black dark:text-luxury-beige group-hover:text-luxury-gold transition-colors duration-300">
                    Chandan
                  </span>
                  <span className="text-[8px] tracking-[0.35em] font-sans font-extrabold text-gray-400 dark:text-zinc-500 uppercase -mt-0.5 group-hover:text-luxury-gold-dark transition-colors duration-300">
                    Art Gallery • Delhi
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation Links & Mega Menu trigger */}
              <div className="hidden lg:flex items-center space-x-8">
                <Link href="/shop" className="nav-link text-xs font-bold tracking-[0.15em] text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold duration-200 uppercase">
                  Shop All
                </Link>

                {/* Custom Mega Menu Item */}
                <div className="relative group">
                  <button className="nav-link flex items-center text-xs font-bold tracking-[0.15em] text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold duration-200 uppercase cursor-pointer">
                    Categories <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden group-hover:block w-60">
                    <div className="bg-white/90 dark:bg-zinc-950/90 border border-white/20 dark:border-zinc-900/60 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col space-y-3">
                      {categories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-luxury-gold transition-colors duration-200 uppercase tracking-wider pl-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link href="/blog" className="nav-link text-xs font-bold tracking-[0.15em] text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold duration-200 uppercase">
                  Journal
                </Link>
                <Link href="/about" className="nav-link text-xs font-bold tracking-[0.15em] text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold duration-200 uppercase">
                  Heritage
                </Link>
                <Link href="/contact" className="nav-link text-xs font-bold tracking-[0.15em] text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold duration-200 uppercase">
                  Contact
                </Link>
              </div>

              {/* Search, Wishlist, Cart Actions */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Search Bar Desktop */}
                <div ref={searchRef} className="relative hidden md:block w-48 lg:w-64">
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      placeholder="Search bespoke frames..."
                      className="w-full px-4 py-2 pl-9 rounded-2xl border border-gray-200/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold/50 backdrop-blur-sm transition-all duration-300 font-medium text-luxury-black dark:text-white"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-gray-400" />
                  </form>

                  {/* Live Search Results Dropdown */}
                  <AnimatePresence>
                    {showSearchDropdown && (searchQuery.length >= 2 || searching) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-3 w-full sm:w-80 bg-white/90 dark:bg-zinc-950/95 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 max-h-80 overflow-y-auto"
                      >
                        {searching ? (
                          <div className="text-xs text-gray-400 text-center py-2">Searching suggestions...</div>
                        ) : searchResults.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-2">No frames found matching your query</div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[9px] uppercase tracking-widest text-luxury-gold font-extrabold border-b border-gray-50 dark:border-zinc-800/50 pb-1">
                              Matching Collections
                            </p>
                            {searchResults.map((prod) => (
                              <Link
                                key={prod.slug}
                                href={`/product/${prod.slug}`}
                                onClick={() => {
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="flex items-center space-x-3 p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl duration-200"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-900 overflow-hidden flex-shrink-0 border border-gray-200/50 dark:border-zinc-800/50">
                                  <img
                                    src={prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150'}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-luxury-black dark:text-white truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] font-extrabold text-luxury-gold mt-0.5">
                                    ₹{prod.price ? prod.price.toLocaleString() : 'Price on request'}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold p-2 duration-200 cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-12" />
                  ) : (
                    <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-45" />
                  )}
                </button>

                {/* Wishlist */}
                <Link
                  href="/profile?tab=wishlist"
                  className="text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold p-2 duration-200 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Cart Drawer Trigger */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold p-2 relative duration-200 cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                  title="Open Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 bg-luxury-black text-white dark:bg-luxury-gold dark:text-luxury-black text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-950 scale-90">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
                {/* Profile Portal */}
                {user ? (
                  <Link
                    href="/profile"
                    className="flex items-center justify-center duration-200"
                    title="My Profile"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-luxury-gold/30 hover:border-luxury-gold transition-colors duration-300">
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-luxury-gold/20 text-luxury-gold font-bold flex items-center justify-center text-sm uppercase border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/30 transition-all duration-300">
                        {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-luxury-charcoal dark:text-luxury-beige hover:text-luxury-gold p-2 duration-200 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    title="Sign In"
                  >
                    <LogIn className="w-5 h-5" />
                  </Link>
                )}

              </div>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white/95 dark:bg-zinc-950/95 border-t border-gray-200/30 dark:border-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-lg"
              >
                <div className="px-4 py-6 space-y-4 flex flex-col">
                  {/* Search Bar Mobile */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bespoke frames..."
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold text-luxury-black dark:text-white"
                    />
                    <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-gray-400" />
                  </form>

                  <div className="flex flex-col space-y-3 font-serif text-lg border-b border-gray-50 dark:border-zinc-900 pb-4">
                    <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold uppercase text-sm font-bold">
                      Shop All
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-luxury-gold uppercase text-sm pl-4 font-bold"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold uppercase text-sm font-bold">
                      Journal
                    </Link>
                    <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold uppercase text-sm font-bold">
                      Heritage
                    </Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold uppercase text-sm font-bold">
                      Contact
                    </Link>
                    {user ? (
                      <Link 
                        href="/profile" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="hover:text-luxury-gold uppercase text-sm font-bold flex items-center space-x-2.5 pt-2 border-t border-gray-100 dark:border-zinc-900/50"
                      >
                        {user.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt="Profile" 
                            className="w-6 h-6 rounded-full object-cover border border-luxury-gold/30"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-luxury-gold/20 text-luxury-gold font-bold flex items-center justify-center text-xs uppercase border border-luxury-gold/30">
                            {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>My Profile</span>
                      </Link>
                    ) : (
                      <Link 
                        href="/login" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="hover:text-luxury-gold uppercase text-sm font-bold flex items-center space-x-2.5 pt-2 border-t border-gray-100 dark:border-zinc-900/50"
                      >
                        <LogIn className="w-4 h-4 text-luxury-gold" />
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 font-bold uppercase tracking-wider">
                    <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-luxury-gold" /> +91 8468845759</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-luxury-gold" /> New Delhi, India</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Spacers to prevent fixed header overlap - wait, pages themselves will have top spacing or top-padding */}

      {/* Mounting Cart Drawer */}
      <CartDrawer />
    </>
  );
}
