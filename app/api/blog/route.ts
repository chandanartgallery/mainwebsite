import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/adminAuth';
import { pickBlogFields, isUuid } from '@/lib/sanitizeProduct';

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const post = pickBlogFields(body.post);
    if (!post.title || !post.slug) {
      return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
    }

    const { data, error } = await auth.admin.from('blog_posts').insert(post).select().single();
    if (error) throw error;
    revalidatePath('/blog');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Blog create error:', error);
    return NextResponse.json({ error: 'Could not create post.' }, { status: 400 });
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
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }
    const post = pickBlogFields(body.post);
    const { data, error } = await auth.admin
      .from('blog_posts')
      .update(post)
      .eq('id', body.id)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/blog');
    if (data?.slug) revalidatePath(`/blog/${data.slug}`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json({ error: 'Could not update post.' }, { status: 400 });
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
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
    }
    const { error } = await auth.admin.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/blog');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog delete error:', error);
    return NextResponse.json({ error: 'Could not delete post.' }, { status: 400 });
  }
}
