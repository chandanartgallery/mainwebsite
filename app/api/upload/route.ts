import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';
import { rateLimit, clientKey } from '@/lib/rateLimit';

const ALLOWED_BUCKETS = new Set(['product-images', 'profile-avatars']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, 'upload'), 20, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait and try again.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

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

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be 5MB or smaller.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImageMime(buffer);
    if (!detected || !ALLOWED_MIME.has(detected)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, or GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Prefer magic-byte MIME over client-declared type
    const contentType = detected;

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

    const ext =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
          ? 'webp'
          : contentType === 'image/gif'
            ? 'gif'
            : 'jpg';

    const folder = bucket === 'profile-avatars' ? user.id : 'products';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await adminSupabase.storage.from(bucket).upload(fileName, buffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed.' }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ success: true, publicUrl });
  } catch (error) {
    console.error('Upload crash:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
