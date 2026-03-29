'use client'
// Arquivo: tatami/components/DashShell.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROLE_COLORS: Record<string, string> = {
  owner:    '#e8503a',
  teacher:  '#7f77dd',
  student:  '#2cb67d',
  operator: '#7f77dd',
}

const ROLE_LABELS: Record<string, string> = {
  owner:    'Dono da Academia',
  teacher:  'Professor',
  student:  'Aluno',
  operator: 'Operador',
}

const ROLE_DEST: Record<string, string> = {
  owner:    '/dashboard/owner',
  teacher:  '/dashboard/teacher',
  student:  '/dashboard/student',
  operator: '/dashboard/operator',
}

export function useDashboard(expectedRole: string | string[]) {
  const [user, setUser]       = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // getUser faz verificação real com o servidor — mais confiável que getSession
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('Profile error:', profileError)
        router.replace('/login')
        return
      }

      const allowed = Array.isArray(expectedRole) ? expectedRole : [expectedRole]

      // Operador acessa tudo
      if (profile.role === 'operator') {
        setUser(user); setProfile(profile); setLoading(false)
        return
      }

      // Role errado → redireciona para o dashboard correto
      if (!allowed.includes(profile.role)) {
        const dest = ROLE_DEST[profile.role] ?? '/login'
        router.replace(dest)
        return
      }

      setUser(user); setProfile(profile); setLoading(false)
    }
    load()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return { user, profile, loading, logout }
}

export function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0c0c0e', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#6e6e78', fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
    }}>
      Carregando...
    </div>
  )
}

export function DashShell({ profile, user, onLogout, title }: {
  profile: any; user: any; onLogout: () => void; title: string
}) {
  const role      = profile?.role ?? 'student'
  const color     = ROLE_COLORS[role] ?? '#e8503a'
  const label     = ROLE_LABELS[role] ?? 'Usuário'
  const firstName = profile?.name?.split(' ')[0] ?? 'Usuário'

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0e', fontFamily: "'DM Sans', sans-serif" }}>
      <header style={{
        height: '54px', background: '#141417',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          width: '30px', height: '30px', background: color, borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/>
            <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/>
            <circle cx="8" cy="8" r="1" fill="white"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontSize: '15px',
          fontWeight: 800, color: '#f0efe8', letterSpacing: '-.02em',
        }}>Tatami</span>
        <span style={{
          fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px',
          background: `${color}18`, color, border: `1px solid ${color}35`, whiteSpace: 'nowrap',
        }}>{label}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#6e6e78' }}>{profile?.name}</span>
          <button onClick={onLogout} style={{
            background: 'rgba(232,80,58,.08)', color: '#e8503a',
            border: '1px solid rgba(232,80,58,.2)', borderRadius: '8px',
            padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>Sair</button>
        </div>
      </header>

      <main style={{ padding: '28px 20px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '20px',
            fontWeight: 700, color: '#f0efe8', letterSpacing: '-.02em',
          }}>Bem-vindo, {firstName}!</h1>
          <p style={{ color: '#6e6e78', fontSize: '13px', marginTop: '4px' }}>
            {title} — painel completo em breve.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
          gap: '10px', marginBottom: '20px',
        }}>
          {[
            { label: 'Conta',           value: 'Ativa',     c: '#2cb67d' },
            { label: 'Banco de dados',  value: 'Conectado', c: '#2cb67d' },
            { label: 'Painel completo', value: 'Em breve',  c: '#f5a623' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#141417', border: '1px solid rgba(255,255,255,.07)',
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{
                fontSize: '11px', color: '#6e6e78', marginBottom: '6px',
                textTransform: 'uppercase', letterSpacing: '.06em',
              }}>{item.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: item.c }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#141417', border: '1px solid rgba(255,255,255,.07)',
          borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0efe8', marginBottom: '14px' }}>
            Seus dados
          </div>
          {[
            ['Nome',   profile?.name ?? '—'],
            ['E-mail', user?.email   ?? '—'],
            ['Função', label],
            ['Faixa',  profile?.belt
              ? profile.belt.charAt(0).toUpperCase() + profile.belt.slice(1)
              : 'Branca'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: '13px',
            }}>
              <span style={{ color: '#6e6e78' }}>{k}</span>
              <span style={{ color: '#f0efe8' }}>{v}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
