import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/adminAuth';
import { pickProductFields, isUuid } from '@/lib/sanitizeProduct';

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
  const urls = (imageUrls || [])
    .filter((u): u is string => typeof u === 'string')
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 20);
  if (urls.length === 0) return;

  // Only allow https image URLs
  const safe = urls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  });
  if (safe.length === 0) return;

  await admin.from('product_images').delete().eq('product_id', productId);
  await admin.from('product_images').insert(
    safe.map((url, i) => ({
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
    return NextResponse.json({ error: 'Could not load products.' }, { status: 400 });
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
    const product = pickProductFields(body.product);
    if (!product.name || !product.slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    const { data: created, error } = await auth.admin
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;

    await syncProductImages(auth.admin, created.id, body.imageUrls);

    revalidateProductPaths(created.slug);
    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Could not create product.' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    if (!isUuid(body.id)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    const product = pickProductFields(body.product);
    const { data: updated, error } = await auth.admin
      .from('products')
      .update(product)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    if (body.imageUrls !== undefined) {
      await syncProductImages(auth.admin, body.id, body.imageUrls);
    }

    revalidateProductPaths(updated.slug);
    if (typeof body.previousSlug === 'string' && body.previousSlug !== updated.slug) {
      revalidateProductPaths(body.previousSlug);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Could not update product.' }, { status: 400 });
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
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Missing or invalid product id' }, { status: 400 });
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
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Could not delete product.' }, { status: 400 });
  }
}
