import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';

const ALLOWED_BUCKETS = new Set(['product-images', 'profile-avatars']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const userSupabase = await getServerClient();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;
    const bucket = String(formData.get('bucket') || '');

    if (!file || !bucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Invalid upload bucket' }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, or GIF images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be 5MB or smaller.' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();
    if (bucket === 'product-images') {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type === 'image/gif'
            ? 'gif'
            : 'jpg';

    const folder = bucket === 'profile-avatars' ? user.id : 'products';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await adminSupabase.storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Upload crash:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
