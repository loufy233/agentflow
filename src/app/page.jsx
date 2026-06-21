'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clean(raw) {
  if (!raw) return ''
  return raw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&\w+;/g,'')
}

function categorizeMail(snippet) {
  const s = (snippet || '').toLowerCase()
  if (s.includes('facture') || s.includes('paiement') || s.includes('bred') || s.includes('impôt') || s.includes('finances') || s.includes('taxe') || s.includes('cofilease')) return 'urgent'
  if (s.includes('candidature') || s.includes('france travail') || s.includes('cv') || s.includes('avertissement') || s.includes('acompte')) return 'rh'
  if (s.includes('rendez-vous') || s.includes('rdv') || s.includes('réunion') || s.includes('accompagnement')) return 'rdv'
  return 'info'
}

const tagMap = {
  urgent: ['Urgent', 't-urgent', '#dc2626'],
  rh:     ['RH',     't-rh',     '#1d4ed8'],
  rdv:    ['RDV',    't-rdv',    '#059669'],
  info:   ['Info',   't-info',   '#7c3aed'],
}

function parseNum(val) {
  if (!val || val === 'Not available') return null
  return parseFloat(String(val).replace(/[^\d,.]/g, '').replace(',', '.')) || null
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M'
  if (n >= 1000) return Math.round(n/1000)+'k'
  return Math.round(n).toString()
}

function Skeleton({ w = '80%', h = 14 }) {
  return <div className="skeleton" style={{ width: w, height: h }} />
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">🤖 AgentFlow</div>
        <div className="sidebar-brand-sub">Mon équipe IA</div>
      </div>

      <a className="nav-item active" href="#">📊 Dashboard</a>
      <a className="nav-item" href="#">💬 Messages</a>
      <a className="nav-item" href="#">🔄 Workflows</a>
      <a className="nav-item" href="#">📈 Analytics</a>
      <a className="nav-item" href="#">🔌 Intégrations</a>

      <div className="nav-section">Mes agents</div>

      <div className="agent-nav">
        <div className="agent-dot" style={{ background: '#6ee7b7' }} />
        <div>
          <div className="agent-nav-name">Victor</div>
          <div className="agent-nav-task">Analyse leads...</div>
        </div>
      </div>

      <div className="agent-nav">
        <div className="agent-dot" style={{ background: '#f472b6' }} />
        <div>
          <div className="agent-nav-name">Morgane</div>
          <div className="agent-nav-task">Rédige un post...</div>
        </div>
      </div>

      <div className="agent-nav">
        <div className="agent-dot" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div>
          <div className="agent-nav-name" style={{ color: 'rgba(255,255,255,0.3)' }}>+ Nouvel agent</div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="avatar">AL</div>
        <div>
          <div className="avatar-name">Alexandre</div>
          <div className="avatar-role">Admin · Pro</div>
        </div>
      </div>
    </aside>
  )
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [events, setEvents] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [emailCount, setEmailCount] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)

    // Campaigns (real API)
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch {
      setCampaigns([])
    }

    // Emails (demo data based on real session)
    setEmails([
      { snippet: 'BRED COFILEASE — Ordre de paiement 2 591,82 € valable jusqu\'au 18/06/2026 à 23:59', cat: 'urgent' },
      { snippet: 'Facture N°23370 du 05/05/2026 pour un réajustement KM non reçu — Christophe', cat: 'urgent' },
      { snippet: 'Taxes d\'urbanisme DP97221022BV10900 — démarches fiscales à réaliser suite à autorisation', cat: 'urgent' },
      { snippet: 'France Travail — Un candidat a postulé à votre offre Pizzaïolo/Pizzaïola (H/F)', cat: 'rh' },
      { snippet: 'Candidature spontanée pour un poste à temps partiel — CV et lettre de motivation joints', cat: 'rh' },
      { snippet: 'Accompagnement entreprises adhérentes PIZZERIA VIAGGIO — proposition temps d\'échange', cat: 'rdv' },
      { snippet: 'Situation compte client — certains règlements restent en attente ce mois', cat: 'info' },
    ])
    setEmailCount(13)

    // Events (demo data based on real calendar)
    setEvents([
      { summary: '🎂 Anniversaire de Maël', day: 28, month: 'juin', time: 'Toute la journée' },
    ])

    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Stats
  const urgentMails = emails.filter(e => e.cat === 'urgent').length
  const activeCampaigns = campaigns.filter(c => c.impressions && c.impressions !== 'Not available')
  const totalSpend = activeCampaigns.reduce((sum, c) => sum + (parseNum(c.spend) || 0), 0)
  const totalReach = activeCampaigns.reduce((sum, c) => sum + (parseNum(c.reach) || 0), 0)

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Vue d&apos;ensemble</h1>
          <div className="top-actions">
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:20, fontSize:12, color:'#059669', fontWeight:500 }}>
              ● 2 agents actifs
            </div>
            <button className="btn-refresh" onClick={load} disabled={loading}>
              {loading ? '↻ Chargement...' : '↻ Actualiser'}
            </button>
            <button className="btn-launch">⚡ Lancer</button>
          </div>
        </div>

        {/* Alert */}
        <div className="alert">
          ⚠️ <span>Compte Meta <strong>102490684</strong> désactivé — contacter le support Facebook pour le réactiver.</span>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">Emails cette semaine</div>
            <div className="kpi-value">{loading ? '—' : emailCount}</div>
            <div className={`kpi-sub ${urgentMails > 0 ? 'sub-warn' : 'sub-ok'}`}>
              {loading ? '...' : urgentMails > 0 ? `⚠️ ${urgentMails} urgent${urgentMails > 1 ? 's' : ''}` : '✓ Aucun urgent'}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Budget Meta (30j)</div>
            <div className="kpi-value">{loading ? '—' : totalSpend > 0 ? totalSpend.toFixed(0) + ' €' : '—'}</div>
            <div className="kpi-sub sub-info">{loading ? '...' : `${activeCampaigns.length} campagne${activeCampaigns.length !== 1 ? 's' : ''} active${activeCampaigns.length !== 1 ? 's' : ''}`}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Portée Meta (30j)</div>
            <div className="kpi-value">{loading ? '—' : totalReach > 0 ? fmt(totalReach) : '—'}</div>
            <div className="kpi-sub sub-ok">{loading ? '...' : 'Personnes touchées'}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Agenda cette semaine</div>
            <div className="kpi-value">{loading ? '—' : events.length}</div>
            <div className="kpi-sub sub-info">{loading ? '...' : events.length === 0 ? '✓ Semaine libre' : '7 prochains jours'}</div>
          </div>
        </div>

        {/* Victor + Morgane */}
        <div className="grid-2">

          {/* Victor */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🤖 Victor — Emails</div>
              <span className="agent-pill pill-victor">Commercial</span>
            </div>
            {loading ? (
              <><Skeleton w="85%" /><Skeleton w="65%" /><Skeleton w="75%" /></>
            ) : emails.length === 0 ? (
              <div className="empty">📭 Aucun email</div>
            ) : emails.map((e, i) => {
              const [label, cls, color] = tagMap[e.cat]
              return (
                <div className="mail-item" key={i}>
                  <div className="p-dot" style={{ background: color }} />
                  <div className="mail-snippet">{clean(e.snippet)}</div>
                  <span className={`mail-tag ${cls}`}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* Morgane */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🎨 Morgane — Meta Ads (30j)</div>
              <span className="agent-pill pill-morgane">Marketing</span>
            </div>
            {loading ? (
              <><Skeleton w="90%" /><Skeleton w="70%" /></>
            ) : campaigns.length === 0 ? (
              <div className="empty">📊 Configure META_ACCESS_TOKEN dans Vercel</div>
            ) : campaigns.map((c, i) => {
              const hasData = c.impressions && c.impressions !== 'Not available'
              const statusClass = c.status === 'ACTIVE' ? 's-active' : c.status === 'PAUSED' ? 's-paused' : 's-off'
              return (
                <div className="camp-item" key={i}>
                  <div className="camp-name">
                    <span className={`camp-status ${statusClass}`} />
                    {c.name}
                  </div>
                  {hasData ? (
                    <div className="metrics-row">
                      <div className="m-box"><div className="m-v">{(c.spend||'—').split(' ')[0]}</div><div className="m-l">Dépensé</div></div>
                      <div className="m-box"><div className="m-v">{fmt(parseNum(c.impressions))}</div><div className="m-l">Impressions</div></div>
                      <div className="m-box"><div className="m-v">{c.ctr||'—'}</div><div className="m-l">CTR</div></div>
                      <div className="m-box"><div className="m-v">{c.cpc||'—'}</div><div className="m-l">CPC</div></div>
                    </div>
                  ) : (
                    <div style={{fontSize:10,color:'#a094c0',fontStyle:'italic'}}>Pas de données sur la période</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Agenda + Activité */}
        <div className="grid-bottom">
          <div className="card">
            <div className="card-header">
              <div className="card-title">📅 Agenda — Cette semaine</div>
            </div>
            {loading ? (
              <><Skeleton w="55%" /><Skeleton w="70%" /></>
            ) : events.length === 0 ? (
              <div className="empty">📅 Aucun événement cette semaine</div>
            ) : events.map((ev, i) => (
              <div className="event-item" key={i}>
                <div className="ev-date">
                  <div className="ev-day">{ev.day}</div>
                  <div className="ev-month">{ev.month}</div>
                </div>
                <div>
                  <div className="ev-name">{ev.summary}</div>
                  <div className="ev-time">{ev.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">⚡ Activité récente</div>
            </div>
            {[
              { icon: '🤖', bg: '#eeebff', text: 'Victor a qualifié 8 leads LinkedIn SaaS B2B', time: 'Il y a 2 min' },
              { icon: '📸', bg: '#fde8f4', text: 'Morgane a publié sur Instagram', time: 'Il y a 14 min' },
              { icon: '📧', bg: '#eeebff', text: 'Victor a envoyé 5 emails de prospection', time: 'Il y a 1h' },
              { icon: '📅', bg: '#d1fae5', text: 'Victor a pris 2 rendez-vous', time: 'Il y a 2h' },
              { icon: '📊', bg: '#fde8f4', text: 'Morgane a analysé les campagnes Meta', time: 'Ce matin' },
            ].map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="act-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div>
                  <div className="act-text">{a.text}</div>
                  <div className="act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          {lastUpdate
            ? `Mis à jour le ${lastUpdate.toLocaleString('fr-FR', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })} · AgentFlow by Alexandre Bessard`
            : 'AgentFlow · Données en cours de chargement...'}
        </div>
      </main>
    </div>
  )
}
