import { getAdminClient, getServerClient } from '@/lib/supabase/server';

export async function verifyAdmin() {
  const userSupabase = await getServerClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: 'Unauthorized', status: 401 };
  }

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { ok: false as const, error: 'Forbidden', status: 403 };
  }

  return { ok: true as const, user, admin };
}
