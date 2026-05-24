import { NextRequest, NextResponse } from 'next/server';

// Forwarding helper for proxying requests to Supabase
async function handleProxy(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL is not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    // Extract everything after /api/supabase
    const subpath = url.pathname.replace(/^\/api\/supabase/, '');
    const targetUrl = new URL(`${supabaseUrl}${subpath}${url.search}`);

    // Verify reCAPTCHA for sensitive auth endpoints
    const isAuth = subpath.startsWith('/auth/v1/');
    const isSensitiveAuth = isAuth && (
      subpath.includes('/signup') ||
      subpath.includes('/token') ||
      subpath.includes('/recover') ||
      subpath.includes('/otp')
    );

    if (isSensitiveAuth) {
      const captchaToken = request.headers.get('x-recaptcha-token');
      // For local testing, allow fallback if no secret is configured
      if (!captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
        return NextResponse.json({ error: 'reCAPTCHA verification token is missing' }, { status: 400 });
      }

      if (captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
        const { verifyRecaptcha } = await import('@/lib/recaptcha');
        const isCaptchaValid = await verifyRecaptcha(captchaToken);
        if (!isCaptchaValid) {
          return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
        }
      }
    }

    // Clone headers to forward
    const headers = new Headers();
    
    // List of headers to forward from the client
    const headersToForward = [
      'content-type',
      'accept',
      'prefer',
      'range',
      'authorization',
      'x-client-info'
    ];

    for (const headerName of headersToForward) {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    }

    // Always inject the Supabase Anon Key to identify requests
    headers.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    // Get body if request has one
    let body: any = null;
    const method = request.method;
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await request.json());
      } else if (contentType.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    // Perform the backend fetch to Supabase
    const response = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
      duplex: body ? 'half' : undefined
    } as any);

    // Get response headers
    const responseHeaders = new Headers();
    const responseHeadersToForward = [
      'content-type',
      'content-range',
      'prefer-applied',
      'location',
      'cache-control'
    ];

    for (const headerName of responseHeadersToForward) {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    }

    // Read response text/json
    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error: any) {
    console.error('Supabase Proxy Error:', error);
    return NextResponse.json(
      { error: 'Supabase Proxy Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, prefer, range'
    }
  });
}
