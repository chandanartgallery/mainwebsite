import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { type, id, action, reply } = body;

    if (type === 'review') {
      if (action === 'approve') {
        const { error } = await auth.admin
          .from('reviews')
          .update({ is_approved: true })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await auth.admin.from('reviews').delete().eq('id', id);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'comment') {
      if (action === 'approve') {
        const { error } = await auth.admin
          .from('product_comments')
          .update({ is_approved: true })
          .eq('id', id);
        if (error) throw error;
      } else if (action === 'reject') {
        const { error } = await auth.admin.from('product_comments').delete().eq('id', id);
        if (error) throw error;
      } else if (action === 'reply' && reply) {
        const { data: comment } = await auth.admin
          .from('product_comments')
          .select('product_id')
          .eq('id', id)
          .single();

        if (!comment) throw new Error('Comment not found');

        const { error: replyErr } = await auth.admin.from('product_comments').insert({
          product_id: comment.product_id,
          user_name: 'Admin Curator (Chandan)',
          comment: reply,
          parent_id: id,
          is_approved: true,
        });
        if (replyErr) throw replyErr;

        const { error: approveErr } = await auth.admin
          .from('product_comments')
          .update({ is_approved: true })
          .eq('id', id);
        if (approveErr) throw approveErr;
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'feature') {
      const { featured } = body;
      const { error } = await auth.admin
        .from('products')
        .update({ is_featured: featured })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid moderation type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
