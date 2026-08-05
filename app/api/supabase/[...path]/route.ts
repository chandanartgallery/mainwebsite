import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientKey } from '@/lib/rateLimit';

const ALLOWED_PREFIXES = [
  '/auth/v1/',
  '/rest/v1/',
  '/storage/v1/',
  '/realtime/v1/',
];

function isAllowedSubpath(subpath: string): boolean {
  if (!subpath.startsWith('/')) return false;
  if (subpath.includes('..')) return false;
  return ALLOWED_PREFIXES.some((prefix) => subpath.startsWith(prefix));
}

async function handleProxy(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, 'supabase-proxy'), 120, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    const url = new URL(request.url);
    const subpath = url.pathname.replace(/^\/api\/supabase/, '');

    if (!isAllowedSubpath(subpath)) {
      return NextResponse.json({ error: 'Forbidden path' }, { status: 403 });
    }

    const targetUrl = new URL(`${supabaseUrl}${subpath}${url.search}`);
    if (!targetUrl.href.startsWith(supabaseUrl)) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    const isAuth = subpath.startsWith('/auth/v1/');
    const isSensitiveAuth =
      isAuth &&
      (subpath.includes('/signup') ||
        subpath.includes('/token') ||
        subpath.includes('/recover') ||
        subpath.includes('/otp'));

    if (isSensitiveAuth) {
      const captchaToken = request.headers.get('x-recaptcha-token');
      if (!captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification token is missing' },
          { status: 400 }
        );
      }

      if (captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
        const { verifyRecaptcha } = await import('@/lib/recaptcha');
        const isCaptchaValid = await verifyRecaptcha(captchaToken);
        if (!isCaptchaValid) {
          return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
        }
      }
    }

    const headers = new Headers();
    const headersToForward = [
      'content-type',
      'accept',
      'prefer',
      'range',
      'authorization',
      'x-client-info',
    ];

    for (const headerName of headersToForward) {
      const headerValue = request.headers.get(headerName);
      if (headerValue) headers.set(headerName, headerValue);
    }

    headers.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    let body: BodyInit | null = null;
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

    const response = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
      duplex: body ? 'half' : undefined,
    } as RequestInit);

    const responseHeaders = new Headers();
    for (const headerName of ['content-type', 'content-range', 'prefer-applied', 'cache-control']) {
      const headerValue = response.headers.get(headerName);
      if (headerValue) responseHeaders.set(headerName, headerValue);
    }

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Supabase Proxy Error:', error);
    return NextResponse.json({ error: 'Upstream request failed' }, { status: 502 });
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, apikey, prefer, range, x-client-info, x-recaptcha-token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
