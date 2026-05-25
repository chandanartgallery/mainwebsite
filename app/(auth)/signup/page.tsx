'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Lock, Mail, Sparkles, User, UserPlus } from 'lucide-react';
import { supabase, setGlobalRecaptchaToken } from '@/lib/supabase/client';
import PasswordStrength from '@/components/auth/PasswordStrength';
import Recaptcha from '@/components/ui/Recaptcha';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleOAuthLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/api/supabase/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/supabase/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        setMessage('Registration successful. Please check your email to activate your account.');
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commerce-page flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-luxury-offwhite dark:bg-luxury-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center text-xs tracking-wider text-stone-600 hover:text-luxury-gold transition-colors duration-200 mb-6 uppercase">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Store
        </Link>
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-luxury-charcoal text-luxury-beige dark:bg-luxury-beige dark:text-luxury-black">
          <UserPlus className="h-5 w-5" />
        </div>
        <h1 className="text-center text-4xl font-serif tracking-tight text-luxury-black dark:text-luxury-beige">Create your account</h1>
        <p className="mt-2 text-center text-xs tracking-widest text-stone-600 dark:text-stone-400 uppercase">
          Save wishlist, inquiries, and order context
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="lux-card rounded-[22px] px-5 py-8 sm:px-10">
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

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold tracking-wider text-stone-600 dark:text-stone-400 uppercase">Full Name</label>
              <div className="mt-1 relative">
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="lux-input block w-full rounded-[12px] px-4 py-3 text-sm" placeholder="Your full name" />
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold tracking-wider text-stone-600 dark:text-stone-400 uppercase">Email Address</label>
              <div className="mt-1 relative">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="lux-input block w-full rounded-[12px] px-4 py-3 text-sm" placeholder="name@example.com" />
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold tracking-wider text-stone-600 dark:text-stone-400 uppercase">Password</label>
              <div className="mt-1 relative">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="lux-input block w-full rounded-[12px] px-4 py-3 text-sm" placeholder="••••••••" />
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-500" />
              </div>
              <PasswordStrength value={password} onValidationChange={setIsPasswordValid} />
            </div>
            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && <Recaptcha onChange={setCaptchaToken} />}
            <button type="submit" disabled={loading} className="lux-button lux-button-primary w-full disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-stone-600 dark:text-stone-400">
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            Or continue with
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>
          <button type="button" onClick={handleOAuthLogin} disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-black/10 dark:border-white/10 rounded-[12px] text-xs font-bold text-stone-700 dark:text-stone-300 bg-white/60 hover:bg-white dark:bg-transparent dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.486 0-6.315-2.829-6.315-6.315s2.83-6.315 6.315-6.315c1.5 0 2.87.525 3.96 1.402l3.1-3.1C18.99 2.062 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.845 0 10.748-4.14 10.748-11.24 0-.58-.063-1.135-.175-1.67L12.24 10.285z" />
            </svg>
            Sign Up with Google
          </button>
          <p className="mt-8 text-center text-xs text-stone-600 dark:text-stone-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-luxury-gold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
