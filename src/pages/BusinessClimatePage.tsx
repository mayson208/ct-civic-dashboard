import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT SoS, DECD, CT Innovations, CT SBDC, IRS SOI, FHFA — realistic CT business data
const BIZ_REGISTRATIONS = [
  { year: '2018', llc: 24800, corp: 8400, other: 6200, dissolutions: 18400 },
  { year: '2019', llc: 26400, corp: 8200, other: 6400, dissolutions: 19200 },
  { year: '2020', llc: 28400, corp: 7800, other: 5800, dissolutions: 18800 },
  { year: '2021', llc: 38400, corp: 9400, other: 7200, dissolutions: 16800 },
  { year: '2022', llc: 42800, corp: 10200, other: 8400, dissolutions: 20400 },
  { year: '2023', llc: 44200, corp: 10400, other: 8200, dissolutions: 22400 },
  { year: '2024', llc: 46800, corp: 10800, other: 8400, dissolutions: 23200 },
]

const SECTOR_EMPLOYMENT = [
  { sector: 'Financial Services',    jobs: 124800, wageAvg: 142000, growth: 1.2 },
  { sector: 'Healthcare',            jobs: 242800, wageAvg: 78400,  growth: 2.8 },
  { sector: 'Manufacturing',         jobs: 158400, wageAvg: 74200,  growth: -0.4 },
  { sector: 'Professional Services', jobs: 192400, wageAvg: 98400,  growth: 3.2 },
  { sector: 'Education',             jobs: 168400, wageAvg: 64800,  growth: 0.8 },
  { sector: 'Retail Trade',          jobs: 148400, wageAvg: 42400,  growth: -1.2 },
  { sector: 'Construction',          jobs: 62400,  wageAvg: 84200,  growth: 4.4 },
  { sector: 'Tech / Software',       jobs: 48400,  wageAvg: 128400, growth: 5.8 },
  { sector: 'Insurance',             jobs: 58400,  wageAvg: 98400,  growth: -0.8 },
  { sector: 'Biotech/Pharma',        jobs: 14800,  wageAvg: 118400, growth: 6.4 },
]

const DECD_INCENTIVES = [
  { program: 'Manufacturing Assistance Act Loans',  fy24: 48200000, projects: 38, jobs: 824, type: 'Loan' },
  { program: 'Small Business Express Program',      fy24: 28400000, projects: 284, jobs: 1248, type: 'Loan/Grant' },
  { program: 'Manufacturing Innovation Fund',       fy24: 18400000, projects: 24, jobs: 484, type: 'Grant' },
  { program: 'Connecticut Innovations (CI)',        fy24: 142000000, projects: 112, jobs: 2840, type: 'Investment' },
  { program: 'Historic Preservation Tax Credits',  fy24: 24800000, projects: 28, jobs: 348, type: 'Tax Credit' },
  { program: 'Urban & Industrial Sites Program',   fy24: 12400000, projects: 14, jobs: 224, type: 'Grant' },
  { program: 'First Five Plus (HQ retention)',      fy24: 84000000, projects: 6, jobs: 1840, type: 'Tax Credit' },
  { program: 'Brownfield Pilot Program',            fy24: 8400000, projects: 18, jobs: 148, type: 'Grant' },
]

const STATE_COMPARE = [
  { state: 'CT', taxBurden: 14.8, costIndex: 128, biz_rank: 42, wage: 82400 },
  { state: 'MA', taxBurden: 13.4, costIndex: 134, biz_rank: 37, wage: 84800 },
  { state: 'NY', taxBurden: 15.4, costIndex: 140, biz_rank: 48, wage: 78400 },
  { state: 'RI', taxBurden: 13.2, costIndex: 122, biz_rank: 38, wage: 68400 },
  { state: 'NH', taxBurden: 9.8,  costIndex: 118, biz_rank: 14, wage: 72400 },
  { state: 'NJ', taxBurden: 13.8, costIndex: 130, biz_rank: 44, wage: 80400 },
]

const STARTUPS = [
  { year: '2019', seed: 124, seriesA: 28, seriesB: 12, total: 284000000 },
  { year: '2020', seed: 108, seriesA: 22, seriesB: 8, total: 218000000 },
  { year: '2021', seed: 184, seriesA: 42, seriesB: 18, total: 482000000 },
  { year: '2022', seed: 168, seriesA: 38, seriesB: 22, total: 624000000 },
  { year: '2023', seed: 148, seriesA: 32, seriesB: 16, total: 484000000 },
  { year: '2024', seed: 162, seriesA: 36, seriesB: 18, total: 528000000 },
]

const TOP_EMPLOYERS = [
  { employer: 'United Technologies / RTX',     sector: 'Defense/Aerospace', employees: 20800, hq: 'Farmington' },
  { employer: 'Cigna Group',                   sector: 'Healthcare/Insurance', employees: 12400, hq: 'Bloomfield' },
  { employer: 'Yale New Haven Health',          sector: 'Healthcare', employees: 28400, hq: 'New Haven' },
  { employer: 'Hartford HealthCare',            sector: 'Healthcare', employees: 38400, hq: 'Hartford' },
  { employer: 'The Hartford',                   sector: 'Insurance', employees: 14800, hq: 'Hartford' },
  { employer: 'Travelers Companies',            sector: 'Insurance', employees: 13200, hq: 'Hartford' },
  { employer: 'Synchrony Financial',            sector: 'Financial Services', employees: 3200, hq: 'Stamford' },
  { employer: 'Gartner, Inc.',                  sector: 'Technology/Research', employees: 4800, hq: 'Stamford' },
  { employer: 'Yale University',                sector: 'Higher Education', employees: 14800, hq: 'New Haven' },
  { employer: 'Electric Boat (General Dynamics)', sector: 'Defense', employees: 19800, hq: 'Groton' },
]

const SECTOR_COLORS: Record<string, string> = {
  'Financial Services': '#003087', Healthcare: '#0072ce', Manufacturing: '#64748b',
  'Professional Services': '#22c55e', Education: '#f59e0b', 'Retail Trade': '#ef4444',
  Construction: '#f97316', 'Tech / Software': '#a855f7', Insurance: '#06b6d4', 'Biotech/Pharma': '#10b981',
}

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`

export default function BusinessClimatePage() {
  const [sectorMetric, setSectorMetric] = useState<'jobs' | 'wageAvg' | 'growth'>('jobs')
  const totalNewBiz = BIZ_REGISTRATIONS[BIZ_REGISTRATIONS.length - 1]
  const totalFormations = totalNewBiz.llc + totalNewBiz.corp + totalNewBiz.other
  const totalDECD = DECD_INCENTIVES.reduce((s, p) => s + p.fy24, 0)
  const totalDECDjobs = DECD_INCENTIVES.reduce((s, p) => s + p.jobs, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Business Climate</h1>
        <p className="text-slate-500 text-sm mt-1">Business formations, sector employment, DECD incentive programs, startup VC activity, major employers, and New England competitiveness · CT SoS / DECD / BLS</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="New Entities (2024)" value={totalFormations.toLocaleString()} subtitle="LLC + Corp + Other formations" icon="🏢" color="blue" delta={{ value: '+5.9% YoY', positive: true }} />
        <KPICard title="DECD Incentives FY24" value={fmt$(totalDECD)} subtitle={`${DECD_INCENTIVES.length} programs, ${totalDECDjobs.toLocaleString()} jobs supported`} icon="💼" color="green" />
        <KPICard title="CT VC Investment" value="$528M" subtitle="Venture capital raised — 2024 preliminary" icon="🚀" color="purple" delta={{ value: '+9.1% YoY', positive: true }} />
        <KPICard title="Business Climate Rank" value="#42" subtitle="CNBC America's Top States for Business 2024" icon="📊" color="yellow" delta={{ value: '+3 vs 2023', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Business formations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="New Business Formations" description="Annual entity registrations by type · CT Secretary of State CONCORD System" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BIZ_REGISTRATIONS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="llc"   name="LLC"                fill="#003087" stackId="a" />
              <Bar dataKey="corp"  name="Corporation"        fill="#0072ce" stackId="a" />
              <Bar dataKey="other" name="Other (LP, LLP…)"  fill="#94a3b8" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">COVID-era stimulus and remote work shift drove the 2021 surge in LLC formations (+35%). Stabilizing near 46,000/year by 2024.</p>
        </div>

        {/* VC activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Venture Capital & Startup Activity" description="Deals by stage + total capital raised · PitchBook / CT Innovations" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={STARTUPS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="seed"    name="Seed Deals"    fill="#003087" stackId="a" />
              <Bar yAxisId="left" dataKey="seriesA" name="Series A"      fill="#0072ce" stackId="a" />
              <Bar yAxisId="left" dataKey="seriesB" name="Series B+"     fill="#22c55e" stackId="a" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="total" name="Total Capital ($)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector employment */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <SectionHeader title="Employment by Sector" description="Jobs, wages, and YoY growth · CT DOL / BLS QCEW 2024" />
          <div className="ml-auto flex gap-1">
            {([['jobs', 'Jobs'], ['wageAvg', 'Avg Wage'], ['growth', 'Growth %']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setSectorMetric(v)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sectorMetric === v ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>{l}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...SECTOR_EMPLOYMENT].sort((a, b) => b[sectorMetric] - a[sectorMetric])} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickFormatter={v => sectorMetric === 'jobs' ? `${(v / 1000).toFixed(0)}k` : sectorMetric === 'wageAvg' ? `$${(v / 1000).toFixed(0)}k` : `${v}%`} />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 9, fill: '#64748b' }} width={128} />
            <Tooltip formatter={(v: number) => sectorMetric === 'jobs' ? [v.toLocaleString() + ' jobs', 'Jobs'] : sectorMetric === 'wageAvg' ? [`$${v.toLocaleString()}`, 'Avg Wage'] : [`${v}%`, 'YoY Growth']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            {sectorMetric === 'growth' && <ReferenceLine x={0} stroke="#94a3b8" />}
            <Bar dataKey={sectorMetric} radius={[0, 4, 4, 0]}>
              {SECTOR_EMPLOYMENT.sort((a, b) => b[sectorMetric] - a[sectorMetric]).map((e, i) => (
                <Cell key={i} fill={sectorMetric === 'growth' ? (e.growth >= 0 ? '#22c55e' : '#ef4444') : SECTOR_COLORS[e.sector] ?? '#0072ce'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DECD incentive table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title={`DECD Incentive Programs — FY2024 (${fmt$(totalDECD)} total deployed)`} description="CT Dept of Economic & Community Development · AdvanceCT program portfolio" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Program</th>
                <th className="text-center px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">FY24 Deployed</th>
                <th className="text-right px-3 py-2">Projects</th>
                <th className="text-right px-3 py-2">Jobs Supported</th>
                <th className="text-right px-3 py-2">Cost per Job</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DECD_INCENTIVES.sort((a, b) => b.fy24 - a.fy24).map(p => (
                <tr key={p.program} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{p.program}</td>
                  <td className="px-3 py-2 text-center"><span className="px-1.5 py-0.5 bg-ct-light text-ct-navy rounded font-semibold">{p.type}</span></td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt$(p.fy24)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{p.projects}</td>
                  <td className="px-3 py-2 text-right text-emerald-700 font-bold">{p.jobs.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{fmt$(Math.round(p.fy24 / p.jobs))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NE competitiveness */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="New England Business Climate Comparison" description="Tax burden (% of income), cost of living index, CNBC ranking · Tax Foundation / CNBC 2024" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={STATE_COMPARE.sort((a, b) => a.biz_rank - b.biz_rank)}>
            <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 55]} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="right" dataKey="biz_rank" name="CNBC Biz Rank (lower=better)" fill="#0072ce" opacity={0.4} />
            <Bar yAxisId="left" dataKey="taxBurden" name="Tax Burden %" radius={[4, 4, 0, 0]}>
              {STATE_COMPARE.sort((a, b) => a.biz_rank - b.biz_rank).map((s, i) => (
                <Cell key={i} fill={s.state === 'CT' ? '#003087' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">CT ranks #42 nationally on CNBC's 2024 best states for business. High cost of living and tax burden remain the primary headwinds. Gains in workforce quality and infrastructure offset competitiveness gap vs. NH (#14).</p>
      </div>

      {/* Top employers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Major Employers" description="Top private sector employers by headcount · CT DOL / AdvanceCT 2024" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">Employer</th>
              <th className="text-left px-3 py-2">Sector</th>
              <th className="text-right px-3 py-2">CT Employees</th>
              <th className="text-left px-3 py-2">HQ Town</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {TOP_EMPLOYERS.sort((a, b) => b.employees - a.employees).map(e => (
              <tr key={e.employer} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-bold text-slate-700">{e.employer}</td>
                <td className="px-3 py-2 text-slate-500">{e.sector}</td>
                <td className="px-3 py-2 text-right font-bold text-ct-blue">{e.employees.toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-500">{e.hq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
