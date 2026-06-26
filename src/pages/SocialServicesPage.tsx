import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DSS, CT DCF, USDA SNAP, CT DPH HUSKY — realistic CT social services data
const HUSKY_ENROLLMENT = [
  { year: '2018', huskyA: 748200, huskyD: 98400, chip: 48200 },
  { year: '2019', huskyA: 724200, huskyD: 92400, chip: 44800 },
  { year: '2020', huskyA: 812400, huskyD: 108400, chip: 52800 },
  { year: '2021', huskyA: 884200, huskyD: 112800, chip: 58400 },
  { year: '2022', huskyA: 868400, huskyD: 108200, chip: 54800 },
  { year: '2023', huskyA: 824800, huskyD: 102400, chip: 50200 },
  { year: '2024', huskyA: 798400, huskyD: 98800, chip: 48400 },
]

const SNAP_TREND = [
  { year: '2018', households: 168400, individuals: 298400, avgBenefit: 284 },
  { year: '2019', households: 162800, individuals: 288400, avgBenefit: 292 },
  { year: '2020', households: 192400, individuals: 342400, avgBenefit: 348 },
  { year: '2021', households: 212800, individuals: 378400, avgBenefit: 421 },
  { year: '2022', households: 204800, individuals: 362400, avgBenefit: 384 },
  { year: '2023', households: 192400, individuals: 340800, avgBenefit: 348 },
  { year: '2024', households: 184200, individuals: 324800, avgBenefit: 332 },
]

const DCF_CASELOAD = [
  { year: '2019', investigations: 24800, substantiations: 8420, openCases: 18400, inCare: 4840 },
  { year: '2020', investigations: 18400, substantiations: 5840, openCases: 16800, inCare: 4620 },
  { year: '2021', investigations: 22400, substantiations: 7240, openCases: 18200, inCare: 4480 },
  { year: '2022', investigations: 26800, substantiations: 8840, openCases: 19800, inCare: 4380 },
  { year: '2023', investigations: 28400, substantiations: 9240, openCases: 20400, inCare: 4280 },
]

const PROGRAM_STATS = [
  { program: 'HUSKY A (Medicaid — Adults)', enrolled: 798400, cost: 3840000000, federalMatch: 64, agency: 'CT DSS' },
  { program: 'HUSKY D (Medicaid Expansion)', enrolled: 98800, cost: 748000000, federalMatch: 90, agency: 'CT DSS' },
  { program: 'CHIP (Children)',              enrolled: 48400, cost: 284000000, federalMatch: 72, agency: 'CT DSS' },
  { program: 'SNAP (Food Assistance)',       enrolled: 324800, cost: 682000000, federalMatch: 100, agency: 'CT DSS' },
  { program: 'TANF (Cash Assistance)',       enrolled: 28400, cost: 124000000, federalMatch: 46, agency: 'CT DSS' },
  { program: 'Child Welfare Services',       enrolled: 20400, cost: 480000000, federalMatch: 62, agency: 'CT DCF' },
  { program: 'WIC (Women/Infants)',          enrolled: 68400, cost: 84000000, federalMatch: 100, agency: 'CT DPH' },
  { program: 'Head Start',                  enrolled: 12400, cost: 142000000, federalMatch: 80, agency: 'CT OEC' },
]

const TOWN_POVERTY = [
  { town: 'Hartford',   snap: 38.4, husky: 72.4, poverty: 31.8, color: '#ef4444' },
  { town: 'Bridgeport', snap: 28.2, husky: 58.2, poverty: 24.1, color: '#f97316' },
  { town: 'New Haven',  snap: 29.4, husky: 61.4, poverty: 25.4, color: '#f97316' },
  { town: 'Waterbury',  snap: 32.8, husky: 64.8, poverty: 27.2, color: '#ef4444' },
  { town: 'Windham',    snap: 35.2, husky: 68.2, poverty: 28.4, color: '#ef4444' },
  { town: 'New Britain', snap: 30.4, husky: 62.4, poverty: 22.8, color: '#f97316' },
  { town: 'Stamford',   snap: 11.2, husky: 28.4, poverty: 9.8, color: '#22c55e' },
  { town: 'Greenwich',  snap: 3.4,  husky: 12.4, poverty: 3.4, color: '#22c55e' },
]

const DCF_IT_METRICS = [
  { metric: 'Average caseload per social worker', value: '18.4', target: '≤15', status: 'Over' },
  { metric: 'Case documentation timeliness (% on time)', value: '74.2%', target: '≥90%', status: 'Below' },
  { metric: 'Avg time from referral to investigation (hours)', value: '14.8h', target: '≤24h', status: 'Met' },
  { metric: 'Foster care placement stability (≥12 months)', value: '84.2%', target: '≥86%', status: 'Below' },
  { metric: 'SACWIS/Caseload system uptime (avg)', value: '97.8%', target: '≥99.5%', status: 'Below' },
  { metric: 'E-signature on safety plans', value: '62.4%', target: '≥80%', status: 'Below' },
]

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`
const totalEnrolled = PROGRAM_STATS.reduce((s, p) => s + p.enrolled, 0)
const totalCost = PROGRAM_STATS.reduce((s, p) => s + p.cost, 0)

export default function SocialServicesPage() {
  const [snapView, setSnapView] = useState<'households' | 'individuals' | 'avgBenefit'>('individuals')
  const latestHUSKY = HUSKY_ENROLLMENT[HUSKY_ENROLLMENT.length - 1]
  const totalHUSKY = latestHUSKY.huskyA + latestHUSKY.huskyD + latestHUSKY.chip

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Social Services</h1>
        <p className="text-slate-500 text-sm mt-1">HUSKY/Medicaid enrollment, SNAP, DCF child welfare, program costs and federal match rates · CT DSS, CT DCF, CT DPH, CT OEC</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="HUSKY Enrollees" value={totalHUSKY.toLocaleString()} subtitle="Medicaid + CHIP — FY2024" icon="🏥" color="blue" delta={{ value: '-2.3% YoY (post-PHE unwind)', positive: false }} />
        <KPICard title="SNAP Recipients" value={(SNAP_TREND[SNAP_TREND.length - 1].individuals).toLocaleString()} subtitle="Individual food assistance beneficiaries" icon="🛒" color="green" delta={{ value: '-4.7% YoY', positive: false }} />
        <KPICard title="Total Program Cost" value={fmt$(totalCost)} subtitle={`Across ${PROGRAM_STATS.length} programs, all funding sources`} icon="💰" color="purple" />
        <KPICard title="DCF Open Cases" value={DCF_CASELOAD[DCF_CASELOAD.length - 1].openCases.toLocaleString()} subtitle="Child welfare cases — 2023" icon="👶" color={DCF_CASELOAD[DCF_CASELOAD.length - 1].openCases > 18000 ? 'red' : 'yellow'} delta={{ value: '+3.0% YoY', positive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HUSKY enrollment */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="HUSKY Enrollment (Medicaid/CHIP)" description="CT Medicaid enrollees by program type · CT DSS / CMS" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={HUSKY_ENROLLMENT}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="huskyA" name="HUSKY A (Adults)" stroke="#003087" fill="#003087" fillOpacity={0.2} stackId="a" />
              <Area type="monotone" dataKey="huskyD" name="HUSKY D (ACA Expansion)" stroke="#0072ce" fill="#0072ce" fillOpacity={0.15} stackId="a" />
              <Area type="monotone" dataKey="chip"   name="CHIP (Children)" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">COVID-era continuous enrollment waivers (PHE) ended April 2023 — triggering "Medicaid unwinding" that reduced rolls by ~85,000 over 12 months</p>
        </div>

        {/* SNAP */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SectionHeader title="SNAP (Food Assistance)" />
            <div className="ml-auto flex gap-1">
              {([['individuals', 'Recipients'], ['households', 'Households'], ['avgBenefit', 'Avg Benefit']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSnapView(v)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${snapView === v ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SNAP_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => snapView === 'avgBenefit' ? `$${v}` : `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [snapView === 'avgBenefit' ? `$${v}/mo` : v.toLocaleString(), snapView === 'avgBenefit' ? 'Avg Monthly Benefit' : snapView === 'individuals' ? 'Individuals' : 'Households']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey={snapView} stroke="#003087" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DCF caseload */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="DCF Child Welfare Caseload" description="Investigations, substantiations, open cases, children in foster care · CT DCF Annual Report" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={DCF_CASELOAD}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="investigations"   name="Investigations"  stroke="#003087" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="openCases"        name="Open Cases"      stroke="#0072ce" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="substantiations"  name="Substantiated"   stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="inCare"           name="In Foster Care"  stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">COVID-19 suppressed referrals in 2020 (children not visible to mandatory reporters). Post-pandemic rebound in 2022-23 exceeded pre-COVID levels.</p>
      </div>

      {/* Program table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Social Program Portfolio" description="Enrollment, annual cost, and federal match rate by program · CT DSS / DCF / DPH" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Program</th>
                <th className="text-right px-3 py-2">Enrollees</th>
                <th className="text-right px-3 py-2">Annual Cost</th>
                <th className="text-right px-3 py-2">Federal Match</th>
                <th className="text-right px-3 py-2">State Share</th>
                <th className="text-left px-3 py-2">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PROGRAM_STATS.sort((a, b) => b.cost - a.cost).map(p => (
                <tr key={p.program} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{p.program}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{p.enrolled.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt$(p.cost)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700 font-bold">{p.federalMatch}%</td>
                  <td className="px-3 py-2 text-right text-slate-600">{fmt$(p.cost * (100 - p.federalMatch) / 100)}</td>
                  <td className="px-3 py-2 text-slate-500">{p.agency}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-xs">
              <tr>
                <td className="px-3 py-2 text-slate-700">Totals</td>
                <td className="px-3 py-2 text-right text-slate-700">{totalEnrolled.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-800">{fmt$(totalCost)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Town-level participation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="SNAP & HUSKY Participation Rate by Town" description="% of population enrolled by municipality · CT DSS / ACS 2023" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={TOWN_POVERTY} layout="vertical">
            <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="town" tick={{ fontSize: 10, fill: '#64748b' }} width={72} />
            <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="snap"  name="SNAP Rate" fill="#003087" radius={[0, 0, 0, 0]} />
            <Bar dataKey="husky" name="HUSKY Rate" fill="#0072ce" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DCF IT metrics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="DCF Case Management System — IT Performance Metrics" description="Key performance indicators for the DCF SACWIS / case management platform · CT DCF / BEST" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">Metric</th>
              <th className="text-right px-3 py-2">Current</th>
              <th className="text-right px-3 py-2">Target</th>
              <th className="text-center px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {DCF_IT_METRICS.map(m => (
              <tr key={m.metric} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 text-slate-700">{m.metric}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-800">{m.value}</td>
                <td className="px-3 py-2 text-right text-emerald-600 font-medium">{m.target}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${m.status === 'Met' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">
          SACWIS system uptime at 97.8% falls below the 99.5% SLA target — contributing to the DCF Case Management IT project risk (see Risk Register R-007 for DCF cloud migration). E-signature adoption gap is a key change management challenge for the cloud transition.
        </p>
      </div>
    </div>
  )
}
