'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Recaptcha from '@/components/ui/Recaptcha';
import { useAuthStore } from '@/store/authStore';
import {
  Mail, Phone, MapPin, Send,
  MessageSquare, Loader2, CheckCircle2
} from 'lucide-react';
import SplitText from '@/components/SplitText';
import FadeContent from '@/components/FadeContent';
import SpotlightCard from '@/components/SpotlightCard';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          name,
          email,
          phone: phone || undefined,
          message,
          type: 'contact_form',
          recaptchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send inquiry');

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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="lux-container flex-grow pt-24 pb-16">
        <div className="mb-10 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <SplitText
            text="Contact"
            tag="h1"
            splitType="chars"
            delay={40}
            duration={0.7}
            ease="power3.out"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0}
            textAlign="left"
            className="lux-section-title !block text-neutral-900 dark:text-neutral-50"
          />
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Questions about custom sizing, finishes, or orders — we&apos;ll get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <FadeContent className="lg:col-span-2">
            <SpotlightCard
              className="!rounded-none border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              spotlightColor="rgba(0, 0, 0, 0.06)"
            >
            <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-neutral-400" />
                <div>
                  <span className="block text-xs font-medium text-neutral-900 dark:text-white">Phone</span>
                  <a href="tel:+918468845759" className="hover:underline">+91 8468845759</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-neutral-400" />
                <div>
                  <span className="block text-xs font-medium text-neutral-900 dark:text-white">Email</span>
                  <a href="mailto:support@chandanartgallery.com" className="hover:underline">support@chandanartgallery.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-neutral-400" />
                <div>
                  <span className="block text-xs font-medium text-neutral-900 dark:text-white">Studio</span>
                  <span className="block leading-relaxed">
                    Chandan Art Gallery, Jaipur-Delhi National Highway,<br />
                    Jaipur, Rajasthan, 302001, India
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <a
                href="https://wa.me/918468845759"
                target="_blank"
                className="w-full flex items-center justify-center py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </a>
            </div>
            </SpotlightCard>
          </FadeContent>

          <FadeContent delay={100} className="lg:col-span-3 border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Message sent</h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Thanks — we&apos;ll review your note and reply soon.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-sm font-medium underline text-neutral-700 dark:text-neutral-300"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Name *</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="lux-input w-full px-3 py-2.5"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="lux-input w-full px-3 py-2.5"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="lux-input w-full px-3 py-2.5"
                    placeholder="+91 …"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="lux-input w-full px-3 py-2.5 resize-none"
                    placeholder="Tell us what you need…"
                  />
                </div>

                <Recaptcha onChange={setRecaptchaToken} />

                <button
                  type="submit"
                  disabled={loading}
                  className="lux-button lux-button-primary disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </FadeContent>
        </div>
      </main>

      <Footer />
    </div>
  );
}
