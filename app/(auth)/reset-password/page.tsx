'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, setGlobalRecaptchaToken } from '@/lib/supabase/client';
import Recaptcha from '@/components/ui/Recaptcha';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { Lock, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your new password');
      return;
    }

    if (!isPasswordValid) {
      setError('Please choose a stronger password matching the requirements');
      return;
    }

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      // Inject the reCAPTCHA token into our Supabase requests
      setGlobalRecaptchaToken(captchaToken);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      setMessage('Your password has been successfully updated.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-luxury-offwhite dark:bg-luxury-black relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-walnut/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link 
          href="/login" 
          className="inline-flex items-center text-xs tracking-wider text-gray-500 hover:text-luxury-gold transition-colors duration-200 mb-6 uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
        </Link>
        <h2 className="text-center text-4xl font-serif tracking-tight text-luxury-black dark:text-luxury-beige">
          Chandan Art Gallery
        </h2>
        <p className="mt-2 text-center text-xs tracking-widest text-gray-500 uppercase">
          Reset Password | Security
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white dark:bg-zinc-900/60 dark:border dark:border-zinc-800/80 py-8 px-4 shadow-xl rounded-2xl sm:px-10 backdrop-blur-md">
          <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">
            Enter your new password below. Ensure it matches our security criteria before submitting.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start text-sm">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-lg flex items-start text-sm">
              <Sparkles className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wider text-gray-400 uppercase">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 text-luxury-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              <PasswordStrength value={password} onValidationChange={setIsPasswordValid} />
            </div>

            {/* reCAPTCHA Widget */}
            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <Recaptcha onChange={setCaptchaToken} />
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-luxury-black dark:bg-luxury-gold dark:text-luxury-black hover:bg-luxury-gold dark:hover:bg-luxury-beige transition-colors duration-300 focus:outline-none disabled:opacity-50 tracking-wider uppercase cursor-pointer"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
