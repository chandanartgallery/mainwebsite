import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'FAQ | Chandan Art Gallery',
  description: 'Frequently asked questions about custom framing, ordering, shipping, and support at Chandan Art Gallery.',
};

const faqs = [
  {
    question: 'How do I place a custom order?',
    answer: 'Use the product pages to select your preferred frame style, then click Buy on WhatsApp to finalize dimensions, materials, and payment details with our design team.'
  },
  {
    question: 'Can I request a size not shown on the product page?',
    answer: 'Yes. We accept custom sizes for most frames and canvas prints. Share your requirements on WhatsApp and we will craft a tailored quote.'
  },
  {
    question: 'What is your return policy?',
    answer: 'Since many items are made-to-order, we review returns on a case-by-case basis. If there is damage or a manufacturing defect, we will repair or replace the item.'
  },
  {
    question: 'Do you ship nationwide?',
    answer: 'Yes, we ship across India using secure packaging and trusted logistics partners. Delivery times vary based on the product and destination.'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <div className="space-y-8 text-gray-700 dark:text-zinc-300">
          <div>
            <h1 className="text-4xl font-serif text-luxury-black dark:text-white">Frequently Asked Questions</h1>
            <p className="text-sm leading-relaxed">
              Find answers to common questions about our ordering process, custom framing, shipping, and returns.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <summary className="cursor-pointer text-lg font-semibold text-luxury-black dark:text-white list-none">
                  {item.question}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
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
