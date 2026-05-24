import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Returns & Customizations | Chandan Art Gallery',
  description: 'Learn about return policies, customization guidelines, and how Chandan Art Gallery handles bespoke frame modifications.',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <div className="space-y-8 text-gray-700 dark:text-zinc-300">
          <h1 className="text-4xl font-serif text-luxury-black dark:text-white">Returns & Customizations</h1>
          <p className="text-sm leading-relaxed">
            We take great care in our custom framing and artwork services. Here is how returns and customization requests are handled.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Customization Process</h2>
            <p className="text-sm leading-relaxed">
              Every order is customized on request. Details such as size, material, finish, and frame style are confirmed over WhatsApp before production.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Returns</h2>
            <p className="text-sm leading-relaxed">
              Because products are often made-to-order, returns are handled individually. If there is damage or a quality issue, we work with you to repair or replace the item.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Customer Support</h2>
            <p className="text-sm leading-relaxed">
              For any adjustment request or issue, contact our support team on WhatsApp or email. We provide personalized support for all custom orders.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
