'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Page = 'checkin' | 'historico' | 'evolucao' | 'financeiro' | 'notificacoes'

interface Notification {
  id: number
  type: 'g' | 'a' | 'p'
  title: string
  sub: string
  time: string
  unread: boolean
}

/* ─────────────────────────────────────────────
   Constants / Mock data
   (replace with real Supabase queries)
───────────────────────────────────────────── */
const INIT_NOTIFS: Notification[] = [
  { id: 1, type: 'a', title: 'Você pode estar pronto para graduar!', sub: 'Frequência 87% · próxima faixa: Roxa', time: 'Hoje, 08:00', unread: true },
  { id: 2, type: 'g', title: 'Presença confirmada — Avançado', sub: '20/03/2026 · Carlos Rocha', time: '20/03, 20:30', unread: true },
  { id: 3, type: 'g', title: 'Presença confirmada — Avançado', sub: '19/03/2026 · Carlos Rocha', time: '19/03, 20:15', unread: false },
  { id: 4, type: 'p', title: 'Parabéns! Faixa azul conferida', sub: 'Janeiro de 2025 · Carlos Rocha', time: 'Jan/25', unread: false },
]

/* ─────────────────────────────────────────────
   SVG helpers
───────────────────────────────────────────── */
const IconQR = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="8" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="2" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="10" y="10" width="1.5" height="1.5" fill="currentColor"/>
    <rect x="12.5" y="10" width="1.5" height="1.5" fill="currentColor"/>
    <rect x="10" y="12.5" width="1.5" height="1.5" fill="currentColor"/>
    <rect x="12.5" y="12.5" width="1.5" height="1.5" fill="currentColor"/>
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 4.5V7.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconChart = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <path d="M2 11l3.5-4 3 2.5L12 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconWallet = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <rect x="2" y="4.5" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 4.5V3a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconBell = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <path d="M7.5 1.5a4 4 0 0 1 4 4v2l1 2H2.5l1-2v-2a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5.5 11.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)
const IconLogout = () => (
  <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
    <path d="M9.5 7.5H2M5 4.5L2 7.5l3 3M10.5 2.5h2v10h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconMenu = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IconLogo = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/>
    <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/>
    <circle cx="8" cy="8" r="1" fill="white"/>
  </svg>
)
const IconCal = () => (
  <svg viewBox="0 0 15 15" fill="none" width="16" height="16">
    <rect x="2" y="3.5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4.5 3.5V2.5M10.5 3.5V2.5M2 6.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
    <path d="M5 15l6 6L23 8" stroke="#2cb67d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconGrad = () => (
  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
    <path d="M10 2L3 6.5l7 4.5 7-4.5L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M3 6.5V12M17 6.5V12M6 8.5v4c0 1.5 2 2 4 2s4-.5 4-2v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function StudentDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [page, setPage] = useState<Page>('checkin')
  const [sideOpen, setSideOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>(INIT_NOTIFS)
  const [checkedIn, setCheckedIn] = useState(false)
  const [toast, setToast] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [selectedClass, setSelectedClass] = useState(0)

  const unreadCount = notifs.filter(n => n.unread).length

  function showToast(msg: string) {
    setToast(msg)
    setToastOn(true)
    setTimeout(() => setToastOn(false), 2600)
  }

  function navigate(p: Page) {
    setPage(p)
    setSideOpen(false)
  }

  function markRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
    showToast('Todas as notificações lidas')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const notifIcon = (type: 'g' | 'a' | 'p') => {
    const cls = { g: 'ni-g', a: 'ni-a', p: 'ni-p' }[type]
    const svgMap = {
      g: <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      a: <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M7 2L2.5 5l4.5 3 4.5-3L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
      p: <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M7 2L2.5 5l4.5 3 4.5-3L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
    }
    return <div className={`notif-icon ${cls}`}>{svgMap[type]}</div>
  }

  /* ── STYLES ── */
  const S = {
    scanFrame: {
      width: 'min(220px, 80vw)', height: 'min(220px, 80vw)',
      borderRadius: 14, background: 'var(--s2)', border: '1px solid var(--b)',
      position: 'relative' as const, display: 'flex',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    } as React.CSSProperties,
    scanLine: {
      position: 'absolute' as const, left: '10%', right: '10%',
      height: 2, background: 'var(--green)', borderRadius: 1, top: 16,
      animation: 'scanMove 2s ease-in-out infinite', opacity: .85,
    } as React.CSSProperties,
    corner: (pos: string) => {
      const base: React.CSSProperties = {
        position: 'absolute', width: 22, height: 22,
        borderColor: 'var(--green)', borderStyle: 'solid', borderWidth: 0,
      }
      const map: Record<string, React.CSSProperties> = {
        tl: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
        tr: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
        bl: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
        br: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
      }
      return { ...base, ...map[pos] }
    },
  }

  return (
    <>
      <style>{`
        @keyframes scanMove { 0%,100%{top:16px} 50%{top:calc(100% - 20px)} }
        .metric-bar-fill { transition: width .6s ease; }
        .stripe-dot { width:16px;height:16px;border-radius:3px;background:var(--s3);border:1px solid var(--b); }
        .stripe-dot.on { background:var(--amber);border-color:var(--amber); }
        .belt-bar { width:50px;height:14px;border-radius:3px;flex-shrink:0; }
        .class-item { display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--hint);cursor:pointer;transition:background .15s; }
        .class-item:last-child { border-bottom:none; }
        .class-item:hover { background:var(--s2); }
        .class-item.selected { background:rgba(44,182,125,.04); }
        .hist-row { display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--hint); }
        .hist-row:last-child { border-bottom:none; }
        .elig-banner { background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.18);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px; }
        .elig-banner svg { color:var(--amber);flex-shrink:0; }
        .elig-text { font-size:13px;line-height:1.5; }
        .elig-text strong { color:var(--amber); }
        .fin-row { display:flex;align-items:center;gap:14px;padding:18px;flex-wrap:wrap; }
        .fin-icon { width:48px;height:48px;border-radius:12px;background:rgba(44,182,125,.1);border:1px solid rgba(44,182,125,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .bprow { display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid var(--hint); }
        .bprow:last-child { border-bottom:none; }
        .bptrack { flex:1;height:6px;background:var(--s3);border-radius:3px;overflow:hidden; }
        .bpfill { height:100%;border-radius:3px; }
      `}</style>

      {/* TOPBAR */}
      <header className="topbar">
        <button className="menu-btn" onClick={() => setSideOpen(o => !o)}><IconMenu/></button>
        <div className="logo-mark" style={{ background: 'var(--green)' }}><IconLogo/></div>
        <span className="logo-name">Tatami</span>
        <div className="topbar-sep"/>
        <span className="role-pill" style={{ background: 'rgba(44,182,125,.1)', color: 'var(--green)', border: '1px solid rgba(44,182,125,.2)' }}>
          Aluno · Team Silva BJJ
        </span>
        <div className="topbar-right">
          <button className="notif-btn" onClick={() => navigate('notificacoes')}>
            <IconBell/>
            {unreadCount > 0 && <span className="notif-badge" style={{ background: 'var(--green)' }}/>}
          </button>
          <div className="avatar" style={{ background: 'rgba(44,182,125,.15)', color: 'var(--green)' }}>LM</div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      <div className="sidebar-overlay" style={{ display: sideOpen ? 'block' : 'none' }} onClick={() => setSideOpen(false)}/>

      <div className="layout">
        {/* SIDEBAR */}
        <nav className="sidebar" id="sidebar" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
          {[
            { id: 'checkin', label: 'Check-in', icon: <IconQR/> },
            { id: 'historico', label: 'Histórico', icon: <IconClock/> },
            { id: 'evolucao', label: 'Evolução', icon: <IconChart/> },
            { id: 'financeiro', label: 'Financeiro', icon: <IconWallet/> },
            { id: 'notificacoes', label: 'Notificações', icon: <IconBell/> },
          ].map(item => (
            <div
              key={item.id}
              className={`nav-item${page === item.id ? ' on' : ''}`}
              onClick={() => navigate(item.id as Page)}
            >
              {item.icon}
              {item.label}
              {item.id === 'notificacoes' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </div>
          ))}
          <div className="nav-separator">
            <div className="nav-item" style={{ color: 'var(--accent)' }} onClick={handleSignOut}>
              <IconLogout/>Sair
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="main">

          {/* ── CHECK-IN ── */}
          <div className={`page${page === 'checkin' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Check-in</div>
                <div className="page-sub">Bom treino, Lucas!</div>
              </div>
            </div>

            <div className="elig-banner">
              <IconGrad/>
              <div className="elig-text">
                Você está <strong>elegível para graduação</strong> — faixa azul → roxa! Frequência de 87% nos últimos 90 dias.
              </div>
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Aulas de hoje</span></div>
              {[
                { name: 'Avançado', meta: 'Hoje · 19:00 · Carlos Rocha', status: 'live' },
                { name: 'NoGi', meta: 'Sáb · 10:00 · Carlos Rocha', status: 'soon' },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`class-item${selectedClass === i ? ' selected' : ''}`}
                  onClick={() => setSelectedClass(i)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCal/>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.meta}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {c.status === 'live'
                      ? <span className="pill pill-live"><span className="pill-dot"/>Ao vivo</span>
                      : <span className="pill pill-soon"><span className="pill-dot"/>Em breve</span>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Escanear QR Code</span></div>
              {!checkedIn ? (
                <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={S.scanFrame}>
                    <div style={S.scanLine}/>
                    <div style={S.corner('tl')}/>
                    <div style={S.corner('tr')}/>
                    <div style={S.corner('bl')}/>
                    <div style={S.corner('br')}/>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                    Aponte a câmera para o QR Code exibido pelo professor
                  </div>
                  <button
                    className="btn btn-green"
                    style={{ maxWidth: 260, width: '100%' }}
                    onClick={() => { setCheckedIn(true); showToast('Check-in realizado — Avançado') }}
                  >
                    Simular leitura do QR
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 18px', textAlign: 'center' }}>
                  <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(44,182,125,.1)', border: '1px solid rgba(44,182,125,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCheck/>
                  </div>
                  <div style={{ fontFamily: 'var(--F)', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>Check-in realizado!</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>Turma <strong>Avançado · 22/03/2026</strong></div>
                  <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>Aguardando confirmação do professor</div>
                  <button className="btn-ghost" style={{ maxWidth: 220, width: '100%', marginTop: 6 }} onClick={() => setCheckedIn(false)}>
                    Escanear outra turma
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── HISTÓRICO ── */}
          <div className={`page${page === 'historico' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Histórico</div>
                <div className="page-sub">Suas últimas presenças</div>
              </div>
            </div>
            <div className="metrics">
              {[
                { label: 'Total de aulas', val: '48', sub: 'desde jan/2026' },
                { label: 'Este mês', val: '12', sub: 'de 15 possíveis' },
                { label: 'Frequência', val: '80%', sub: 'março' },
                { label: 'Sequência', val: '5', sub: 'aulas seguidas' },
              ].map((m, i) => (
                <div key={i} className="metric">
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val">{m.val}</div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              {[
                { date: '22/03', cls: 'Avançado', status: 'pending' },
                { date: '20/03', cls: 'Avançado', status: 'ok' },
                { date: '19/03', cls: 'Avançado', status: 'ok' },
                { date: '17/03', cls: 'Avançado', status: 'ok' },
                { date: '15/03', cls: 'Avançado', status: 'absent' },
                { date: '13/03', cls: 'Avançado', status: 'ok' },
                { date: '12/03', cls: 'Avançado', status: 'ok' },
              ].map((row, i) => (
                <div key={i} className="hist-row">
                  <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 54, flexShrink: 0 }}>{row.date}</div>
                  <div style={{ fontSize: 13, flex: 1 }}>{row.cls}</div>
                  {row.status === 'ok' && <span className="pill pill-ok"><span className="pill-dot"/>Confirmado</span>}
                  {row.status === 'pending' && <span className="pill pill-pending"><span className="pill-dot"/>Aguardando</span>}
                  {row.status === 'absent' && <span className="pill pill-absent"><span className="pill-dot"/>Falta</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── EVOLUÇÃO ── */}
          <div className={`page${page === 'evolucao' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Evolução</div>
                <div className="page-sub">Faixa, graduações e progresso</div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <span className="card-title">Faixa atual</span>
                <span className="pill pill-eligible"><span className="pill-dot"/>Elegível para graduação</span>
              </div>
              <div style={{ background: 'var(--s2)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14, margin: '14px 18px 0' }}>
                <div className="belt-bar" style={{ background: '#2563b0' }}/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>Faixa Azul</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Desde janeiro de 2025</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                    {[1,2,3,4].map(i => <div key={i} className={`stripe-dot${i <= 2 ? ' on' : ''}`}/>)}
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 18px 18px' }}>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Você tem <strong style={{ color: 'var(--text)' }}>2 graus</strong> na faixa azul. Com frequência de{' '}
                  <strong style={{ color: 'var(--green)' }}>87%</strong> nos últimos 90 dias, você está apto para a próxima graduação.
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Jornada de faixas</span></div>
              {[
                { label: 'Branca', color: '#ddd', fill: 100, val: '✓', done: true },
                { label: 'Azul', color: '#2563b0', fill: 50, val: '2/4', done: false },
                { label: 'Roxa', color: '#7c3aed', fill: 0, val: '—', done: false },
                { label: 'Marrom', color: '#78350f', fill: 0, val: '—', done: false },
                { label: 'Preta', color: '#111', fill: 0, val: '—', done: false },
              ].map((b, i) => (
                <div key={i} className="bprow">
                  <div style={{ fontSize: 12, minWidth: 60, flexShrink: 0, color: b.fill === 0 && !b.done ? 'var(--muted)' : 'var(--text)' }}>{b.label}</div>
                  <div className="bptrack">
                    <div className="bpfill" style={{ width: `${b.fill}%`, background: b.color }}/>
                  </div>
                  <div style={{ fontSize: 11, color: b.done ? 'var(--green)' : 'var(--muted)', minWidth: 28, textAlign: 'right' }}>{b.val}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Histórico de graduações</span></div>
              {[
                { date: 'Jan/25', desc: 'Faixa branca → Faixa azul' },
                { date: 'Jun/24', desc: '4º grau faixa branca' },
                { date: 'Nov/23', desc: 'Início — faixa branca' },
              ].map((row, i) => (
                <div key={i} className="hist-row">
                  <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 54, flexShrink: 0 }}>{row.date}</div>
                  <div style={{ fontSize: 13, flex: 1 }}>{row.desc}</div>
                  <span className="pill pill-ok"><span className="pill-dot"/>Graduado</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FINANCEIRO ── */}
          <div className={`page${page === 'financeiro' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Financeiro</div>
                <div className="page-sub">Situação da sua mensalidade</div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Status atual</span></div>
              <div className="fin-row">
                <div className="fin-icon">
                  <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
                    <path d="M5 12l4 4L17 7" stroke="#2cb67d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Mensalidade em dia</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Próximo vencimento: 22/04/2026</div>
                </div>
                <span className="pill pill-ok" style={{ marginLeft: 'auto' }}><span className="pill-dot"/>Ativo</span>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Histórico de pagamentos</span></div>
              {[
                { date: 'Mar/26', desc: 'Mensalidade março' },
                { date: 'Fev/26', desc: 'Mensalidade fevereiro' },
                { date: 'Jan/26', desc: 'Mensalidade janeiro' },
              ].map((row, i) => (
                <div key={i} className="hist-row">
                  <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 54, flexShrink: 0 }}>{row.date}</div>
                  <div style={{ fontSize: 13, flex: 1 }}>{row.desc}</div>
                  <span className="pill pill-ok"><span className="pill-dot"/>Pago</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── NOTIFICAÇÕES ── */}
          <div className={`page${page === 'notificacoes' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Notificações</div>
                <div className="page-sub">{unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}</div>
              </div>
              <button className="btn-ghost" onClick={markAllRead}>Marcar tudo lido</button>
            </div>
            <div className="card">
              {notifs.map(n => (
                <div
                  key={n.id}
                  className={`notif-item${n.unread ? ' unread' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  {notifIcon(n.type)}
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.sub}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.unread && <div className="unread-dot" style={{ background: 'var(--green)' }}/>}
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* TOAST */}
      <div className={`toast${toastOn ? ' on' : ''}`}>{toast}</div>
    </>
  )
}
