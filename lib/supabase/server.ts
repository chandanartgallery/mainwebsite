import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper to get cookies safely on the server side
async function getAuthToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('sb-access-token')?.value || null;
  } catch (e) {
    // cookies() can throw in static generation pages
    return null;
  }
}

// User-scoped Supabase client for server actions/API routes
export async function getServerClient() {
  const token = await getAuthToken();
  const options: any = {};

  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
}

// Admin-scoped Supabase client that bypasses RLS
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
