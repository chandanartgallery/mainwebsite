'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, setGlobalRecaptchaToken } from '@/lib/supabase/client';
import Recaptcha from '@/components/ui/Recaptcha';
import { LogIn, Mail, Lock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        options: {
          redirectTo: `${window.location.origin}/api/supabase/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
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

      if (!password) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
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
          href="/" 
          className="inline-flex items-center text-xs tracking-wider text-gray-500 hover:text-luxury-gold transition-colors duration-200 mb-6 uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Store
        </Link>
        <h2 className="text-center text-4xl font-serif tracking-tight text-luxury-black dark:text-luxury-beige">
          Chandan Art Gallery
        </h2>
        <p className="mt-2 text-center text-xs tracking-widest text-gray-500 uppercase">
          Welcome Back | Sign In
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white dark:bg-zinc-900/60 dark:border dark:border-zinc-800/80 py-8 px-4 shadow-xl rounded-2xl sm:px-10 backdrop-blur-md">
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

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wider text-gray-400 uppercase">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 text-luxury-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold text-sm"
                  placeholder="name@example.com"
                />
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:text-luxury-gold transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
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
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative flex justify-center text-xs uppercase tracking-widest my-4">
              <span className="bg-white dark:bg-zinc-900 px-3 text-gray-400">Or continue with</span>
            </div>

            <div>
              <button
                type="button"
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer"
              >
                {/* SVG Google icon */}
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.486 0-6.315-2.829-6.315-6.315s2.83-6.315 6.315-6.315c1.5 0 2.87.525 3.96 1.402l3.1-3.1C18.99 2.062 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.845 0 10.748-4.14 10.748-11.24 0-.58-.063-1.135-.175-1.67L12.24 10.285z"
                  />
                </svg>
                Sign In with Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-luxury-gold hover:underline transition-all duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
