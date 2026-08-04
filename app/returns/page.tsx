import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ClipboardCheck, MessageSquare, PackageOpen } from 'lucide-react';

export const metadata = {
  title: 'Returns & Customizations | Chandan Art Gallery',
  description: 'Learn about return policies, customization guidelines, and how Chandan Art Gallery handles bespoke frame modifications.',
};

const steps = [
  ['1', 'Confirm', 'We confirm product type, size, finish, pricing, and delivery notes before production begins.'],
  ['2', 'Craft', 'Made-to-order frames and art pieces enter production after your approval.'],
  ['3', 'Resolve', 'If there is transit damage or a production issue, we review photos and resolve through repair or replacement support.'],
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="lux-container flex-grow pt-24 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Order support</p>
            <h1 className="lux-section-title mt-3">Returns & Customizations</h1>
          </div>
          <p className="lux-copy">
            A professional policy for bespoke ecommerce: clear confirmation before production, careful packaging, and personal support after delivery.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map(([number, title, body]) => (
            <section key={title} className="lux-card rounded-[22px] p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-neutral-900 text-sm font-black text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900">
                {number}
              </span>
              <h2 className="mt-6 font-serif text-3xl text-neutral-800 dark:text-neutral-100">{title}</h2>
              <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <section className="lux-panel rounded-[22px] p-7">
            <PackageOpen className="h-6 w-6 text-neutral-600" />
            <h2 className="mt-5 font-serif text-3xl text-neutral-800 dark:text-neutral-100">Returns</h2>
            <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">
              Because many products are customized, returns are reviewed individually. If there is a manufacturing issue or transit damage, we work with you toward a fair resolution.
            </p>
          </section>
          <section className="lux-panel rounded-[22px] p-7">
            <ClipboardCheck className="h-6 w-6 text-neutral-600" />
            <h2 className="mt-5 font-serif text-3xl text-neutral-800 dark:text-neutral-100">Custom Work</h2>
            <p className="mt-3 text-sm leading-8 text-stone-700 dark:text-stone-400">
              Size, finish, frame style, and artwork details are confirmed via WhatsApp before production, keeping your final order precise and documented.
            </p>
          </section>
        </div>

        <a href="https://wa.me/918468845759" className="lux-button lux-button-primary mt-8 w-full sm:w-auto">
          <MessageSquare className="h-4 w-4" />
          Contact support
        </a>
      </main>
      <Footer />
    </div>
  );
}
