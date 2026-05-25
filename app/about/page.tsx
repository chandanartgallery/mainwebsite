import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Our Heritage | Chandan Art Gallery',
  description: 'Learn about our traditional Rajasthani woodcarving artisans and custom framing history in India.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="lux-container flex-grow pt-36 pb-20 space-y-16">
        
        {/* Intro Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="lux-eyebrow">The artisan story</span>
          <h1 className="lux-section-title mt-4">
            Our Heritage & Craft
          </h1>
          <p className="lux-copy mx-auto mt-5 max-w-2xl">
            Bridging age-old Rajasthani wood carving with high-end modern framing
          </p>
        </div>

        {/* Large Story Cover */}
        <div className="aspect-[21/10] bg-white rounded-[24px] overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl select-none">
          <img 
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200" 
            alt="Artisan workspace" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Two-Column Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-stone-600 dark:text-stone-400 leading-8 font-sans">
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
        <div className="lux-card p-8 sm:p-10 rounded-[24px] grid grid-cols-1 sm:grid-cols-3 gap-8 text-center select-none">
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
