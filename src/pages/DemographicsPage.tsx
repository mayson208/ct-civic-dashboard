import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT demographic data — CT OPM, US Census Bureau ACS, CT State Data Center
const POP_TREND = [
  { year: '2010', population: 3574097 }, { year: '2012', population: 3591767 },
  { year: '2014', population: 3596677 }, { year: '2016', population: 3578141 },
  { year: '2018', population: 3572665 }, { year: '2020', population: 3605944 },
  { year: '2021', population: 3612314 }, { year: '2022', population: 3626205 },
  { year: '2023', population: 3641956 }, { year: '2024', population: 3657432 },
]

const AGE_DIST = [
  { group: 'Under 5',  pct: 5.1, us: 5.7 },
  { group: '5–17',     pct: 15.8, us: 16.4 },
  { group: '18–34',    pct: 20.9, us: 22.1 },
  { group: '35–49',    pct: 19.2, us: 18.8 },
  { group: '50–64',    pct: 19.4, us: 18.9 },
  { group: '65–74',    pct: 10.9, us: 9.6 },
  { group: '75+',      pct: 8.7, us: 6.8 },
]

const RACE_ETH = [
  { name: 'White (Non-Hispanic)', value: 63.4, color: '#003087' },
  { name: 'Hispanic / Latino',    value: 17.8, color: '#0072ce' },
  { name: 'Black / African Am.',  value: 11.4, color: '#22c55e' },
  { name: 'Asian',                value: 5.2,  color: '#f59e0b' },
  { name: 'Two or More Races',    value: 1.8,  color: '#a855f7' },
  { name: 'Other',                value: 0.4,  color: '#94a3b8' },
]

const MIGRATION = [
  { year: '2018', inflow: 128400, outflow: 148200, net: -19800 },
  { year: '2019', inflow: 126800, outflow: 142100, net: -15300 },
  { year: '2020', inflow: 131200, outflow: 122400, net: 8800 },
  { year: '2021', inflow: 164800, outflow: 138200, net: 26600 },
  { year: '2022', inflow: 148200, outflow: 136800, net: 11400 },
  { year: '2023', inflow: 142100, outflow: 132400, net: 9700 },
  { year: '2024', inflow: 138800, outflow: 128100, net: 10700 },
]

const COUNTY_POP = [
  { county: 'Fairfield',  pop2010: 916829, pop2024: 972408, pctChange: 6.1, medianAge: 41.2, foreignBorn: 22.4 },
  { county: 'Hartford',   pop2010: 894014, pop2024: 902211, pctChange: 0.9, medianAge: 39.8, foreignBorn: 14.2 },
  { county: 'New Haven',  pop2010: 862477, pop2024: 875642, pctChange: 1.5, medianAge: 38.4, foreignBorn: 13.8 },
  { county: 'New London', pop2010: 274055, pop2024: 281902, pctChange: 2.9, medianAge: 41.1, foreignBorn: 10.1 },
  { county: 'Litchfield', pop2010: 189927, pop2024: 186841, pctChange: -1.6, medianAge: 45.8, foreignBorn: 6.2 },
  { county: 'Middlesex',  pop2010: 165676, pop2024: 174219, pctChange: 5.2, medianAge: 43.6, foreignBorn: 9.8 },
  { county: 'Tolland',    pop2010: 152691, pop2024: 156842, pctChange: 2.7, medianAge: 42.4, foreignBorn: 8.4 },
  { county: 'Windham',    pop2010: 118428, pop2024: 107367, pctChange: -9.3, medianAge: 39.2, foreignBorn: 12.1 },
]

const EDUCATION_ATTAIN = [
  { level: 'Less than HS', ct: 8.2, us: 11.5 },
  { level: 'HS Diploma',   ct: 23.4, us: 27.2 },
  { level: 'Some College', ct: 18.2, us: 20.1 },
  { level: "Associate's",  ct: 7.8, us: 8.2 },
  { level: "Bachelor's",   ct: 24.8, us: 19.8 },
  { level: 'Grad / Prof.', ct: 17.6, us: 13.1 },
]

const HOUSEHOLD_COMP = [
  { type: 'Married Couple Family', pct: 45.2 },
  { type: 'Single-Person',        pct: 28.4 },
  { type: 'Single Parent',        pct: 10.8 },
  { type: 'Other Family',         pct: 7.2 },
  { type: 'Non-Family Household', pct: 8.4 },
]

const COLORS_POOL = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316']

export default function DemographicsPage() {
  const [countyView, setCountyView] = useState<'pop' | 'change' | 'foreignBorn'>('pop')
  const [sortCounty, setSortCounty] = useState<'pop' | 'change'>('pop')

  const latestPop = POP_TREND[POP_TREND.length - 1]
  const priorPop  = POP_TREND[POP_TREND.length - 3]
  const growthRate = ((latestPop.population - priorPop.population) / priorPop.population * 100)
  const medianAge = 41.2
  const foreignBornPct = 15.1

  const countySorted = useMemo(() =>
    [...COUNTY_POP].sort((a, b) =>
      sortCounty === 'pop' ? b.pop2024 - a.pop2024 : b.pctChange - a.pctChange
    ),
    [sortCounty]
  )

  const netMigration = MIGRATION[MIGRATION.length - 1].net

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Demographics</h1>
        <p className="text-slate-500 text-sm mt-1">Population trends, age & race distribution, migration, household composition, and education attainment · US Census ACS / CT OPM</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="CT Population" value={latestPop.population.toLocaleString()} subtitle="2024 estimate" icon="👥" color="blue" delta={{ value: `${growthRate.toFixed(1)}%`, positive: growthRate > 0 }} />
        <KPICard title="Median Age" value={`${medianAge} yrs`} subtitle="Up 1.2 yrs since 2010" icon="🎂" color="purple" />
        <KPICard title="Net Migration" value={`+${netMigration.toLocaleString()}`} subtitle="2024 estimate (positive since 2020)" icon="🧳" color="green" delta={{ value: '3yr avg +15.7k', positive: true }} />
        <KPICard title="Foreign-Born" value={`${foreignBornPct}%`} subtitle="Of CT population · ACS 2023" icon="🌐" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Population trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Population 2010–2024" description="Annual estimates · US Census Bureau / CT OPM" live />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={POP_TREND}>
              <defs>
                <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003087" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#003087" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={1} />
              <YAxis tickFormatter={v => `${(v / 1e6).toFixed(2)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[3500000, 'auto']} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Population']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="population" stroke="#003087" fill="url(#popGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Migration */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Migration — In vs. Out" description="People moving to/from CT · IRS SOI migration data" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MIGRATION}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number, n) => [v.toLocaleString(), n === 'inflow' ? 'Moved In' : n === 'outflow' ? 'Moved Out' : 'Net']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="inflow"  name="inflow"  fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="outflow" name="outflow" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Race / ethnicity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Race & Ethnicity" description="CT population composition · ACS 5-Year Estimate 2023" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={180}>
              <PieChart>
                <Pie data={RACE_ETH} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={2}>
                  {RACE_ETH.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {RACE_ETH.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-slate-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Age Distribution — CT vs. US" description="ACS 2023 · Percent of population by age group" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AGE_DIST} layout="vertical">
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="group" tick={{ fontSize: 10, fill: '#64748b' }} width={56} />
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pct" name="CT" fill="#003087" radius={[0, 3, 3, 0]} />
              <Bar dataKey="us"  name="US" fill="#94a3b8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* County breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SectionHeader title="County Population" />
          <div className="ml-auto flex gap-1.5">
            <select value={countyView} onChange={e => setCountyView(e.target.value as typeof countyView)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
              <option value="pop">2024 Population</option>
              <option value="change">% Change 2010–2024</option>
              <option value="foreignBorn">Foreign-Born %</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[...COUNTY_POP].sort((a, b) =>
            countyView === 'pop' ? b.pop2024 - a.pop2024 : countyView === 'change' ? b.pctChange - a.pctChange : b.foreignBorn - a.foreignBorn
          )}>
            <XAxis dataKey="county" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis tickFormatter={v => countyView === 'pop' ? `${(v / 1000).toFixed(0)}k` : `${v}%`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <Tooltip
              formatter={(v: number, n) => [countyView === 'pop' ? v.toLocaleString() : `${v}%`, countyView === 'pop' ? 'Population' : countyView === 'change' ? '% Change' : 'Foreign-Born']}
              contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey={countyView === 'pop' ? 'pop2024' : countyView === 'change' ? 'pctChange' : 'foreignBorn'} radius={[4, 4, 0, 0]}>
              {COUNTY_POP.map((_, i) => <Cell key={i} fill={_.pctChange < 0 && countyView === 'change' ? '#ef4444' : COLORS_POOL[i % COLORS_POOL.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Education attainment */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Educational Attainment — CT vs. US" description="Population 25+ · ACS 5-Year 2023" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={EDUCATION_ATTAIN} layout="vertical">
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="level" tick={{ fontSize: 9, fill: '#64748b' }} width={78} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ct" name="CT" fill="#003087" radius={[0, 3, 3, 0]} />
              <Bar dataKey="us" name="US" fill="#94a3b8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">CT ranks 2nd nationally in bachelor's + graduate degree attainment (42.4% vs 32.9% US avg)</p>
        </div>

        {/* Household composition */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Household Composition" description="Share of total households · ACS 2023" />
          <div className="space-y-2.5 mt-2">
            {HOUSEHOLD_COMP.map((h, i) => (
              <div key={h.type} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{h.type}</span>
                  <span className="font-bold text-slate-700">{h.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${h.pct}%`, background: COLORS_POOL[i % COLORS_POOL.length] }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">1.338M total households · Avg 2.52 persons per household</p>
        </div>
      </div>

      {/* County detail table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <SectionHeader title="County Population Detail" />
          <div className="ml-auto flex gap-1">
            <button onClick={() => setSortCounty('pop')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sortCounty === 'pop' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Pop</button>
            <button onClick={() => setSortCounty('change')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sortCounty === 'change' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Growth</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">County</th>
                <th className="text-right px-3 py-2">2010 Pop.</th>
                <th className="text-right px-3 py-2">2024 Est.</th>
                <th className="text-right px-3 py-2">% Change</th>
                <th className="text-right px-3 py-2">Median Age</th>
                <th className="text-right px-3 py-2">Foreign-Born</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {countySorted.map(c => (
                <tr key={c.county} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-bold text-slate-700">{c.county}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{c.pop2010.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">{c.pop2024.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: c.pctChange >= 0 ? '#22c55e' : '#ef4444' }}>
                    {c.pctChange >= 0 ? '+' : ''}{c.pctChange}%
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">{c.medianAge}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{c.foreignBorn}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
