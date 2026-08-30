import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import AuthProvider from "@/components/providers/AuthProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ToastContainer from "@/components/ui/Toast";
import DevAdminButton from "@/components/DevAdminButton";
import CookieNotice from "@/components/CookieNotice";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Handcrafted Photo Frames & Religious Art - Chandan Art Gallery Delhi",
    template: "%s | Chandan Art Gallery Delhi",
  },
  description: "Premium handcrafted wooden photo frames, religious frames, and traditional Indian handicrafts in Delhi. Custom photo frames, wooden art, and decorative trays made by skilled artisans. WhatsApp ordering available.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chandanartgallery.in'),
  keywords: [
    "handcrafted photo frames",
    "religious photo frames", 
    "wooden photo frames Delhi",
    "custom photo frames",
    "handmade wooden art",
    "traditional Indian handicrafts",
    "religious frames Delhi",
    "wooden handicrafts",
    "photo frames in Delhi",
    "custom wooden frames",
    "decorative frames",
    "artisan crafted frames"
  ],
  authors: [{ name: "Chandan Art Gallery" }],
  creator: "Chandan Art Gallery",
  publisher: "Chandan Art Gallery",
  category: "Art & Handicrafts",
  classification: "Handcrafted Photo Frames and Religious Art",
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Chandan Art Gallery",
    title: "Handcrafted Photo Frames & Religious Art - Chandan Art Gallery Delhi",
    description: "Premium handcrafted wooden photo frames and religious art in Delhi. Custom frames, traditional handicrafts, and decorative pieces by skilled artisans.",
    url: "https://chandanartgallery.in",
    countryName: "India",
    images: [
      {
        url: "https://chandanartgallery.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Chandan Art Gallery - Handcrafted Photo Frames Delhi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Photo Frames & Religious Art - Chandan Art Gallery Delhi",
    description: "Premium handcrafted wooden photo frames and religious art in Delhi. Custom frames made by skilled artisans.",
    images: ["https://chandanartgallery.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://chandanartgallery.in",
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "Delhi",
    "geo.position": "28.6139;77.2090",
    "ICBM": "28.6139, 77.2090",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `(function(){try{var saved=localStorage.getItem('theme');var system=window.matchMedia('(prefers-color-scheme: dark)').matches;if(saved==='dark'||(!saved&&system)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={cn("h-full", "antialiased", poppins.variable, "font-sans")}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href={`https://${process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : 'pykgahwdzqotbchvaviq.supabase.co'}`} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="flex min-h-full flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
            <CookieNotice />
            <DevAdminButton />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
