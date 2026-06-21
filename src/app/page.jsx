'use client'
import { useState, useEffect, useCallback } from 'react'

function clean(raw) {
  if (!raw) return ''
  return raw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&\w+;/g,'')
}

function categorizeMail(snippet) {
  const s = (snippet || '').toLowerCase()
  if (s.includes('facture')||s.includes('paiement')||s.includes('bred')||s.includes('impôt')||s.includes('taxe')||s.includes('cofilease')) return 'urgent'
  if (s.includes('candidature')||s.includes('france travail')||s.includes('avertissement')||s.includes('acompte')) return 'rh'
  if (s.includes('rendez-vous')||s.includes('rdv')||s.includes('accompagnement')) return 'rdv'
  return 'info'
}

const tagMap = {
  urgent: ['Urgent','t-urgent','#f87171'],
  rh:     ['RH','t-rh','#93c5fd'],
  rdv:    ['RDV','t-rdv','#6ee7b7'],
  info:   ['Info','t-info','#c4b5fd'],
}

function parseNum(val) {
  if (!val || val==='Not available') return null
  return parseFloat(String(val).replace(/[^\d,.]/g,'').replace(',','.')) || null
}

function fmt(n) {
  if (n===null||n===undefined) return '—'
  if (n>=1000000) return (n/1000000).toFixed(1)+'M'
  if (n>=1000) return Math.round(n/1000)+'k'
  return Math.round(n).toString()
}

function Skeleton({ w='80%', h=12 }) {
  return <div className="skeleton" style={{ width:w, height:h }} />
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">🤖 AgentFlow</div>
        <div className="sidebar-brand-sub">Mon équipe IA</div>
      </div>
      <a className="nav-item active" href="#">📊 Dashboard</a>
      <a className="nav-item" href="#">
        💬 Messages
        <span style={{background:'#7c3aed',color:'#fff',fontSize:10,padding:'1px 6px',borderRadius:10,marginLeft:'auto'}}>3</span>
      </a>
      <a className="nav-item" href="#">🔄 Workflows</a>
      <a className="nav-item" href="#">📈 Analytics</a>
      <a className="nav-item" href="#">🔌 Intégrations</a>
      <div className="nav-section">Mes agents</div>
      <div className="agent-nav">
        <div className="agent-dot" style={{background:'#6ee7b7'}}/>
        <div><div className="agent-nav-name">Victor</div><div className="agent-nav-task">Analyse leads...</div></div>
      </div>
      <div className="agent-nav">
        <div className="agent-dot" style={{background:'#f472b6'}}/>
        <div><div className="agent-nav-name">Morgane</div><div className="agent-nav-task">Rédige un post...</div></div>
      </div>
      <div className="agent-nav">
        <div className="agent-dot" style={{background:'rgba(255,255,255,0.2)'}}/>
        <div><div className="agent-nav-name" style={{color:'rgba(255,255,255,0.3)'}}>+ Nouvel agent</div></div>
      </div>
      <div className="sidebar-footer">
        <div className="avatar">AL</div>
        <div><div className="avatar-name">Alexandre</div><div className="avatar-role">Admin · Pro</div></div>
      </div>
    </aside>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [events, setEvents] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [emailCount, setEmailCount] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch { setCampaigns([]) }

    setEmails([
      { snippet: 'BRED COFILEASE — Ordre de paiement 2 591,82 € valable jusqu\'au 18/06/2026', cat: 'urgent' },
      { snippet: 'Facture N°23370 du 05/05/2026 — réajustement KM non reçu (Christophe)', cat: 'urgent' },
      { snippet: 'Taxes d\'urbanisme DP97221022BV10900 — démarches fiscales à réaliser', cat: 'urgent' },
      { snippet: 'France Travail — candidature Pizzaïolo/Pizzaïola (H/F)', cat: 'rh' },
      { snippet: 'Candidature spontanée pour un poste à temps partiel — CV joint', cat: 'rh' },
      { snippet: 'Accompagnement Pizzeria Viaggio — proposition temps d\'échange', cat: 'rdv' },
      { snippet: 'Situation compte client — rëglements en attente ce mois', cat: 'info' },
    ])
    setEmailCount(13)
    setEvents([{ summary: '🎂 Anniversaire de Maël', day: 28, month: 'juin', time: 'Toute la journée' }])
    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const active = campaigns.filter(c => c.impressions && c.impressions !== 'Not available')
  const totalSpend = active.reduce((s,c) => s+(parseNum(c.spend)||0), 0)
  const totalReach = active.reduce((s,c) => s+(parseNum(c.reach)||0), 0)
  const urgentMails = emails.filter(e => e.cat === 'urgent').length

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Vue d&apos;ensemble</h1>
          <div className="top-actions">
            <div className="pill-active"><span className="status-dot-green"></span>2 agents actifs</div>
            <button className="btn-rapport">📄 Rapport</button>
            <button className="btn-launch" onClick={load} disabled={loading}>
              {loading ? '↻ Chargement...' : '⚡ Actualiser'}
            </button>
          </div>
        </div>

        {/* Alert */}
        <div className="alert">⚠️ <span>Compte Meta <strong>102490684</strong> désactivé — contacter le support Facebook pour le réactiver.</span></div>

        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">Emails cette semaine</div>
            <div className="kpi-value">{loading ? '—' : emailCount}</div>
            <div className={`kpi-sub ${urgentMails>0?'sub-warn':'sub-ok'}`}>
              {loading ? '...' : urgentMails>0 ? `⚠️ ${urgentMails} urgent${urgentMails>1?'s':''}` : '↑ Aucun urgent'}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Budget Meta (30j)</div>
            <div className="kpi-value">{loading ? '—' : totalSpend>0 ? totalSpend.toFixed(0)+' €' : '—'}</div>
            <div className="kpi-sub sub-info">{loading ? '...' : `${active.length} campagne${active.length!==1?'s':''} active${active.length!==1?'s':''}`}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Portée Meta (30j)</div>
            <div className="kpi-value">{loading ? '—' : totalReach>0 ? fmt(totalReach) : '—'}</div>
            <div className="kpi-sub sub-ok">{loading ? '...' : 'Personnes touchées'}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Agenda cette semaine</div>
            <div className="kpi-value">{loading ? '—' : events.length}</div>
            <div className="kpi-sub sub-info">{loading ? '...' : events.length===0 ? 'Semaine libre' : '7 prochains jours'}</div>
          </div>
        </div>

        {/* Agents */}
        <div className="agents-row">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <img className="agent-avatar" src="/victor-avatar.png" alt="Victor" />
                <div className="agent-info"><span className="agent-name">Victor</span><span className="agent-role-label">Agent Commercial</span></div>
              </div>
              <div className="badge-actif">Actif</div>
            </div>
            <div className="metric-row"><span className="metric-label">Leads</span><div className="bar-bg"><div className="bar-fill bar-victor" style={{width:'78%'}}></div></div><span className="metric-pct">78%</span></div>
            <div className="metric-row"><span className="metric-label">Emails</span><div className="bar-bg"><div className="bar-fill bar-victor" style={{width:'65%'}}></div></div><span className="metric-pct">65%</span></div>
            <div className="metric-row"><span className="metric-label">RDV pris</span><div className="bar-bg"><div className="bar-fill bar-victor" style={{width:'45%'}}></div></div><span className="metric-pct">45%</span></div>
            <div className="task-row">
              <span>🔍</span>
              <div><div className="task-name">Qualification de leads</div><div className="task-desc">Analyse 15 profils LinkedIn SaaS B2B</div></div>
              <span className="task-status">En cours</span>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <img className="agent-avatar" src="/morgane-avatar.png" alt="Morgane" />
                <div className="agent-info"><span className="agent-name">Morgane</span><span className="agent-role-label">Agente Marketing</span></div>
              </div>
              <div className="badge-busy">Occupée</div>
            </div>
            <div className="metric-row"><span className="metric-label">Contenu</span><div className="bar-bg"><div className="bar-fill bar-morgane" style={{width:'88%'}}></div></div><span className="metric-pct">88%</span></div>
            <div className="metric-row"><span className="metric-label">Réseaux</span><div className="bar-bg"><div className="bar-fill bar-morgane" style={{width:'72%'}}></div></div><span className="metric-pct">72%</span></div>
            <div className="metric-row"><span className="metric-label">Engagement</span><div className="bar-bg"><div className="bar-fill bar-morgane" style={{width:'91%'}}></div></div><span className="metric-pct">91%</span></div>
            <div className="task-row">
              <span>✏️</span>
              <div><div className="task-name">Post LinkedIn</div><div className="task-desc">Rédige 3 posts pour la semaine</div></div>
              <span className="task-status">En cours</span>
            </div>
          </div>
        </div>

        {/* Emails + Meta */}
        <div className="agents-row" style={{marginBottom:14}}>
          <div className="card">
            <div className="card-header"><div className="card-title">📬 Victor — Emails de la semaine</div></div>
            {loading ? <><Skeleton w="85%"/><Skeleton w="65%"/><Skeleton w="75%"/></> :
              emails.length===0 ? <div className="empty">📭 Aucun email</div> :
              emails.map((e,i) => {
                const [label,cls,color] = tagMap[e.cat]
                return <div className="mail-item" key={i}>
                  <div className="p-dot" style={{background:color}}/>
                  <div className="mail-snippet">{clean(e.snippet)}</div>
                  <span className={`mail-tag ${cls}`}>{label}</span>
                </div>
              })
            }
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">📊 Morgane — Meta Ads (30j)</div></div>
            {loading ? <><Skeleton w="90%"/><Skeleton w="70%"/></> :
              campaigns.length===0 ? <div className="empty">Configure META_ACCESS_TOKEN sur Vercel</div> :
              campaigns.map((c,i) => {
                const hasData = c.impressions && c.impressions!=='Not available'
                const sc = c.status==='ACTIVE'?'s-active':c.status==='PAUSED'?'s-paused':'s-off'
                return <div className="camp-item" key={i}>
                  <div className="camp-name"><span className={`camp-status ${sc}`}/>{c.name}</div>
                  {hasData && <div className="metrics-row">
                    <div className="m-box"><div className="m-v">{(c.spend||'—').split(' ')[0]}</div><div className="m-l">Dépensé</div></div>
                    <div className="m-box"><div className="m-v">{fmt(parseNum(c.impressions))}</div><div className="m-l">Impressions</div></div>
                    <div className="m-box"><div className="m-v">{c.ctr||'—'}</div><div className="m-l">CTR</div></div>
                    <div className="m-box"><div className="m-v">{c.cpc||'—'}</div><div className="m-l">CPC</div></div>
                  </div>}
                </div>
              })
            }
          </div>
        </div>

        {/* Workflow + Activité */}
        <div className="grid-bottom" style={{marginBottom:14}}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔗 Workflow actif : Prospection → Contenu</div>
              <span className="see-all">Voir tout →</span>
            </div>
            <div className="running-label"><span className="running-dot"></span>En cours d&apos;exécution</div>
            <div className="wf-step">
              <div className="step-icon step-done">✓</div>
              <div><div className="step-name">Identification des leads</div><div className="step-desc">Victor scrape 15 profils LinkedIn SaaS B2B</div><div className="step-agent">Victor · Terminé</div></div>
            </div>
            <div className="wf-step">
              <div className="step-icon step-active">⚡</div>
              <div><div className="step-name">Qualification & scoring</div><div className="step-desc">Analyse, attribution d'un score 1-10</div><div className="step-agent">Victor · En cours</div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">⚡ Activité récente</div></div>
            {[
              ['/victor-avatar.png','Victor a qualifié 8 leads LinkedIn','Il y a 2 min'],
              ['/morgane-avatar.png','Morgane a publié sur Instagram','Il y a 14 min'],
              ['/victor-avatar.png','Victor a envoyé 5 emails','Il y a 1h'],
              ['/victor-avatar.png','Victor a pris 2 RDV','Il y a 2h'],
              ['/morgane-avatar.png','Morgane a analysé Meta Ads','Ce matin'],
            ].map(([src,text,time],i) => (
              <div className="activity-item" key={i}>
                <img className="act-avatar" src={src} alt="" />
                <div><div className="act-text">{text}</div><div className="act-time">{time}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div className="card">
          <div className="card-header"><div className="card-title">📅 Agenda — 7 prochains jours</div></div>
          {loading ? <Skeleton w="55%"/> :
            events.length===0 ? <div className="empty">📅 Aucun événement cette semaine</div> :
            events.map((ev,i) => (
              <div className="event-item" key={i}>
                <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
                <div><div className="ev-name">{ev.summary}</div><div className="ev-time">{ev.time}</div></div>
              </div>
            ))
          }
        </div>

        <div className="footer">
          {lastUpdate ? `Mis à jour le ${lastUpdate.toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})} · AgentFlow by Alexandre Bessard` : 'AgentFlow · Chargement...'}
        </div>
      </main>
    </div>
  )
}
