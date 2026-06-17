import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getServerClient } from '@/lib/supabase/server';

// Create a new inquiry (WhatsApp / Form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, name, email, phone, message, type } = body;

    const supabase = getAdminClient();
    
    // Log the inquiry into the database
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_id: userId || null,
        product_id: productId || null,
        name: name || 'Guest User',
        email: email || null,
        phone: phone || null,
        message,
        type: type || 'whatsapp',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting inquiry:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log an analytics event for this WhatsApp redirect / form submission
    const eventType = type === 'whatsapp' ? 'whatsapp_click' : 'inquiry_submit';
    
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      product_id: productId || null,
      path: '/cart',
      session_id: 'inquiry-' + Date.now(),
      created_at: new Date().toISOString()
    });

    // If the inquiry is a contact form submission, send an email notification using Resend
    if (type === 'contact_form') {
      const resendApiKey = process.env.RESEND_API_KEY;
      const recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || 'chandanartgallery919@gmail.com';

      if (resendApiKey) {
        // Run this asynchronously (we can log failures but we won't block the HTTP response)
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Chandan Art Gallery <onboarding@resend.dev>',
            to: [recipientEmail],
            subject: `New Contact Form Submission from ${name || 'Guest User'}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #eaeaea; padding-bottom: 20px;">
                  <h1 style="color: #1a1a1a; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: normal; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Chandan Art Gallery</h1>
                  <p style="color: #c5a880; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0; font-weight: bold;">Electronic Inquiry Notification</p>
                </div>
                
                <h3 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #f2f2f2; padding-bottom: 8px;">Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #7f7f7f; text-transform: uppercase; letter-spacing: 0.5px;">Client Name</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;">${name || 'Guest User'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #7f7f7f; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;"><a href="mailto:${email}" style="color: #c5a880; text-decoration: none; border-bottom: 1px dashed #c5a880;">${email || 'N/A'}</a></td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #7f7f7f; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;"><a href="tel:${phone}" style="color: #c5a880; text-decoration: none;">${phone}</a></td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #7f7f7f; text-transform: uppercase; letter-spacing: 0.5px;">Received At</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</td>
                  </tr>
                </table>
                
                <div style="margin-top: 25px; padding: 20px; background-color: #faf8f5; border-left: 3px solid #c5a880; border-radius: 8px;">
                  <h4 style="margin: 0 0 10px 0; color: #7f7f7f; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Inquiry Message</h4>
                  <p style="margin: 0; color: #333333; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" style="display: inline-block; padding: 10px 20px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 8px;">
                    View in Admin Panel
                  </a>
                </div>
                
                <p style="font-size: 10px; color: #a5a5a5; margin-top: 35px; text-align: center; line-height: 1.4;">
                  This is an automated notification from the Chandan Art Gallery platform.<br />
                  Please reply directly to the client's email above.
                </p>
              </div>
            `,
          })
        }).then(async (emailRes) => {
          if (!emailRes.ok) {
            const errBody = await emailRes.text();
            console.error('Resend API failed to send email:', errBody);
          } else {
            console.log('Resend email sent successfully.');
          }
        }).catch((err) => {
          console.error('Error during Resend email fetch request:', err);
        });
      } else {
        console.warn('Resend API Key is missing. Email notification was not sent.');
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Inquiry log crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get inquiries of the logged in user
export async function GET(request: NextRequest) {
  try {
    const userSupabase = await getServerClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        message,
        type,
        status,
        created_at,
        products (
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user inquiries:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error('User inquiries fetch crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update inquiry status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const userSupabase = await getServerClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Confirm role is admin
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

    const { data, error } = await adminSupabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inquiry:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Inquiry update crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
