'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Page = 'overview' | 'academies' | 'users' | 'payments' | 'settings'

const ACADEMIES = [
  { id: 1, name: 'Team Silva BJJ', slug: 'team-silva', plan: 'pro', members: 54, status: 'active', mrr: 'R$15.300', created: 'Jan/25' },
  { id: 2, name: 'GFTeam Rio', slug: 'gfteam-rio', plan: 'starter', members: 28, status: 'active', mrr: 'R$4.900', created: 'Mar/25' },
  { id: 3, name: 'Nova União SP', slug: 'nova-uniao-sp', plan: 'unlimited', members: 142, status: 'active', mrr: 'R$49.700', created: 'Dez/24' },
  { id: 4, name: 'Checkmat BH', slug: 'checkmat-bh', plan: 'starter', members: 19, status: 'trial', mrr: 'R$0', created: 'Mar/26' },
]

const ALL_USERS = [
  { id: 1, initials: 'JS', name: 'João Silva', email: 'joao@silva.com', role: 'owner', academy: 'Team Silva BJJ', status: 'active', color: 'var(--accent)' },
  { id: 2, initials: 'CR', name: 'Carlos Rocha', email: 'carlos@silva.com', role: 'teacher', academy: 'Team Silva BJJ', status: 'active', color: 'var(--purple)' },
  { id: 3, initials: 'LM', name: 'Lucas Matos', email: 'lucas@silva.com', role: 'student', academy: 'Team Silva BJJ', status: 'active', color: 'var(--green)' },
  { id: 4, initials: 'MF', name: 'Marcos Faria', email: 'marcos@gfteam.com', role: 'owner', academy: 'GFTeam Rio', status: 'active', color: 'var(--blue)' },
  { id: 5, initials: 'AN', name: 'Ana Nunes', email: 'ana@gfteam.com', role: 'student', academy: 'GFTeam Rio', status: 'inactive', color: 'var(--amber)' },
]

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', unlimited: 'Unlimited', trial: 'Trial' }
const ROLE_LABELS: Record<string, string> = { owner: 'Dono', teacher: 'Professor', student: 'Aluno', operator: 'Operador' }

// SVGs
const IconMenu = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IconLogo = () => <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="8" r="1" fill="white"/></svg>
const IconGrid = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="2" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
const IconHome = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="7" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 7L7.5 2 14 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5.5" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/></svg>
const IconUsers = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10.5 6.5a2 2 0 1 0 0-4M14 13c0-1.5-1-2.5-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconWallet = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><rect x="2" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 7h11M5 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconSettings = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 1v1.5M7.5 12.5V14M14 7.5h-1.5M2.5 7.5H1M11.7 3.3l-1 1M4.3 10.7l-1 1M11.7 11.7l-1-1M4.3 4.3l-1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IconLogout = () => <svg viewBox="0 0 15 15" fill="none" width="15" height="15"><path d="M9.5 7.5H2M5 4.5L2 7.5l3 3M10.5 2.5h2v10h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>

export default function OperatorDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [page, setPage] = useState<Page>('overview')
  const [sideOpen, setSideOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [academySearch, setAcademySearch] = useState('')

  function showToast(msg: string) {
    setToast(msg); setToastOn(true)
    setTimeout(() => setToastOn(false), 2600)
  }
  function navigate(p: Page) { setPage(p); setSideOpen(false) }

  const filteredUsers = ALL_USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredAcademies = ACADEMIES.filter(a =>
    a.name.toLowerCase().includes(academySearch.toLowerCase())
  )

  const planColors: Record<string, { bg: string; color: string; border: string }> = {
    starter: { bg: 'rgba(55,138,221,.1)', color: 'var(--blue)', border: '1px solid rgba(55,138,221,.2)' },
    pro: { bg: 'rgba(127,119,221,.1)', color: 'var(--purple)', border: '1px solid rgba(127,119,221,.2)' },
    unlimited: { bg: 'rgba(44,182,125,.1)', color: 'var(--green)', border: '1px solid rgba(44,182,125,.2)' },
    trial: { bg: 'rgba(245,166,35,.1)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,.2)' },
  }

  const roleColors: Record<string, { bg: string; color: string; border: string }> = {
    owner: { bg: 'rgba(232,80,58,.1)', color: 'var(--accent)', border: '1px solid rgba(232,80,58,.2)' },
    teacher: { bg: 'rgba(127,119,221,.1)', color: 'var(--purple)', border: '1px solid rgba(127,119,221,.2)' },
    student: { bg: 'rgba(44,182,125,.06)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,.2)' },
    operator: { bg: 'rgba(127,119,221,.2)', color: '#c4b5fd', border: '1px solid rgba(127,119,221,.3)' },
  }

  const totalMRR = 'R$69.900'
  const totalAcademies = ACADEMIES.length
  const totalUsers = ALL_USERS.length
  const activeAcademies = ACADEMIES.filter(a => a.status === 'active').length

  return (
    <>
      <style>{`
        .metrics-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
        .sparkbar { display:flex;align-items:flex-end;gap:2px;height:28px;margin-top:8px; }
        .sparkbar-col { flex:1;background:rgba(127,119,221,.3);border-radius:2px;min-height:4px; }
        .mrr-row { display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid var(--hint); }
        .mrr-row:last-child { border-bottom:none; }
        .mrr-track { flex:1;height:8px;background:var(--s3);border-radius:4px;overflow:hidden; }
        .mrr-fill { height:100%;border-radius:4px;background:var(--purple); }
        .hist-row { display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--hint); }
        .hist-row:last-child { border-bottom:none; }
        @media(max-width:900px) { .metrics-4{grid-template-columns:repeat(2,1fr);} .hide-md{display:none!important;} }
        @media(max-width:680px) { .metrics-4{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:400px) { .metrics-4{grid-template-columns:1fr;} }
      `}</style>

      {/* TOPBAR */}
      <header className="topbar">
        <button className="menu-btn" onClick={() => setSideOpen(o => !o)}><IconMenu/></button>
        <div className="logo-mark" style={{ background: 'linear-gradient(135deg,#7f77dd,#534ab7)' }}><IconLogo/></div>
        <span className="logo-name">Tatami</span>
        <div className="topbar-sep"/>
        <span className="role-pill" style={{ background: 'rgba(127,119,221,.15)', color: '#c4b5fd', border: '1px solid rgba(127,119,221,.3)' }}>Operador</span>
        <div className="topbar-right">
          <div className="avatar" style={{ background: 'rgba(127,119,221,.2)', color: '#c4b5fd' }}>OP</div>
        </div>
      </header>

      <div className="sidebar-overlay" style={{ display: sideOpen ? 'block' : 'none' }} onClick={() => setSideOpen(false)}/>

      <div className="layout">
        <nav className="sidebar" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
          <div className={`nav-item${page === 'overview' ? ' on' : ''}`} onClick={() => navigate('overview')}><IconGrid/>Visão da plataforma</div>
          <div className="nav-group">Gestão</div>
          <div className={`nav-item${page === 'academies' ? ' on' : ''}`} onClick={() => navigate('academies')}><IconHome/>Academias</div>
          <div className={`nav-item${page === 'users' ? ' on' : ''}`} onClick={() => navigate('users')}><IconUsers/>Todos os usuários</div>
          <div className="nav-group">Financeiro</div>
          <div className={`nav-item${page === 'payments' ? ' on' : ''}`} onClick={() => navigate('payments')}><IconWallet/>Pagamentos & Planos</div>
          <div className="nav-group">Sistema</div>
          <div className={`nav-item${page === 'settings' ? ' on' : ''}`} onClick={() => navigate('settings')}><IconSettings/>Configurações</div>
          <div className="nav-separator">
            <div className="nav-item" style={{ color: 'var(--accent)' }} onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}>
              <IconLogout/>Sair
            </div>
          </div>
        </nav>

        <main className="main">
          {/* ── OVERVIEW ── */}
          <div className={`page${page === 'overview' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Visão da plataforma</div>
                <div className="page-sub">Tatami SaaS — Março 2026</div>
              </div>
            </div>
            <div className="metrics-4">
              {[
                { label: 'MRR total', val: totalMRR, sub: '↑ 12% vs. fev', color: 'var(--green)', bars: [30,45,40,55,50,65,70,80,75,85,90,100] },
                { label: 'Academias ativas', val: String(activeAcademies), sub: `de ${totalAcademies} cadastradas`, color: 'var(--purple)', bars: [60,65,70,72,75,78,80,82,85,87,90,95] },
                { label: 'Usuários totais', val: String(totalUsers), sub: '+8 este mês', color: 'var(--blue)', bars: [40,42,48,50,55,58,60,65,68,70,75,80] },
                { label: 'Plano Unlimited', val: '1', sub: 'Pro: 1 · Starter: 2', color: 'var(--amber)', bars: [20,20,25,25,30,30,35,40,45,50,55,60] },
              ].map((m, i) => (
                <div key={i} className="metric" style={{ borderTop: `2px solid ${m.color}` }}>
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val" style={{ fontSize: i === 0 ? 20 : 26 }}>{m.val}</div>
                  <div className="metric-sub" style={{ color: m.color }}>{m.sub}</div>
                  <div className="sparkbar">
                    {m.bars.map((h, j) => (
                      <div key={j} className="sparkbar-col" style={{ height: `${h}%`, background: `${m.color}55` }}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">MRR por academia</span></div>
              {[
                { name: 'Nova União SP', plan: 'unlimited', mrr: 49700, pct: 71 },
                { name: 'Team Silva BJJ', plan: 'pro', mrr: 15300, pct: 22 },
                { name: 'GFTeam Rio', plan: 'starter', mrr: 4900, pct: 7 },
              ].map((row, i) => (
                <div key={i} className="mrr-row">
                  <div style={{ fontSize: 13, fontWeight: 500, minWidth: 140 }}>{row.name}</div>
                  <span className="pill" style={planColors[row.plan]}><span className="pill-dot"/>{PLAN_LABELS[row.plan]}</span>
                  <div className="mrr-track">
                    <div className="mrr-fill" style={{ width: `${row.pct}%` }}/>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, minWidth: 70, textAlign: 'right' }}>R${row.mrr.toLocaleString('pt-BR')}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Atividade recente</span></div>
              {[
                { text: 'Checkmat BH iniciou trial', time: 'Hoje, 09:00', color: 'var(--amber)', bg: 'rgba(245,166,35,.12)', icon: '★' },
                { text: 'Nova União SP renovou plano Unlimited', time: 'Ontem, 14:30', color: 'var(--green)', bg: 'rgba(44,182,125,.12)', icon: '✓' },
                { text: 'GFTeam Rio adicionou 3 novos alunos', time: '25/03', color: 'var(--purple)', bg: 'rgba(127,119,221,.12)', icon: '+' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--hint)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>{item.icon}</div>
                  <div style={{ flex: 1, fontSize: 13 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--hint)', flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ACADEMIAS ── */}
          <div className={`page${page === 'academies' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Academias</div>
                <div className="page-sub">{ACADEMIES.length} cadastradas</div>
              </div>
              <button className="btn" style={{ background: 'var(--purple)' }} onClick={() => showToast('Criando nova academia...')}>+ Nova academia</button>
            </div>
            <div className="card">
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--b)' }}>
                <input
                  style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 9, color: 'var(--text)', fontFamily: 'var(--B)', fontSize: 13, padding: '9px 14px', outline: 'none' }}
                  placeholder="Buscar academia..."
                  value={academySearch}
                  onChange={e => setAcademySearch(e.target.value)}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Academia</th>
                      <th>Plano</th>
                      <th className="hide-md">Membros</th>
                      <th className="hide-md">MRR</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAcademies.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="user-cell">
                            <div className="av av-p">{a.name.substring(0, 2).toUpperCase()}</div>
                            <div>
                              <div className="user-name">{a.name}</div>
                              <div className="user-email">/{a.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="pill" style={planColors[a.plan]}><span className="pill-dot"/>{PLAN_LABELS[a.plan]}</span></td>
                        <td className="hide-md">{a.members}</td>
                        <td className="hide-md" style={{ fontWeight: 500 }}>{a.mrr}</td>
                        <td>
                          {a.status === 'active'
                            ? <span className="pill pill-ok"><span className="pill-dot"/>Ativa</span>
                            : <span className="pill pill-pending"><span className="pill-dot"/>Trial</span>
                          }
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn-ghost" onClick={() => showToast(`Editando ${a.name}`)}>Editar</button>
                            <button className="btn-ghost" style={{ background: 'var(--purple)', color: '#fff', border: 'none' }} onClick={() => showToast(`Gerenciando ${a.name}`)}>Entrar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── USERS ── */}
          <div className={`page${page === 'users' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Todos os usuários</div>
                <div className="page-sub">{ALL_USERS.length} cadastrados na plataforma</div>
              </div>
            </div>
            <div className="card">
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--b)' }}>
                <input
                  style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 9, color: 'var(--text)', fontFamily: 'var(--B)', fontSize: 13, padding: '9px 14px', outline: 'none' }}
                  placeholder="Buscar usuário..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Função</th>
                      <th className="hide-md">Academia</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-cell">
                            <div className="av" style={{ background: `${u.color}22`, color: u.color }}>{u.initials}</div>
                            <div>
                              <div className="user-name">{u.name}</div>
                              <div className="user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="pill" style={roleColors[u.role]}><span className="pill-dot"/>{ROLE_LABELS[u.role]}</span></td>
                        <td className="hide-md" style={{ fontSize: 12, color: 'var(--muted)' }}>{u.academy}</td>
                        <td>
                          {u.status === 'active'
                            ? <span className="pill pill-ok"><span className="pill-dot"/>Ativo</span>
                            : <span className="pill pill-inactive"><span className="pill-dot"/>Inativo</span>
                          }
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn-ghost" onClick={() => showToast(`Editando ${u.name}`)}>Editar</button>
                            <button className="btn-danger" onClick={() => showToast(`${u.name} bloqueado`)}>Bloquear</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── PAYMENTS ── */}
          <div className={`page${page === 'payments' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Pagamentos & Planos</div>
                <div className="page-sub">Gestão de assinaturas da plataforma</div>
              </div>
            </div>
            <div className="metrics-4">
              {[
                { label: 'MRR Total', val: 'R$69.900', sub: '↑ 12% março', color: 'var(--green)' },
                { label: 'Plano Starter', val: '2', sub: 'academias', color: 'var(--blue)' },
                { label: 'Plano Pro', val: '1', sub: 'academia', color: 'var(--purple)' },
                { label: 'Plano Unlimited', val: '1', sub: 'academia', color: 'var(--green)' },
              ].map((m, i) => (
                <div key={i} className="metric" style={{ borderTop: `2px solid ${m.color}` }}>
                  <div className="metric-lbl">{m.label}</div>
                  <div className="metric-val" style={{ fontSize: i === 0 ? 20 : 26 }}>{m.val}</div>
                  <div className="metric-sub" style={{ color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Assinaturas ativas</span></div>
              {ACADEMIES.filter(a => a.status === 'active').map((a, i, arr) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--hint)' : 'none' }}>
                  <div className="av av-p">{a.name.substring(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Desde {a.created}</div>
                  </div>
                  <span className="pill" style={planColors[a.plan]}><span className="pill-dot"/>{PLAN_LABELS[a.plan]}</span>
                  <div style={{ fontSize: 13, fontWeight: 500, minWidth: 70, textAlign: 'right' }}>{a.mrr}</div>
                  <button className="btn-ghost" onClick={() => showToast(`Gerenciando plano de ${a.name}`)}>Gerenciar</button>
                </div>
              ))}
            </div>
          </div>

          {/* ── SETTINGS ── */}
          <div className={`page${page === 'settings' ? ' on' : ''}`}>
            <div className="page-hd">
              <div>
                <div className="page-title">Configurações</div>
                <div className="page-sub">Configurações globais da plataforma</div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Planos disponíveis</span></div>
              {[
                { plan: 'starter', name: 'Starter', price: 'R$297/mês', limit: 'Até 30 alunos' },
                { plan: 'pro', name: 'Pro', price: 'R$497/mês', limit: 'Até 100 alunos' },
                { plan: 'unlimited', name: 'Unlimited', price: 'R$997/mês', limit: 'Alunos ilimitados' },
              ].map((p, i, arr) => (
                <div key={p.plan} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--hint)' : 'none' }}>
                  <span className="pill" style={planColors[p.plan]}>{p.name}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.price}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.limit}</div>
                  </div>
                  <button className="btn-ghost" onClick={() => showToast(`Editando plano ${p.name}`)}>Editar</button>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Configurações do sistema</span></div>
              {[
                { label: 'URL da plataforma', val: 'https://tatami-seven.vercel.app' },
                { label: 'Versão', val: 'v2.0.0' },
                { label: 'Banco de dados', val: 'Supabase (PostgreSQL)' },
                { label: 'Região', val: 'South America (São Paulo)' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--hint)' : 'none' }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', minWidth: 160 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontFamily: row.label === 'URL da plataforma' || row.label === 'Versão' ? 'monospace' : 'var(--B)' }}>{row.val}</div>
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
