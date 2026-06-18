import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/cadastro']

// Optimistic check: read session from cookie without a network call.
// Full token validation happens inside each page via supabase.auth.getUser().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Supabase SSR stores the session under this key
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .replace('https://', '')
    .split('.')[0]
  const sessionCookie = request.cookies.get(`sb-${projectRef}-auth-token`)
  const hasSession = !!sessionCookie?.value

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
