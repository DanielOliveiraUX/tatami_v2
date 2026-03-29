'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Page = 'aulas' | 'historico' | 'resumo' | 'notificacoes'

interface Student {
  id: string
  initials: string
  name: string
  belt: 'white' | 'blue' | 'purple' | 'brown' | 'black'
  stripes: number
  status: 'pending' | 'confirmed' | 'absent'
  color: string
}

const CLASSES = [
  { name: 'Avançado', days: 'Ter, Qui, Sáb', time: '19:00', duration: '60 min', count: 18 },
  { name: 'Iniciantes', days: 'Seg, Qua', time: '18:00', duration: '60 min', count: 24 },
  { name: 'Infantil', days: 'Seg, Qua, Sex', time: '17:00', duration: '45 min', count: 12 },
]

const INIT_STUDENTS: Student[] = [
  { id: 'lm', initials: 'LM', name: 'Lucas Matos', belt: 'blue', stripes: 2, status: 'pending', color: 'var(--purple)' },
  { id: 'bf', initials: 'BF', name: 'Beatriz Fontes', belt: 'white', stripes: 1, status: 'pending', color: 'var(--accent)' },
  { id: 'rt', initials: 'RT', name: 'Rafael Torres', belt: 'purple', stripes: 0, status: 'pending', color: 'var(--amber)' },
  { id: 'jn', initials: 'JN', name: 'Juliana Neves', belt: 'white', stripes: 0, status: 'pending', color: 'var(--green)' },
]

const BELT_COLORS: Record<string, string> = {
  white: '#ddd', blue: '#2563b0', purple: '#7c3aed', brown: '#78350f', black: '#111',
}

const BELT_LABELS: Record<string, string> = {
  white: 'Branca', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
}

const NOTIFS = [
  { id: 1, type: 'a', title: 'Lucas Matos elegível para graduação', sub: 'Frequência: 87% · Faixa azul → Roxa', time: 'Hoje, 08:00', unread: true },
  { id: 2, type: 'g', title: 'Sessão Avançado concluída', sub: '16/18 presenças confirmadas · 22/03', time: '22/03, 21:00', unread: true },
  { id: 3, type: 'p', title: 'Nova turma adicionada: NoGi', sub: 'Sábados · 10:00 · 0 alunos', time: '18/03', unread: false },
]

// SVGs
const IconMenu = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IconLogo = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="1" fill="white"/></svg>
const IconCal = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="3.5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 3.5V2.5M10.5 3.5V2.5M2 6.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconClock = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 4.5V7.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconGrid = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
const IconBell = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M7.5 1.5a4 4 0 0 1 4 4v2l1 2H2.5l1-2v-2a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 11.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.2"/></svg>
const IconLogout = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M9.5 7.5H2M5 4.5L2 7.5l3 3M10.5 2.5h2v10h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>

export default function TeacherDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [page, setPage] = useState<Page>('aulas')
  const [sideOpen, setSideOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [students, setStudents] = useState<Student[]>(INIT_STUDENTS)
  const [toast, setToast] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [sessionSec, setSessionSec] = useState(0)
  const [tokenSec, setTokenSec] = useState(300)
  const [token, setToken] = useState('')
  const [notifs, setNotifs] = useState(NOTIFS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tokenRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const confirmed = students.filter(s => s.status === 'confirmed').length
  const unread = notifs.filter(n => n.unread).length

  function showToast(msg: string) {
    setToast(msg); setToastOn(true)
    setTimeout(() => setToastOn(false), 2600)
  }

  function navigate(p: Page) { setPage(p); setSideOpen(false) }

  function genToken() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  function startSession() {
    setSessionActive(true)
    setSessionSec(0)
    setTokenSec(300)
    setToken(genToken())
    timerRef.current = setInterval(() => setSessionSec(s => s + 1), 1000)
    tokenRef.current = setInterval(() => {
      setTokenSec(s => {
        if (s <= 1) { setToken(genToken()); return 300 }
        return s - 1
      })
    }, 1000)
    showToast(`Sessão iniciada — ${CLASSES[selectedClass].name}`)
  }

  function endSession() {
    setSessionActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (tokenRef.current) clearInterval(tokenRef.current)
    showToast('Sessão encerrada')
  }

  function confirm(id: string, name: string) {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'confirmed' } : s))
    showToast(`${name} confirmado`)
  }

  function absent(id: string, name: string) {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'absent' } : s))
    showToast(`Falta registrada — ${name}`)
  }

  function confirmAll() {
    setStudents(prev => prev.map(s => s.status === 'pending' ? { ...s, status: 'confirmed' } : s))
    showToast('Todos confirmados')
  }

  function resetStudents() {
    setStudents(INIT_STUDENTS.map(s => ({ ...s, status: 'pending' })))
  }

  function fmtTime(s: number) {
    const m = Math.floor(s / 60); const ss = s % 60
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (tokenRef.current) clearInterval(tokenRef.current)
  }, [])

  const tokenPct = (tokenSec / 300) * 100
  const circumference = 119.4
  const dashOffset = circumference * (1 - tokenPct / 100)

  return (
    <>
      <style>{`
        .class-card { background:var(--s2);border:1.5px solid var(--b);border-radius:11px;padding:14px;cursor:pointer;transition:all .18s; }
        .class-card:hover { border-color:var(--bh); }
        .class-card.on { border-color:var(--accent);background:rgba(232,80,58,.05); }
        .session-layout { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .attend-row { display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid var(--hint);transition:background .15s; }
        .attend-row:last-child { border-bottom:none; }
        .attend-row:hover { background:var(--s2); }
        .hist-row { display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--hint); }
        .hist-row:last-child { border-bottom:none; }
        .session-bar { display:flex;align-items:center;gap:8px;background:rgba(232,80,58,.07);border:1px solid rgba(232,80,58,.18);border-radius:9px;padding:9px 14px;font-size:13px; }
        @media(max-width:860px) { .session-layout { grid-template-columns:1fr; } }
        @media(max-width:680px) { .class-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:400px) { .class-grid { grid-template-columns:1fr; } }
      `}</style>

      <header className="topbar">
        <button className="menu-btn" onClick={() => setSideOpen(o => !o)}><IconMenu/></button>
        <div className="logo-mark" style={{ background: 'var(--purple)' }}><IconLogo/></div>
        <span className="logo-name">Tatami</span>
        <div className="topbar-sep"/>
        <span className="role-pill" style={{ background: 'rgba(127,119,221,.1)', color: 'var(--purple)', border: '1px solid rgba(127,119,221,.2)' }}>
          Professor · Team Silva BJJ
        </span>
        <div className="topbar-right">
          <button className="notif-btn" onClick={() => navigate('notificacoes')}>
            <IconBell/>
            {unread > 0 && <span className="notif-badge" style={{ background: 'var(--accent)' }}/>}
          </button>
          <div className="avatar" style={{ background: 'rgba(127,119,221,.15)', color: 'var(--purple)' }}>CR</div>
        </div>
      </header>

      <div className="sidebar-overlay" style={{ display: sideOpen ? 'block' : 'none' }} onClick={() => setSideOpen(false)}/>

      <div className="layout">
        <nav className="sidebar" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
          {[
            { id: 'aulas', label: 'Minhas aulas', icon: <IconCal/> },
            { id: 'historico', label: 'Histórico', icon: <IconClock/> },
            { id: 'resumo', label: 'Resumo', icon: <IconGrid/> },
            { id: 'notificacoes', label: 'Notificações', icon: <IconBell/> },
          ].map(item => (
            <div key={item.id} className={`nav-item${page === item.id ? ' on' : ''}`} onClick={() => navigate(item.id as Page)}>
              {item.icon}{item.label}
              {item.id === 'notificacoes' && unread > 0 && <span className="nav-badge">{unread}</span>}
            </div>
          ))}
          <div className="nav-separator">
            <div className="nav-item" style={{ color: 'var(--accent)' }} onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}>
              <IconLogout/>Sair
            </div>
          </div>
        </nav>

        <main className="main">
          {/* ── AULAS ── */}
          <div className={`page${page === 'aulas' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Minhas aulas</div>
                <div className="page-sub">Selecione uma turma para iniciar a sessão</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }} className="class-grid">
              {CLASSES.map((c, i) => (
                <div key={i} className={`class-card${selectedClass === i ? ' on' : ''}`} onClick={() => { setSelectedClass(i); resetStudents() }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{c.days} — {c.time}<br/>{c.duration}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 7 }}>{c.count} alunos</div>
                </div>
              ))}
            </div>

            {sessionActive && (
              <div className="session-bar">
                <svg viewBox="0 0 13 13" fill="none" width="13" height="13"><circle cx="6.5" cy="6.5" r="5" stroke="var(--accent)" strokeWidth="1.2"/><circle cx="6.5" cy="6.5" r="2" fill="var(--accent)"/></svg>
                Sessão em andamento — <strong style={{ margin: '0 4px' }}>{CLASSES[selectedClass].name}</strong>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, fontFamily: 'monospace', marginLeft: 'auto' }}>{fmtTime(sessionSec)}</span>
              </div>
            )}

            <div className="session-layout">
              {/* QR Card */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">QR Code da sessão</span>
                  {sessionActive && <span className="pill pill-live"><span className="pill-dot"/>Ao vivo</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', gap: 8 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: 14, position: 'relative', margin: '4px 0' }}>
                    {/* Fake QR placeholder */}
                    <svg width="152" height="152" viewBox="0 0 152 152" style={{ display: 'block', borderRadius: 4 }}>
                      <rect width="152" height="152" fill="white"/>
                      <rect x="10" y="10" width="40" height="40" rx="4" fill="#111"/>
                      <rect x="14" y="14" width="32" height="32" rx="2" fill="white"/>
                      <rect x="18" y="18" width="24" height="24" rx="1" fill="#111"/>
                      <rect x="102" y="10" width="40" height="40" rx="4" fill="#111"/>
                      <rect x="106" y="14" width="32" height="32" rx="2" fill="white"/>
                      <rect x="110" y="18" width="24" height="24" rx="1" fill="#111"/>
                      <rect x="10" y="102" width="40" height="40" rx="4" fill="#111"/>
                      <rect x="14" y="106" width="32" height="32" rx="2" fill="white"/>
                      <rect x="18" y="110" width="24" height="24" rx="1" fill="#111"/>
                      {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 8 }).map((_, c) => {
                        if (Math.random() > 0.5 && !((r < 4 && c < 4) || (r < 4 && c > 3) || (r > 3 && c < 4))) {
                          return <rect key={`${r}-${c}`} x={55 + c * 6} y={55 + r * 6} width="5" height="5" fill="#111"/>
                        }
                        return null
                      }))}
                    </svg>
                    {!sessionActive && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(12,12,14,.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>
                        <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '0 10px', lineHeight: 1.4 }}>Inicie a sessão para gerar o QR Code</span>
                      </div>
                    )}
                  </div>

                  {sessionActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ position: 'relative', width: 46, height: 46 }}>
                        <svg width="46" height="46" viewBox="0 0 46 46" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="23" cy="23" r="19" fill="none" stroke="var(--hint)" strokeWidth="3"/>
                          <circle cx="23" cy="23" r="19" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset .9s linear' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>
                          {Math.floor(tokenSec / 60)}:{String(tokenSec % 60).padStart(2, '0')}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>TOKEN: {token}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Renovado automaticamente</div>
                    </div>
                  )}

                  {!sessionActive
                    ? <button className="btn btn-lg" onClick={startSession}>Iniciar sessão</button>
                    : <button className="btn-ghost" style={{ width: '100%', padding: 11 }} onClick={endSession}>Encerrar sessão</button>
                  }
                </div>
              </div>

              {/* Attendance Card */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">Lista de presença</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{confirmed} / {CLASSES[selectedClass].count}</span>
                </div>
                <div>
                  {students.map(s => (
                    <div key={s.id} className="attend-row">
                      <div className="av" style={{ background: `${s.color}22`, color: s.color }}>{s.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          <span className="bd" style={{ background: BELT_COLORS[s.belt], border: s.belt === 'white' ? '1px solid #aaa' : undefined, display: 'inline-block', width: 7, height: 7, borderRadius: 2, verticalAlign: 'middle', marginRight: 3 }}/>
                          {BELT_LABELS[s.belt]} · {s.stripes} grau{s.stripes !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {s.status === 'pending' && <span className="pill pill-pending"><span className="pill-dot"/>Aguardando</span>}
                      {s.status === 'confirmed' && <span className="pill pill-ok"><span className="pill-dot"/>Confirmado</span>}
                      {s.status === 'absent' && <span className="pill pill-absent"><span className="pill-dot"/>Falta</span>}
                      {s.status === 'pending' && (
                        <div className="actions" style={{ marginLeft: 6 }}>
                          <button className="btn-success" onClick={() => confirm(s.id, s.name)}>✓</button>
                          <button className="btn-danger" onClick={() => absent(s.id, s.name)}>✗</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--b)' }}>
                  <button className="btn-success" style={{ width: '100%', padding: 9, fontSize: 13 }} onClick={confirmAll}>
                    Confirmar todos presentes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── HISTÓRICO ── */}
          <div className={`page${page === 'historico' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Histórico de aulas</div>
                <div className="page-sub">Sessões realizadas</div>
              </div>
            </div>
            <div className="card">
              {[
                { date: '22/03', cls: 'Avançado', count: '16/18' },
                { date: '20/03', cls: 'Avançado', count: '14/18' },
                { date: '19/03', cls: 'Iniciantes', count: '20/24' },
                { date: '18/03', cls: 'Infantil', count: '10/12' },
                { date: '17/03', cls: 'Avançado', count: '18/18' },
                { date: '15/03', cls: 'Iniciantes', count: '22/24' },
              ].map((row, i) => (
                <div key={i} className="hist-row">
                  <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 60, flexShrink: 0 }}>{row.date}</div>
                  <div style={{ fontSize: 13, flex: 1 }}>{row.cls}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginRight: 8 }}>{row.count}</div>
                  <span className="pill pill-ok"><span className="pill-dot"/>Concluída</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RESUMO ── */}
          <div className={`page${page === 'resumo' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Resumo</div>
                <div className="page-sub">Estatísticas do seu ensino</div>
              </div>
            </div>
            <div className="metrics">
              {[
                { label: 'Aulas ministradas', val: '48', sub: 'esse mês' },
                { label: 'Alunos ativos', val: '54', sub: 'em 3 turmas' },
                { label: 'Média de presença', val: '84%', sub: 'últimos 30 dias' },
                { label: 'Sessões este mês', val: '18', sub: 'de 20 previstas' },
              ].map((m, i) => (
                <div key={i} className="metric">
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val">{m.val}</div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Presença por turma</span></div>
              {CLASSES.map((c, i) => {
                const pcts = [89, 84, 92]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: i < CLASSES.length - 1 ? '1px solid var(--hint)' : 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, minWidth: 80 }}>{c.name}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--s3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--purple)', width: `${pcts[i]}%`, transition: 'width .6s' }}/>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>{pcts[i]}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── NOTIFICAÇÕES ── */}
          <div className={`page${page === 'notificacoes' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Notificações</div>
                <div className="page-sub">{unread > 0 ? `${unread} não lidas` : 'Tudo em dia'}</div>
              </div>
              <button className="btn-ghost" onClick={() => setNotifs(prev => prev.map(n => ({ ...n, unread: false })))}>Marcar tudo lido</button>
            </div>
            <div className="card">
              {notifs.map(n => (
                <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}>
                  <div className={`notif-icon ni-${n.type}`}>
                    {n.type === 'g' && <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                    {n.type === 'a' && <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M7 2L2.5 5l4.5 3 4.5-3L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>}
                    {n.type === 'p' && <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M7 2L2.5 5l4.5 3 4.5-3L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.sub}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.unread && <div className="unread-dot" style={{ background: 'var(--purple)' }}/>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <div className={`toast${toastOn ? ' on' : ''}`}>{toast}</div>
    </>
  )
}
