'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'
type Role = 'owner' | 'teacher' | 'student'

const supabase = createClient()

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [academyName, setAcademyName] = useState('')
  const [academySlug, setAcademySlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // If owner, create academy
    if (role === 'owner' && data.user && academyName) {
      const slug = academySlug || academyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { data: academy, error: acError } = await supabase
        .from('academies')
        .insert({ name: academyName, slug, plan: 'starter' })
        .select('id')
        .single()

      if (!acError && academy) {
        await supabase.from('profiles').update({ academy_id: academy.id }).eq('id', data.user.id)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  const roles = [
    {
      id: 'owner' as Role,
      label: 'Academia',
      desc: 'Dono ou gestor',
      color: 'var(--accent)',
      bg: 'rgba(232,80,58,.12)',
      icon: (
        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
          <rect x="2" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 8L9 2l8 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="6.5" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      )
    },
    {
      id: 'teacher' as Role,
      label: 'Professor',
      desc: 'Instrutor da academia',
      color: 'var(--purple)',
      bg: 'rgba(127,119,221,.12)',
      icon: (
        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
          <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2 16c0-3 3-5 7-5s7 2 7 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 'student' as Role,
      label: 'Aluno',
      desc: 'Praticante',
      color: 'var(--green)',
      bg: 'rgba(44,182,125,.12)',
      icon: (
        <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
          <path d="M9 2L2 6.5l7 4.5 7-4.5L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M2 6.5V12M16 6.5V12M5 8.5v4c0 1.8 2 2.5 4 2.5s4-.7 4-2.5v-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0c0c0e; --s1: #141417; --s2: #1c1c21;
          --b: rgba(255,255,255,.07); --bh: rgba(255,255,255,.13);
          --text: #f0efe8; --muted: #6e6e78;
          --accent: #e8503a; --green: #2cb67d; --purple: #7f77dd;
          --F: 'Syne', sans-serif; --B: 'DM Sans', sans-serif;
        }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        html, body { background: var(--bg); color: var(--text); font-family: var(--B); min-height: 100%; }
        .shell { min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px 64px; }
        .wrap { width: 440px; max-width: 100%; }
        .logo { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
        .logo-mark { width: 48px; height: 48px; background: var(--accent); border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .logo-name { font-family: var(--F); font-size: 22px; font-weight: 800; letter-spacing: -.03em; }
        .logo-sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
        .tabs { display: flex; gap: 2px; background: var(--s1); border: 1px solid var(--b); border-radius: 100px; padding: 4px; margin-bottom: 20px; }
        .tab { flex: 1; font-family: var(--B); font-size: 13px; font-weight: 500; color: var(--muted); background: none; border: none; padding: 8px; border-radius: 100px; cursor: pointer; transition: all .2s; }
        .tab.on { background: var(--s2); color: var(--text); }
        .card { background: var(--s1); border: 1px solid var(--b); border-radius: 20px; padding: 32px; }
        .h1 { font-family: var(--F); font-size: 20px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 5px; }
        .sub { font-size: 14px; color: var(--muted); line-height: 1.55; margin-bottom: 24px; }
        .fld { margin-bottom: 14px; }
        .fld label { display: block; font-size: 11px; font-weight: 500; color: var(--muted); letter-spacing: .07em; text-transform: uppercase; margin-bottom: 6px; }
        .fld input { width: 100%; background: var(--s2); border: 1px solid var(--b); border-radius: 10px; color: var(--text); font-family: var(--B); font-size: 15px; padding: 13px 15px; outline: none; transition: border-color .18s; }
        .fld input::placeholder { color: var(--muted); }
        .fld input:focus { border-color: var(--accent); }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .role-card { background: var(--s2); border: 1.5px solid var(--b); border-radius: 12px; padding: 14px 10px; cursor: pointer; transition: all .18s; text-align: center; }
        .role-card:hover { border-color: var(--bh); }
        .role-card.on { border-color: var(--accent); background: rgba(232,80,58,.07); }
        .role-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
        .role-name { font-size: 13px; font-weight: 500; display: block; }
        .role-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .btn-main { width: 100%; background: var(--accent); color: #fff; font-family: var(--B); font-size: 15px; font-weight: 500; border: none; border-radius: 10px; padding: 14px; cursor: pointer; transition: opacity .15s; margin-top: 4px; }
        .btn-main:hover { opacity: .88; }
        .btn-main:disabled { opacity: .5; cursor: not-allowed; }
        .err { background: rgba(232,80,58,.08); border: 1px solid rgba(232,80,58,.2); border-radius: 9px; color: var(--accent); font-size: 13px; padding: 10px 14px; margin-bottom: 14px; }
        .ok-wrap { text-align: center; padding: 16px 0; }
        .ok-ring { width: 64px; height: 64px; border-radius: 50%; background: rgba(44,182,125,.1); border: 1px solid rgba(44,182,125,.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .ok-title { font-family: var(--F); font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .ok-sub { font-size: 14px; color: var(--muted); line-height: 1.5; }
        .divider { height: 1px; background: var(--b); margin: 20px 0; }
        .owner-extra { background: var(--s2); border-radius: 12px; padding: 16px; margin-bottom: 14px; }
        .owner-extra-title { font-size: 12px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 12px; }
        .slug-wrap { position: relative; }
        .slug-pre { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--muted); pointer-events: none; }
        .slug-wrap input { padding-left: 110px; }
        @media(max-width:400px) { .role-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="shell">
        <div className="wrap">
          <div className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 16 16" fill="none" width="26" height="26">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/>
                <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/>
                <circle cx="8" cy="8" r="1" fill="white"/>
              </svg>
            </div>
            <span className="logo-name">Tatami</span>
            <span className="logo-sub">Gestão de academias de jiu-jítsu</span>
          </div>

          <div className="tabs">
            <button className={`tab${mode === 'login' ? ' on' : ''}`} onClick={() => setMode('login')}>Entrar</button>
            <button className={`tab${mode === 'register' ? ' on' : ''}`} onClick={() => setMode('register')}>Criar conta</button>
          </div>

          <div className="card">
            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <>
                <div className="h1">Bem-vindo de volta</div>
                <div className="sub">Entre com seu email e senha para acessar seu painel.</div>
                {error && <div className="err">{error}</div>}
                <form onSubmit={handleLogin}>
                  <div className="fld">
                    <label>Email</label>
                    <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                  </div>
                  <div className="fld">
                    <label>Senha</label>
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                  </div>
                  <button className="btn-main" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
                </form>
              </>
            )}

            {/* ── REGISTER ── */}
            {mode === 'register' && !success && (
              <>
                <div className="h1">Criar conta</div>
                <div className="sub">Escolha seu perfil e preencha os dados para começar.</div>
                {error && <div className="err">{error}</div>}

                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>Seu perfil</div>
                <div className="role-grid">
                  {roles.map(r => (
                    <div
                      key={r.id}
                      className={`role-card${role === r.id ? ' on' : ''}`}
                      onClick={() => setRole(r.id)}
                    >
                      <div className="role-icon" style={{ background: r.bg, color: r.color }}>{r.icon}</div>
                      <span className="role-name">{r.label}</span>
                      <span className="role-desc">{r.desc}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleRegister}>
                  <div className="fld">
                    <label>Nome completo</label>
                    <input placeholder="Carlos Rocha" value={name} onChange={e => setName(e.target.value)} required/>
                  </div>
                  <div className="fld">
                    <label>Email</label>
                    <input type="email" placeholder="carlos@academia.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                  </div>
                  <div className="fld">
                    <label>Senha</label>
                    <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}/>
                  </div>

                  {role === 'owner' && (
                    <>
                      <div className="divider"/>
                      <div className="owner-extra">
                        <div className="owner-extra-title">Dados da sua academia</div>
                        <div className="fld">
                          <label>Nome da academia</label>
                          <input
                            placeholder="Team Silva BJJ"
                            value={academyName}
                            onChange={e => {
                              setAcademyName(e.target.value)
                              setAcademySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                            }}
                          />
                        </div>
                        <div className="fld">
                          <label>Slug (URL)</label>
                          <div className="slug-wrap">
                            <span className="slug-pre">tatami.app/</span>
                            <input
                              placeholder="team-silva"
                              value={academySlug}
                              onChange={e => setAcademySlug(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <button className="btn-main" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
                </form>
              </>
            )}

            {/* ── SUCCESS ── */}
            {mode === 'register' && success && (
              <div className="ok-wrap">
                <div className="ok-ring">
                  <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                    <path d="M5 15l6 6L23 8" stroke="#2cb67d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="ok-title">Conta criada!</div>
                <div className="ok-sub">
                  Verifique seu email <strong>{email}</strong> para confirmar o cadastro, depois entre normalmente.
                </div>
                <button className="btn-main" style={{ marginTop: 20, maxWidth: 200, width: '100%' }} onClick={() => { setMode('login'); setSuccess(false) }}>
                  Fazer login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
