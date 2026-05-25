import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import AuthProvider from "@/components/providers/AuthProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ToastContainer from "@/components/ui/Toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chandan Art Gallery | Luxury Custom Framing & Indian Wall Decor",
  description: "Curated collection of handcrafted wood photo frames, acrylic stands, canvas prints, religious art pieces, and custom home framing in India. Order directly on WhatsApp.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const saved = localStorage.getItem('theme');
                const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && system)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-luxury-offwhite text-luxury-charcoal dark:bg-luxury-black dark:text-luxury-beige transition-colors duration-300">
        <SmoothScrollProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
