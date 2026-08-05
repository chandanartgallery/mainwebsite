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
    default: "Chandan Art Gallery | Luxury Custom Framing & Indian Wall Decor",
    template: "%s | Chandan Art Gallery",
  },
  description: "Curated collection of handcrafted wood photo frames, acrylic stands, canvas prints, religious art pieces, and custom home framing in India. Order directly on WhatsApp.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Chandan Art Gallery",
    title: "Chandan Art Gallery | Luxury Custom Framing & Indian Wall Decor",
    description: "Handcrafted frames, canvas prints, and custom framing in India. Order on WhatsApp.",
  },
  robots: {
    index: true,
    follow: true,
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
      lang="en"
      className={cn("h-full", "antialiased", poppins.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
