import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms of Service | Chandan Art Gallery',
  description: 'Review the terms of service for using Chandan Art Gallery, including ordering, shipping, and custom framing policies.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <div className="space-y-8 text-gray-700 dark:text-zinc-300">
          <h1 className="text-4xl font-serif text-luxury-black dark:text-white">Terms of Service</h1>
          <p className="text-sm leading-relaxed">
            These terms govern your use of Chandan Art Gallery’s website and custom framing services. By browsing or ordering, you agree to the conditions below.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Ordering</h2>
            <p className="text-sm leading-relaxed">
              All orders are confirmed via WhatsApp. Since our products are often customized, availability and delivery are finalized after order review by our team.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Shipping and Delivery</h2>
            <p className="text-sm leading-relaxed">
              We ship across India using secure packaging. Delivery timelines depend on product customization and shipping location.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Customer Agreements</h2>
            <p className="text-sm leading-relaxed">
              Once the order is confirmed, any changes to dimensions or finish may affect price and delivery. Final approval is required before production begins.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
