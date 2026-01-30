import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/features/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For API routes, only refresh Supabase session
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next({ request })
    return refreshSupabaseSession(request, response)
  }

  // For all other routes, run intl middleware then refresh session
  const intlResponse = intlMiddleware(request)
  return refreshSupabaseSession(request, intlResponse)
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
