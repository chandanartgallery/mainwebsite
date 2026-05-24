'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
    const setSessionCookies = (accessToken: string, refreshToken: string) => {
      const commonAttrs = `path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureAttr}`;
      document.cookie = `sb-access-token=${accessToken}; ${commonAttrs}`;
      document.cookie = `sb-refresh-token=${refreshToken}; ${commonAttrs}`;
    };
    const clearSessionCookies = () => {
      const commonAttrs = `path=/; max-age=0; SameSite=Lax${secureAttr}`;
      document.cookie = `sb-access-token=; ${commonAttrs}`;
      document.cookie = `sb-refresh-token=; ${commonAttrs}`;
    };
    // Initial load
    const loadSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSessionCookies(session.access_token, session.refresh_token);
          // Fetch role from profile table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setAuth(session.user, (profile?.role as 'user' | 'admin') || 'user');
        } else {
          clearSessionCookies();
          setAuth(null, null);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        clearSessionCookies();
        setAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSessionCookies(session.access_token, session.refresh_token);

        // Fetch user profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setAuth(session.user, (profile?.role as 'user' | 'admin') || 'user');
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        // Clear cookies only on explicit sign out or if initial load has no session
        clearSessionCookies();
        setAuth(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setLoading]);

  return <>{children}</>;
}
