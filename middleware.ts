import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Public routes — allow unauthenticated
  const publicRoutes = ['/login', '/register', '/auth/callback']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    // If already logged in, redirect to appropriate dashboard
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        return NextResponse.redirect(new URL(dashboardForRole(profile.role), request.url))
      }
    }
    return supabaseResponse
  }

  // Protected routes — require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Root redirect — send to correct dashboard
  if (pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      return NextResponse.redirect(new URL(dashboardForRole(profile.role), request.url))
    }
  }

  // Role-based access control
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile) {
    const role = profile.role
    const allowedRoutes: Record<string, string[]> = {
      operator: ['/dashboard/operator'],
      owner:    ['/dashboard/owner'],
      teacher:  ['/dashboard/teacher'],
      student:  ['/dashboard/student'],
    }

    const allowed = allowedRoutes[role] || []
    const isAllowed = allowed.some(r => pathname.startsWith(r))

    if (!isAllowed && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL(dashboardForRole(role), request.url))
    }
  }

  return supabaseResponse
}

function dashboardForRole(role: string): string {
  const map: Record<string, string> = {
    operator: '/dashboard/operator',
    owner:    '/dashboard/owner',
    teacher:  '/dashboard/teacher',
    student:  '/dashboard/student',
  }
  return map[role] || '/login'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
