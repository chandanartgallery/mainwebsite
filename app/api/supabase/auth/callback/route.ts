import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function safeNextPath(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNextPath(requestUrl.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
  }

  // Mirror tokens into HttpOnly cookies for server API auth (not readable by JS)
  const response = NextResponse.redirect(new URL(next, request.url))
  if (data.session) {
    const secure =
      requestUrl.protocol === 'https:' || process.env.NODE_ENV === 'production'
    const common = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax' as const,
      secure,
      httpOnly: true,
    }
    response.cookies.set('sb-access-token', data.session.access_token, common)
    response.cookies.set('sb-refresh-token', data.session.refresh_token, common)
  }

  return response
}
