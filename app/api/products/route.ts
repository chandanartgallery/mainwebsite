import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/adminAuth';

function revalidateProductPaths(slug?: string) {
  revalidatePath('/');
  revalidatePath('/shop');
  if (slug) revalidatePath(`/product/${slug}`);
}

async function syncProductImages(
  admin: ReturnType<typeof import('@/lib/supabase/server').getAdminClient>,
  productId: string,
  imageUrls?: string[]
) {
  const urls = (imageUrls || []).map((u) => u.trim()).filter(Boolean);
  if (urls.length === 0) return;

  await admin.from('product_images').delete().eq('product_id', productId);
  await admin.from('product_images').insert(
    urls.map((url, i) => ({
      product_id: productId,
      image_url: url,
      is_primary: i === 0,
      display_order: i,
    }))
  );
}

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.admin
    .from('products')
    .select('*, category:categories(name), product_images(image_url, is_primary, display_order)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { product, imageUrls } = body;

    const { data: created, error } = await auth.admin
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;

    await syncProductImages(auth.admin, created.id, imageUrls);

    revalidateProductPaths(created.slug);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, product, imageUrls } = body;

    const { data: updated, error } = await auth.admin
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (imageUrls !== undefined) {
      await syncProductImages(auth.admin, id, imageUrls);
    }

    revalidateProductPaths(updated.slug);
    if (body.previousSlug && body.previousSlug !== updated.slug) {
      revalidateProductPaths(body.previousSlug);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    const { data: existing } = await auth.admin
      .from('products')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await auth.admin.from('products').delete().eq('id', id);
    if (error) throw error;

    revalidateProductPaths(existing?.slug);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
