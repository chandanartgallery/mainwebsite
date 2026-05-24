import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy | Chandan Art Gallery',
  description: 'Read our privacy policy to understand how we protect your personal information when you shop with Chandan Art Gallery.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <div className="space-y-8 text-gray-700 dark:text-zinc-300">
          <h1 className="text-4xl font-serif text-luxury-black dark:text-white">Privacy Policy</h1>
          <p className="text-sm leading-relaxed">
            Chandan Art Gallery values your privacy. We collect only the information needed to fulfill your orders, improve your shopping experience, and provide support through WhatsApp and email.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              We may collect your name, email address, phone number, shipping address, and WhatsApp consent when you place an order or inquire about custom framing. We also store order details and preference data to improve our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">How We Use It</h2>
            <p className="text-sm leading-relaxed">
              Your data is used to process orders, respond to inquiries, confirm delivery, and personalize our communications. We never sell your information to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-luxury-black dark:text-white">Security</h2>
            <p className="text-sm leading-relaxed">
              We protect your information using secure transport and trusted service providers. Payment and checkout are handled through secure channels and our WhatsApp order flow.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
