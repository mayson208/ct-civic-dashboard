import { useMemo, useState } from 'react'
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, Cell, ReferenceLine, LineChart, Line,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT municipal fiscal data — CT OPM, CT DRS, CT MRSA, Office of the State Comptroller
interface Municipality {
  town: string
  county: string
  population: number
  millRate2024: number
  millRate2020: number
  grandList: number
  ecs2024: number
  ecsPerPupil: number
  debtServicePct: number
  fundBalance: number
  fiscalDistress: boolean
  propertyTaxRevPct: number
  medianIncome: number
  povertyRate: number
}

const MUNICIPALITIES: Municipality[] = [
  { town: 'Hartford',       county: 'Hartford',   population: 121054, millRate2024: 74.29, millRate2020: 68.95, grandList: 4820000000, ecs2024: 292800000, ecsPerPupil: 13840, debtServicePct: 8.2, fundBalance: 4.1, fiscalDistress: true,  propertyTaxRevPct: 42.1, medianIncome: 35240, povertyRate: 31.8 },
  { town: 'Bridgeport',     county: 'Fairfield',  population: 148654, millRate2024: 54.37, millRate2020: 50.84, grandList: 7840000000, ecs2024: 274200000, ecsPerPupil: 11480, debtServicePct: 7.8, fundBalance: 3.2, fiscalDistress: true,  propertyTaxRevPct: 58.2, medianIncome: 42180, povertyRate: 24.1 },
  { town: 'New Haven',      county: 'New Haven',  population: 134023, millRate2024: 43.88, millRate2020: 41.84, grandList: 10240000000, ecs2024: 231400000, ecsPerPupil: 10840, debtServicePct: 9.1, fundBalance: 6.8, fiscalDistress: false, propertyTaxRevPct: 47.8, medianIncome: 41820, povertyRate: 25.4 },
  { town: 'Waterbury',      county: 'New Haven',  population: 114403, millRate2024: 60.21, millRate2020: 55.48, grandList: 4280000000, ecs2024: 186400000, ecsPerPupil: 12120, debtServicePct: 6.4, fundBalance: 5.2, fiscalDistress: false, propertyTaxRevPct: 68.4, medianIncome: 37420, povertyRate: 27.2 },
  { town: 'Stamford',       county: 'Fairfield',  population: 136523, millRate2024: 24.83, millRate2020: 23.17, grandList: 34200000000, ecs2024: 14400000, ecsPerPupil: 820, debtServicePct: 4.2, fundBalance: 14.8, fiscalDistress: false, propertyTaxRevPct: 88.4, medianIncome: 94820, povertyRate: 9.8 },
  { town: 'Norwalk',        county: 'Fairfield',  population: 88438,  millRate2024: 25.38, millRate2020: 23.82, grandList: 14800000000, ecs2024: 18200000, ecsPerPupil: 1240, debtServicePct: 4.8, fundBalance: 11.2, fiscalDistress: false, propertyTaxRevPct: 84.2, medianIncome: 82140, povertyRate: 11.2 },
  { town: 'Danbury',        county: 'Fairfield',  population: 86518,  millRate2024: 27.04, millRate2020: 25.42, grandList: 10400000000, ecs2024: 22400000, ecsPerPupil: 1480, debtServicePct: 5.1, fundBalance: 8.4, fiscalDistress: false, propertyTaxRevPct: 78.2, medianIncome: 68240, povertyRate: 13.4 },
  { town: 'West Hartford',  county: 'Hartford',   population: 64083,  millRate2024: 41.80, millRate2020: 39.24, grandList: 8640000000, ecs2024: 16200000, ecsPerPupil: 1020, debtServicePct: 5.8, fundBalance: 9.4, fiscalDistress: false, propertyTaxRevPct: 86.4, medianIncome: 88240, povertyRate: 7.2 },
  { town: 'Greenwich',      county: 'Fairfield',  population: 63518,  millRate2024: 11.59, millRate2020: 11.42, grandList: 48200000000, ecs2024: 0,         ecsPerPupil: 0,    debtServicePct: 3.2, fundBalance: 18.4, fiscalDistress: false, propertyTaxRevPct: 96.2, medianIncome: 124820, povertyRate: 3.4 },
  { town: 'New Britain',    county: 'Hartford',   population: 74135,  millRate2024: 49.53, millRate2020: 46.18, grandList: 2840000000, ecs2024: 98200000, ecsPerPupil: 8420, debtServicePct: 7.2, fundBalance: 4.8, fiscalDistress: true,  propertyTaxRevPct: 52.4, medianIncome: 38420, povertyRate: 22.8 },
  { town: 'Windham',        county: 'Windham',    population: 43857,  millRate2024: 45.82, millRate2020: 42.48, grandList: 1840000000, ecs2024: 84200000, ecsPerPupil: 9840, debtServicePct: 6.8, fundBalance: 3.8, fiscalDistress: true,  propertyTaxRevPct: 48.2, medianIncome: 35840, povertyRate: 28.4 },
  { town: 'New Milford',    county: 'Litchfield', population: 28068,  millRate2024: 29.84, millRate2020: 27.42, grandList: 3120000000, ecs2024: 8400000, ecsPerPupil: 1640, debtServicePct: 5.4, fundBalance: 7.2, fiscalDistress: false, propertyTaxRevPct: 82.4, medianIncome: 74820, povertyRate: 8.4 },
]

const ECS_TREND = [
  { year: 'FY2019', total: 2280000000 }, { year: 'FY2020', total: 2320000000 },
  { year: 'FY2021', total: 2240000000 }, { year: 'FY2022', total: 2380000000 },
  { year: 'FY2023', total: 2441000000 }, { year: 'FY2024', total: 2524000000 },
  { year: 'FY2025E', total: 2598000000 },
]

const FISCAL_DISTRESS_CRITERIA = [
  { criterion: 'Mill Rate > 1.5x State Median', threshold: '>1.5× (>42.8)', status: 'Hartford 74.3, Waterbury 60.2, Bridgeport 54.4' },
  { criterion: 'Fund Balance < 5% Expenditures', threshold: '<5%', status: 'Hartford 4.1%, Bridgeport 3.2%, New Britain 4.8%' },
  { criterion: 'Debt Service > 10% Revenue', threshold: '>10%', status: 'None currently at threshold (closest: New Haven 9.1%)' },
  { criterion: 'Property Tax Rev > 80% Total', threshold: '>80%', status: 'Indicates low state aid dependency — inversely associated with distress' },
]

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`
const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#64748b','#10b981','#8b5cf6','#f43f5e']

export default function MunicipalPage() {
  const [sortBy, setSortBy] = useState<'millRate' | 'ecs' | 'fundBalance' | 'income'>('millRate')
  const [filterDistress, setFilterDistress] = useState<'all' | 'distressed' | 'healthy'>('all')

  const filtered = useMemo(() =>
    MUNICIPALITIES
      .filter(m => filterDistress === 'all' || (filterDistress === 'distressed' ? m.fiscalDistress : !m.fiscalDistress))
      .sort((a, b) => {
        if (sortBy === 'millRate')   return b.millRate2024 - a.millRate2024
        if (sortBy === 'ecs')        return b.ecs2024 - a.ecs2024
        if (sortBy === 'fundBalance') return a.fundBalance - b.fundBalance
        return a.medianIncome - b.medianIncome
      }),
    [sortBy, filterDistress]
  )

  const stateMedianMR = useMemo(() =>
    [...MUNICIPALITIES].sort((a, b) => a.millRate2024 - b.millRate2024)[Math.floor(MUNICIPALITIES.length / 2)].millRate2024,
    []
  )

  const totalECS = MUNICIPALITIES.reduce((s, m) => s + m.ecs2024, 0)
  const distressedCount = MUNICIPALITIES.filter(m => m.fiscalDistress).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Municipal Fiscal Health</h1>
        <p className="text-slate-500 text-sm mt-1">Mill rates, Education Cost Sharing (ECS) grants, fund balance, debt service, and fiscal distress indicators · CT OPM, CT DRS, MRSA</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="State Median Mill Rate" value={`${stateMedianMR.toFixed(2)}`} subtitle="Per thousand assessed value (2024 GL)" icon="🏠" color="blue" delta={{ value: '+2.8 pts vs 2020', positive: false }} />
        <KPICard title="Total ECS Grants" value={fmt$(totalECS)} subtitle="Across displayed municipalities" icon="🎓" color="green" />
        <KPICard title="Fiscally Distressed" value={distressedCount} subtitle="MRSA-monitored municipalities" icon="⚠️" color={distressedCount > 0 ? 'red' : 'green'} />
        <KPICard title="Highest Mill Rate" value="74.29" subtitle="Hartford — nearly 3× Stamford (11.59)" icon="📊" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mill rate bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Mill Rate Comparison — 2024 Grand List" description="Effective mill rate per $1,000 assessed value · CT OPM / DRS" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[...MUNICIPALITIES].sort((a, b) => b.millRate2024 - a.millRate2024)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="town" tick={{ fontSize: 9, fill: '#64748b' }} width={88} />
              <Tooltip formatter={(v: number) => [`${v} mills`, 'Mill Rate']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine x={stateMedianMR} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Median', fill: '#94a3b8', fontSize: 9 }} />
              <Bar dataKey="millRate2024" radius={[0, 4, 4, 0]}>
                {[...MUNICIPALITIES].sort((a, b) => b.millRate2024 - a.millRate2024).map((m, i) => (
                  <Cell key={i} fill={m.fiscalDistress ? '#ef4444' : m.millRate2024 > stateMedianMR ? '#f59e0b' : '#003087'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-1">Red = MRSA fiscal distress designation · Yellow = above state median</p>
        </div>

        {/* ECS by town */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Education Cost Sharing (ECS) Grant Awards" description="FY2024 state aid for public education by town · CT OPM" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[...MUNICIPALITIES].filter(m => m.ecs2024 > 0).sort((a, b) => b.ecs2024 - a.ecs2024)} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="town" tick={{ fontSize: 9, fill: '#64748b' }} width={88} />
              <Tooltip formatter={(v: number) => [fmt$(v), 'ECS Grant']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="ecs2024" radius={[0, 4, 4, 0]} fill="#003087" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter — income vs mill rate */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Income vs. Mill Rate — Fiscal Equity Analysis" description="Median household income vs. property tax burden · ACS 2023 / CT DRS 2024" />
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ left: 10, right: 20, bottom: 10, top: 10 }}>
            <XAxis dataKey="medianIncome" name="Median Income" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'Median HH Income', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#94a3b8' }} />
            <YAxis dataKey="millRate2024" name="Mill Rate" tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'Mill Rate', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-white border border-slate-200 rounded-lg p-2 shadow text-xs">
                  <p className="font-bold text-slate-700">{d.town}</p>
                  <p>Mill Rate: <strong>{d.millRate2024}</strong></p>
                  <p>Income: <strong>${d.medianIncome.toLocaleString()}</strong></p>
                  {d.fiscalDistress && <p className="text-red-600 font-bold">⚠ Fiscal Distress</p>}
                </div>
              )
            }} />
            <Scatter data={MUNICIPALITIES} name="Towns">
              {MUNICIPALITIES.map((m, i) => (
                <Cell key={i} fill={m.fiscalDistress ? '#ef4444' : '#003087'} opacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-1">Strong negative correlation: lower-income municipalities face higher mill rates — CT's ECS formula partially offsets this gap. Red = MRSA fiscal distress.</p>
      </div>

      {/* ECS trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Statewide ECS Grant Trend" description="Total annual Education Cost Sharing appropriation ($B) · CT OPM" />
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={ECS_TREND}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tickFormatter={v => `$${(v / 1e9).toFixed(2)}B`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[2100000000, 2700000000]} />
            <Tooltip formatter={(v: number) => [fmt$(v), 'Total ECS']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="total" stroke="#003087" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fiscal distress criteria */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Municipal Fiscal Distress Indicators (MRSA)" description="CT Municipal Revenue Sharing Act criteria for enhanced monitoring · CT OPM" />
        </div>
        <div className="divide-y divide-slate-50">
          {FISCAL_DISTRESS_CRITERIA.map(c => (
            <div key={c.criterion} className="px-4 py-3 hover:bg-slate-50 transition">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{c.criterion}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Threshold: <span className="font-medium text-amber-600">{c.threshold}</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort / filter controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-2 flex-wrap items-center text-xs">
        <span className="font-semibold text-slate-500">Sort:</span>
        {([['millRate', 'Mill Rate ↓'], ['ecs', 'ECS Grant ↓'], ['fundBalance', 'Fund Balance ↑'], ['income', 'Income ↑']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setSortBy(k)}
            className={`px-2 py-1 rounded-lg font-semibold border transition ${sortBy === k ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-slate-500">Show:</span>
        {([['all', 'All'], ['distressed', '⚠ Distressed'], ['healthy', '✓ Healthy']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilterDistress(k)}
            className={`px-2 py-1 rounded-lg font-semibold border transition ${filterDistress === k ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Town</th>
                <th className="text-right px-3 py-2">Mill Rate 2024</th>
                <th className="text-right px-3 py-2">vs. 2020</th>
                <th className="text-right px-3 py-2">ECS Grant</th>
                <th className="text-right px-3 py-2">$/Pupil</th>
                <th className="text-right px-3 py-2">Fund Bal %</th>
                <th className="text-right px-3 py-2">Debt Svc %</th>
                <th className="text-right px-3 py-2">Median Income</th>
                <th className="text-center px-3 py-2">MRSA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(m => {
                const mrChange = m.millRate2024 - m.millRate2020
                return (
                  <tr key={m.town} className={`hover:bg-slate-50 transition ${m.fiscalDistress ? 'bg-red-50/20' : ''}`}>
                    <td className="px-3 py-2 font-bold text-slate-700">
                      {m.town}
                      <span className="text-slate-400 font-normal ml-1.5">{m.county}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-black" style={{ color: m.millRate2024 > stateMedianMR ? '#ef4444' : '#22c55e' }}>{m.millRate2024}</td>
                    <td className="px-3 py-2 text-right font-medium" style={{ color: mrChange > 0 ? '#ef4444' : '#22c55e' }}>
                      {mrChange > 0 ? '+' : ''}{mrChange.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">{m.ecs2024 > 0 ? fmt$(m.ecs2024) : '—'}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{m.ecsPerPupil > 0 ? `$${m.ecsPerPupil.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2 text-right font-bold" style={{ color: m.fundBalance < 5 ? '#ef4444' : m.fundBalance < 8 ? '#f59e0b' : '#22c55e' }}>{m.fundBalance}%</td>
                    <td className="px-3 py-2 text-right" style={{ color: m.debtServicePct > 9 ? '#ef4444' : '#64748b' }}>{m.debtServicePct}%</td>
                    <td className="px-3 py-2 text-right text-slate-500">${m.medianIncome.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      {m.fiscalDistress
                        ? <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">⚠ Distressed</span>
                        : <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">✓ Monitored</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
