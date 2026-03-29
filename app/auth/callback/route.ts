// Arquivo: tatami/app/auth/callback/route.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code         = searchParams.get('code')
  const token_hash   = searchParams.get('token_hash')
  const type         = searchParams.get('type')

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()  { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Caso 1: link de confirmação de email (token_hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!error) {
      // Confirmou o email — redireciona para login com mensagem
      return NextResponse.redirect(new URL('/login?confirmed=true', origin))
    }
    return NextResponse.redirect(new URL('/login?error=auth', origin))
  }

  // Caso 2: OAuth ou magic link (code)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const dest: Record<string, string> = {
        owner:    '/dashboard/owner',
        teacher:  '/dashboard/teacher',
        student:  '/dashboard/student',
        operator: '/dashboard/operator',
      }

      return NextResponse.redirect(
        new URL(dest[profile?.role ?? 'student'] ?? '/dashboard/student', origin)
      )
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
