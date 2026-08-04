import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { HelpCircle, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'FAQ | Chandan Art Gallery',
  description: 'Frequently asked questions about custom framing, ordering, shipping, and support at Chandan Art Gallery.',
};

const faqs = [
  {
    question: 'How do I place a custom order?',
    answer: 'Use the product pages to select your preferred frame style, then click Buy on WhatsApp to finalize dimensions, materials, price, and payment details with our design team.',
  },
  {
    question: 'Can I request a size not shown on the product page?',
    answer: 'Yes. Most frames and canvas prints can be made in custom sizes. Share your requirements on WhatsApp and our team will prepare a tailored quote.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Made-to-order products are reviewed case by case. If there is damage or a manufacturing defect, we work with you to repair or replace the item.',
  },
  {
    question: 'Do you ship nationwide?',
    answer: 'Yes, we ship across India using protective packaging and trusted logistics partners. Delivery timelines vary based on destination and customization.',
  },
  {
    question: 'Is online payment available?',
    answer: 'The website supports product discovery and cart preparation. Final payment instructions are shared after your order is confirmed with our curator.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="lux-container flex-grow pt-24 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Support center</p>
            <h1 className="lux-section-title mt-3">Frequently Asked Questions</h1>
          </div>
          <p className="lux-copy">
            Clear answers for a premium ecommerce journey: browse, configure, send to WhatsApp, confirm, craft, and ship.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.65fr_1fr]">
          <aside className="lux-card rounded-[22px] p-7 lg:sticky lg:top-28 lg:self-start">
            <HelpCircle className="h-7 w-7 text-neutral-600" />
            <h2 className="mt-5 font-serif text-3xl text-neutral-800 dark:text-neutral-100">Need a precise answer?</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-400">
              Custom framing is personal. For exact dimensions, finishes, and delivery timelines, message our studio directly.
            </p>
            <a href="https://wa.me/918468845759" className="lux-button lux-button-primary mt-7">
              <MessageSquare className="h-4 w-4" />
              WhatsApp studio
            </a>
          </aside>

          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="lux-card group rounded-[18px] p-6">
                <summary className="cursor-pointer list-none font-serif text-2xl text-neutral-800 dark:text-neutral-100">
                  {item.question}
                </summary>
                <p className="mt-4 border-t border-black/10 pt-4 text-sm leading-8 text-stone-700 dark:border-white/10 dark:text-stone-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
