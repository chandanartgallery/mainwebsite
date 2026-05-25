import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Lock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Chandan Art Gallery',
  description: 'Read our privacy policy to understand how we protect your personal information when you shop with Chandan Art Gallery.',
};

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect the details needed to serve a made-to-order ecommerce experience: name, email, phone, delivery preferences, WhatsApp inquiry context, product selections, and custom framing notes.',
  },
  {
    title: 'How We Use It',
    body: 'Your information is used to confirm orders, prepare quotations, coordinate delivery, support after-sales requests, and make your future consultations smoother. We do not sell customer data.',
  },
  {
    title: 'Security',
    body: 'We use trusted platforms for authentication, form handling, and order communication. Payment and final order confirmation happen through secure agreed channels during consultation.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="commerce-page min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="lux-container flex-grow pt-36 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Customer care</p>
            <h1 className="lux-section-title mt-3">Privacy Policy</h1>
          </div>
          <p className="lux-copy">
            A clear explanation of how Chandan Art Gallery handles personal details across browsing, consultation, ordering, and support.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1fr]">
          <aside className="lux-card rounded-[22px] p-7 lg:sticky lg:top-28 lg:self-start">
            <ShieldCheck className="h-7 w-7 text-luxury-gold" />
            <h2 className="mt-5 font-serif text-3xl text-luxury-charcoal dark:text-luxury-beige">Built for trust.</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-400">
              Our shopping model is consultation-led, so we only ask for details that help us quote, customize, pack, ship, and support your order.
            </p>
            <div className="mt-7 space-y-3 text-sm text-stone-700 dark:text-stone-400">
              <p className="flex items-center gap-3"><Lock className="h-4 w-4 text-luxury-gold" /> Secure account handling</p>
              <p className="flex items-center gap-3"><MessageSquare className="h-4 w-4 text-luxury-gold" /> WhatsApp order context</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-luxury-gold" /> Email support records</p>
            </div>
          </aside>

          <div className="space-y-4">
            {sections.map((section) => (
              <section key={section.title} className="lux-card rounded-[22px] p-7">
                <h2 className="font-serif text-2xl text-luxury-charcoal dark:text-luxury-beige">{section.title}</h2>
                <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
