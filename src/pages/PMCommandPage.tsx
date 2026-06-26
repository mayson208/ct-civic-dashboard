import { useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import SectionHeader from '../components/SectionHeader'

// ─── Synthesized data pulled from the same mock datasets used across all pages ───
const PORTFOLIO_STATUS = [
  { id: 'P-01', name: 'CT.gov Portal Redesign',         phase: 'Execution',  schedule: 'Green', budget: 'Green', risk: 'Low',  pct: 72, rag: 'Green' },
  { id: 'P-02', 'name': 'CTDOL Unemployment System',    phase: 'Execution',  schedule: 'Amber', budget: 'Red',   risk: 'High', pct: 58, rag: 'Red'   },
  { id: 'P-03', name: 'BEST Zero Trust Implementation', phase: 'Execution',  schedule: 'Green', budget: 'Green', risk: 'Med',  pct: 48, rag: 'Green' },
  { id: 'P-04', name: 'CT Data Lake / Analytics Hub',   phase: 'Planning',   schedule: 'Amber', budget: 'Green', risk: 'High', pct: 22, rag: 'Amber' },
  { id: 'P-05', name: 'DMV VIEWS Modernization',        phase: 'Procurement',schedule: 'Red',   budget: 'Amber', risk: 'High', pct: 18, rag: 'Red'   },
  { id: 'P-06', name: 'Courts e-Filing (Tyler Odyssey)',phase: 'Execution',  schedule: 'Green', budget: 'Green', risk: 'Med',  pct: 62, rag: 'Green' },
  { id: 'P-07', name: 'BEAD Broadband (DEEP/OPM)',      phase: 'Execution',  schedule: 'Amber', budget: 'Green', risk: 'Med',  pct: 44, rag: 'Amber' },
  { id: 'P-08', name: 'DCF Case Management Cloud',      phase: 'Planning',   schedule: 'Green', budget: 'Green', risk: 'Low',  pct: 14, rag: 'Green' },
  { id: 'P-09', name: 'CT ECS Grant Portal',            phase: 'Closed',     schedule: 'Green', budget: 'Green', risk: 'Low',  pct: 100, rag: 'Green' },
  { id: 'P-10', name: 'CTDMHAS Crisis Line Platform',   phase: 'Execution',  schedule: 'Green', budget: 'Green', risk: 'Low',  pct: 84, rag: 'Green' },
]

const RISK_SUMMARY = [
  { level: 'Critical', count: 2, color: '#dc2626' },
  { level: 'High',     count: 3, color: '#f97316' },
  { level: 'Medium',   count: 4, color: '#f59e0b' },
  { level: 'Low',      count: 3, color: '#22c55e' },
]

const GRANT_BURN = [
  { name: 'ARPA SLFRF', total: 1382, obligated: 1284, expended: 1124, daysLeft: 184 },
  { name: 'IIJA BEAD',  total: 144,  obligated: 98,   expended: 42,   daysLeft: 548 },
  { name: 'ESSER III',  total: 428,  obligated: 412,  expended: 384,  daysLeft: 62  },
  { name: 'EPA CPRG',   total: 87,   obligated: 48,   expended: 12,   daysLeft: 482 },
  { name: 'IIJA-HWY',   total: 284,  obligated: 184,  expended: 124,  daysLeft: 912 },
]

const CONTRACTS_EXPIRING = [
  { vendor: 'Deloitte / CTDOL',    value: 84000000,  daysLeft: 142, action: 'Renew or re-bid' },
  { vendor: 'IBM Mainframe (OIS)', value: 28400000,  daysLeft: 168, action: 'Cloud migration decision' },
  { vendor: 'NetSol CT (SBE)',     value: 4200000,   daysLeft: 201, action: 'Sole-source justification' },
  { vendor: 'Palo Alto Networks',  value: 18400000,  daysLeft: 248, action: 'Expand scope for ZT' },
  { vendor: 'Lumen CEN',           value: 42000000,  daysLeft: 284, action: 'Renegotiate bandwidth' },
]

const PORTFOLIO_HEALTH = [
  { dimension: 'Schedule',     score: 3.2 },
  { dimension: 'Budget',       score: 3.6 },
  { dimension: 'Risk Mgmt',    score: 2.9 },
  { dimension: 'Scope Control',score: 3.4 },
  { dimension: 'Stakeholder',  score: 3.8 },
  { dimension: 'Cyber',        score: 3.1 },
]

const RAG_CFG: Record<string, { dot: string; label: string }> = {
  Green: { dot: 'bg-emerald-500', label: 'text-emerald-700 bg-emerald-50' },
  Amber: { dot: 'bg-amber-500',   label: 'text-amber-700 bg-amber-50'   },
  Red:   { dot: 'bg-red-500',     label: 'text-red-700 bg-red-50'       },
}

const RISK_ACTIONS = [
  { id: 'R-02', name: 'CTDOL Vendor Delay (Deloitte)',        level: 'Critical', due: '2025-07-15', owner: 'CT DOL / DAS', action: 'Trigger penalty clause; activate backup vendor assessment' },
  { id: 'R-05', name: 'Data Lake PII Governance Gap',         level: 'Critical', due: '2025-08-01', owner: 'BEST / OPM',   action: 'Execute DPIA; implement field-level encryption before Phase 2' },
  { id: 'R-01', name: 'DMV VIEWS — Scope Creep',              level: 'High',     due: '2025-09-01', owner: 'CT DMV',       action: 'Freeze requirements; ICC review before next milestone' },
  { id: 'R-03', name: 'Zero Trust — Cloud Scope Creep',       level: 'High',     due: '2025-10-01', owner: 'BEST',         action: 'Locked backlog; quarterly scope review with CISO' },
]

const RECENT_MILESTONES = [
  { date: '2025-06-02', project: 'Courts e-Filing', milestone: 'Phase 3 Housing Court go-live — 18 courthouses', status: 'On Time' },
  { date: '2025-05-28', project: 'BEST Zero Trust', milestone: 'Identity pillar: MFA enforced statewide (52,000 accounts)', status: 'On Time' },
  { date: '2025-05-15', project: 'CTDOL Modernization', milestone: 'Missed: UI Claims Portal v2 release', status: 'Slipped' },
  { date: '2025-05-01', project: 'CT.gov Redesign', milestone: 'Beta launch — 12 agency sites migrated', status: 'On Time' },
  { date: '2025-04-18', project: 'BEAD Broadband', milestone: 'Challenge process closed — 42,800 locations submitted', status: 'On Time' },
]

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`

export default function PMCommandPage() {
  const redCount = PORTFOLIO_STATUS.filter(p => p.rag === 'Red').length
  const amberCount = PORTFOLIO_STATUS.filter(p => p.rag === 'Amber').length
  const greenCount = PORTFOLIO_STATUS.filter(p => p.rag === 'Green').length
  const avgHealth = (PORTFOLIO_HEALTH.reduce((s, d) => s + d.score, 0) / PORTFOLIO_HEALTH.length).toFixed(1)
  const expiringCritical = CONTRACTS_EXPIRING.filter(c => c.daysLeft < 180).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">PM Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">IT portfolio roll-up · Active risks · Grant burn rate · Contract expirations · Steering committee view</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Refreshed: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1 bg-ct-navy text-white rounded-xl p-4 shadow">
          <p className="text-xs text-blue-300 font-semibold">Portfolio Score</p>
          <p className="text-4xl font-black mt-1">{avgHealth}<span className="text-lg text-blue-300">/5.0</span></p>
          <p className="text-xs text-blue-300 mt-1">Across 6 PMBOK dimensions</p>
        </div>
        <div className={`bg-white rounded-xl border-2 ${redCount > 0 ? 'border-red-300' : 'border-slate-200'} p-3 shadow-sm flex flex-col items-center justify-center`}>
          <p className="text-3xl font-black text-red-600">{redCount}</p>
          <p className="text-xs text-slate-500 mt-1 text-center">Red Projects</p>
        </div>
        <div className={`bg-white rounded-xl border-2 ${amberCount > 1 ? 'border-amber-300' : 'border-slate-200'} p-3 shadow-sm flex flex-col items-center justify-center`}>
          <p className="text-3xl font-black text-amber-500">{amberCount}</p>
          <p className="text-xs text-slate-500 mt-1 text-center">Amber Projects</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-black text-emerald-600">{greenCount}</p>
          <p className="text-xs text-slate-500 mt-1 text-center">Green Projects</p>
        </div>
        <div className={`bg-white rounded-xl border-2 ${expiringCritical > 0 ? 'border-red-300' : 'border-slate-200'} p-3 shadow-sm flex flex-col items-center justify-center`}>
          <p className="text-3xl font-black text-red-600">{expiringCritical}</p>
          <p className="text-xs text-slate-500 mt-1 text-center">Contracts &lt;180d</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar health */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Portfolio Health Radar" description="PMBOK-aligned dimension scores (1–5 scale)" />
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={PORTFOLIO_HEALTH} cx="50%" cy="50%" outerRadius={75}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#64748b' }} />
              <Radar name="Score" dataKey="score" stroke="#003087" fill="#003087" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip formatter={(v: number) => [`${v}/5.0`, 'Score']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Risk Register Summary" description="Active risks by severity level" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={RISK_SUMMARY} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={65} label={({ level, count }) => `${level}: ${count}`}>
                {RISK_SUMMARY.map((r, i) => <Cell key={i} fill={r.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-1 justify-center">
            {RISK_SUMMARY.map(r => (
              <span key={r.level} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />{r.level}: {r.count}
              </span>
            ))}
          </div>
        </div>

        {/* Grant burn */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Federal Grant Burn Rate" description="Obligated vs. expended ($M) · Key active grants" />
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={GRANT_BURN} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={72} />
              <Tooltip formatter={(v: number, n) => [`$${v}M`, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="total"     name="Total"    fill="#003087" opacity={0.25} />
              <Bar dataKey="obligated" name="Obligated" fill="#003087" opacity={0.6} />
              <Bar dataKey="expended"  name="Expended"  fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* IT Project Portfolio */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="IT Project Portfolio — RAG Status" description={`${PORTFOLIO_STATUS.length} active projects · ${redCount} Red · ${amberCount} Amber · ${greenCount} Green`} />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-400 font-semibold">
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Project</th>
              <th className="text-center px-3 py-2">Phase</th>
              <th className="text-center px-3 py-2">Sched</th>
              <th className="text-center px-3 py-2">Budget</th>
              <th className="text-right px-3 py-2">Pct</th>
              <th className="text-center px-3 py-2">RAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {PORTFOLIO_STATUS.sort((a, b) => {
              const order = { Red: 0, Amber: 1, Green: 2 }
              return order[a.rag as keyof typeof order] - order[b.rag as keyof typeof order]
            }).map(p => (
              <tr key={p.id} className={`hover:bg-slate-50 transition ${p.rag === 'Red' ? 'bg-red-50/40' : p.rag === 'Amber' ? 'bg-amber-50/30' : ''}`}>
                <td className="px-3 py-2 font-bold text-slate-400">{p.id}</td>
                <td className="px-3 py-2 font-medium text-slate-700">{p.name}</td>
                <td className="px-3 py-2 text-center text-slate-500">{p.phase}</td>
                <td className="px-3 py-2 text-center"><span className={`w-2 h-2 rounded-full inline-block ${RAG_CFG[p.schedule].dot}`} /></td>
                <td className="px-3 py-2 text-center"><span className={`w-2 h-2 rounded-full inline-block ${RAG_CFG[p.budget].dot}`} /></td>
                <td className="px-3 py-2 text-right text-slate-600">{p.pct}%</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-black ${RAG_CFG[p.rag].label}`}>{p.rag}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Required actions */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <SectionHeader title="Required PM Actions — Next 90 Days" description="Escalation items requiring immediate PM decision" />
          </div>
          <div className="divide-y divide-slate-100">
            {RISK_ACTIONS.map(r => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${r.level === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{r.level}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{r.id}: {r.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Owner: {r.owner} · Due: {r.due}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contracts expiring / milestones */}
        <div className="space-y-4">
          {/* Contracts expiring */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <SectionHeader title="Contracts Expiring — Next 12 Months" description="Requires renewal decision or re-procurement" />
            </div>
            {CONTRACTS_EXPIRING.sort((a, b) => a.daysLeft - b.daysLeft).map(c => (
              <div key={c.vendor} className="px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-center gap-3">
                <div className={`flex-shrink-0 text-center w-12 h-12 rounded-lg flex flex-col items-center justify-center font-black text-white text-xs ${c.daysLeft < 180 ? 'bg-red-500' : 'bg-amber-500'}`}>
                  <span className="text-lg leading-tight">{c.daysLeft}</span>
                  <span className="text-xs opacity-80">days</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{c.vendor}</p>
                  <p className="text-xs text-slate-400">{fmt$(c.value)} · {c.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent milestones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Recent Milestone Activity" description="Last 90-day milestone log across portfolio" />
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_MILESTONES.map((m, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <span className={`text-xs font-black px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${m.status === 'On Time' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span>
              <div>
                <p className="text-xs font-bold text-slate-700">{m.project}: {m.milestone}</p>
                <p className="text-xs text-slate-400">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
