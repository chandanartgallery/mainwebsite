import type { Metadata } from "next";
import { Manrope, Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import AuthProvider from "@/components/providers/AuthProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ToastContainer from "@/components/ui/Toast";
import DevAdminButton from "@/components/DevAdminButton";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
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
      className={cn("h-full", "antialiased", instrument.variable, manrope.variable, "font-sans", geist.variable)}
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
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <SmoothScrollProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
            <DevAdminButton />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
