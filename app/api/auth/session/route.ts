import { NextRequest, NextResponse } from 'next/server';

/**
 * Sets HttpOnly session cookies so access/refresh tokens are not readable by JS.
 * Client AuthProvider calls this instead of document.cookie.
 */

function cookieOptions(request: NextRequest) {
  const secure = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax' as const,
    secure,
    httpOnly: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = typeof body.access_token === 'string' ? body.access_token : '';
    const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token : '';

    if (!accessToken || !refreshToken || accessToken.length > 4096 || refreshToken.length > 4096) {
      return NextResponse.json({ error: 'Invalid tokens' }, { status: 400 });
    }

    // Basic JWT shape check (do not trust payload; APIs still verify with Supabase)
    if (accessToken.split('.').length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    const opts = cookieOptions(request);
    response.cookies.set('sb-access-token', accessToken, opts);
    response.cookies.set('sb-refresh-token', refreshToken, opts);
    return response;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const opts = { ...cookieOptions(request), maxAge: 0 };
  response.cookies.set('sb-access-token', '', opts);
  response.cookies.set('sb-refresh-token', '', opts);
  return response;
}
