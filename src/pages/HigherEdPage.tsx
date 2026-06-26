import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CSCU, UConn IREP, NCES IPEDS, CT OHE — realistic CT higher ed data
const ENROLLMENT_TREND = [
  { year: '2018', uconn: 32800, cscu: 84200, private: 44800, total: 161800 },
  { year: '2019', uconn: 33200, cscu: 82400, private: 43800, total: 159400 },
  { year: '2020', uconn: 32400, cscu: 78400, private: 41800, total: 152600 },
  { year: '2021', uconn: 31400, cscu: 74200, private: 40400, total: 146000 },
  { year: '2022', uconn: 31800, cscu: 76200, private: 40800, total: 148800 },
  { year: '2023', uconn: 32400, cscu: 78400, private: 41200, total: 152000 },
  { year: '2024', uconn: 33200, cscu: 79800, private: 41800, total: 154800 },
]

const INSTITUTIONS = [
  { name: 'University of Connecticut (UConn)', type: 'Public Research', enrollment: 33200, gradRate: 84, tuition: 17082, research: 562000000, rank: 'AAU Aspirant' },
  { name: 'Southern CT State University',    type: 'CSCU — 4yr', enrollment: 10200, gradRate: 48, tuition: 6572, research: 12400000, rank: '#2 CSCU' },
  { name: 'Central CT State University',      type: 'CSCU — 4yr', enrollment: 11400, gradRate: 51, tuition: 6572, research: 8400000, rank: '#1 CSCU (enrollment)' },
  { name: 'Eastern CT State University',      type: 'CSCU — 4yr', enrollment: 5400,  gradRate: 52, tuition: 6572, research: 4200000, rank: '#4 CSCU' },
  { name: 'Western CT State University',      type: 'CSCU — 4yr', enrollment: 5800,  gradRate: 46, tuition: 6572, research: 3800000, rank: '#3 CSCU' },
  { name: 'Yale University',                  type: 'Private Research', enrollment: 14800, gradRate: 97, tuition: 62250, research: 1280000000, rank: '#3 National (USNWR)' },
  { name: 'Quinnipiac University',            type: 'Private', enrollment: 10200,  gradRate: 79, tuition: 48400, research: 24000000, rank: '#5 North (USNWR Reg)' },
  { name: 'Fairfield University',             type: 'Private', enrollment: 6400, gradRate: 82, tuition: 52400, research: 12000000, rank: 'Tier 1 Regional' },
  { name: 'Charter Oak State College',        type: 'CSCU — Online', enrollment: 2400, gradRate: 28, tuition: 4992, research: 0, rank: 'Prior Learning Focus' },
  { name: 'Gateway CC / Housatonic CC (avg)', type: 'CSCU — 2yr', enrollment: 5800, gradRate: 18, tuition: 4392, research: 0, rank: 'Open Access' },
]

const COMPLETION_BY_RACE = [
  { race: 'White',    ct6yr: 74.2, natl: 67.4 },
  { race: 'Asian',    ct6yr: 81.4, natl: 78.2 },
  { race: 'Hispanic', ct6yr: 48.4, natl: 52.8 },
  { race: 'Black',    ct6yr: 44.2, natl: 42.4 },
  { race: 'All CT',   ct6yr: 66.8, natl: 63.2 },
]

const RESEARCH_FUNDING = [
  { year: '2019', uconn: 498, yale: 1148, other: 42 },
  { year: '2020', uconn: 518, yale: 1198, other: 44 },
  { year: '2021', uconn: 534, yale: 1224, other: 46 },
  { year: '2022', uconn: 548, yale: 1254, other: 48 },
  { year: '2023', uconn: 562, yale: 1280, other: 52 },
]

const CSCU_IT_PROJECTS = [
  { project: 'Shared ERP (Banner 9 Upgrade)',       status: 'In Progress', pct: 64, vendor: 'Ellucian', value: 28400000 },
  { project: 'Identity & Access Management',         status: 'Complete',   pct: 100, vendor: 'Okta / Microsoft', value: 4200000 },
  { project: 'LMS Migration (Canvas → D2L)',         status: 'In Progress', pct: 82, vendor: 'D2L',       value: 3800000 },
  { project: 'CT State New Campus (Digital First)',  status: 'Planning',   pct: 18, vendor: 'TBD',        value: 18000000 },
  { project: 'Student Success Analytics Platform',   status: 'In Progress', pct: 45, vendor: 'Civitas',   value: 6400000 },
  { project: 'Shared IT Services Consolidation',     status: 'Planning',   pct: 12, vendor: 'Internal',   value: 8200000 },
]

const TUITION_COMPARE = [
  { state: 'CT (UConn)', inState: 17082, outState: 39082 },
  { state: 'MA (UMass)',  inState: 16953, outState: 38965 },
  { state: 'NY (SUNY)',   inState: 10080, outState: 26570 },
  { state: 'NH (UNH)',    inState: 20620, outState: 36990 },
  { state: 'RI (URI)',    inState: 15994, outState: 35704 },
  { state: 'VT (UVM)',    inState: 21490, outState: 45378 },
]

const STATUS_CFG: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Planning: 'bg-slate-100 text-slate-600',
}

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`

export default function HigherEdPage() {
  const [sortKey, setSortKey] = useState<'enrollment' | 'gradRate' | 'tuition'>('enrollment')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Higher Education</h1>
        <p className="text-slate-500 text-sm mt-1">CT enrollment trends, UConn & CSCU system, completion equity, research funding, tuition comparison, and CSCU IT modernization portfolio · NCES IPEDS / CT OHE</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Enrollment" value="154,800" subtitle="CT residents in higher ed — Fall 2024" icon="🎓" color="blue" delta={{ value: '+1.8% YoY recovery', positive: true }} />
        <KPICard title="UConn 6-yr Grad Rate" value="84%" subtitle="#1 public university in New England" icon="🏆" color="green" />
        <KPICard title="Yale + UConn Research" value="$1.84B" subtitle="Annual R&D expenditures FY2023" icon="🔬" color="purple" />
        <KPICard title="CSCU IT Portfolio" value={fmt$(CSCU_IT_PROJECTS.reduce((s, p) => s + p.value, 0))} subtitle={`${CSCU_IT_PROJECTS.length} active IT projects across system`} icon="💻" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Higher Ed Enrollment Trend" description="Headcount enrollment by sector · NCES IPEDS Fall 2018–2024" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ENROLLMENT_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="private" name="Private CT" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} stackId="a" />
              <Area type="monotone" dataKey="cscu"    name="CSCU System" stroke="#0072ce" fill="#0072ce" fillOpacity={0.2} stackId="a" />
              <Area type="monotone" dataKey="uconn"   name="UConn" stroke="#003087" fill="#003087" fillOpacity={0.2} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">COVID-19 drove a 9.4% enrollment decline 2019–2021, concentrated at CSCU community colleges (−15%). Recovery driven by workforce retraining demand and online program expansion.</p>
        </div>

        {/* Research funding */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="R&D Expenditures (Yale + UConn)" description="Annual research spending in $M · NSF Higher Education R&D Survey" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RESEARCH_FUNDING}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `$${v}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [`$${v}M`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="yale"  name="Yale University"     fill="#003087" stackId="a" />
              <Bar dataKey="uconn" name="UConn"               fill="#0072ce" stackId="a" />
              <Bar dataKey="other" name="Other CT Inst."      fill="#94a3b8" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Institution table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <SectionHeader title="CT Institutions of Higher Education" description="Selected institutions · NCES IPEDS 2023–24" />
          <div className="ml-auto flex gap-1">
            {([['enrollment', 'Enrollment'], ['gradRate', '6-yr Grad %'], ['tuition', 'In-State Tuition']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setSortKey(v)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sortKey === v ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Institution</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">Enrollment</th>
                <th className="text-right px-3 py-2">6-yr Grad</th>
                <th className="text-right px-3 py-2">In-State Tuition</th>
                <th className="text-right px-3 py-2">R&D (Annual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...INSTITUTIONS].sort((a, b) => b[sortKey] - a[sortKey]).map(inst => (
                <tr key={inst.name} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{inst.name}</td>
                  <td className="px-3 py-2 text-slate-500">{inst.type}</td>
                  <td className="px-3 py-2 text-right font-bold text-ct-blue">{inst.enrollment.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: inst.gradRate >= 70 ? '#22c55e' : inst.gradRate >= 50 ? '#f59e0b' : '#ef4444' }}>{inst.gradRate}%</td>
                  <td className="px-3 py-2 text-right text-slate-600">${inst.tuition.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{inst.research > 0 ? fmt$(inst.research) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Completion by race */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="6-Year Completion Rate by Race/Ethnicity" description="CT vs. national benchmark · NCES IPEDS 2023 cohort" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={COMPLETION_BY_RACE}>
              <XAxis dataKey="race" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[30, 90]} />
              <Tooltip formatter={(v: number) => [`${v}%`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={66.8} stroke="#003087" strokeDasharray="3 3" label={{ value: 'CT Avg', fill: '#003087', fontSize: 9 }} />
              <Bar dataKey="ct6yr" name="CT Rate" fill="#003087" radius={[3, 3, 0, 0]} />
              <Bar dataKey="natl"  name="National Rate" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">CT Hispanic 6-yr completion (48.4%) is 25.8 points below White (74.2%) — the largest racial equity gap in the CT higher ed system.</p>
        </div>

        {/* Tuition comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Flagship University In-State Tuition — New England" description="Annual undergraduate in-state tuition & fees · NCES 2023–24" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...TUITION_COMPARE].sort((a, b) => a.inState - b.inState)}>
              <XAxis dataKey="state" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="inState"  name="In-State" fill="#003087" radius={[3, 3, 0, 0]}>
                {TUITION_COMPARE.sort((a, b) => a.inState - b.inState).map((t, i) => (
                  <Cell key={i} fill={t.state === 'CT (UConn)' ? '#003087' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CSCU IT portfolio */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CSCU System IT Portfolio" description="Active IT modernization projects across the Connecticut State Colleges & Universities system · CSCU / CT DAS" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">Project</th>
              <th className="text-center px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Pct Complete</th>
              <th className="text-left px-3 py-2">Vendor</th>
              <th className="text-right px-3 py-2">Contract Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {CSCU_IT_PROJECTS.map(p => (
              <tr key={p.project} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-700">{p.project}</td>
                <td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${STATUS_CFG[p.status]}`}>{p.status}</span></td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-ct-blue" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="font-bold text-slate-600 w-8 text-right">{p.pct}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-500">{p.vendor}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{fmt$(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          The Banner 9 upgrade (Ellucian) is the highest-value CSCU project. CT State — the merger of 12 legacy community colleges into a single accredited institution — will require a separate Digital First campus IT architecture currently in planning phase.
        </p>
      </div>
    </div>
  )
}
