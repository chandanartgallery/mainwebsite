'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Lock, Mail, Sparkles } from 'lucide-react';
import { supabase, setGlobalRecaptchaToken } from '@/lib/supabase/client';
import Recaptcha from '@/components/ui/Recaptcha';
import AuthShell from '@/components/auth/AuthShell';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.486 0-6.315-2.829-6.315-6.315s2.83-6.315 6.315-6.315c1.5 0 2.87.525 3.96 1.402l3.1-3.1C18.99 2.062 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.845 0 10.748-4.14 10.748-11.24 0-.58-.063-1.135-.175-1.67L12.24 10.285z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const safeNext =
    nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';

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
          redirectTo: `${window.location.origin}/api/supabase/auth/callback?next=${encodeURIComponent(safeNext)}`,
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
    if (!email || !password) {
      setError('Please enter your email and password');
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(safeNext);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue shopping and manage inquiries."
      footer={
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-neutral-950 underline-offset-4 hover:underline dark:text-white"
          >
            Create one
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleOAuthLogin}
        disabled={loading}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 border border-neutral-200 bg-white text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        <GoogleIcon className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          or email
        </span>
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full border border-neutral-200 bg-white pl-10 pr-3.5 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[0.72rem] font-medium text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full border border-neutral-200 bg-white pl-10 pr-3.5 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && <Recaptcha onChange={setCaptchaToken} />}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center bg-neutral-950 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center bg-[#f7f7f5] dark:bg-neutral-950">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
