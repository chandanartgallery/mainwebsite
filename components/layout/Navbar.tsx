"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogIn,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import CartDrawer from "./CartDrawer";
import SmartImage from "@/components/ui/SmartImage";

const categories = [
  {
    name: "Photo Frames",
    href: "/shop?category=photo-frames",
    note: "Classic timber borders",
  },
  {
    name: "Custom Frames",
    href: "/shop?category=custom-photo-frames",
    note: "Made to your dimensions",
  },
  {
    name: "Acrylic Prints",
    href: "/shop?category=acrylic-frames",
    note: "Clean gallery depth",
  },
  {
    name: "Canvas Prints",
    href: "/shop?category=canvas-prints",
    note: "Soft wall-scale editions",
  },
  {
    name: "Religious Art",
    href: "/shop?category=religious-frames",
    note: "Mandir-ready pieces",
  },
];

export default function Navbar() {
  const router = useRouter();
  const { user, role } = useAuthStore();
  const { setCartOpen } = useUIStore();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const scrollAccumulatorRef = useRef(0);
  const lastDirectionRef = useRef<1 | -1 | 0>(0);
  const tickingRef = useRef(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );

    lastScrollYRef.current = window.scrollY;
    scrollAccumulatorRef.current = 0;
    lastDirectionRef.current = 0;

    const updateNavVisibility = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;

      setIsScrolled(currentScrollY > 16);

      if (currentScrollY <= 24) {
        setNavVisible(true);
        scrollAccumulatorRef.current = 0;
        lastDirectionRef.current = 0;
        return;
      }

      if (Math.abs(delta) < 2) return;

      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      if (lastDirectionRef.current !== direction) {
        scrollAccumulatorRef.current = 0;
        lastDirectionRef.current = direction;
      }

      scrollAccumulatorRef.current += delta;

      if (
        direction === 1 &&
        scrollAccumulatorRef.current > 30 &&
        currentScrollY > 90
      ) {
        setNavVisible(false);
        scrollAccumulatorRef.current = 0;
      }

      if (direction === -1 && scrollAccumulatorRef.current < -18) {
        setNavVisible(true);
        scrollAccumulatorRef.current = 0;
      }
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(updateNavVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearching(true);
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            name,
            slug,
            price,
            product_images (
              image_url
            )
          `,
          )
          .ilike("name", `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      setShowSearchDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const iconButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/12 text-luxury-beige shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-luxury-gold/45 hover:bg-white/18 hover:text-luxury-gold dark:border-white/10 dark:bg-white/5 dark:text-luxury-beige";

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: navVisible ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.52 }}
        className="fixed left-0 right-0 z-50 px-3 pt-3 sm:px-5"
      >
        <nav
          className={`${isScrolled ? "glass-nav-scrolled" : "glass-nav"} relative z-30 mx-auto max-w-[1420px] overflow-visible rounded-full px-3.5 py-2 sm:px-4`}
          style={{
            backdropFilter: isScrolled
              ? "blur(30px) saturate(160%)"
              : "blur(26px) saturate(155%)",
            WebkitBackdropFilter: isScrolled
              ? "blur(30px) saturate(160%)"
              : "blur(26px) saturate(155%)",
          }}
        >
          <div className="flex min-h-[62px] items-center justify-between gap-3 sm:min-h-[66px]">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className={iconButton}
                aria-label="Open navigation"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>

            <Link
              href="/"
              className="group hidden min-w-fit items-center gap-2.5 rounded-full px-1.5 sm:flex ml-2"
            >
              <span className="leading-none">
                <span className="brand-logotype block text-[1.46rem] text-luxury-beige transition group-hover:text-luxury-gold">
                  Chandan Art Gallery
                </span>
                <span className="mt-1 block text-[0.58rem] font-extrabold uppercase tracking-[0.26em] text-luxury-beige/68">
                  New Delhi - India
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-6 xl:gap-7 lg:flex">
              <Link
                href="/shop"
                className="nav-link text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-beige hover:text-luxury-gold"
              >
                Shop
              </Link>

              <div className="group relative">
                <button className="nav-link flex items-center text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-beige hover:text-luxury-gold">
                  Collections <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </button>

                <div className="absolute left-0 top-full z-50 mt-2 min-w-[520px] w-[520px] opacity-0 invisible transition-all duration-250 ease-out group-hover:visible group-hover:opacity-100">
                  <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[rgba(18,16,13,0.86)] shadow-[0_40px_110px_rgba(0,0,0,0.28)] backdrop-blur-[48px] backdrop-saturate-[140%]" style={{ WebkitBackdropFilter: 'blur(48px) saturate(140%)', backdropFilter: 'blur(48px) saturate(140%)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/[0.12] via-transparent to-black/[0.06]" />
                    <div className="relative grid gap-2 px-6 py-5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="group/item rounded-[18px] px-4 py-3 transition duration-200 hover:bg-white/5"
                        >
                          <span className="block text-[1rem] font-semibold leading-tight text-white transition-colors group-hover/item:text-luxury-gold">
                            {cat.name}
                          </span>
                          <span className="mt-1 block text-[0.86rem] leading-relaxed text-stone-300">
                            {cat.note}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/blog"
                className="nav-link text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-beige hover:text-luxury-gold"
              >
                Journal
              </Link>
              <Link
                href="/about"
                className="nav-link text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-beige hover:text-luxury-gold"
              >
                Heritage
              </Link>
              <Link
                href="/contact"
                className="nav-link text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-beige hover:text-luxury-gold"
              >
                Contact
              </Link>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="nav-link text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-luxury-gold"
                >
                  Studio
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div ref={searchRef} className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-luxury-gold" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    placeholder="Search pieces"
                    className="lux-input h-11 w-44 rounded-full py-2 pl-10 pr-4 text-xs font-semibold placeholder:text-stone-400 lg:w-56"
                  />
                </form>

                <AnimatePresence>
                  {showSearchDropdown &&
                    (searchQuery.length >= 2 || searching) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.22 }}
                        className="lux-card absolute right-0 mt-3 w-80 rounded-[18px] p-3"
                      >
                        {searching ? (
                          <div className="py-5 text-center text-xs text-stone-500">
                            Searching the collection...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="py-5 text-center text-xs text-stone-500">
                            No matching pieces found.
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {searchResults.map((prod) => (
                              <Link
                                key={prod.slug}
                                href={`/product/${prod.slug}`}
                                onClick={() => {
                                  setShowSearchDropdown(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 rounded-[18px] p-2 transition hover:bg-luxury-gold/10"
                              >
                                <div className="h-12 w-12 overflow-hidden rounded-[12px] bg-stone-100 dark:bg-stone-900">
                                  <SmartImage
                                    src={
                                      prod.product_images?.[0]?.image_url ||
                                      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150"
                                    }
                                    alt={prod.name}
                                    className="h-full w-full object-cover"
                                    containerClassName="h-full w-full"
                                    fallbackLabel="No image"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-serif text-sm text-luxury-charcoal dark:text-luxury-beige">
                                    {prod.name}
                                  </p>
                                  <p className="text-[0.68rem] font-bold text-luxury-gold">
                                    {prod.price
                                      ? `₹${prod.price.toLocaleString()}`
                                      : "Price on request"}
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

              <button
                onClick={toggleTheme}
                className={iconButton}
                title={
                  theme === "light"
                    ? "Switch to Dark Mode"
                    : "Switch to Light Mode"
                }
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
              <Link
                href="/profile?tab=wishlist"
                className={`${iconButton} hidden sm:inline-flex`}
                title="Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className={`${iconButton} relative`}
                title="Open Cart"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-[12px] bg-luxury-gold px-1 text-[0.62rem] font-black text-luxury-black ring-2 ring-luxury-offwhite dark:ring-luxury-black">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              {user ? (
                <Link href="/profile" className={iconButton} title="My Profile">
                  {user.user_metadata?.avatar_url ? (
                    <SmartImage
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                      containerClassName="h-8 w-8 rounded-full"
                      referrerPolicy="no-referrer"
                      fallbackLabel="User"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Link>
              ) : (
                <Link href="/login" className={iconButton} title="Sign In">
                  <LogIn className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close menu backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-10 bg-black/40 backdrop-blur-xl lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="lux-card relative z-20 mx-auto mt-3 max-h-[calc(100svh-6.5rem)] max-w-7xl overflow-hidden rounded-[22px] border-white/12 bg-[rgba(13,11,9,0.74)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-2xl lg:hidden"
              >
                <form onSubmit={handleSearchSubmit} className="relative mb-3">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the collection"
                    className="lux-input h-11 w-full rounded-full py-2 pl-11 pr-4 text-sm"
                  />
                </form>

                <div className="grid gap-0.5">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-[16px] px-4 py-2 font-serif text-2xl leading-none text-luxury-charcoal dark:text-luxury-beige"
                  >
                    Shop all
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-[16px] px-4 py-2 transition hover:bg-luxury-gold/10"
                    >
                      <span className="block font-serif text-xl leading-none text-luxury-charcoal dark:text-luxury-beige">
                        {cat.name}
                      </span>
                      <span className="text-[0.82rem] leading-tight text-stone-500 dark:text-stone-400">
                        {cat.note}
                      </span>
                    </Link>
                  ))}
                  {[
                    ["Journal", "/blog"],
                    ["Heritage", "/about"],
                    ["Contact", "/contact"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-[16px] px-4 py-1.5 font-serif text-lg leading-none text-luxury-charcoal transition hover:bg-luxury-gold/10 dark:text-luxury-beige"
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-1.5 border-t border-black/10 pt-3 text-[0.68rem] text-stone-500 dark:border-white/10 dark:text-stone-400">
                  <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />
                  Bespoke consultation by WhatsApp, crafted in India.
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer />
    </>
  );
}
