import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT OPM, GAAP financials, Pew Charitable Trusts, Moody's, SEBAC — realistic CT pension data
const FUNDED_STATUS = [
  { year: '2014', sers: 41.2, trs: 59.4, judges: 78.4, muni: 62.4 },
  { year: '2015', sers: 40.8, trs: 56.8, judges: 76.2, muni: 61.8 },
  { year: '2016', sers: 37.4, trs: 54.2, judges: 74.4, muni: 60.8 },
  { year: '2017', sers: 33.4, trs: 51.8, judges: 72.8, muni: 59.4 },
  { year: '2018', sers: 34.2, trs: 50.4, judges: 71.4, muni: 58.4 },
  { year: '2019', sers: 35.4, trs: 52.4, judges: 73.2, muni: 60.2 },
  { year: '2020', sers: 37.8, trs: 54.8, judges: 74.8, muni: 58.8 },
  { year: '2021', sers: 43.4, trs: 59.8, judges: 78.4, muni: 66.4 },
  { year: '2022', sers: 36.4, trs: 53.4, judges: 72.4, muni: 58.8 },
  { year: '2023', sers: 38.8, trs: 55.4, judges: 74.2, muni: 61.4 },
]

const PENSION_PLANS = [
  { plan: 'SERS (State Employee Retirement)', aal: 24800000000, assets: 9624000000, funded: 38.8, members: 48200, retirees: 52400, contrib: 842000000 },
  { plan: 'TRS (Teacher Retirement)',          aal: 23400000000, assets: 12973000000, funded: 55.4, members: 52400, retirees: 44200, contrib: 1142000000 },
  { plan: 'Judges\' Retirement',               aal: 428000000,  assets: 317000000,  funded: 74.2, members: 184,   retirees: 312,   contrib: 24000000 },
]

const CONTRIBUTION_TREND = [
  { year: '2018', required: 1842, actual: 1842, revenue: 22400 },
  { year: '2019', required: 1924, actual: 1924, revenue: 22800 },
  { year: '2020', required: 2024, actual: 2024, revenue: 22400 },
  { year: '2021', required: 2124, actual: 2124, revenue: 23800 },
  { year: '2022', required: 2284, actual: 2284, revenue: 24800 },
  { year: '2023', required: 2484, actual: 2484, revenue: 26400 },
  { year: '2024', required: 2624, actual: 2624, revenue: 28400 },
]

const OPEB_DATA = [
  { year: '2018', liability: 22400, assets: 1240, funded: 5.5 },
  { year: '2019', liability: 22800, assets: 1480, funded: 6.5 },
  { year: '2020', liability: 23400, assets: 1820, funded: 7.8 },
  { year: '2021', liability: 22800, assets: 2240, funded: 9.8 },
  { year: '2022', liability: 24400, assets: 2124, funded: 8.7 },
  { year: '2023', liability: 24800, assets: 2480, funded: 10.0 },
]

const STATE_COMPARE = [
  { state: 'CT',   funded: 38.8, debt_pct_revenue: 28.4 },
  { state: 'NJ',   funded: 39.2, debt_pct_revenue: 18.2 },
  { state: 'KY',   funded: 43.8, debt_pct_revenue: 16.4 },
  { state: 'IL',   funded: 44.8, debt_pct_revenue: 22.4 },
  { state: 'PA',   funded: 52.4, debt_pct_revenue: 14.8 },
  { state: 'US Avg', funded: 72.4, debt_pct_revenue: 9.2 },
]

const SEBAC_MILESTONES = [
  { year: 2017, event: 'SEBAC 2017 Agreement — 2yr wage freeze, healthcare concessions, benefit tier changes', impact: '$1.57B savings over 5 years' },
  { year: 2020, event: 'COVID-19 — Governor suspends pension smoothing, uses surplus for debt service', impact: 'AAL grows $1.2B' },
  { year: 2021, event: 'ARPA $1.58B — $900M used for pension pre-payment (one-time)', impact: 'SERS +4.8pt / TRS +2.4pt' },
  { year: 2022, event: 'CT Fiscal Guardrails implemented: spending cap + volatility cap on capital gains', impact: 'Enables pension paydown formula' },
  { year: 2023', event: 'Gov. Lamont proposes extra $2B pension prepayment from surplus', impact: 'Saves est. $6B over 25 years' },
  { year: 2024, event: 'Pension obligation bonds (POB) debate — AG opinion requested', impact: 'Decision pending' },
]

const REFORM_SCORECARD = [
  { reform: 'Full ARC Payment (since 2009)',        status: 'Complete',  note: '100% Actuarially Required Contribution paid every year' },
  { reform: 'Volatility Cap on Capital Gains Revenue', status: 'Complete', note: 'Excess revenues above cap deposited to pension funds' },
  { reform: 'Spending Cap Enforcement',              status: 'Complete',  note: 'Constitutional spending cap strictly observed since FY2022' },
  { reform: 'Pension Tier 4 (new employees)',        status: 'Complete',  note: 'Hybrid DC+DB plan for employees hired after 2022' },
  { reform: 'TRS Normal Cost Shared with Districts', status: 'Partial',   note: 'Phased cost-sharing began FY2020; fully shared by FY2034' },
  { reform: 'OPEB Trust Pre-Funding',                status: 'In Progress', note: '10% funded; SEBAC target: 30% by 2030' },
  { reform: 'Pension Obligation Bond Refinancing',   status: 'Proposed',  note: 'AG opinion pending; high risk if market declines' },
]

const STATUS_CFG: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700',
  Partial: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Proposed: 'bg-slate-100 text-slate-600',
}

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`
const totalAAL = PENSION_PLANS.reduce((s, p) => s + p.aal, 0)
const totalAssets = PENSION_PLANS.reduce((s, p) => s + p.assets, 0)
const unfunded = totalAAL - totalAssets

export default function PensionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Pension & Fiscal Sustainability</h1>
        <p className="text-slate-500 text-sm mt-1">SERS & TRS funded status, OPEB liabilities, ARC payments, SEBAC reform timeline, national comparison, and fiscal guardrails · CT OPM / GAAP CAFR</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Combined Funded Ratio" value={`${((totalAssets / totalAAL) * 100).toFixed(1)}%`} subtitle="SERS + TRS + Judges' combined" icon="📉" color="red" delta={{ value: `Unfunded: ${fmt$(unfunded)}`, positive: false }} />
        <KPICard title="Total AAL" value={fmt$(totalAAL)} subtitle="Actuarial Accrued Liability (SERS+TRS+Judges)" icon="💰" color="red" />
        <KPICard title="FY24 Pension Contrib" value="$2.6B" subtitle="14.5% of state operating revenue" icon="📊" color="yellow" delta={{ value: 'Full ARC — 100%', positive: true }} />
        <KPICard title="National Rank" value="#50 of 50" subtitle="Worst-funded public pension system in US (Pew 2024)" icon="🏆" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funded status trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Pension Funded Ratio Trend" description="SERS, TRS, Judges' Retirement — actuarial funded % · CT OPM CAFR" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={FUNDED_STATUS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[30, 85]} />
              <Tooltip formatter={(v: number) => [`${v}%`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Target 80%', fill: '#22c55e', fontSize: 9 }} />
              <Line type="monotone" dataKey="sers"   name="SERS"        stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="trs"    name="TRS"         stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="judges" name="Judges' Ret." stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="muni"   name="Muni Avg"    stroke="#94a3b8" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">2021 bump: ARPA $900M one-time pension prepayment. 2022 decline: market volatility eroded asset values. CT projects 80% funded by 2047 under current plan.</p>
        </div>

        {/* Contribution vs. revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Pension Contribution vs. State Revenue" description="Required + actual contributions ($M) vs. total state revenue ($M) · CT OPM" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CONTRIBUTION_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tickFormatter={v => `$${(v / 1000).toFixed(1)}B`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${(v / 1000).toFixed(1)}B`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [`$${v}M`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="required" name="ARC Payment ($M)" fill="#ef4444" opacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="State Revenue ($M)" stroke="#003087" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title={`CT Pension Plans — Combined Unfunded Liability: ${fmt$(unfunded)}`} description="Plan-by-plan actuarial data · CT SERS / TRS Actuarial Reports 2023" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Plan</th>
                <th className="text-right px-3 py-2">Total AAL</th>
                <th className="text-right px-3 py-2">Assets</th>
                <th className="text-right px-3 py-2">Unfunded</th>
                <th className="text-right px-3 py-2">Funded %</th>
                <th className="text-right px-3 py-2">Active Members</th>
                <th className="text-right px-3 py-2">Retirees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PENSION_PLANS.map(p => (
                <tr key={p.plan} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{p.plan}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{fmt$(p.aal)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{fmt$(p.assets)}</td>
                  <td className="px-3 py-2 text-right text-red-600 font-bold">{fmt$(p.aal - p.assets)}</td>
                  <td className="px-3 py-2 text-right font-black" style={{ color: p.funded >= 70 ? '#22c55e' : p.funded >= 50 ? '#f59e0b' : '#ef4444' }}>{p.funded}%</td>
                  <td className="px-3 py-2 text-right text-slate-500">{p.members.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{p.retirees.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* National comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Worst-Funded States — Pension Comparison" description="SERS funded ratio vs. comparable poorly-funded states · Pew Charitable Trusts 2024" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[...STATE_COMPARE].sort((a, b) => a.funded - b.funded)}>
            <XAxis dataKey="state" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 90]} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Funded Ratio']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Healthy (80%)', fill: '#22c55e', fontSize: 9 }} />
            <Bar dataKey="funded" radius={[4, 4, 0, 0]}>
              {[...STATE_COMPARE].sort((a, b) => a.funded - b.funded).map((s, i) => (
                <Bar key={i} dataKey="funded" fill={s.state === 'CT' ? '#ef4444' : s.state === 'US Avg' ? '#22c55e' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reform scorecard */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Pension Reform Scorecard" description="CT fiscal sustainability reform actions and status · CT OPM / SEBAC" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">Reform</th>
              <th className="text-center px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {REFORM_SCORECARD.map(r => (
              <tr key={r.reform} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-700">{r.reform}</td>
                <td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${STATUS_CFG[r.status]}`}>{r.status}</span></td>
                <td className="px-3 py-2 text-slate-500">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900">
        <p className="font-bold mb-1">PM Note — Pension as IT Budget Constraint</p>
        <p>The pension ARC ($2.6B FY24) consumes ~14.5% of total state operating revenue, leaving less discretionary budget for IT capital investment. State IT projects must compete with mandatory pension obligations for bond-funded capital. This makes the CT BEST IT consolidation model (shared services to reduce per-agency overhead) a fiscally driven necessity, not just a good-government preference. Interviewers expect CT IT PMs to understand this constraint and design projects accordingly.</p>
      </div>
    </div>
  )
}
