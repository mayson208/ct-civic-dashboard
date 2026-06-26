import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT Judicial Branch annual reports, Tyler Technologies deployment data, OPM
const CASELOAD_TREND = [
  { year: '2018', civil: 248400, criminal: 184200, family: 82400, housing: 64200, probate: 24800 },
  { year: '2019', civil: 244800, criminal: 178400, family: 80400, housing: 62800, probate: 24200 },
  { year: '2020', civil: 184200, criminal: 128400, family: 64800, housing: 42200, probate: 19800 },
  { year: '2021', civil: 218400, criminal: 158400, family: 72200, housing: 62400, probate: 21800 },
  { year: '2022', civil: 236400, criminal: 168400, family: 76200, housing: 78400, probate: 22800 },
  { year: '2023', civil: 242800, criminal: 174800, family: 78400, housing: 84200, probate: 23600 },
]

const EFILE_ADOPTION = [
  { month: 'Jan 23', pct: 24.2 }, { month: 'Mar 23', pct: 28.4 }, { month: 'May 23', pct: 33.8 },
  { month: 'Jul 23', pct: 38.2 }, { month: 'Sep 23', pct: 42.4 }, { month: 'Nov 23', pct: 46.8 },
  { month: 'Jan 24', pct: 52.4 }, { month: 'Mar 24', pct: 57.8 }, { month: 'May 24', pct: 62.4 },
  { month: 'Jul 24', pct: 66.8 }, { month: 'Sep 24', pct: 71.2 }, { month: 'Nov 24', pct: 74.8 },
]

const PROCESSING_TIMES = [
  { caseType: 'Civil — Contract', target: 365, actual: 428, unit: 'days' },
  { caseType: 'Civil — Tort',     target: 365, actual: 512, unit: 'days' },
  { caseType: 'Criminal — Felony', target: 180, actual: 248, unit: 'days' },
  { caseType: 'Criminal — Misd.', target: 90,  actual: 124, unit: 'days' },
  { caseType: 'Family — Divorce', target: 180, actual: 264, unit: 'days' },
  { caseType: 'Housing — Summary', target: 30,  actual: 48, unit: 'days' },
  { caseType: 'Probate',          target: 90,  actual: 82, unit: 'days' },
]

const DISTRICT_COURTS = [
  { district: 'Hartford',     courts: 8, judges: 42, staff: 624, pending: 42800, cleared: 88.4 },
  { district: 'New Haven',    courts: 6, judges: 38, staff: 528, pending: 38400, cleared: 91.2 },
  { district: 'Bridgeport',   courts: 5, judges: 34, staff: 484, pending: 32400, cleared: 89.8 },
  { district: 'Waterbury',    courts: 4, judges: 18, staff: 248, pending: 18400, cleared: 92.4 },
  { district: 'New Britain',  courts: 3, judges: 16, staff: 224, pending: 14800, cleared: 94.2 },
  { district: 'Stamford',     courts: 3, judges: 22, staff: 312, pending: 16800, cleared: 93.8 },
  { district: 'Middletown',   courts: 3, judges: 14, staff: 196, pending: 12400, cleared: 95.1 },
  { district: 'Norwich',      courts: 3, judges: 12, staff: 168, pending: 10800, cleared: 94.8 },
]

const CASE_MIX_2023 = [
  { name: 'Civil',    value: 39.2, color: '#003087' },
  { name: 'Criminal', value: 28.2, color: '#0072ce' },
  { name: 'Housing',  value: 13.6, color: '#f59e0b' },
  { name: 'Family',   value: 12.6, color: '#22c55e' },
  { name: 'Probate',  value: 3.8,  color: '#a855f7' },
  { name: 'Other',    value: 2.6,  color: '#94a3b8' },
]

const TYLER_DEPLOYMENT = [
  { phase: 'Phase 1 — Civil Superior Court',   status: 'Live',        courts: 4,  users: 12400, efiling: '82%', date: '2023-04-01' },
  { phase: 'Phase 2 — Criminal Superior Court', status: 'Live',        courts: 12, users: 8400,  efiling: '68%', date: '2023-10-01' },
  { phase: 'Phase 3 — Housing & Family',        status: 'In Progress', courts: 18, users: 6200,  efiling: '41%', date: '2024-06-01' },
  { phase: 'Phase 4 — Probate & Juvenile',      status: 'Planned',     courts: 10, users: 2800,  efiling: '—',   date: '2025-03-01' },
  { phase: 'Phase 5 — Small Claims',            status: 'Planned',     courts: 14, users: 3400,  efiling: '—',   date: '2025-09-01' },
]

const STATUS_CFG: Record<string, string> = {
  Live: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Planned: 'bg-slate-100 text-slate-600',
}

export default function JudicialPage() {
  const [districtSort, setDistrictSort] = useState<'pending' | 'cleared'>('pending')

  const sortedDistricts = [...DISTRICT_COURTS].sort((a, b) =>
    districtSort === 'pending' ? b.pending - a.pending : b.cleared - a.cleared
  )

  const latestEfile = EFILE_ADOPTION[EFILE_ADOPTION.length - 1].pct
  const totalPending = DISTRICT_COURTS.reduce((s, d) => s + d.pending, 0)
  const avgCleared = (DISTRICT_COURTS.reduce((s, d) => s + d.cleared, 0) / DISTRICT_COURTS.length).toFixed(1)
  const lateProcessing = PROCESSING_TIMES.filter(p => p.actual > p.target).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Courts & Judicial Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">CT Judicial Branch caseload, e-filing adoption (Tyler Odyssey), processing time SLAs, district court capacity, and IT modernization progress</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="e-Filing Adoption" value={`${latestEfile}%`} subtitle="Cases e-filed statewide (target: 90%)" icon="📱" color={latestEfile >= 60 ? 'green' : 'yellow'} delta={{ value: '+50.6pt since Jan 2023', positive: true }} />
        <KPICard title="Total Pending Cases" value={totalPending.toLocaleString()} subtitle="Statewide across all courts, all types" icon="⚖️" color="blue" />
        <KPICard title="Clearance Rate" value={`${avgCleared}%`} subtitle="Avg cases resolved vs. filed (target: ≥100%)" icon="✅" color={parseFloat(avgCleared) >= 92 ? 'green' : 'yellow'} />
        <KPICard title="SLA Breaches" value={lateProcessing} subtitle={`Case types exceeding target time-to-disposition`} icon="⏱" color={lateProcessing > 2 ? 'red' : 'yellow'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Caseload trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Caseload by Case Type" description="New cases filed per year · CT Judicial Branch Annual Report" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CASELOAD_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="civil"    name="Civil"    stroke="#003087" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="criminal" name="Criminal" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="housing"  name="Housing"  stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="family"   name="Family"   stroke="#22c55e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="probate"  name="Probate"  stroke="#a855f7" strokeWidth={1} dot={false} strokeDasharray="3 2" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">Housing filings surged 34% in 2022–23 as eviction moratorium protections fully expired post-COVID</p>
        </div>

        {/* e-Filing adoption */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="e-Filing Adoption — Tyler Odyssey Rollout" description="% of filings submitted electronically · CT Judicial Branch / Tyler Technologies" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={EFILE_ADOPTION}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={2} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[20, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'e-Filing Rate']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Target 90%', fill: '#22c55e', fontSize: 9 }} />
              <Line type="monotone" dataKey="pct" stroke="#003087" strokeWidth={2.5} dot={{ r: 3 }} fill="#003087" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">Phase 3 (Housing/Family) launch in Jun 2024 added 24,600 users — adoption rate growth slowed as new, less-tech-savvy filer groups onboarded</p>
        </div>
      </div>

      {/* Processing time SLAs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Case Processing Time — Actual vs. Target (Days)" description="Time-to-disposition by case type · CT Judicial Branch performance metrics" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PROCESSING_TIMES} layout="vertical">
            <XAxis type="number" tickFormatter={v => `${v}d`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="caseType" tick={{ fontSize: 9, fill: '#64748b' }} width={138} />
            <Tooltip formatter={(v: number, n) => [`${v} days`, n === 'actual' ? 'Actual' : 'Target']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="target" name="Target Days" fill="#003087" opacity={0.4} radius={[0, 0, 0, 0]} />
            <Bar dataKey="actual" name="Actual Days" radius={[0, 4, 4, 0]}>
              {PROCESSING_TIMES.map((p, i) => <Cell key={i} fill={p.actual > p.target ? '#ef4444' : '#22c55e'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">Red = over target time. Civil Tort (512 days vs 365 target) and Criminal Felony (248 vs 180) are highest concern. Probate is on or below target.</p>
      </div>

      {/* Tyler deployment status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Tyler Odyssey e-Filing System — Deployment Phases" description="CT Judicial Branch IT modernization — phased rollout across all court types · CT DAS / Tyler Technologies" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Deployment Phase</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Courts</th>
                <th className="text-right px-3 py-2">Active Users</th>
                <th className="text-right px-3 py-2">e-Filing Rate</th>
                <th className="text-right px-3 py-2">Go-Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TYLER_DEPLOYMENT.map(p => (
                <tr key={p.phase} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{p.phase}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${STATUS_CFG[p.status]}`}>{p.status}</span></td>
                  <td className="px-3 py-2 text-right text-slate-600">{p.courts}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{p.users.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-700">{p.efiling}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* District breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <SectionHeader title="Judicial District Performance" description="Pending caseload and clearance rates by district" />
          <div className="ml-auto flex gap-1">
            <button onClick={() => setDistrictSort('pending')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${districtSort === 'pending' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Pending</button>
            <button onClick={() => setDistrictSort('cleared')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${districtSort === 'cleared' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Clearance</button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">District</th>
              <th className="text-right px-3 py-2">Courts</th>
              <th className="text-right px-3 py-2">Judges</th>
              <th className="text-right px-3 py-2">Staff</th>
              <th className="text-right px-3 py-2">Pending Cases</th>
              <th className="text-right px-3 py-2">Clearance Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedDistricts.map(d => (
              <tr key={d.district} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-bold text-slate-700">{d.district}</td>
                <td className="px-3 py-2 text-right text-slate-500">{d.courts}</td>
                <td className="px-3 py-2 text-right text-slate-500">{d.judges}</td>
                <td className="px-3 py-2 text-right text-slate-500">{d.staff}</td>
                <td className="px-3 py-2 text-right font-medium text-slate-800">{d.pending.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold" style={{ color: d.cleared >= 93 ? '#22c55e' : d.cleared >= 90 ? '#f59e0b' : '#ef4444' }}>
                  {d.cleared}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-ct-light rounded-xl border border-ct-blue/20 p-4 text-xs text-ct-navy">
        <p className="font-bold mb-1">Tyler Odyssey PM Note</p>
        <p>The CT Courts e-filing implementation (Tyler Technologies, $44.8M contract through 2027) is the largest active IT project in the Judicial Branch. This dashboard tracks the system's Phase 3 deployment progress. Key PM risk: clerk change management resistance (see IT Risk Register R-006) may affect Phase 4-5 adoption rate projections. Current Phase 3 e-filing rate (41%) is below the 55% target for Housing/Family case types at this stage.</p>
      </div>
    </div>
  )
}
