'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Page = 'visao' | 'alunos' | 'turmas' | 'financeiro' | 'graduacao' | 'notificacoes'

const BELT_COLORS: Record<string, string> = { white: '#ddd', blue: '#2563b0', purple: '#7c3aed', brown: '#78350f', black: '#111' }
const BELT_LABELS: Record<string, string> = { white: 'Branca', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta' }

const MEMBERS = [
  { id: 1, initials: 'LM', name: 'Lucas Matos', email: 'lucas@email.com', role: 'student', belt: 'blue', stripes: 2, freq: 87, status: 'active', color: 'var(--purple)' },
  { id: 2, initials: 'CR', name: 'Carlos Rocha', email: 'carlos@email.com', role: 'teacher', belt: 'black', stripes: 1, freq: 100, status: 'active', color: 'var(--accent)' },
  { id: 3, initials: 'BF', name: 'Beatriz Fontes', email: 'bia@email.com', role: 'student', belt: 'white', stripes: 1, freq: 72, status: 'active', color: 'var(--green)' },
  { id: 4, initials: 'RT', name: 'Rafael Torres', email: 'rafael@email.com', role: 'student', belt: 'purple', stripes: 0, freq: 90, status: 'overdue', color: 'var(--amber)' },
  { id: 5, initials: 'JN', name: 'Juliana Neves', email: 'juliana@email.com', role: 'student', belt: 'white', stripes: 0, freq: 65, status: 'active', color: 'var(--blue)' },
]

const CLASSES = [
  { name: 'Avançado', teacher: 'Carlos Rocha', days: 'Ter, Qui, Sáb', time: '19:00', duration: 60, count: 18, active: true },
  { name: 'Iniciantes', teacher: 'Carlos Rocha', days: 'Seg, Qua', time: '18:00', duration: 60, count: 24, active: true },
  { name: 'Infantil', teacher: 'Carlos Rocha', days: 'Seg, Qua, Sex', time: '17:00', duration: 45, count: 12, active: true },
]

const ELIGIBLE = [
  { id: 1, initials: 'LM', name: 'Lucas Matos', currentBelt: 'blue', nextBelt: 'purple', freq: 87, days: 420, color: 'var(--purple)' },
]

const NOTIFS = [
  { id: 1, type: 'a', title: 'Lucas Matos elegível para graduação', sub: 'Frequência: 87% · Azul → Roxa · 420 dias', time: 'Hoje, 08:00', unread: true },
  { id: 2, type: 'r', title: 'Mensalidade vencida — Rafael Torres', sub: 'Vencimento: 20/03/2026', time: 'Hoje, 09:30', unread: true },
  { id: 3, type: 'g', title: 'Presença: Avançado 22/03', sub: '16/18 alunos confirmados', time: '22/03, 21:00', unread: false },
]

// Mini SVGs
const IconMenu = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IconLogo = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="1" fill="white"/></svg>
const IconGrid = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
const IconUsers = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10.5 6.5a2 2 0 1 0 0-4M14 13c0-1.5-1-2.5-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconCal = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="3.5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 3.5V2.5M10.5 3.5V2.5M2 6.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconWallet = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="4.5" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4.5V3a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconGrad = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M7.5 2L2 5.5l5.5 3.5L13 5.5 7.5 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M2 5.5V10M13 5.5V10M4.5 7v3c0 1.5 1.5 2 3 2s3-.5 3-2V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconBell = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M7.5 1.5a4 4 0 0 1 4 4v2l1 2H2.5l1-2v-2a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 11.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.2"/></svg>
const IconLogout = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M9.5 7.5H2M5 4.5L2 7.5l3 3M10.5 2.5h2v10h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IconPlus = () => <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>

export default function OwnerDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [page, setPage] = useState<Page>('visao')
  const [sideOpen, setSideOpen] = useState(false)
  const [members, setMembers] = useState(MEMBERS)
  const [notifs, setNotifs] = useState(NOTIFS)
  const [toast, setToast] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [search, setSearch] = useState('')
  const [modalGrad, setModalGrad] = useState<typeof ELIGIBLE[0] | null>(null)
  const [inviteModal, setInviteModal] = useState(false)
  const [newClassModal, setNewClassModal] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedBelt, setSelectedBelt] = useState('blue')

  const unread = notifs.filter(n => n.unread).length
  const overdue = members.filter(m => m.status === 'overdue').length

  function showToast(msg: string) {
    setToast(msg); setToastOn(true)
    setTimeout(() => setToastOn(false), 2600)
  }
  function navigate(p: Page) { setPage(p); setSideOpen(false) }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  function promoteStudent() {
    if (!modalGrad) return
    showToast(`${modalGrad.name} graduado — Faixa ${BELT_LABELS[modalGrad.nextBelt]}!`)
    setModalGrad(null)
  }

  const DAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <>
      <style>{`
        .metrics-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
        .class-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;padding:16px; }
        .class-card2 { background:var(--s2);border:1.5px solid var(--b);border-radius:11px;padding:14px;transition:border-color .18s; }
        .class-card2:hover { border-color:var(--bh); }
        .hist-row { display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--hint); }
        .hist-row:last-child { border-bottom:none; }
        .freq-bar { display:flex;align-items:center;gap:8px; }
        .freq-track { width:72px;height:6px;background:var(--s3);border-radius:3px;overflow:hidden;flex-shrink:0; }
        .freq-fill { height:100%;border-radius:3px; }
        .grad-row { display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--hint); }
        .grad-row:last-child { border-bottom:none; }
        .eligible-card { background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.18);border-radius:9px;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.6; }
        .eligible-card strong { color:var(--amber); }
        .belt-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:16px; }
        .belt-opt { height:28px;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:all .15s; }
        .belt-opt:hover { transform:scaleY(1.08); }
        .belt-opt.on { transform:scaleY(1.12); }
        .days-row { display:flex;gap:5px;flex-wrap:wrap;margin-top:6px; }
        .day-btn { width:36px;height:32px;border-radius:7px;background:var(--s2);border:1px solid var(--b);color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s; }
        .day-btn.on { background:rgba(232,80,58,.12);border-color:var(--accent);color:var(--accent); }
        @media(max-width:900px) { .metrics-4{grid-template-columns:repeat(2,1fr);} .hide-md{display:none!important;} }
        @media(max-width:680px) { .metrics-4{grid-template-columns:repeat(2,1fr);} .freq-track{width:48px;} }
      `}</style>

      {/* TOPBAR */}
      <header className="topbar">
        <button className="menu-btn" onClick={() => setSideOpen(o => !o)}><IconMenu/></button>
        <div className="logo-mark" style={{ background: 'var(--accent)' }}><IconLogo/></div>
        <span className="logo-name">Tatami</span>
        <div className="topbar-sep"/>
        <span className="role-pill" style={{ background: 'rgba(232,80,58,.1)', color: 'var(--accent)', border: '1px solid rgba(232,80,58,.2)' }}>Dono</span>
        <div className="topbar-right">
          <button className="notif-btn" onClick={() => navigate('notificacoes')}>
            <IconBell/>
            {unread > 0 && <span className="notif-badge" style={{ background: 'var(--accent)' }}/>}
          </button>
          <div className="avatar" style={{ background: 'rgba(232,80,58,.15)', color: 'var(--accent)' }}>JS</div>
        </div>
      </header>

      <div className="sidebar-overlay" style={{ display: sideOpen ? 'block' : 'none' }} onClick={() => setSideOpen(false)}/>

      <div className="layout">
        <nav className="sidebar" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
          {[
            { id: 'visao', label: 'Visão geral', icon: <IconGrid/> },
            { id: 'alunos', label: 'Membros', icon: <IconUsers/> },
            { id: 'turmas', label: 'Turmas', icon: <IconCal/> },
            { id: 'financeiro', label: 'Financeiro', icon: <IconWallet/> },
            { id: 'graduacao', label: 'Graduação', icon: <IconGrad/>, badge: ELIGIBLE.length },
            { id: 'notificacoes', label: 'Notificações', icon: <IconBell/> },
          ].map(item => (
            <div key={item.id} className={`nav-item${page === item.id ? ' on' : ''}`} onClick={() => navigate(item.id as Page)}>
              {item.icon}{item.label}
              {item.badge && item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
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
          {/* ── VISÃO GERAL ── */}
          <div className={`page${page === 'visao' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Visão geral</div>
                <div className="page-sub">Team Silva BJJ — Março 2026</div>
              </div>
            </div>
            <div className="metrics-4">
              {[
                { label: 'Alunos ativos', val: '54', sub: '+3 este mês', color: 'var(--green)' },
                { label: 'Turmas ativas', val: '3', sub: '167 aulas/ano', color: 'var(--accent)' },
                { label: 'Frequência média', val: '84%', sub: '↑ 3% vs. fev', color: 'var(--purple)' },
                { label: 'Inadimplentes', val: String(overdue), sub: overdue > 0 ? 'atenção' : 'tudo em dia', color: overdue > 0 ? 'var(--amber)' : 'var(--muted)' },
              ].map((m, i) => (
                <div key={i} className="metric" style={{ borderTop: `2px solid ${m.color}` }}>
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val">{m.val}</div>
                  <div className="metric-sub" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {ELIGIBLE.length > 0 && (
              <div className="card">
                <div className="card-head"><span className="card-title">⭐ Elegíveis para graduação</span></div>
                {ELIGIBLE.map(e => (
                  <div key={e.id} className="grad-row">
                    <div className="av" style={{ background: `${e.color}22`, color: e.color }}>{e.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: BELT_COLORS[e.currentBelt], border: e.currentBelt === 'white' ? '1px solid #aaa' : 'none', verticalAlign: 'middle', marginRight: 4 }}/>
                        {BELT_LABELS[e.currentBelt]} → <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: BELT_COLORS[e.nextBelt], verticalAlign: 'middle', marginRight: 4, marginLeft: 4 }}/>{BELT_LABELS[e.nextBelt]}
                      </div>
                    </div>
                    <div className="freq-bar">
                      <div className="freq-track">
                        <div className="freq-fill" style={{ width: `${e.freq}%`, background: e.freq >= 80 ? 'var(--green)' : 'var(--amber)' }}/>
                      </div>
                      <span style={{ fontSize: 12, color: e.freq >= 80 ? 'var(--green)' : 'var(--amber)' }}>{e.freq}%</span>
                    </div>
                    <button className="btn-amber" onClick={() => setModalGrad(e)}>Graduar</button>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <div className="card-head"><span className="card-title">Atividade recente</span></div>
              {[
                { color: 'var(--green)', bg: 'rgba(44,182,125,.12)', icon: '✓', title: 'Sessão Avançado concluída', sub: '16/18 presenças · Carlos Rocha', time: 'Hoje, 21:00' },
                { color: 'var(--amber)', bg: 'rgba(245,166,35,.12)', icon: '★', title: 'Lucas Matos elegível para graduar', sub: 'Frequência 87% · Faixa Azul → Roxa', time: 'Hoje, 08:00' },
                { color: 'var(--accent)', bg: 'rgba(232,80,58,.12)', icon: '!', title: 'Mensalidade vencida — Rafael Torres', sub: 'Vencimento: 20/03/2026', time: 'Ontem' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--hint)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--hint)', flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ALUNOS ── */}
          <div className={`page${page === 'alunos' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Membros</div>
                <div className="page-sub">{members.length} cadastrados</div>
              </div>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setInviteModal(true)}>
                <IconPlus/>Convidar
              </button>
            </div>
            <div className="card">
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--b)' }}>
                <input
                  style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 9, color: 'var(--text)', fontFamily: 'var(--B)', fontSize: 13, padding: '9px 14px', outline: 'none' }}
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Membro</th>
                      <th>Função</th>
                      <th className="hide-md">Faixa</th>
                      <th className="hide-md">Frequência</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div className="user-cell">
                            <div className="av" style={{ background: `${m.color}22`, color: m.color }}>{m.initials}</div>
                            <div>
                              <div className="user-name">{m.name}</div>
                              <div className="user-email">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {m.role === 'teacher'
                            ? <span className="pill pill-teacher"><span className="pill-dot"/>Professor</span>
                            : <span className="pill" style={{ background: 'rgba(44,182,125,.06)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,.2)' }}><span className="pill-dot"/>Aluno</span>
                          }
                        </td>
                        <td className="hide-md">
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: BELT_COLORS[m.belt], border: m.belt === 'white' ? '1px solid #aaa' : 'none', verticalAlign: 'middle', marginRight: 5 }}/>
                          {BELT_LABELS[m.belt]}
                        </td>
                        <td className="hide-md">
                          <div className="freq-bar">
                            <div className="freq-track">
                              <div className="freq-fill" style={{ width: `${m.freq}%`, background: m.freq >= 80 ? 'var(--green)' : 'var(--amber)' }}/>
                            </div>
                            <span style={{ fontSize: 12 }}>{m.freq}%</span>
                          </div>
                        </td>
                        <td>
                          {m.status === 'active'
                            ? <span className="pill pill-ok"><span className="pill-dot"/>Ativo</span>
                            : <span className="pill pill-overdue"><span className="pill-dot"/>Inadimplente</span>
                          }
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn-ghost" onClick={() => showToast(`Editando ${m.name}`)}>Editar</button>
                            {m.status === 'overdue' && <button className="btn-success" onClick={() => { setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status: 'active' } : x)); showToast(`${m.name} regularizado`) }}>Regularizar</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── TURMAS ── */}
          <div className={`page${page === 'turmas' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Turmas</div>
                <div className="page-sub">{CLASSES.filter(c => c.active).length} turmas ativas</div>
              </div>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setNewClassModal(true)}>
                <IconPlus/>Nova turma
              </button>
            </div>
            <div className="class-grid">
              {CLASSES.map((c, i) => (
                <div key={i} className="class-card2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                    <span className="pill pill-ok"><span className="pill-dot"/>Ativa</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                    {c.days}<br/>{c.time} · {c.duration} min
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--b)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                      <div className="av" style={{ width: 20, height: 20, fontSize: 9, background: 'rgba(232,80,58,.15)', color: 'var(--accent)' }}>CR</div>
                      {c.teacher}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.count} alunos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FINANCEIRO ── */}
          <div className={`page${page === 'financeiro' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Financeiro</div>
                <div className="page-sub">Controle de mensalidades</div>
              </div>
            </div>
            <div className="metrics-4">
              {[
                { label: 'Mensalidades ativas', val: '51', sub: 'de 54 alunos', color: 'var(--green)' },
                { label: 'Inadimplentes', val: String(overdue), sub: 'aguardando', color: 'var(--amber)' },
                { label: 'Receita mensal est.', val: 'R$15.300', sub: 'base: R$300/mês', color: 'var(--purple)' },
                { label: 'Taxa de renovação', val: '94%', sub: '↑ vs. mês passado', color: 'var(--blue)' },
              ].map((m, i) => (
                <div key={i} className="metric" style={{ borderTop: `2px solid ${m.color}` }}>
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val">{m.val}</div>
                  <div className="metric-sub" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Alunos inadimplentes</span></div>
              {members.filter(m => m.status === 'overdue').length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  Nenhum aluno inadimplente 🎉
                </div>
              ) : (
                members.filter(m => m.status === 'overdue').map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--hint)' }}>
                    <div className="av" style={{ background: `${m.color}22`, color: m.color }}>{m.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Vencimento: 20/03/2026</div>
                    </div>
                    <span className="pill pill-overdue"><span className="pill-dot"/>Inadimplente</span>
                    <button className="btn-success" onClick={() => { setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status: 'active' } : x)); showToast(`${m.name} regularizado`) }}>Regularizar</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── GRADUAÇÃO ── */}
          <div className={`page${page === 'graduacao' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Graduação</div>
                <div className="page-sub">Elegibilidade e histórico</div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Elegíveis para graduação</span></div>
              {ELIGIBLE.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Nenhum aluno elegível no momento</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="tbl">
                    <thead><tr><th>Aluno</th><th>Faixa atual</th><th>Próxima</th><th>Frequência</th><th>Ação</th></tr></thead>
                    <tbody>
                      {ELIGIBLE.map(e => (
                        <tr key={e.id}>
                          <td>
                            <div className="user-cell">
                              <div className="av" style={{ background: `${e.color}22`, color: e.color }}>{e.initials}</div>
                              <div className="user-name">{e.name}</div>
                            </div>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: BELT_COLORS[e.currentBelt], border: e.currentBelt === 'white' ? '1px solid #aaa' : 'none' }}/>
                              {BELT_LABELS[e.currentBelt]}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: BELT_COLORS[e.nextBelt] }}/>
                              {BELT_LABELS[e.nextBelt]}
                            </span>
                          </td>
                          <td>
                            <div className="freq-bar">
                              <div className="freq-track">
                                <div className="freq-fill" style={{ width: `${e.freq}%`, background: 'var(--green)' }}/>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--green)' }}>{e.freq}%</span>
                            </div>
                          </td>
                          <td>
                            <button className="btn-amber" onClick={() => setModalGrad(e)}>Graduar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  <div className={`notif-icon ni-${n.type === 'r' ? 'r' : n.type === 'a' ? 'a' : 'g'}`}>
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      {n.type === 'g' && <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>}
                      {n.type === 'a' && <path d="M7 2L2.5 5l4.5 3 4.5-3L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>}
                      {n.type === 'r' && <path d="M7 2v6M7 10v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>}
                    </svg>
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.sub}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.unread && <div className="unread-dot" style={{ background: 'var(--accent)' }}/>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: GRADUAR */}
      <div className={`overlay${modalGrad ? ' on' : ''}`} onClick={() => setModalGrad(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          {modalGrad && (
            <>
              <div className="modal-title">Registrar Graduação</div>
              <div className="modal-sub">{modalGrad.name} — {BELT_LABELS[modalGrad.currentBelt]} → {BELT_LABELS[modalGrad.nextBelt]}</div>
              <div className="eligible-card">
                Frequência: <strong>{modalGrad.freq}%</strong> nos últimos 90 dias · {modalGrad.days} dias na faixa atual · Próxima faixa: <strong>{BELT_LABELS[modalGrad.nextBelt]}</strong>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>Selecionar faixa</div>
                <div className="belt-grid">
                  {['white', 'blue', 'purple', 'brown', 'black'].map(b => (
                    <div
                      key={b}
                      className={`belt-opt${selectedBelt === b ? ' on' : ''}`}
                      style={{
                        background: BELT_COLORS[b],
                        border: b === 'white' ? '2px solid #aaa' : b === 'black' ? '2px solid #555' : '2px solid transparent',
                        outline: selectedBelt === b ? '2px solid #fff' : 'none',
                      }}
                      onClick={() => setSelectedBelt(b)}
                    />
                  ))}
                </div>
              </div>
              <div className="fld">
                <label>Graus</label>
                <select><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option></select>
              </div>
              <div className="fld">
                <label>Observações</label>
                <textarea placeholder="Notas sobre a graduação..." rows={3}/>
              </div>
              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setModalGrad(null)}>Cancelar</button>
                <button className="btn-amber" onClick={promoteStudent}>Confirmar graduação</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: CONVIDAR */}
      <div className={`overlay${inviteModal ? ' on' : ''}`} onClick={() => setInviteModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">Convidar membro</div>
          <div className="modal-sub">Envie um convite por email para adicionar um novo membro à academia.</div>
          <div className="fld"><label>Nome completo</label><input placeholder="Ex: Ana Paula Silva"/></div>
          <div className="fld"><label>Email</label><input type="email" placeholder="ana@email.com"/></div>
          <div className="fld">
            <label>Função</label>
            <select>
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setInviteModal(false)}>Cancelar</button>
            <button className="btn" onClick={() => { setInviteModal(false); showToast('Convite enviado!') }}>Enviar convite</button>
          </div>
        </div>
      </div>

      {/* MODAL: NOVA TURMA */}
      <div className={`overlay${newClassModal ? ' on' : ''}`} onClick={() => setNewClassModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">Nova turma</div>
          <div className="modal-sub">Configure a nova turma para sua academia.</div>
          <div className="fld"><label>Nome da turma</label><input placeholder="Ex: Avançado Noturno"/></div>
          <div className="fld">
            <label>Dias da semana</label>
            <div className="days-row">
              {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
                <button
                  key={d}
                  className={`day-btn${selectedDays.includes(d) ? ' on' : ''}`}
                  onClick={() => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                >{d}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fld"><label>Horário</label><input type="time" defaultValue="19:00"/></div>
            <div className="fld"><label>Duração (min)</label><input type="number" defaultValue="60"/></div>
          </div>
          <div className="fld">
            <label>Professor responsável</label>
            <select><option>Carlos Rocha</option></select>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setNewClassModal(false)}>Cancelar</button>
            <button className="btn" onClick={() => { setNewClassModal(false); showToast('Turma criada!') }}>Criar turma</button>
          </div>
        </div>
      </div>

      <div className={`toast${toastOn ? ' on' : ''}`}>{toast}</div>
    </>
  )
}
