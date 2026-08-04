import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

const ALLOWED_TYPES = new Set(['whatsapp', 'contact_form']);
const MAX_MESSAGE = 4000;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_PHONE = 30;

function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Create a new inquiry (WhatsApp / Form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { userId, productId, type } = body;

    // Normalize legacy client value
    if (type === 'form') type = 'contact_form';
    if (!ALLOWED_TYPES.has(type)) type = 'whatsapp';

    const name = sanitizeText(body.name, MAX_NAME) || 'Guest User';
    const email = sanitizeText(body.email, MAX_EMAIL);
    const phone = sanitizeText(body.phone, MAX_PHONE);
    const message = sanitizeText(body.message, MAX_MESSAGE);
    const recaptchaToken = body.recaptchaToken;

    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    }

    if (type === 'contact_form') {
      if (!email || !isValidEmail(email)) {
        return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
      }
      if (!sanitizeText(body.name, MAX_NAME)) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
      }

      if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY) {
        if (!recaptchaToken) {
          return NextResponse.json({ error: 'reCAPTCHA token is missing' }, { status: 400 });
        }
        const ok = await verifyRecaptcha(recaptchaToken);
        if (!ok) {
          return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
        }
      }
    }

    // Prefer authenticated user id when present
    const userClient = await getServerClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (user) {
      userId = user.id;
    } else {
      userId = null;
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_id: userId,
        product_id: productId || null,
        name,
        email: email || null,
        phone: phone || null,
        message,
        type,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id, type, status, created_at')
      .single();

    if (error) {
      console.error('Error inserting inquiry:', error);
      return NextResponse.json({ error: 'Could not save inquiry.' }, { status: 400 });
    }

    const eventType = type === 'whatsapp' ? 'whatsapp_click' : 'inquiry_submit';

    await supabase.from('analytics_events').insert({
      event_type: eventType,
      product_id: productId || null,
      path: type === 'contact_form' ? '/contact' : '/cart',
      session_id: 'inquiry-' + Date.now(),
      created_at: new Date().toISOString(),
    });

    if (type === 'contact_form') {
      const resendApiKey = process.env.RESEND_API_KEY;
      const recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || 'chandanartgallery919@gmail.com';

      if (resendApiKey) {
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = escapeHtml(phone);
        const safeMessage = escapeHtml(message);

        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Chandan Art Gallery <onboarding@resend.dev>',
            to: [recipientEmail],
            reply_to: email || undefined,
            subject: `New Contact Form Submission from ${name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 20px; margin: 0 0 16px;">Chandan Art Gallery</h1>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                ${phone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${safeMessage}</p>
              </div>
            `,
          }),
        }).catch((err) => console.error('Resend email error:', err));
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Inquiry log crash:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userSupabase = await getServerClient();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(
        `
        id,
        message,
        type,
        status,
        created_at,
        products (
          name,
          slug
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userSupabase = await getServerClient();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;
    const allowed = ['pending', 'replied', 'closed'];
    if (!id || !allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
