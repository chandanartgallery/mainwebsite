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
