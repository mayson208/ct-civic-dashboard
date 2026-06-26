import { useState, useMemo } from 'react'

type Phase = 'Planning' | 'In Progress' | 'UAT' | 'Deployed' | 'On Hold'
type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
type RiskLevel = 'High' | 'Medium' | 'Low'

interface Project {
  id: string
  name: string
  agency: string
  phase: Phase
  priority: Priority
  progress: number
  budget: number
  spent: number
  startDate: string
  targetDate: string
  pm: string
  risk: RiskLevel
  riskNote: string
  tags: string[]
}

const PHASE_COLOR: Record<Phase, string> = {
  'Planning':    'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'UAT':         'bg-purple-100 text-purple-700 border-purple-200',
  'Deployed':    'bg-emerald-100 text-emerald-700 border-emerald-200',
  'On Hold':     'bg-amber-100 text-amber-700 border-amber-200',
}

const PRIORITY_COLOR: Record<Priority, string> = {
  Critical: 'text-red-600 bg-red-50 border-red-200',
  High:     'text-orange-600 bg-orange-50 border-orange-200',
  Medium:   'text-amber-600 bg-amber-50 border-amber-200',
  Low:      'text-slate-500 bg-slate-50 border-slate-200',
}

const RISK_COLOR: Record<RiskLevel, string> = {
  High:   'text-red-600',
  Medium: 'text-amber-600',
  Low:    'text-emerald-600',
}

const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'DMV Online Renewal Modernization', agency: 'Dept of Motor Vehicles', phase: 'In Progress', priority: 'Critical', progress: 68, budget: 4800000, spent: 3100000, startDate: '2024-01-15', targetDate: '2025-03-31', pm: 'R. Chudworth', risk: 'Medium', riskNote: 'Legacy system integration delayed 3 weeks; vendor escalated', tags: ['Modernization', 'Citizen-Facing', 'ITSM'] },
  { id: '2', name: 'CT.gov Accessibility Remediation', agency: 'BEST / OPM', phase: 'In Progress', priority: 'High', progress: 82, budget: 890000, spent: 710000, startDate: '2024-03-01', targetDate: '2025-06-30', pm: 'R. Chudworth', risk: 'Low', riskNote: 'On track; WCAG 2.1 AA audit passed for 94% of pages', tags: ['Accessibility', 'Compliance', 'WCAG'] },
  { id: '3', name: 'Enterprise Data Lake Phase 2', agency: 'Office of Policy & Management', phase: 'Planning', priority: 'High', progress: 22, budget: 12500000, spent: 1400000, startDate: '2024-09-01', targetDate: '2026-12-31', pm: 'R. Chudworth', risk: 'High', riskNote: 'Vendor selection RFP received 6 bids; scoring in progress', tags: ['Data', 'Analytics', 'Infrastructure'] },
  { id: '4', name: 'DCF Case Management System Upgrade', agency: 'Dept of Children & Families', phase: 'UAT', priority: 'Critical', progress: 91, budget: 7200000, spent: 6800000, startDate: '2023-06-01', targetDate: '2025-01-31', pm: 'R. Chudworth', risk: 'Medium', riskNote: 'UAT defect backlog at 23 open items; 4 are P1', tags: ['Case Mgmt', 'Social Services', 'Migration'] },
  { id: '5', name: 'CTDOL Benefits Portal Rewrite', agency: 'Dept of Labor', phase: 'Deployed', priority: 'High', progress: 100, budget: 3100000, spent: 2980000, startDate: '2023-01-10', targetDate: '2024-09-30', pm: 'R. Chudworth', risk: 'Low', riskNote: 'Deployed Sept 2024; 99.8% uptime; 42K active users', tags: ['Deployed', 'Portal', 'Benefits'] },
  { id: '6', name: 'Statewide Cybersecurity Zero Trust Framework', agency: 'BEST', phase: 'In Progress', priority: 'Critical', progress: 44, budget: 18000000, spent: 7200000, startDate: '2024-06-01', targetDate: '2026-06-30', pm: 'R. Chudworth', risk: 'High', riskNote: 'Identity provider migration complex; SOC2 audit Q2 2025', tags: ['Cybersecurity', 'Zero Trust', 'Infrastructure'] },
  { id: '7', name: 'Courts E-Filing System', agency: 'Judicial Branch', phase: 'Planning', priority: 'Medium', progress: 10, budget: 5500000, spent: 350000, startDate: '2025-01-01', targetDate: '2026-09-30', pm: 'R. Chudworth', risk: 'Low', riskNote: 'Requirements gathering phase; stakeholder interviews scheduled', tags: ['Courts', 'E-Filing', 'Modernization'] },
  { id: '8', name: 'CT Health Analytics Platform', agency: 'Dept of Public Health', phase: 'On Hold', priority: 'Medium', progress: 35, budget: 2200000, spent: 890000, startDate: '2024-02-01', targetDate: '2025-08-31', pm: 'R. Chudworth', risk: 'Medium', riskNote: 'On hold pending FY26 budget allocation decision', tags: ['Health', 'Analytics', 'Data'] },
]

const fmt$ = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`

export default function ProjectTrackerPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [filterPhase, setFilterPhase] = useState<Phase | 'All'>('All')
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const filtered = useMemo(() => projects.filter(p => {
    if (filterPhase !== 'All' && p.phase !== filterPhase) return false
    if (filterPriority !== 'All' && p.priority !== filterPriority) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.agency.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [projects, filterPhase, filterPriority, search])

  const selected = projects.find(p => p.id === selectedId)

  const summary = useMemo(() => ({
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalSpent:  projects.reduce((s, p) => s + p.spent, 0),
    byPhase: (['Planning', 'In Progress', 'UAT', 'Deployed', 'On Hold'] as Phase[]).map(ph => ({
      phase: ph, count: projects.filter(p => p.phase === ph).length,
    })),
    highRisk: projects.filter(p => p.risk === 'High').length,
    overBudget: projects.filter(p => p.spent > p.budget).length,
    avgProgress: projects.reduce((s, p) => s + p.progress, 0) / projects.length,
  }), [projects])

  const updateProject = (id: string, updates: Partial<Project>) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

  const daysUntil = (d: string) => Math.round((new Date(d).getTime() - Date.now()) / 86400000)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">IT Project Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1">Active state technology initiatives — budget, phase, risk, and progress tracking</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
            PM: R. Chudworth
          </span>
          <button
            onClick={() => {
              const newP: Project = { id: String(Date.now()), name: 'New Project', agency: 'Agency', phase: 'Planning', priority: 'Medium', progress: 0, budget: 1000000, spent: 0, startDate: new Date().toISOString().slice(0,10), targetDate: '2026-12-31', pm: 'R. Chudworth', risk: 'Low', riskNote: '', tags: [] }
              setProjects(p => [...p, newP]); setSelectedId(newP.id); setEditMode(true)
            }}
            className="px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
            + New Project
          </button>
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
          <p className="text-2xl font-black text-ct-blue">{projects.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Projects</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
          <p className="text-2xl font-black text-slate-800">{fmt$(summary.totalBudget)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Portfolio Budget</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
            <div className="bg-ct-blue h-1.5 rounded-full" style={{ width: `${Math.min(100, summary.totalSpent / summary.totalBudget * 100)}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{(summary.totalSpent / summary.totalBudget * 100).toFixed(0)}% spent ({fmt$(summary.totalSpent)})</p>
        </div>
        <div className={`rounded-xl border p-3 shadow-sm text-center ${summary.highRisk > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-2xl font-black ${summary.highRisk > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{summary.highRisk}</p>
          <p className="text-xs text-slate-500 mt-0.5">High-Risk Projects</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{summary.avgProgress.toFixed(0)}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Portfolio Progress</p>
        </div>
      </div>

      {/* Phase pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Project Pipeline</p>
        <div className="flex gap-2 flex-wrap">
          {summary.byPhase.map(({ phase, count }) => (
            <div key={phase} className={`flex-1 min-w-[100px] rounded-xl border p-3 text-center cursor-pointer transition ${PHASE_COLOR[phase]} ${filterPhase === phase ? 'ring-2 ring-offset-1 ring-ct-blue' : 'hover:opacity-80'}`}
              onClick={() => setFilterPhase(filterPhase === phase ? 'All' : phase)}>
              <p className="text-xl font-black">{count}</p>
              <p className="text-xs font-semibold mt-0.5">{phase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-2 flex-wrap items-center text-xs">
        <span className="font-semibold text-slate-500">Priority:</span>
        {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={`px-2 py-1 rounded-lg font-semibold transition border ${filterPriority === p ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {p}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project or agency…"
          className="ml-auto border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-ct-sky w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project cards */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(p => {
            const pctBudget = p.budget > 0 ? p.spent / p.budget * 100 : 0
            const days = daysUntil(p.targetDate)
            return (
              <div key={p.id}
                onClick={() => { setSelectedId(p.id === selectedId ? null : p.id); setEditMode(false) }}
                className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md ${selectedId === p.id ? 'border-ct-blue ring-1 ring-ct-blue' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[p.priority]}`}>{p.priority}</span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${PHASE_COLOR[p.phase]}`}>{p.phase}</span>
                      {p.risk === 'High' && <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">⚠ High Risk</span>}
                    </div>
                    <p className="font-bold text-slate-800 mt-1.5 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.agency}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <p className="font-black text-lg text-slate-800">{p.progress}%</p>
                    <p className={`font-semibold ${days < 0 ? 'text-red-600' : days < 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.progress === 100 ? '#22c55e' : '#003087' }} />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-slate-400">Budget: <span className="text-slate-600 font-semibold">{fmt$(p.budget)}</span></span>
                  <span className={`font-semibold ${pctBudget > 100 ? 'text-red-600' : pctBudget > 85 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {fmt$(p.spent)} spent ({pctBudget.toFixed(0)}%)
                  </span>
                </div>
                {p.riskNote && (
                  <p className={`mt-2 text-xs ${RISK_COLOR[p.risk]}`}>• {p.riskNote}</p>
                )}
                <div className="mt-2 flex gap-1 flex-wrap">
                  {p.tags.map(tag => <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{tag}</span>)}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No projects match the current filters</div>}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Detail</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(!editMode)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${editMode ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {editMode ? 'Save' : 'Edit'}
                  </button>
                  <button onClick={() => { setProjects(p => p.filter(x => x.id !== selected.id)); setSelectedId(null) }} className="text-xs px-2 py-1 rounded-lg text-red-500 border border-red-200 hover:bg-red-50">Delete</button>
                </div>
              </div>
              {editMode ? (
                <div className="space-y-2">
                  {[
                    { label: 'Project Name', k: 'name' as const, type: 'text' },
                    { label: 'Agency', k: 'agency' as const, type: 'text' },
                    { label: 'Target Date', k: 'targetDate' as const, type: 'date' },
                    { label: 'Budget ($)', k: 'budget' as const, type: 'number' },
                    { label: 'Spent ($)', k: 'spent' as const, type: 'number' },
                    { label: 'Progress (%)', k: 'progress' as const, type: 'number' },
                    { label: 'Risk Note', k: 'riskNote' as const, type: 'text' },
                  ].map(({ label, k, type }) => (
                    <div key={k}>
                      <label className="block text-xs text-slate-400 mb-0.5">{label}</label>
                      <input type={type} value={String(selected[k])} onChange={e => updateProject(selected.id, { [k]: type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-ct-sky" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Phase</label>
                    <select value={selected.phase} onChange={e => updateProject(selected.id, { phase: e.target.value as Phase })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                      {(['Planning', 'In Progress', 'UAT', 'Deployed', 'On Hold'] as Phase[]).map(ph => <option key={ph}>{ph}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Risk Level</label>
                    <select value={selected.risk} onChange={e => updateProject(selected.id, { risk: e.target.value as RiskLevel })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                      {(['High', 'Medium', 'Low'] as RiskLevel[]).map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                    {[
                      ['Agency', selected.agency],
                      ['Phase', selected.phase],
                      ['Priority', selected.priority],
                      ['Risk', selected.risk],
                      ['PM', selected.pm],
                      ['Start', selected.startDate],
                      ['Target', selected.targetDate],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-semibold text-slate-700">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                    <p className="font-bold text-ct-navy">Budget Burn</p>
                    <div className="flex justify-between"><span className="text-slate-500">Allocated</span><span className="font-bold">{fmt$(selected.budget)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Spent</span><span className="font-bold">{fmt$(selected.spent)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Remaining</span><span className={`font-bold ${selected.budget - selected.spent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmt$(selected.budget - selected.spent)}</span></div>
                    <div className="w-full bg-white rounded-full h-2 border border-slate-200">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, selected.spent / selected.budget * 100)}%`, background: selected.spent > selected.budget ? '#ef4444' : selected.spent / selected.budget > 0.85 ? '#f59e0b' : '#003087' }} />
                    </div>
                  </div>
                  {selected.riskNote && (
                    <div className={`p-3 rounded-lg ${selected.risk === 'High' ? 'bg-red-50 border border-red-100' : selected.risk === 'Medium' ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                      <p className={`font-bold mb-1 ${RISK_COLOR[selected.risk]}`}>Risk: {selected.risk}</p>
                      <p className="text-slate-600">{selected.riskNote}</p>
                    </div>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {selected.tags.map(tag => <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{tag}</span>)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-400">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm font-medium">Select a project</p>
              <p className="text-xs mt-1">Click any project card to view details and edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
