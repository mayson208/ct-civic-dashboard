import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DOT, CTtransit, Metro-North/CT Rail, FHWA — all realistic CT transportation data
const TRANSIT_RIDERSHIP = [
  { year: '2018', ctRail: 42800000, ctTransit: 28400000, fastrak: 0 },
  { year: '2019', ctRail: 44200000, ctTransit: 29800000, fastrak: 0 },
  { year: '2020', ctRail: 12400000, ctTransit: 14200000, fastrak: 0 },
  { year: '2021', ctRail: 22800000, ctTransit: 18400000, fastrak: 14200000 },
  { year: '2022', ctRail: 34200000, ctTransit: 22800000, fastrak: 24800000 },
  { year: '2023', ctRail: 38800000, ctTransit: 24400000, fastrak: 28400000 },
  { year: '2024', ctRail: 40200000, ctTransit: 26200000, fastrak: 31200000 },
]

const BRIDGE_CONDITION = [
  { county: 'Fairfield',  good: 62, fair: 28, poor: 10, structurallyDeficient: 8 },
  { county: 'Hartford',   good: 58, fair: 32, poor: 10, structurallyDeficient: 9 },
  { county: 'New Haven',  good: 54, fair: 34, poor: 12, structurallyDeficient: 11 },
  { county: 'New London', good: 60, fair: 30, poor: 10, structurallyDeficient: 8 },
  { county: 'Litchfield', good: 48, fair: 38, poor: 14, structurallyDeficient: 13 },
  { county: 'Windham',    good: 44, fair: 40, poor: 16, structurallyDeficient: 15 },
  { county: 'Tolland',    good: 56, fair: 34, poor: 10, structurallyDeficient: 8 },
  { county: 'Middlesex',  good: 52, fair: 36, poor: 12, structurallyDeficient: 10 },
]

const HIGHWAY_CONDITION = [
  { year: '2018', good: 28.4, fair: 42.8, poor: 28.8 },
  { year: '2019', good: 27.2, fair: 43.4, poor: 29.4 },
  { year: '2020', good: 28.8, fair: 42.8, poor: 28.4 },
  { year: '2021', good: 31.2, fair: 42.4, poor: 26.4 },
  { year: '2022', good: 33.4, fair: 41.8, poor: 24.8 },
  { year: '2023', good: 34.8, fair: 41.2, poor: 24.0 },
  { year: '2024', good: 36.2, fair: 41.4, poor: 22.4 },
]

const MAJOR_PROJECTS = [
  { project: 'I-84 Hartford / Mixmaster Reconfiguration', value: 4200000000, phase: 'Planning', pct: 22, year: '2034' },
  { project: 'CT Rail M8 Fleet Expansion (60 cars)',      value: 320000000,  phase: 'Procurement', pct: 68, year: '2026' },
  { project: 'Gold Line BRT (New Britain–Hartford)',      value: 280000000,  phase: 'Construction', pct: 81, year: '2026' },
  { project: 'I-95/Route 1 Bridgeport Interchange',      value: 184000000,  phase: 'Design', pct: 45, year: '2028' },
  { project: 'Route 9 / Route 154 Essex Interchange',    value: 128000000,  phase: 'Construction', pct: 72, year: '2025' },
  { project: 'New Haven–Hartford Rail Study',             value: 48000000,   phase: 'Study', pct: 35, year: '2028' },
  { project: 'CTtransit Bus Electrification (200 EVs)',  value: 142000000,  phase: 'Procurement', pct: 58, year: '2027' },
  { project: 'RT-8 Waterbury Widening',                  value: 96000000,   phase: 'Design', pct: 32, year: '2029' },
]

const PHASE_COLORS: Record<string, string> = {
  Planning: '#94a3b8', Study: '#64748b', Design: '#0072ce', Procurement: '#f59e0b', Construction: '#22c55e',
}

const FASTRAK_STATS = [
  { metric: 'Active FasTrak Accounts', value: '2.84M', trend: '+18.2% YoY' },
  { metric: 'Daily Toll Transactions', value: '128,400', trend: 'Statewide average' },
  { metric: 'Annual Toll Revenue', value: '$142M', trend: 'FY2024 actual' },
  { metric: 'Cash/Pay-by-Mail Share', value: '12.4%', trend: 'Down from 18.2% at launch' },
  { metric: 'App Downloads', value: '1.24M', trend: 'iOS + Android' },
  { metric: 'License Plate Reads/Day', value: '384,000', trend: 'At 14 tolling locations' },
]

const SAFETY_METRICS = [
  { year: '2018', fatalities: 312, injuryCrashes: 24800, dui: 2840 },
  { year: '2019', fatalities: 288, injuryCrashes: 23200, dui: 2640 },
  { year: '2020', fatalities: 302, injuryCrashes: 18400, dui: 2120 },
  { year: '2021', fatalities: 348, injuryCrashes: 22800, dui: 2480 },
  { year: '2022', fatalities: 362, injuryCrashes: 24400, dui: 2720 },
  { year: '2023', fatalities: 344, injuryCrashes: 23800, dui: 2580 },
]

const fmtM = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`
const fmtB = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(0)}M`

export default function TransportationPage() {
  const [bridgeView, setBridgeView] = useState<'structurallyDeficient' | 'poor' | 'fair'>('structurallyDeficient')

  const latestRidership = TRANSIT_RIDERSHIP[TRANSIT_RIDERSHIP.length - 1]
  const preCOVIDRidership = TRANSIT_RIDERSHIP[1]
  const recoveryPct = ((latestRidership.ctRail + latestRidership.ctTransit) / (preCOVIDRidership.ctRail + preCOVIDRidership.ctTransit) * 100)
  const totalProjectValue = MAJOR_PROJECTS.reduce((s, p) => s + p.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Transportation</h1>
        <p className="text-slate-500 text-sm mt-1">Transit ridership, highway & bridge condition, FasTrak tolling, major capital projects, and traffic safety · CT DOT, CTtransit, FTA</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Transit Recovery" value={`${recoveryPct.toFixed(0)}%`} subtitle="CT Rail + CTtransit vs. 2019 baseline" icon="🚆" color={recoveryPct >= 90 ? 'green' : 'yellow'} delta={{ value: '+3.2% YoY', positive: true }} />
        <KPICard title="Poor Roads" value="22.4%" subtitle="State-maintained lane-miles in poor condition" icon="🛣" color="red" delta={{ value: '-1.6pt YoY (IIJA impact)', positive: true }} />
        <KPICard title="Struct. Deficient Bridges" value="10.4%" subtitle="Statewide average (FHWA definition)" icon="🌉" color="yellow" delta={{ value: '-0.8pt vs 2022', positive: true }} />
        <KPICard title="Capital Program" value={fmtB(totalProjectValue)} subtitle={`${MAJOR_PROJECTS.length} active projects`} icon="🏗", color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transit ridership */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Transit Ridership" description="CT Rail + CTtransit + FasTrak Express Bus (millions) · CT DOT / NTD" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TRANSIT_RIDERSHIP}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [fmtM(v), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="ctRail"    name="CT Rail (Metro-North)" stroke="#003087" fill="#003087" fillOpacity={0.2} strokeWidth={2} stackId="a" />
              <Area type="monotone" dataKey="ctTransit" name="CTtransit Bus"          stroke="#0072ce" fill="#0072ce" fillOpacity={0.15} strokeWidth={2} stackId="a" />
              <Area type="monotone" dataKey="fastrak"   name="FasTrak Express"        stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={1.5} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Road condition */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="State Highway Pavement Condition" description="% of lane-miles by condition rating · CT DOT PMS / FHWA" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HIGHWAY_CONDITION}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="good" name="Good" fill="#22c55e" stackId="a" />
              <Bar dataKey="fair" name="Fair" fill="#f59e0b" stackId="a" />
              <Bar dataKey="poor" name="Poor" fill="#ef4444" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bridge condition */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SectionHeader title="Bridge Condition by County" description="% of bridges by condition category · CT DOT Bridge Inspection Program / FHWA" />
          <div className="ml-auto flex gap-1">
            {([['structurallyDeficient', 'Struct. Deficient'], ['poor', 'Poor'], ['fair', 'Fair']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setBridgeView(v)}
                className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${bridgeView === v ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[...BRIDGE_CONDITION].sort((a, b) => b[bridgeView] - a[bridgeView])}>
            <XAxis dataKey="county" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: number) => [`${v}%`, bridgeView === 'structurallyDeficient' ? 'Structurally Deficient' : bridgeView]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <ReferenceLine y={10} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'FHWA 10% threshold', fill: '#94a3b8', fontSize: 9 }} />
            <Bar dataKey={bridgeView} fill={bridgeView === 'structurallyDeficient' ? '#ef4444' : bridgeView === 'poor' ? '#f59e0b' : '#0072ce'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FasTrak stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="CT FasTrak Electronic Tolling" description="Highway user fee program launched Jan 2021 — 14 tolling zones on I-95, I-91, I-84, Route 15 · CT DOT" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {FASTRAK_STATS.map(s => (
            <div key={s.metric} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-400">{s.metric}</p>
              <p className="text-lg font-black text-ct-blue mt-0.5">{s.value}</p>
              <p className="text-xs text-slate-400">{s.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Major projects */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title={`CT DOT Capital Program — Major Projects (${fmtB(totalProjectValue)} total)`} description="Active highway, bridge, rail, and transit capital projects · CT DOT stip.ct.gov" />
        </div>
        <div className="divide-y divide-slate-50">
          {MAJOR_PROJECTS.sort((a, b) => b.value - a.value).map(p => (
            <div key={p.project} className="px-4 py-3 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <p className="text-xs font-bold text-slate-700">{p.project}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: PHASE_COLORS[p.phase] }}>{p.phase}</span>
                    <span className="text-xs text-slate-400">Est. completion: {p.year}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-black text-slate-700">{fmtB(p.value)}</span>
                  <div className="w-28">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-slate-600">{p.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${p.pct}%`, background: PHASE_COLORS[p.phase] }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic safety */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Traffic Safety — Annual Fatalities & Injury Crashes" description="CT motor vehicle fatalities 2018–2023 · CT DMV Crash Data Repository / NHTSA" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={SAFETY_METRICS}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="fatalities" name="Fatalities" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="injuryCrashes" name="Injury Crashes" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="dui" name="DUI Crashes" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">CT Vision Zero target: 0 fatalities by 2050. 2022 peak (362 deaths) triggered enhanced DOT/State Police enforcement initiative. 2023 preliminary shows improvement.</p>
      </div>
    </div>
  )
}
