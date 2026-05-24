import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const userSupabase = await getServerClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;
    const bucket = formData.get('bucket') as string; // 'product-images' or 'profile-avatars'

    if (!file || !bucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
    }

    // 3. For 'product-images', check if the user is an admin
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

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique file name
    const fileExtension = file.type.split('/')[1] || 'jpg';
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`;

    // 4. Upload to storage using service role client to bypass storage RLS
    const { data, error } = await adminSupabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 5. Get the public URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Upload crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
