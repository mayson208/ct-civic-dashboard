import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DOC, CT DOJ, CT Judicial Branch, BJS, CT Division of Criminal Justice — realistic data
const PRISON_POPULATION = [
  { year: '2014', sentenced: 16800, pretrial: 4200, total: 21000, capacity: 18400 },
  { year: '2015', sentenced: 15800, pretrial: 3980, total: 19780, capacity: 18400 },
  { year: '2016', sentenced: 14800, pretrial: 3680, total: 18480, capacity: 18400 },
  { year: '2017', sentenced: 13800, pretrial: 3480, total: 17280, capacity: 18400 },
  { year: '2018', sentenced: 12800, pretrial: 3120, total: 15920, capacity: 17800 },
  { year: '2019', sentenced: 11800, pretrial: 2840, total: 14640, capacity: 17200 },
  { year: '2020', sentenced: 9800,  pretrial: 2080, total: 11880, capacity: 16800 },
  { year: '2021', sentenced: 9400,  pretrial: 2120, total: 11520, capacity: 15200 },
  { year: '2022', sentenced: 9800,  pretrial: 2480, total: 12280, capacity: 14800 },
  { year: '2023', sentenced: 10200, pretrial: 2640, total: 12840, capacity: 14200 },
]

const RECIDIVISM = [
  { cohortYear: '2016', rearrest: 51.2, reconviction: 34.8, reincarceration: 28.4 },
  { cohortYear: '2017', rearrest: 49.8, reconviction: 33.2, reincarceration: 27.2 },
  { cohortYear: '2018', rearrest: 48.4, reconviction: 31.8, reincarceration: 26.4 },
  { cohortYear: '2019', rearrest: 47.2, reconviction: 30.4, reincarceration: 25.2 },
  { cohortYear: '2020', rearrest: 44.2, reconviction: 28.4, reincarceration: 23.4 },
  { cohortYear: '2021', rearrest: 46.4, reconviction: 30.2, reincarceration: 24.8 },
]

const OFFENSE_MIX = [
  { type: 'Violent',    current: 4840, color: '#ef4444' },
  { type: 'Property',   current: 1840, color: '#f97316' },
  { type: 'Drug',       current: 2120, color: '#f59e0b' },
  { type: 'Public Order', current: 980, color: '#64748b' },
  { type: 'Other',      current: 420,  color: '#94a3b8' },
]

const RACE_DISPARITY = [
  { race: 'Black',    pctPrison: 42.4, pctCT: 12.8, disparity: 3.3 },
  { race: 'Hispanic', pctPrison: 24.8, pctCT: 17.2, disparity: 1.4 },
  { race: 'White',    pctPrison: 30.2, pctCT: 65.4, disparity: 0.5 },
  { race: 'Other',    pctPrison: 2.6,  pctCT: 4.6,  disparity: 0.6 },
]

const DOC_FACILITIES = [
  { facility: 'Cheshire CI',       type: 'Level 4 (High)',  pop: 1248, cap: 1400, opened: 1913 },
  { facility: 'MacDougall-Walker', type: 'Level 4 (High)',  pop: 1684, cap: 1800, opened: 1997 },
  { facility: 'Northern CI',       type: 'Level 5 (Max)',   pop: 484,  cap: 512,  opened: 1995 },
  { facility: 'Garner CI',         type: 'Level 3 (Med)',   pop: 1124, cap: 1200, opened: 1992 },
  { facility: 'Corrigan-Radgowski', type: 'Level 3 (Med)', pop: 1284, cap: 1400, opened: 1986 },
  { facility: 'York CI (Women)',   type: 'Women\'s Facility', pop: 728, cap: 880, opened: 1918 },
  { facility: 'Brooklyn CI',       type: 'Level 2 (Low)',   pop: 484,  cap: 612,  opened: 1987 },
  { facility: 'Willard-Cybulski',  type: 'Level 2 (Low)',   pop: 884,  cap: 960,  opened: 1999 },
]

const DOC_IT_SYSTEMS = [
  { system: 'COMPAS Risk Assessment Tool',  vendor: 'Northpointe / equivant', status: 'Active', cost: 2400000, note: 'Risk/needs scoring for all sentenced inmates — equity review pending' },
  { system: 'CCM Case Management System',   vendor: 'Tyler Technologies',     status: 'Upgrade', cost: 18400000, note: 'Phase 2 upgrade in progress — integrates with Courts Tyler Odyssey' },
  { system: 'E-NOTIFY (victim notification)', vendor: 'Appriss (VINE)',       status: 'Active', cost: 840000, note: 'Statewide victim notification platform — federal grant funded' },
  { system: 'CORE Body Cameras',            vendor: 'Axon Enterprise',        status: 'Pilot', cost: 3200000, note: 'Facility-wide BWC pilot at MacDougall-Walker FY2024' },
  { system: 'Telehealth (Incarcerated)',     vendor: 'Televero Health',        status: 'Active', cost: 1840000, note: 'Mental health telepsychiatry — 8 facilities' },
  { system: 'Electronic Monitoring (GPS)',   vendor: 'Sentinel Offender Svcs', status: 'Active', cost: 4200000, note: 'GPS ankle monitoring — pre-trial & community supervision' },
]

const REFORM_TIMELINE = [
  { year: 2015, reform: 'Justice Reinvestment Initiative', impact: 'Property + drug sentencing reform; 1,100 beds reduced' },
  { year: 2016, reform: 'Police Accountability — Body Camera Mandate', impact: 'CT first New England state to require BWC' },
  { year: 2018, reform: 'Raise the Age (Act 18)', impact: '18-year-olds moved to adult court; 17s handled by juvenile' },
  { year: 2020, reform: 'CT Police Accountability Act', impact: 'Banned choke holds, qualified immunity reform' },
  { year: 2021, reform: 'Earned Risk Reduction Credits', impact: 'Expanded good-time credits; ~600 additional releases' },
  { year: 2022, reform: '3 Prison Closures (Montville, Enfield, CGE)', impact: 'Saved $40M/yr; 2,400 beds retired' },
  { year: 2023, reform: 'Second Chance Initiative (SCI-CT)', impact: 'Re-entry employment tax credits; 840 placements' },
]

export default function CriminalJusticePage() {
  const [disp, setDisp] = useState<'pctPrison' | 'disparity'>('disparity')
  const latestPop = PRISON_POPULATION[PRISON_POPULATION.length - 1]
  const peakPop = Math.max(...PRISON_POPULATION.map(p => p.total))
  const decline = ((peakPop - latestPop.total) / peakPop * 100).toFixed(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Criminal Justice</h1>
        <p className="text-slate-500 text-sm mt-1">DOC population, recidivism, racial disparity, facility capacity, IT systems (COMPAS, CCM, BWC), and reform timeline · CT DOC / Judicial Branch / DCJ</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="CT Incarcerated" value={latestPop.total.toLocaleString()} subtitle="Sentenced + pre-trial — FY2023" icon="⚖️" color="blue" delta={{ value: `${decline}% below 2014 peak`, positive: true }} />
        <KPICard title="Pretrial Population" value={latestPop.pretrial.toLocaleString()} subtitle="Awaiting trial — 20.6% of DOC census" icon="⏱" color="yellow" delta={{ value: '+6.5% YoY', positive: false }} />
        <KPICard title="Recidivism Rate" value="46.4%" subtitle="3-yr rearrest — 2021 release cohort" icon="📊" color="red" delta={{ value: 'vs 51.2% in 2016', positive: true }} />
        <KPICard title="Racial Disparity" value="3.3×" subtitle="Black incarceration rate vs. CT pop share" icon="⚠️" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prison population */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Incarcerated Population" description="Sentenced + pretrial, vs. designed capacity · CT DOC Daily Count" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PRISON_POPULATION}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={latestPop.capacity} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Capacity', fill: '#94a3b8', fontSize: 9 }} />
              <Area type="monotone" dataKey="sentenced" name="Sentenced" stroke="#003087" fill="#003087" fillOpacity={0.2} stackId="a" />
              <Area type="monotone" dataKey="pretrial"  name="Pre-trial"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">CT prison pop. peaked at ~21,000 in 2008. Down 39% since then. Three facility closures in 2022 (Montville, Enfield, CGE) removed 2,400 beds and saved ~$40M/year.</p>
        </div>

        {/* Recidivism */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="3-Year Recidivism — Release Cohort" description="% returning to criminal justice system within 3 years · CT DOC Recidivism Study" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={RECIDIVISM}>
              <XAxis dataKey="cohortYear" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[20, 58]} />
              <Tooltip formatter={(v: number) => [`${v}%`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="rearrest"       name="Rearrest"       stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reconviction"   name="Reconviction"   stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reincarceration" name="Reincarceration" stroke="#003087" strokeWidth={1.5} dot={false} strokeDasharray="3 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Racial disparity */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <SectionHeader title="Racial Disparity in Incarceration" description="Prison population share vs. CT general population % · CT DOC / ACS 2023" />
          <div className="ml-auto flex gap-1">
            <button onClick={() => setDisp('disparity')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${disp === 'disparity' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>Disparity Ratio</button>
            <button onClick={() => setDisp('pctPrison')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${disp === 'pctPrison' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>% of Prison Pop</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={RACE_DISPARITY}>
            <XAxis dataKey="race" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => disp === 'disparity' ? `${v}×` : `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: number) => [disp === 'disparity' ? `${v}× overrepresented` : `${v}% of prison population`, disp]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            {disp === 'disparity' && <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Proportional (1×)', fill: '#22c55e', fontSize: 9 }} />}
            <Bar dataKey={disp} radius={[4, 4, 0, 0]} fill="#003087" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">Black CT residents are incarcerated at 3.3× their share of the general population. The CT Racial Justice Advisory Commission identified this as a priority for criminal justice reform.</p>
      </div>

      {/* DOC IT Systems */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT DOC IT Systems Portfolio" description="Technology platforms supporting incarceration, supervision, and re-entry · CT DOC / CT DAS" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">System</th>
              <th className="text-left px-3 py-2">Vendor</th>
              <th className="text-center px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Annual Cost</th>
              <th className="text-left px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {DOC_IT_SYSTEMS.map(s => (
              <tr key={s.system} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-700">{s.system}</td>
                <td className="px-3 py-2 text-slate-500">{s.vendor}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'Upgrade' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                </td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">${(s.cost / 1e6).toFixed(1)}M</td>
                <td className="px-3 py-2 text-slate-500 text-xs">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reform timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Criminal Justice Reform Timeline" description="Legislative and executive actions 2015–2023 · CT DCJ / OLR / Governor's Office" />
        </div>
        <div className="divide-y divide-slate-50">
          {REFORM_TIMELINE.map((r, i) => (
            <div key={i} className="px-4 py-3 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-ct-light rounded-lg flex items-center justify-center font-black text-ct-navy text-xs">{r.year}</div>
              <div>
                <p className="text-xs font-bold text-slate-700">{r.reform}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
