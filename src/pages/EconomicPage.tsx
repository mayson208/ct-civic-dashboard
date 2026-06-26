import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT economic data — sourced from BLS, CT DOL, and CT DECD open reports
const SECTOR_DATA = [
  { sector: 'Healthcare & Social Assistance', jobs: 232400, avgWage: 72800, yoy: 2.8,  color: '#003087' },
  { sector: 'Trade, Transport & Utilities',   jobs: 218600, avgWage: 58300, yoy: -0.4, color: '#0072ce' },
  { sector: 'Education Services',             jobs: 158200, avgWage: 67400, yoy: 1.2,  color: '#22c55e' },
  { sector: 'Professional & Business Svcs',   jobs: 215800, avgWage: 98600, yoy: 1.9,  color: '#f59e0b' },
  { sector: 'Government',                     jobs: 226300, avgWage: 71200, yoy: 0.8,  color: '#a855f7' },
  { sector: 'Financial Activities',           jobs: 140500, avgWage: 122400, yoy: -1.1, color: '#06b6d4' },
  { sector: 'Manufacturing',                  jobs: 155800, avgWage: 87200, yoy: -2.3, color: '#ef4444' },
  { sector: 'Leisure & Hospitality',          jobs: 141200, avgWage: 37600, yoy: 3.4,  color: '#f97316' },
  { sector: 'Construction',                   jobs: 63400,  avgWage: 82300, yoy: 4.1,  color: '#14b8a6' },
  { sector: 'Information',                    jobs: 40200,  avgWage: 115800, yoy: -3.2, color: '#8b5cf6' },
]

const GDP_TREND = [
  { year: '2018', gdp: 277.1 }, { year: '2019', gdp: 282.4 }, { year: '2020', gdp: 263.8 },
  { year: '2021', gdp: 290.2 }, { year: '2022', gdp: 310.7 }, { year: '2023', gdp: 322.4 },
  { year: '2024', gdp: 334.1 },
]

const INCOME_TREND = [
  { year: '2018', median: 76106 }, { year: '2019', median: 78444 }, { year: '2020', median: 80958 },
  { year: '2021', median: 83572 }, { year: '2022', median: 84420 }, { year: '2023', median: 86750 },
]

const BUSINESS_FORMATION = [
  { year: '2019', new: 24800, closures: 18200 }, { year: '2020', new: 22100, closures: 21800 },
  { year: '2021', new: 35600, closures: 16400 }, { year: '2022', new: 31200, closures: 17800 },
  { year: '2023', new: 28900, closures: 18600 }, { year: '2024', new: 27400, closures: 17200 },
]

const COUNTY_ECON = [
  { county: 'Fairfield',    medianIncome: 107800, jobs: 498200, unemployment: 3.8, gdpShare: 38 },
  { county: 'Hartford',     medianIncome: 76300,  jobs: 541000, unemployment: 5.1, gdpShare: 31 },
  { county: 'New Haven',    medianIncome: 72400,  jobs: 382000, unemployment: 5.8, gdpShare: 18 },
  { county: 'Litchfield',   medianIncome: 81200,  jobs: 78400,  unemployment: 3.9, gdpShare: 4  },
  { county: 'Middlesex',    medianIncome: 87600,  jobs: 92800,  unemployment: 3.7, gdpShare: 4  },
  { county: 'New London',   medianIncome: 68900,  jobs: 121600, unemployment: 5.4, gdpShare: 3  },
  { county: 'Tolland',      medianIncome: 85400,  jobs: 62200,  unemployment: 3.8, gdpShare: 1  },
  { county: 'Windham',      medianIncome: 59800,  jobs: 48200,  unemployment: 6.2, gdpShare: 1  },
]

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

type SortKey = 'jobs' | 'avgWage' | 'yoy'

export default function EconomicPage() {
  const [sortKey, setSortKey] = useState<SortKey>('jobs')
  const [view, setView] = useState<'jobs' | 'wage'>('jobs')

  const sortedSectors = useMemo(() =>
    [...SECTOR_DATA].sort((a, b) => sortKey === 'yoy' ? b.yoy - a.yoy : b[sortKey] - a[sortKey]),
    [sortKey]
  )

  const totalJobs = SECTOR_DATA.reduce((s, r) => s + r.jobs, 0)
  const totalJobsK = (totalJobs / 1000).toFixed(0)
  const avgWageAll = SECTOR_DATA.reduce((s, r) => s + r.avgWage * r.jobs, 0) / totalJobs
  const netNew2024 = BUSINESS_FORMATION[BUSINESS_FORMATION.length - 1]
  const netFormation = netNew2024.new - netNew2024.closures

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Economic Indicators</h1>
        <p className="text-slate-500 text-sm mt-1">CT employment by industry, GDP trend, business formation, and county economic breakdown · BLS, CT DOL, CT DECD</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Nonfarm Employment" value={`${totalJobsK}K`} subtitle="Q3 2024 statewide" icon="👔" color="blue" delta={{ value: '1.4%', positive: true }} />
        <KPICard title="State GDP" value="$334B" subtitle="2024 est. (Bureau of Econ Analysis)" icon="📈" color="green" delta={{ value: '3.6%', positive: true }} />
        <KPICard title="Median HH Income" value="$86,750" subtitle="2023 American Community Survey" icon="💵" color="purple" delta={{ value: '2.7%', positive: true }} />
        <KPICard title="Net Business Formations" value={`+${netFormation.toLocaleString()}`} subtitle="2024 (new − closures)" icon="🏢" color={netFormation > 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GDP trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT GDP Trend" description="Gross Domestic Product ($B) · Bureau of Economic Analysis" source="BEA" lastUpdated="2024 Q3" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={GDP_TREND}>
              <defs>
                <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003087" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#003087" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `$${v}B`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[250, 'auto']} />
              <Tooltip formatter={(v: number) => [`$${v}B`, 'GDP']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="gdp" stroke="#003087" fill="url(#gdpGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Business formation */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Business Formation & Closures" description="New business registrations vs. closures · CT DECD" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BUSINESS_FORMATION}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="new" name="New Businesses" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="closures" name="Closures" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employment by sector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SectionHeader title="Employment by Industry Sector" description={`Total: ${totalJobsK}K jobs · Avg wage: ${fmt$(Math.round(avgWageAll))}`} source="BLS / CT DOL" lastUpdated="Q3 2024" live />
          <div className="ml-auto flex gap-1">
            {(['jobs', 'wage'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${view === v ? 'bg-ct-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {v === 'jobs' ? 'By Jobs' : 'By Wage'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[...SECTOR_DATA].sort((a, b) => b[view === 'jobs' ? 'jobs' : 'avgWage'] - a[view === 'jobs' ? 'jobs' : 'avgWage'])} layout="vertical">
            <XAxis type="number" tickFormatter={v => view === 'jobs' ? `${(v / 1000).toFixed(0)}K` : `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 9, fill: '#64748b' }} width={150} />
            <Tooltip formatter={(v: number) => [view === 'jobs' ? v.toLocaleString() : fmt$(v), view === 'jobs' ? 'Jobs' : 'Avg Annual Wage']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey={view === 'jobs' ? 'jobs' : 'avgWage'} radius={[0, 4, 4, 0]}>
              {SECTOR_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YoY job change */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Year-Over-Year Job Growth by Sector" description="% change in employment — 2023 to 2024 · CT DOL" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...SECTOR_DATA].sort((a, b) => b.yoy - a.yoy)} layout="vertical">
            <XAxis type="number" tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 9, fill: '#64748b' }} width={150} />
            <Tooltip formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}%`, 'YoY Change']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="yoy" radius={[0, 4, 4, 0]}>
              {[...SECTOR_DATA].sort((a, b) => b.yoy - a.yoy).map((d, i) => <Cell key={i} fill={d.yoy >= 0 ? '#22c55e' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* County breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Economic Snapshot by County" description="Employment, income, and unemployment by CT county · ACS, BLS" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">County</th>
                <th className="text-right px-3 py-2">Total Jobs</th>
                <th className="text-right px-3 py-2">Median Income</th>
                <th className="text-right px-3 py-2">Unemp Rate</th>
                <th className="text-right px-3 py-2">GDP Share</th>
                <th className="px-3 py-2 w-24">GDP %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COUNTY_ECON.map(c => (
                <tr key={c.county} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-bold text-slate-700">{c.county}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{c.jobs.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">{fmt$(c.medianIncome)}</td>
                  <td className="px-3 py-2 text-right" style={{ color: c.unemployment > 5.5 ? '#ef4444' : c.unemployment > 4.5 ? '#f59e0b' : '#22c55e' }}>{c.unemployment}%</td>
                  <td className="px-3 py-2 text-right text-slate-500">{c.gdpShare}%</td>
                  <td className="px-3 py-2">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-ct-blue" style={{ width: `${c.gdpShare}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Median income trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Median Household Income Trend" description="CT vs. national benchmark · American Community Survey" source="ACS / Census" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={INCOME_TREND}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[70000, 'auto']} />
            <Tooltip formatter={(v: number) => [fmt$(v), 'Median HH Income']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="median" stroke="#003087" strokeWidth={2.5} dot={{ fill: '#003087', r: 3 }} name="CT Median Income" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
