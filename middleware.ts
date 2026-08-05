import { NextRequest, NextResponse } from 'next/server';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'on',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block scratch / local tooling paths if ever deployed
  if (pathname.startsWith('/scratch')) {
    return applySecurityHeaders(new NextResponse('Not Found', { status: 404 }));
  }

  // Production: require a session cookie before hitting the admin RSC page
  if (
    pathname.startsWith('/admin') &&
    process.env.NODE_ENV === 'production' &&
    !request.cookies.get('sb-access-token')?.value
  ) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return applySecurityHeaders(NextResponse.redirect(login));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
