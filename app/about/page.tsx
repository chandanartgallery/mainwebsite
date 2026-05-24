import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Sparkles, Calendar, BookOpen, User } from 'lucide-react';

export const metadata = {
  title: 'Our Heritage | Chandan Art Gallery',
  description: 'Learn about our traditional Rajasthani woodcarving artisans and custom framing history in India.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16 space-y-16">
        
        {/* Intro Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold">The Artisan Story</span>
          <h1 className="text-4xl sm:text-5xl font-serif text-luxury-black dark:text-white uppercase tracking-wider leading-tight">
            Our Heritage & Craft
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">
            Bridging age-old Rajasthani wood carving with high-end modern framing
          </p>
        </div>

        {/* Large Story Cover */}
        <div className="aspect-[21/9] bg-white rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm select-none">
          <img 
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200" 
            alt="Artisan workspace" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Two-Column Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-luxury-black dark:text-white uppercase tracking-wider border-l-2 border-luxury-gold pl-4">
              Bespoke Beginnings
            </h3>
            <p>
              Founded in the cultural heart of Rajasthan, Chandan Art Gallery began as a humble cooperative of traditional woodcarving specialists. Our founders recognized a vital niche: while high-definition print photography and digital canvas transfers were advancing, the ancient craft of framing was losing its soul to synthetic plastics and fake wraps.
            </p>
            <p>
              We pledged to restore genuine, solid, seasoned timber framing to the modern household. By sourcing genuine New Zealand Pine and ancient Rajasthan Teakwood, we established a luxury brand that respects the natural textures and knots of real wood.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="font-serif text-xl text-luxury-black dark:text-white uppercase tracking-wider border-l-2 border-luxury-gold pl-4">
              The Curator Standard
            </h3>
            <p>
              Every frame manufactured in our studio undergoes a rigorous, multi-stage refinement checklist. We season our teakwood for weeks to prevent warping, cut borders using high-precision CNC machinery, and employ our signature anti-glare museum acrylic to ensure your precious memories block out UV radiation and yellowing.
            </p>
            <p>
              Furthermore, we reject the generic online checkout kart standard. We believe luxury framing is a highly personal dialogue. By establishing a direct Buy on WhatsApp design consultation, our collectors speak directly with specialists to review mock mock-ups, customize dimensions, and secure the ultimate logistics arrangement.
            </p>
          </div>
        </div>

        {/* Brand Milestones Grid */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-8 sm:p-10 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center select-none shadow-sm">
          <div className="space-y-3">
            <span className="text-4xl font-serif text-luxury-gold font-bold">15,000+</span>
            <span className="block text-xs uppercase font-bold text-luxury-charcoal dark:text-white tracking-widest">Custom Frames Crafted</span>
            <span className="text-[10px] text-gray-400 block mt-1">From small portraits up to massive estate canvases</span>
          </div>

          <div className="space-y-3 border-y sm:border-y-0 sm:border-x border-gray-100 dark:border-zinc-800/80 py-6 sm:py-0">
            <span className="text-4xl font-serif text-luxury-gold font-bold">100%</span>
            <span className="block text-xs uppercase font-bold text-luxury-charcoal dark:text-white tracking-widest">Seasoned Hardwoods</span>
            <span className="text-[10px] text-gray-400 block mt-1">Zero synthetic vinyl wraps or composites used</span>
          </div>

          <div className="space-y-3">
            <span className="text-4xl font-serif text-luxury-gold font-bold">24k</span>
            <span className="block text-xs uppercase font-bold text-luxury-charcoal dark:text-white tracking-widest">Gold Foil Religious Art</span>
            <span className="text-[10px] text-gray-400 block mt-1">Spiritual mandir icons enclosed in solid teak boxes</span>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
