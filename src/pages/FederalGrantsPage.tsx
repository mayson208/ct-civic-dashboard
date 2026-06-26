import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

type GrantStatus = 'Obligated' | 'In Progress' | 'Expended' | 'At Risk' | 'Completed'
type Act = 'ARPA' | 'IIJA' | 'IRA' | 'ESSER' | 'Other'

interface Grant {
  id: string
  name: string
  agency: string
  act: Act
  totalAward: number
  obligated: number
  expended: number
  deadline: string
  status: GrantStatus
  category: string
  pmNote?: string
}

const GRANTS: Grant[] = [
  { id: '1',  name: 'ARPA State Fiscal Recovery Fund',             agency: 'OPM',         act: 'ARPA',  totalAward: 1586000000, obligated: 1586000000, expended: 1420000000, deadline: '2026-12-31', status: 'In Progress', category: 'Fiscal Recovery', pmNote: 'Final obligation deadline Dec 2024 — all funds obligated. Expenditure deadline Dec 2026.' },
  { id: '2',  name: 'ARPA Capital Projects Fund',                   agency: 'DECD',        act: 'ARPA',  totalAward: 213000000,  obligated: 198000000,  expended: 142000000,  deadline: '2026-12-31', status: 'In Progress', category: 'Infrastructure' },
  { id: '3',  name: 'ARPA Homeowner Assistance Fund',               agency: 'CHFA',        act: 'ARPA',  totalAward: 123000000,  obligated: 118000000,  expended: 98000000,   deadline: '2025-09-30', status: 'In Progress', category: 'Housing', pmNote: 'Expenditure pace may miss deadline — escalation recommended' },
  { id: '4',  name: 'IIJA Broadband — BEAD Program',               agency: 'DECD',        act: 'IIJA',  totalAward: 144000000,  obligated: 14000000,   expended: 2100000,    deadline: '2028-06-30', status: 'In Progress', category: 'Broadband' },
  { id: '5',  name: 'IIJA Federal Highway Formula',                 agency: 'DOT',         act: 'IIJA',  totalAward: 524000000,  obligated: 421000000,  expended: 312000000,  deadline: '2026-09-30', status: 'In Progress', category: 'Transportation' },
  { id: '6',  name: 'IIJA Safe Streets & Roads for All',            agency: 'DOT',         act: 'IIJA',  totalAward: 22800000,   obligated: 22800000,   expended: 8400000,    deadline: '2027-03-31', status: 'In Progress', category: 'Transportation' },
  { id: '7',  name: 'IIJA Bridge Replacement & Rehabilitation',     agency: 'DOT',         act: 'IIJA',  totalAward: 186000000,  obligated: 148000000,  expended: 89000000,   deadline: '2027-09-30', status: 'In Progress', category: 'Transportation' },
  { id: '8',  name: 'IIJA Lead Service Line Replacement',           agency: 'DPH',         act: 'IIJA',  totalAward: 48000000,   obligated: 38000000,   expended: 22000000,   deadline: '2026-06-30', status: 'In Progress', category: 'Water / Health' },
  { id: '9',  name: 'IRA Clean Energy Innovation Fund',             agency: 'DEEP',        act: 'IRA',   totalAward: 86000000,   obligated: 52000000,   expended: 18000000,   deadline: '2030-09-30', status: 'In Progress', category: 'Clean Energy' },
  { id: '10', name: 'IRA Environmental Justice Grants (EPA)',       agency: 'DEEP',        act: 'IRA',   totalAward: 24000000,   obligated: 18000000,   expended: 6200000,    deadline: '2027-09-30', status: 'In Progress', category: 'Environment' },
  { id: '11', name: 'ESSER III (COVID School Relief)',              agency: 'CSDE',        act: 'ESSER', totalAward: 641000000,  obligated: 641000000,  expended: 641000000,  deadline: '2024-09-30', status: 'Completed',   category: 'Education' },
  { id: '12', name: 'ARPA Emergency Rental Assistance',             agency: 'DOH',         act: 'ARPA',  totalAward: 324000000,  obligated: 324000000,  expended: 312000000,  deadline: '2025-03-31', status: 'Completed',   category: 'Housing' },
  { id: '13', name: 'IIJA Electric Vehicle Charging (NEVI)',        agency: 'DOT',         act: 'IIJA',  totalAward: 32000000,   obligated: 18000000,   expended: 4200000,    deadline: '2027-09-30', status: 'In Progress', category: 'Clean Energy' },
  { id: '14', name: 'ARPA Child Care Stabilization',                agency: 'OEC',         act: 'ARPA',  totalAward: 98000000,   obligated: 98000000,   expended: 94000000,   deadline: '2024-09-30', status: 'Expended',    category: 'Social Services' },
]

const ACT_COLORS: Record<Act, string> = {
  ARPA:  '#003087', IIJA: '#0072ce', IRA: '#22c55e', ESSER: '#f59e0b', Other: '#94a3b8',
}

const STATUS_COLORS: Record<GrantStatus, string> = {
  'Obligated':   '#0072ce', 'In Progress': '#22c55e', 'Expended': '#a855f7',
  'At Risk':     '#ef4444', 'Completed':   '#64748b',
}

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

export default function FederalGrantsPage() {
  const [filterAct, setFilterAct] = useState<Act | 'All'>('All')
  const [sortBy, setSortBy] = useState<'award' | 'pct' | 'deadline'>('award')

  const filtered = useMemo(() =>
    GRANTS.filter(g => filterAct === 'All' || g.act === filterAct)
      .sort((a, b) => {
        if (sortBy === 'award') return b.totalAward - a.totalAward
        if (sortBy === 'pct') return (b.expended / b.totalAward) - (a.expended / a.totalAward)
        return a.deadline.localeCompare(b.deadline)
      }),
    [filterAct, sortBy]
  )

  const summary = useMemo(() => {
    const totalAward = GRANTS.reduce((s, g) => s + g.totalAward, 0)
    const totalObligated = GRANTS.reduce((s, g) => s + g.obligated, 0)
    const totalExpended = GRANTS.reduce((s, g) => s + g.expended, 0)
    const atRisk = GRANTS.filter(g => {
      const days = Math.round((new Date(g.deadline).getTime() - Date.now()) / 86400000)
      const pctExpended = g.expended / g.totalAward
      return days < 365 && pctExpended < 0.5 && g.status !== 'Completed'
    }).length
    return { totalAward, totalObligated, totalExpended, atRisk, pctExpended: totalExpended / totalAward * 100 }
  }, [])

  const byAct = useMemo(() => {
    const agg: Record<string, number> = {}
    GRANTS.forEach(g => { agg[g.act] = (agg[g.act] || 0) + g.totalAward })
    return Object.entries(agg).map(([act, value]) => ({ act, value }))
  }, [])

  const byCategory = useMemo(() => {
    const agg: Record<string, number> = {}
    GRANTS.forEach(g => { agg[g.category] = (agg[g.category] || 0) + g.totalAward })
    return Object.entries(agg).sort(([,a],[,b]) => b - a).map(([name, value]) => ({ name, value: Math.round(value / 1e6) }))
  }, [])

  const spendPace = useMemo(() => {
    return GRANTS.filter(g => g.status !== 'Completed').map(g => {
      const days = Math.round((new Date(g.deadline).getTime() - Date.now()) / 86400000)
      const pct = g.expended / g.totalAward * 100
      const onPace = days > 0 ? (pct + (100 - pct) * (365 / Math.max(days, 1)) >= 80) : pct >= 90
      return { name: g.name.slice(0, 30) + '…', pct: Math.round(pct), days, onPace }
    }).sort((a, b) => a.pct - b.pct).slice(0, 8)
  }, [])

  const daysUntil = (d: string) => Math.round((new Date(d).getTime() - Date.now()) / 86400000)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Federal Grants Tracker</h1>
        <p className="text-slate-500 text-sm mt-1">ARPA · IIJA · IRA · ESSER — $3.5B+ in federal awards to Connecticut agencies · obligation and expenditure tracking</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Federal Awards" value={fmt$(summary.totalAward)} subtitle={`${GRANTS.length} active grants`} icon="🏛" color="blue" />
        <KPICard title="Total Obligated" value={fmt$(summary.totalObligated)} subtitle={`${(summary.totalObligated / summary.totalAward * 100).toFixed(0)}% of awards`} icon="📝" color="purple" />
        <KPICard title="Total Expended" value={fmt$(summary.totalExpended)} subtitle={`${summary.pctExpended.toFixed(0)}% drawn down`} icon="💸" color="green" />
        <KPICard title="At-Risk Grants" value={summary.atRisk} subtitle="<50% expended, <1yr deadline" icon="⚠️" color={summary.atRisk > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Act */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Awards by Federal Legislation" description="Total grant dollars by program source" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byAct} dataKey="value" nameKey="act" innerRadius={55} outerRadius={90} paddingAngle={3}
                label={({ act, percent }) => `${act} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {byAct.map((d, i) => <Cell key={i} fill={ACT_COLORS[d.act as Act] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt$(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By category */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Awards by Program Category" description="Top categories by total funding ($M)" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
              <Tooltip formatter={(v: number) => [`$${v}M`, 'Total Award']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#003087" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenditure pace */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Expenditure Pace — Active Grants" description="% expended for grants with upcoming deadlines (lowest first)" />
        <div className="space-y-2">
          {spendPace.map(g => (
            <div key={g.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-64 truncate flex-shrink-0">{g.name}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 relative">
                <div className="h-3 rounded-full transition-all" style={{ width: `${g.pct}%`, background: g.pct >= 75 ? '#22c55e' : g.pct >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span className="text-xs font-bold w-10 text-right" style={{ color: g.pct >= 75 ? '#22c55e' : g.pct >= 50 ? '#f59e0b' : '#ef4444' }}>{g.pct}%</span>
              <span className={`text-xs w-20 text-right ${g.days < 180 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {g.days < 0 ? 'OVERDUE' : `${g.days}d left`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + sort */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-2 flex-wrap items-center text-xs">
        <span className="font-semibold text-slate-500">Filter by Act:</span>
        {(['All', 'ARPA', 'IIJA', 'IRA', 'ESSER'] as const).map(a => (
          <button key={a} onClick={() => setFilterAct(a)}
            className={`px-2 py-1 rounded-lg font-semibold transition border ${filterAct === a ? 'text-white border-transparent' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            style={filterAct === a ? { background: a === 'All' ? '#003087' : ACT_COLORS[a] } : {}}>
            {a}
          </button>
        ))}
        <span className="ml-auto text-slate-500">Sort:</span>
        {([['award', 'By Award'], ['pct', 'By % Spent'], ['deadline', 'By Deadline']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setSortBy(k)}
            className={`px-2 py-1 rounded-lg font-semibold transition border ${sortBy === k ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grant table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Grant Name</th>
                <th className="text-left px-3 py-2">Agency</th>
                <th className="text-left px-3 py-2">Act</th>
                <th className="text-right px-3 py-2">Award</th>
                <th className="text-right px-3 py-2">Expended</th>
                <th className="text-right px-3 py-2">% Spent</th>
                <th className="text-right px-3 py-2">Deadline</th>
                <th className="text-center px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(g => {
                const pct = g.totalAward > 0 ? g.expended / g.totalAward * 100 : 0
                const days = daysUntil(g.deadline)
                const atRisk = days < 365 && pct < 50 && g.status !== 'Completed'
                return (
                  <tr key={g.id} className={`hover:bg-slate-50 transition ${atRisk ? 'bg-red-50/30' : ''}`}>
                    <td className="px-3 py-2 font-medium text-slate-700 max-w-xs">
                      <span>{g.name}</span>
                      {g.pmNote && <p className="text-xs text-amber-600 mt-0.5">{g.pmNote}</p>}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{g.agency}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: ACT_COLORS[g.act] }}>{g.act}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">{fmt$(g.totalAward)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{fmt$(g.expended)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ color: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} className="font-bold">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${days < 0 ? 'text-red-600' : days < 180 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {g.deadline}{days < 180 && days >= 0 && <span className="block text-xs font-bold">{days}d</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: STATUS_COLORS[g.status] }}>{g.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-xs">
                <td colSpan={3} className="px-3 py-2 text-slate-700">Totals ({filtered.length} grants)</td>
                <td className="px-3 py-2 text-right text-slate-800">{fmt$(filtered.reduce((s, g) => s + g.totalAward, 0))}</td>
                <td className="px-3 py-2 text-right text-slate-800">{fmt$(filtered.reduce((s, g) => s + g.expended, 0))}</td>
                <td className="px-3 py-2 text-right text-slate-600">
                  {(filtered.reduce((s, g) => s + g.expended, 0) / filtered.reduce((s, g) => s + g.totalAward, 0) * 100).toFixed(0)}%
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
