import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, PackageCheck, Ruler, Truck } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Chandan Art Gallery',
  description: 'Review the terms of service for using Chandan Art Gallery, including ordering, shipping, and custom framing policies.',
};

const terms = [
  {
    icon: CheckCircle2,
    title: 'Order Confirmation',
    body: 'Orders are finalized through WhatsApp or direct studio communication. Product availability, dimensions, finish, and final quotation are confirmed before production begins.',
  },
  {
    icon: Truck,
    title: 'Shipping and Delivery',
    body: 'We ship across India using protective packaging. Delivery timelines depend on customization complexity, destination, and courier availability.',
  },
  {
    icon: Ruler,
    title: 'Custom Changes',
    body: 'Custom dimensions, finish changes, and layout revisions may affect price and lead time. Production starts after final approval from the customer.',
  },
  {
    icon: PackageCheck,
    title: 'After-Sales Support',
    body: 'Damage, defect, or adjustment requests are reviewed by our team with repair, replacement, or resolution guidance based on the order type.',
  },
];

export default function TermsPage() {
  return (
    <div className="commerce-page min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="lux-container flex-grow pt-36 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Shopping terms</p>
            <h1 className="lux-section-title mt-3">Terms of Service</h1>
          </div>
          <p className="lux-copy">
            Practical terms for a premium ecommerce experience where products are often bespoke and confirmed with a curator before dispatch.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {terms.map(({ icon: Icon, title, body }) => (
            <section key={title} className="lux-card rounded-[22px] p-7">
              <Icon className="h-6 w-6 text-luxury-gold" />
              <h2 className="mt-5 font-serif text-3xl text-luxury-charcoal dark:text-luxury-beige">{title}</h2>
              <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
