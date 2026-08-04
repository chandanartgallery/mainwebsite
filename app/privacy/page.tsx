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
    body: 'We collect the details needed to serve a made-to-order ecommerce experience: name, email, phone, delivery preferences, WhatsApp inquiry context, product selections, custom framing notes, account profile data, and product reviews you submit while signed in.',
  },
  {
    title: 'How We Use It',
    body: 'Your information is used to confirm orders, prepare quotations, coordinate delivery, moderate reviews and comments, support after-sales requests, and make future consultations smoother. We do not sell customer data.',
  },
  {
    title: 'Accounts and reviews',
    body: 'Wishlist, profile, and product reviews require an account. Reviews are moderated before public display. You are responsible for content you post; we may remove abusive or fraudulent submissions.',
  },
  {
    title: 'Cookies',
    body: 'We use essential cookies for authentication and preferences, and security tools such as reCAPTCHA. See our Cookie Policy for details.',
  },
  {
    title: 'Security',
    body: 'We use trusted platforms for authentication, form handling, and order communication. Payment and final order confirmation happen through secure agreed channels during consultation.',
  },
  {
    title: 'Retention and contact',
    body: 'Inquiry and order records are kept as long as needed for fulfillment and legal obligations. For access or deletion requests, email support@chandanartgallery.com.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="lux-container flex-grow pt-24 pb-20">
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
            <ShieldCheck className="h-7 w-7 text-neutral-600" />
            <h2 className="mt-5 font-serif text-3xl text-neutral-800 dark:text-neutral-100">Built for trust.</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-400">
              Our shopping model is consultation-led, so we only ask for details that help us quote, customize, pack, ship, and support your order.
            </p>
            <div className="mt-7 space-y-3 text-sm text-stone-700 dark:text-stone-400">
              <p className="flex items-center gap-3"><Lock className="h-4 w-4 text-neutral-600" /> Secure account handling</p>
              <p className="flex items-center gap-3"><MessageSquare className="h-4 w-4 text-neutral-600" /> WhatsApp order context</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-neutral-600" /> Email support records</p>
            </div>
          </aside>

          <div className="space-y-4">
            {sections.map((section) => (
              <section key={section.title} className="lux-card rounded-[22px] p-7">
                <h2 className="font-serif text-2xl text-neutral-800 dark:text-neutral-100">{section.title}</h2>
                <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">
                  {section.body}
                  {section.title === 'Cookies' && (
                    <>
                      {' '}
                      <a href="/cookies" className="underline underline-offset-2">
                        Read the Cookie Policy
                      </a>
                      .
                    </>
                  )}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
