import { createBrowserClient } from '@supabase/ssr'

// Thread-safe-ish global token container
let currentRecaptchaToken: string | null = null

export const setGlobalRecaptchaToken = (
  token: string | null
) => {
  currentRecaptchaToken = token
}

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options = {}) => {
        const headers = new Headers(
          options.headers || {}
        )

        if (currentRecaptchaToken) {
          headers.set(
            'x-recaptcha-token',
            currentRecaptchaToken
          )
        }

        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  }
)