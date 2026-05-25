'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { supabase, setGlobalRecaptchaToken } from '@/lib/supabase/client';
import PasswordStrength from '@/components/auth/PasswordStrength';
import Recaptcha from '@/components/ui/Recaptcha';

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
      setGlobalRecaptchaToken(captchaToken);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Your password has been successfully updated.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commerce-page flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-luxury-offwhite dark:bg-luxury-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/login" className="inline-flex items-center text-xs tracking-wider text-stone-600 hover:text-luxury-gold transition-colors duration-200 mb-6 uppercase">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
        </Link>
        <h1 className="text-center text-4xl font-serif tracking-tight text-luxury-black dark:text-luxury-beige">Reset password</h1>
        <p className="mt-2 text-center text-xs tracking-widest text-stone-600 dark:text-stone-400 uppercase">Account security</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="lux-card rounded-[22px] py-8 px-5 sm:px-10">
          <p className="text-sm text-stone-700 dark:text-stone-400 mb-6 text-center leading-relaxed">
            Enter a new password that meets the strength requirements below.
          </p>
          {error && (
            <div className="mb-4 flex items-start rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 flex items-start rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Sparkles className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold tracking-wider text-stone-600 dark:text-stone-400 uppercase">New Password</label>
              <div className="mt-1 relative">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="lux-input block w-full px-4 py-3 rounded-[12px] text-sm" placeholder="••••••••" />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-stone-500" />
              </div>
              <PasswordStrength value={password} onValidationChange={setIsPasswordValid} />
            </div>
            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && <Recaptcha onChange={setCaptchaToken} />}
            <button type="submit" disabled={loading} className="lux-button lux-button-primary w-full disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
