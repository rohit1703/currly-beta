import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session if expired — keeps users logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard — redirect unauthenticated users to /login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Protect /admin — only rohitagentx@gmail.com can access
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Always allow /admin/login through
    if (request.nextUrl.pathname === '/admin/login') {
      return supabaseResponse
    }
    if (!user || user.email !== 'rohitagentx@gmail.com') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return supabaseResponse
}

export default proxy

export const proxyConfig = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
