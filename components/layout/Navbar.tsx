"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogIn,
  Menu,
  Moon,
  Search,
  ShoppingBag,
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
  { name: "Photo Frames", href: "/shop?category=photo-frames", note: "Classic timber borders" },
  { name: "Custom Frames", href: "/shop?category=custom-photo-frames", note: "Made to your dimensions" },
  { name: "Acrylic Prints", href: "/shop?category=acrylic-frames", note: "Clean gallery depth" },
  { name: "Canvas Prints", href: "/shop?category=canvas-prints", note: "Wall-scale editions" },
  { name: "Religious Art", href: "/shop?category=religious-frames", note: "Mandir-ready pieces" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role } = useAuthStore();
  const { setCartOpen } = useUIStore();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");

    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
          .select(`name, slug, price, product_images (image_url)`)
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Home hero is dark — use white nav there. Elsewhere (and after scroll) use dark text on frosted glass.
  const onDarkHero = pathname === "/" && !isScrolled;

  const iconButton = onDarkHero
    ? "inline-flex h-9 w-9 items-center justify-center text-white/90 transition hover:text-white dark:text-neutral-200 dark:hover:text-white"
    : "inline-flex h-9 w-9 items-center justify-center text-neutral-800 transition hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white";

  const navLinkIdle = onDarkHero
    ? "text-white/85 hover:text-white dark:text-neutral-200 dark:hover:text-white"
    : "text-neutral-700 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white";
  const navLinkActive = onDarkHero
    ? "text-white dark:text-white"
    : "text-neutral-950 dark:text-white";
  const navUnderline = onDarkHero ? "bg-white" : "bg-neutral-950 dark:bg-white";

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <header
          className={`pointer-events-auto mx-auto max-w-[1280px] overflow-visible rounded-2xl transition-all duration-300 ${
            onDarkHero
              ? "bg-white/[0.05] backdrop-blur-2xl backdrop-saturate-150 dark:bg-neutral-950/50"
              : "bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-neutral-950/70 dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          }`}
        >
        <nav className="mx-auto flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`${iconButton} lg:hidden`}
              aria-label="Open navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link href="/" className="group min-w-fit">
              <span
                className={`brand-logotype block text-[1.15rem] tracking-[-0.01em] transition group-hover:opacity-80 sm:text-[1.35rem] ${
                  onDarkHero ? "text-white dark:text-neutral-50" : "text-neutral-950 dark:text-neutral-50"
                }`}
              >
                Chandan Art Gallery
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/shop"
              className={`relative px-3 py-2 text-[0.78rem] font-medium tracking-[0.04em] transition ${
                isActive("/shop") ? navLinkActive : navLinkIdle
              }`}
            >
              Shop
              {isActive("/shop") && (
                <span className={`absolute inset-x-3 -bottom-0.5 h-px ${navUnderline}`} />
              )}
            </Link>            <div className="group relative">
              <button
                type="button"
                aria-haspopup="menu"
                className={`flex items-center px-3 py-2 text-[0.78rem] font-medium tracking-[0.04em] transition ${navLinkIdle}`}
              >
                Collections{" "}
                <ChevronDown className="ml-1 h-3.5 w-3.5 transition duration-300 group-hover:rotate-180" />
              </button>
              {/* pt-3 keeps the hover bridge across the gap so the menu stays open */}
              <div className="invisible absolute left-1/2 top-full z-[60] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div
                  role="menu"
                  className="relative origin-top scale-95 rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition duration-200 group-hover:scale-100 dark:border-white/10 dark:bg-neutral-950/90 dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-white/60 bg-white/90 dark:border-white/10 dark:bg-neutral-950/95"
                  />
                  <div className="relative overflow-hidden rounded-2xl">
                  <div className="border-b border-neutral-200/70 px-4 pb-3 pt-4 dark:border-white/10">
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Browse
                    </p>
                    <p className="mt-1 font-serif text-[1.05rem] tracking-[-0.02em] text-neutral-950 dark:text-white">
                      Collections
                    </p>
                  </div>
                  <div className="p-1.5">
                    {categories.map((cat, i) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        role="menuitem"
                        className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-neutral-100 dark:hover:bg-white/10"
                      >
                        <span className="mt-0.5 w-5 shrink-0 font-serif text-[0.7rem] tabular-nums text-neutral-400 transition group-hover/item:text-neutral-600 dark:text-neutral-500 dark:group-hover/item:text-neutral-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[0.9rem] font-medium tracking-[-0.01em] text-neutral-900 transition group-hover/item:text-neutral-950 dark:text-neutral-100 dark:group-hover/item:text-white">
                              {cat.name}
                            </span>
                            <span
                              aria-hidden
                              className="translate-x-0 text-neutral-400 opacity-0 transition group-hover/item:translate-x-0.5 group-hover/item:opacity-100 dark:text-neutral-400 dark:group-hover/item:text-neutral-200"
                            >
                              →
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] leading-snug text-neutral-500 transition group-hover/item:text-neutral-600 dark:text-neutral-400 dark:group-hover/item:text-neutral-300">
                            {cat.note}
                          </span>
                        </span>
                      </Link>
                    ))}                  </div>
                  <div className="border-t border-neutral-200/70 p-1.5 dark:border-white/10">
                    <Link
                      href="/shop"
                      role="menuitem"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.78rem] font-medium tracking-[0.02em] text-neutral-600 transition hover:bg-neutral-950/[0.04] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                      View all shop
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {[
              { label: "Journal", href: "/blog" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-[0.78rem] font-medium tracking-[0.04em] transition ${
                  isActive(link.href) ? navLinkActive : navLinkIdle
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className={`absolute inset-x-3 -bottom-0.5 h-px ${navUnderline}`} />
                )}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                className={`px-3 py-2 text-[0.78rem] font-medium tracking-[0.04em] transition ${
                  onDarkHero
                    ? "text-white/70 hover:text-white dark:text-neutral-400 dark:hover:text-white"
                    : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <div ref={searchRef} className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 dark:text-neutral-300 ${
                    onDarkHero ? "text-white/75" : "text-neutral-600"
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  placeholder="Search"
                  className={`h-9 w-44 rounded-lg border-0 py-2 pl-9 pr-3 text-xs font-medium outline-none transition lg:w-52 dark:bg-white/10 dark:text-neutral-100 dark:placeholder:text-neutral-300 dark:focus:bg-white/15 ${
                    onDarkHero
                      ? "bg-white/15 text-white placeholder:text-white/70 focus:bg-white/25"
                      : "bg-black/[0.06] text-neutral-900 placeholder:text-neutral-500 focus:bg-black/[0.1]"
                  }`}
                />
              </form>              <AnimatePresence>
                {showSearchDropdown && (searchQuery.length >= 2 || searching) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    {searching ? (
                      <div className="py-4 text-center text-xs text-neutral-500">Searching…</div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-4 text-center text-xs text-neutral-500">No results</div>
                    ) : (
                      <div className="space-y-0.5">
                        {searchResults.map((prod) => (
                          <Link
                            key={prod.slug}
                            href={`/product/${prod.slug}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <div className="h-11 w-11 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
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
                              <p className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                                {prod.name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {prod.price ? `₹${prod.price.toLocaleString()}` : "Price on request"}
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

            <button onClick={toggleTheme} className={iconButton} title="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link href="/profile?tab=wishlist" className={`${iconButton} hidden sm:inline-flex`} title="Wishlist">
              <Heart className="h-4 w-4" />
            </Link>
            <button onClick={() => setCartOpen(true)} className={`${iconButton} relative`} title="Cart">
              <ShoppingBag className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-neutral-950 px-1 text-[0.6rem] font-semibold text-white dark:bg-white dark:text-neutral-900">
                  {cartItemsCount}
                </span>
              )}
            </button>
            {user ? (
              <Link href="/profile" className={iconButton} title="Profile">
                {user.user_metadata?.avatar_url ? (
                  <SmartImage
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-7 w-7 rounded-full object-cover"
                    containerClassName="h-7 w-7 rounded-full"
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
                transition={{ duration: 0.15 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 top-[4.5rem] z-10 bg-black/40 backdrop-blur-[2px] lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative z-20 border-b border-neutral-200 bg-white px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden"
              >
                <form onSubmit={handleSearchSubmit} className="relative mb-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products"
                    className="h-11 w-full border border-neutral-200 bg-transparent py-2 pl-10 pr-3 text-sm outline-none dark:border-neutral-700"
                  />
                </form>

                <div className="grid gap-0.5">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2 py-3 font-serif text-xl text-neutral-900 dark:text-neutral-100"
                  >
                    Shop all
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2 py-2.5 text-sm text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-neutral-100 dark:border-neutral-800" />
                  {[
                    ["Journal", "/blog"],
                    ["About", "/about"],
                    ["Contact", "/contact"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2 py-2.5 text-sm text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      </div>

      <CartDrawer />
    </>
  );
}
