import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, title, comment, recaptchaToken } = body;

    if (!productId || !userName || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify reCAPTCHA token if site key and secret key are configured
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
    
    // Insert review, pending moderation approval
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId || null,
        user_name: userName,
        rating: rating,
        title: title || '',
        comment: comment || '',
        is_approved: false // requires admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting review:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Reviews submission crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
