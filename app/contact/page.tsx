'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Recaptcha from '@/components/ui/Recaptcha';
import { useAuthStore } from '@/store/authStore';
import { 
  Sparkles, Mail, Phone, MapPin, Send, 
  MessageSquare, Loader2, CheckCircle2 
} from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !email || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          name,
          email,
          phone,
          message,
          type: 'contact_form',
          recaptchaToken, // optional if proxy handles it or we verify it
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit contact request');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setRecaptchaToken(null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-offwhite dark:bg-luxury-black">
      <Navbar />

      <main className="lux-container flex-grow pt-36 pb-20">
        
        {/* Page Header */}
        <div className="mb-16 grid gap-5 select-none lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
          <span className="lux-eyebrow">Dialogue with curators</span>
          <h1 className="lux-section-title mt-3">
            Establish Contact
          </h1>
          </div>
          <p className="lux-copy max-w-xl lg:justify-self-end">
            Discuss mockups, custom sizing projects, or order logistics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Premium Contact Details */}
          <div className="lux-card lg:col-span-2 p-8 rounded-[22px] space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-luxury-black dark:text-white uppercase tracking-wide">
                Studio Headquarters
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-400 leading-relaxed font-sans">
                Feel free to contact our Rajasthani design consultants for direct mock renders of your sizing layouts.
              </p>
            </div>

            <div className="space-y-5 text-xs font-sans text-stone-700 dark:text-stone-400">
              
              {/* Phone detail */}
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-luxury-gold/10 text-luxury-gold rounded-[12px] mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-luxury-charcoal dark:text-white uppercase text-[10px] tracking-wider">Curator Hotline</span>
                  <a href="tel:+918468845759" className="hover:text-luxury-gold transition-colors block mt-0.5">+91 8468845759</a>
                </div>
              </div>

              {/* Email detail */}
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-luxury-gold/10 text-luxury-gold rounded-[12px] mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-luxury-charcoal dark:text-white uppercase text-[10px] tracking-wider">Electronic Inquiries</span>
                  <a href="mailto:support@chandanartgallery.com" className="hover:text-luxury-gold transition-colors block mt-0.5">support@chandanartgallery.com</a>
                </div>
              </div>

              {/* Address detail */}
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-luxury-gold/10 text-luxury-gold rounded-[12px] mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-luxury-charcoal dark:text-white uppercase text-[10px] tracking-wider">Bespoke Studio</span>
                  <span className="block mt-0.5 leading-relaxed">
                    Chandan Art Gallery, Jaipur-Delhi National Highway,<br />
                    Jaipur, Rajasthan, 302001, India
                  </span>
                </div>
              </div>

            </div>

            {/* Quick WhatsApp Redirection */}
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-6">
              <span className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-3">Direct curator dialogue</span>
              <a 
                href="https://wa.me/918468845759" 
                target="_blank"
                className="w-full flex items-center justify-center py-3.5 bg-luxury-gold/10 text-luxury-gold-dark border border-luxury-gold/25 hover:bg-luxury-gold hover:text-luxury-black rounded-[12px] text-xs font-bold uppercase tracking-wider transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Curator Chat on WhatsApp
              </a>
            </div>

          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lux-card lg:col-span-3 p-8 sm:p-10 rounded-[22px]">
            
            {success ? (
              <div className="p-6 text-center space-y-4">
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-[12px]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-luxury-black dark:text-white uppercase">Inquiry Received</h3>
                <p className="text-sm text-stone-700 dark:text-stone-400 leading-relaxed font-sans max-w-sm mx-auto">
                  Thank you for establish contact. Our local framing curator will review your design requirements and email or call back shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-luxury-black dark:bg-luxury-gold text-white dark:text-luxury-black text-xs font-bold uppercase tracking-wider rounded-[12px]"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                
                {error && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-[12px] leading-relaxed">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-extrabold uppercase text-stone-600 dark:text-stone-400 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="lux-input w-full px-4 py-3 rounded-[12px] text-luxury-charcoal dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold uppercase text-stone-600 dark:text-stone-400 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="lux-input w-full px-4 py-3 rounded-[12px] text-luxury-charcoal dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-stone-600 dark:text-stone-400 mb-1.5">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="lux-input w-full px-4 py-3 rounded-[12px] text-luxury-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-stone-600 dark:text-stone-400 mb-1.5">Design Inquiry message *</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your frame choices, photo sizes, color styles..."
                    rows={5}
                    className="lux-input w-full p-4 rounded-[12px] text-luxury-charcoal dark:text-white"
                  />
                </div>

                {/* reCAPTCHA component */}
                {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                  <Recaptcha onChange={setRecaptchaToken} />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="lux-button lux-button-primary w-full disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Filing Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Launch Design Inquiry
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
