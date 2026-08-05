'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

async function syncSessionCookies(accessToken: string, refreshToken: string) {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
      credentials: 'same-origin',
    });
  } catch {
    // Non-fatal: client session still works via Supabase storage
  }
}

async function clearSessionCookies() {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch {
    // ignore
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await syncSessionCookies(session.access_token, session.refresh_token);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setAuth(session.user, (profile?.role as 'user' | 'admin') || 'user');
        } else {
          await clearSessionCookies();
          setAuth(null, null);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        await clearSessionCookies();
        setAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncSessionCookies(session.access_token, session.refresh_token);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setAuth(session.user, (profile?.role as 'user' | 'admin') || 'user');
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        await clearSessionCookies();
        setAuth(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setLoading]);

  return <>{children}</>;
}
