import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { rateLimit, clientKey } from '@/lib/rateLimit';
import { isUuid } from '@/lib/sanitizeProduct';

const MAX_COMMENT = 2000;
const MAX_TITLE = 120;
const MAX_NAME = 80;

function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, 'review'), 5, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many review submissions. Please wait and try again.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const userClient = await getServerClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a review.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, title, comment, recaptchaToken } = body;

    if (!isUuid(productId) || rating == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const cleanComment = sanitizeText(comment, MAX_COMMENT);
    if (cleanComment.length < 10) {
      return NextResponse.json(
        { error: 'Please write a review of at least 10 characters.' },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeText(title, MAX_TITLE);
    const displayName = sanitizeText(
      body.userName ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Member',
      MAX_NAME
    );

    if (!displayName) {
      return NextResponse.json({ error: 'A display name is required.' }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json({ error: 'reCAPTCHA token is missing' }, { status: 400 });
      }
      const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isCaptchaValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    const supabase = getAdminClient();

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this product.' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        user_name: displayName,
        rating: ratingNum,
        title: cleanTitle,
        comment: cleanComment,
        is_approved: false,
      })
      .select('id, product_id, rating, title, is_approved, created_at')
      .single();

    if (error) {
      console.error('Error inserting review:', error);
      return NextResponse.json({ error: 'Could not save review.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Reviews submission crash:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
