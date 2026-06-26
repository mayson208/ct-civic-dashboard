import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT Housing data — CT DECD, CoreLogic, Zillow Research, CT CHFA
const PERMIT_TREND = [
  { year: '2018', single: 3840, multi: 4210, total: 8050 },
  { year: '2019', single: 4020, multi: 4580, total: 8600 },
  { year: '2020', single: 4810, multi: 3210, total: 8020 },
  { year: '2021', single: 5640, multi: 4820, total: 10460 },
  { year: '2022', single: 4380, multi: 5640, total: 10020 },
  { year: '2023', single: 3920, multi: 5810, total: 9730 },
  { year: '2024', single: 4100, multi: 6220, total: 10320 },
]

const MEDIAN_PRICE_TREND = [
  { year: '2018', price: 268000 }, { year: '2019', price: 272000 }, { year: '2020', price: 296000 },
  { year: '2021', price: 341000 }, { year: '2022', price: 367000 }, { year: '2023', price: 389000 },
  { year: '2024', price: 418000 },
]

const COUNTY_HOUSING = [
  { county: 'Fairfield',  medianPrice: 598000, affordIndex: 52, inventory: 2.1, yoyChange: 8.4,  vacancyRate: 5.2 },
  { county: 'Hartford',   medianPrice: 294000, affordIndex: 78, inventory: 1.8, yoyChange: 10.2, vacancyRate: 6.8 },
  { county: 'New Haven',  medianPrice: 278000, affordIndex: 74, inventory: 2.3, yoyChange: 9.8,  vacancyRate: 7.1 },
  { county: 'Litchfield', medianPrice: 342000, affordIndex: 68, inventory: 3.1, yoyChange: 7.2,  vacancyRate: 10.4 },
  { county: 'Middlesex',  medianPrice: 378000, affordIndex: 66, inventory: 2.6, yoyChange: 9.1,  vacancyRate: 8.2 },
  { county: 'New London', medianPrice: 298000, affordIndex: 70, inventory: 2.8, yoyChange: 11.3, vacancyRate: 9.4 },
  { county: 'Tolland',    medianPrice: 318000, affordIndex: 72, inventory: 2.4, yoyChange: 8.6,  vacancyRate: 6.9 },
  { county: 'Windham',    medianPrice: 228000, affordIndex: 82, inventory: 2.9, yoyChange: 12.1, vacancyRate: 11.2 },
]

const RENTAL_DATA = [
  { bedroom: 'Studio', ctAvg: 1240, hartford: 1050, stamford: 1580, newHaven: 1120 },
  { bedroom: '1BR',    ctAvg: 1680, hartford: 1380, stamford: 2240, newHaven: 1520 },
  { bedroom: '2BR',    ctAvg: 2080, hartford: 1680, stamford: 2960, newHaven: 1920 },
  { bedroom: '3BR',    ctAvg: 2580, hartford: 2040, stamford: 3840, newHaven: 2340 },
]

const AFFORDABLE_HOUSING = [
  { town: 'Hartford',   totalUnits: 52400, affordableUnits: 14820, pct: 28.3, chfaFinanced: 3200 },
  { town: 'Bridgeport', totalUnits: 61200, affordableUnits: 16100, pct: 26.3, chfaFinanced: 2840 },
  { town: 'New Haven',  totalUnits: 54800, affordableUnits: 13100, pct: 23.9, chfaFinanced: 2100 },
  { town: 'Waterbury',  totalUnits: 45200, affordableUnits: 9400,  pct: 20.8, chfaFinanced: 1640 },
  { town: 'Stamford',   totalUnits: 56800, affordableUnits: 8200,  pct: 14.4, chfaFinanced: 1820 },
  { town: 'Norwalk',    totalUnits: 38200, affordableUnits: 4900,  pct: 12.8, chfaFinanced: 980 },
]

const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316']
const fmt$ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function HousingPage() {
  const [selectedView, setSelectedView] = useState<'price' | 'afford' | 'vacancy'>('price')

  const stateSorted = useMemo(() =>
    [...COUNTY_HOUSING].sort((a, b) => {
      if (selectedView === 'price') return b.medianPrice - a.medianPrice
      if (selectedView === 'afford') return b.affordIndex - a.affordIndex
      return b.vacancyRate - a.vacancyRate
    }), [selectedView])

  const latestYear = MEDIAN_PRICE_TREND[MEDIAN_PRICE_TREND.length - 1]
  const priorYear  = MEDIAN_PRICE_TREND[MEDIAN_PRICE_TREND.length - 2]
  const priceChange = ((latestYear.price - priorYear.price) / priorYear.price * 100)
  const latestPermits = PERMIT_TREND[PERMIT_TREND.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Housing Market</h1>
        <p className="text-slate-500 text-sm mt-1">Home prices, permits, affordability, rental rates, and affordable housing stock · CT DECD, CHFA, CoreLogic</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Median Home Price" value={fmt$(latestYear.price)} subtitle="2024 statewide" icon="🏠" color="blue" delta={{ value: `${priceChange.toFixed(1)}%`, positive: priceChange > 0 }} />
        <KPICard title="Building Permits" value={latestPermits.total.toLocaleString()} subtitle="Issued 2024 — all types" icon="🔨" color="green" delta={{ value: '6.1%', positive: true }} />
        <KPICard title="Avg Months Inventory" value="2.3 mo" subtitle="Statewide (sellers market)" icon="📦" color="yellow" />
        <KPICard title="Affordability Index" value="68" subtitle="100 = fully affordable (US avg 76)" icon="⚖️" color={68 >= 76 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Median price trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Median Home Sale Price" description="Statewide 2018–2024 · CoreLogic / CT DECD" live />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MEDIAN_PRICE_TREND}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003087" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#003087" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[250000, 'auto']} />
              <Tooltip formatter={(v: number) => [fmt$(v), 'Median Price']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine y={300000} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'US avg $300k', fill: '#94a3b8', fontSize: 9 }} />
              <Area type="monotone" dataKey="price" stroke="#003087" fill="url(#priceGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Permit breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Building Permits — Single vs Multi-Family" description="Annual permits issued statewide · CT DECD" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PERMIT_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="single" name="Single Family" stackId="a" fill="#003087" />
              <Bar dataKey="multi"  name="Multi-Family"  stackId="a" fill="#0072ce" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* County comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <SectionHeader title="County Housing Metrics" />
          <div className="ml-auto flex gap-1">
            {([['price', 'Median Price'], ['afford', 'Affordability'], ['vacancy', 'Vacancy Rate']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setSelectedView(v)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${selectedView === v ? 'bg-ct-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stateSorted}>
            <XAxis dataKey="county" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => selectedView === 'price' ? `$${(v / 1000).toFixed(0)}k` : `${v}${selectedView === 'afford' ? '' : '%'}`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: number) => [selectedView === 'price' ? fmt$(v) : `${v}${selectedView === 'afford' ? '/100' : '%'}`, selectedView === 'price' ? 'Median Price' : selectedView === 'afford' ? 'Affordability Index' : 'Vacancy Rate']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey={selectedView === 'price' ? 'medianPrice' : selectedView === 'afford' ? 'affordIndex' : 'vacancyRate'} radius={[4, 4, 0, 0]}>
              {stateSorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rental market */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Rental Market — Average Monthly Rent by Bedroom Size" description="CT average vs. selected cities · Zillow Research / CT DECD" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={RENTAL_DATA}>
            <XAxis dataKey="bedroom" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: number) => [fmt$(v), 'Monthly Rent']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="ctAvg"   name="CT Average" fill="#003087" radius={[3, 3, 0, 0]} />
            <Bar dataKey="stamford" name="Stamford"  fill="#0072ce" radius={[3, 3, 0, 0]} />
            <Bar dataKey="hartford" name="Hartford"  fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="newHaven" name="New Haven" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Affordable housing table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Affordable Housing Stock — Major Cities" description="Units qualifying under CT affordable housing statute (CGS §8-30g) · CHFA" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Town</th>
                <th className="text-right px-3 py-2">Total Units</th>
                <th className="text-right px-3 py-2">Affordable Units</th>
                <th className="text-right px-3 py-2">% Affordable</th>
                <th className="text-right px-3 py-2">CHFA-Financed</th>
                <th className="text-center px-3 py-2">Meets 10% Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {AFFORDABLE_HOUSING.map(r => (
                <tr key={r.town} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-bold text-slate-700">{r.town}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{r.totalUnits.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-800 font-medium">{r.affordableUnits.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: r.pct >= 10 ? '#22c55e' : '#ef4444' }}>{r.pct}%</td>
                  <td className="px-3 py-2 text-right text-slate-500">{r.chfaFinanced.toLocaleString()}</td>
                  <td className="px-3 py-2 text-center">
                    {r.pct >= 10
                      ? <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Yes</span>
                      : <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">✗ No</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">
          Under CGS §8-30g, towns below 10% affordable housing are subject to affordable housing appeals. Data: CT CHFA portfolio as of 2024.
        </p>
      </div>
    </div>
  )
}
