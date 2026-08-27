import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { HelpCircle, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Handcrafted Photo Frames | Chandan Art Gallery Delhi',
  description: 'Get answers about custom photo frame orders, religious art, shipping, and WhatsApp ordering at Chandan Art Gallery Delhi. Learn about our handcrafted wooden frames and traditional Indian handicrafts.',
  keywords: [
    'photo frame FAQ Delhi',
    'custom frame questions',
    'religious art FAQ',
    'handcrafted frames FAQ',
    'WhatsApp ordering questions',
    'wooden handicrafts FAQ',
    'Chandan Art Gallery questions',
    'custom framing Delhi FAQ'
  ],
  openGraph: {
    title: 'FAQ - Handcrafted Photo Frames | Chandan Art Gallery Delhi',
    description: 'Answers to common questions about our handcrafted photo frames, religious art, and custom framing services in Delhi.',
    images: [
      {
        url: 'https://chandanartgallery.in/og-faq.jpg',
        width: 1200,
        height: 630,
        alt: 'Chandan Art Gallery FAQ',
      },
    ],
  },
  alternates: {
    canonical: 'https://chandanartgallery.in/faq',
  },
};

const faqs = [
  {
    question: 'How do I order custom handcrafted photo frames?',
    answer: 'Browse our collection of handcrafted wooden frames, select your preferred style, then click "Buy on WhatsApp" to discuss custom dimensions, wood types, finishes, and pricing with our skilled artisans. We specialize in made-to-order frames using premium materials.',
  },
  {
    question: 'Can you create custom sizes for photo frames and religious art?',
    answer: 'Absolutely! Our expert craftsmen can create frames in any size from small 4x6 inches to large wall displays up to 60x80 inches. Share your exact requirements via WhatsApp and we\'ll provide a detailed quote for your custom wooden frame.',
  },
  {
    question: 'What types of wood do you use for handcrafted frames?',
    answer: 'We use premium seasoned woods including New Zealand pine, authentic Rajasthani teak, and natural mango wood. All our frames are made from genuine wood - no composites or synthetic materials - ensuring durability and traditional craftsmanship.',
  },
  {
    question: 'Do you ship handcrafted frames nationwide across India?',
    answer: 'Yes, we safely ship our handcrafted photo frames and religious art across India using five-ply corrugated packaging, bubble wrap, and corner guards. If any damage occurs during transit, we replace the item free of charge.',
  },
  {
    question: 'How does WhatsApp ordering work for custom frames?',
    answer: 'After selecting a frame style, click "Buy on WhatsApp" and you\'ll be connected with our lead curator who will help finalize dimensions, wood selection, finish options, pricing, and secure shipping details before we begin crafting your custom piece.',
  },
  {
    question: 'What religious art and frames do you offer?',
    answer: 'We create custom religious frames for Hindu deities, Islamic calligraphy, Christian art, and other spiritual artwork. Our artisans can craft frames specifically designed to complement and honor religious imagery with traditional Indian craftsmanship.',
  },
  {
    question: 'How long does it take to craft custom wooden frames?',
    answer: 'Handcrafted frames typically take 7-14 days to complete, depending on size and complexity. Religious art frames with intricate details may require additional time. We\'ll provide an exact timeline when you place your WhatsApp order.',
  },
  {
    question: 'What is your return policy for handcrafted items?',
    answer: 'Since each piece is handcrafted to your specifications, returns are evaluated case-by-case. If there\'s damage, manufacturing defect, or the item doesn\'t match your order specifications, we\'ll work with you to repair or replace it at no charge.',
  },
];

export default function FAQPage() {
  // FAQ page schema markup
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'name': 'Frequently Asked Questions - Chandan Art Gallery Delhi',
    'description': 'Common questions about handcrafted photo frames, religious art, and custom framing services',
    'url': 'https://chandanartgallery.in/faq',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    })),
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://chandanartgallery.in'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'FAQ',
          'item': 'https://chandanartgallery.in/faq'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Navbar />
      <main className="lux-container flex-grow pt-24 pb-20">
        <div className="page-hero">
          <div>
            <p className="commerce-kicker">Support Center</p>
            <h1 className="lux-section-title mt-3">Frequently Asked Questions</h1>
          </div>
          <p className="lux-copy">
            Everything you need to know about our handcrafted photo frames, religious art, custom framing services, and WhatsApp ordering process in Delhi.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.65fr_1fr]">
          <aside className="lux-card rounded-[22px] p-7 lg:sticky lg:top-28 lg:self-start">
            <HelpCircle className="h-7 w-7 text-neutral-600" />
            <h2 className="mt-5 font-sans text-3xl text-neutral-800 dark:text-neutral-100">Need Specific Help?</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-400">
              Every handcrafted frame is unique. For exact dimensions, wood types, finishes, religious art specifications, and delivery timelines, message our artisan studio directly.
            </p>
            <a 
              href="https://wa.me/918468845759?text=Hi%2C%20I%20have%20a%20question%20about%20your%20handcrafted%20frames"
              target="_blank"
              rel="noopener noreferrer" 
              className="lux-button lux-button-primary mt-7"
            >
              <MessageSquare className="h-4 w-4" />
              Contact Artisan Studio
            </a>
          </aside>

          <div className="space-y-3">
            {faqs.map((item, index) => (
              <details key={item.question} className="lux-card group rounded-[18px] p-6">
                <summary className="cursor-pointer list-none font-sans text-2xl text-neutral-800 dark:text-neutral-100">
                  {item.question}
                </summary>
                <div className="mt-4 border-t border-black/10 pt-4 text-sm leading-8 text-stone-700 dark:border-white/10 dark:text-stone-400">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
