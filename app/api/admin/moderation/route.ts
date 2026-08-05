import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { isUuid } from '@/lib/sanitizeProduct';

const REVIEW_ACTIONS = new Set(['approve', 'reject']);
const COMMENT_ACTIONS = new Set(['approve', 'reject', 'reply']);

function sanitizeReply(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, 2000);
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { type, action } = body;

    if (!isUuid(body.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const id = body.id as string;

    if (type === 'review') {
      if (!REVIEW_ACTIONS.has(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
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
      if (!COMMENT_ACTIONS.has(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
      if (action === 'approve') {
        const { error } = await auth.admin
          .from('product_comments')
          .update({ is_approved: true })
          .eq('id', id);
        if (error) throw error;
      } else if (action === 'reject') {
        const { error } = await auth.admin.from('product_comments').delete().eq('id', id);
        if (error) throw error;
      } else if (action === 'reply') {
        const reply = sanitizeReply(body.reply);
        if (reply.length < 2) {
          return NextResponse.json({ error: 'Reply is required' }, { status: 400 });
        }
        const { data: comment } = await auth.admin
          .from('product_comments')
          .select('product_id')
          .eq('id', id)
          .single();

        if (!comment) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

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
      if (typeof body.featured !== 'boolean') {
        return NextResponse.json({ error: 'Invalid featured flag' }, { status: 400 });
      }
      const { error } = await auth.admin
        .from('products')
        .update({ is_featured: body.featured })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid moderation type' }, { status: 400 });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Moderation action failed.' }, { status: 400 });
  }
}
