import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTownProfiles, useUnemployment } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#ec4899','#14b8a6']
const fmt$ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const COUNTIES = ['All', 'Fairfield', 'Hartford', 'Litchfield', 'Middlesex', 'New Haven', 'New London', 'Tolland', 'Windham']

export default function TownProfilesPage() {
  const { data: profiles, isLoading } = useTownProfiles()
  const { data: unemp } = useUnemployment({ limit: 1000 })
  const [county, setCounty] = useState('All')
  const [sort, setSort] = useState<'income' | 'population' | 'poverty'>('income')
  const [search, setSearch] = useState('')

  const enriched = useMemo(() => {
    if (!profiles) return []
    return profiles.map(p => {
      const unempRows = unemp?.filter(u => u.town.toLowerCase() === p.town.toLowerCase()) || []
      const avgUnemp = unempRows.length
        ? unempRows.reduce((s, u) => s + parseFloat(u.unemployment_rate || '0'), 0) / unempRows.length
        : null
      return { ...p, avgUnemp }
    })
  }, [profiles, unemp])

  const filtered = useMemo(() => {
    let rows = enriched
    if (county !== 'All') rows = rows.filter(r => r.county === county)
    if (search) rows = rows.filter(r => r.town.toLowerCase().includes(search.toLowerCase()))
    return [...rows].sort((a, b) => {
      if (sort === 'income') return parseInt(b.median_household_income || '0') - parseInt(a.median_household_income || '0')
      if (sort === 'population') return parseInt(b.population || '0') - parseInt(a.population || '0')
      return parseFloat(b.poverty_rate || '0') - parseFloat(a.poverty_rate || '0')
    })
  }, [enriched, county, sort, search])

  const stateAvgIncome = useMemo(() => {
    if (!enriched.length) return 0
    return enriched.reduce((s, r) => s + parseInt(r.median_household_income || '0'), 0) / enriched.length
  }, [enriched])

  const incomeChart = useMemo(() => filtered.slice(0, 10).map(r => ({
    name: r.town,
    income: parseInt(r.median_household_income || '0'),
  })), [filtered])

  const povertyChart = useMemo(() => [...filtered].sort((a, b) => parseFloat(b.poverty_rate || '0') - parseFloat(a.poverty_rate || '0')).slice(0, 10).map(r => ({
    name: r.town,
    poverty: parseFloat(r.poverty_rate || '0'),
  })), [filtered])

  const exportCSV = () => {
    if (!profiles) return
    const rows = [['Town', 'County', 'Population', 'Median Income', 'Poverty Rate'],
      ...profiles.map(r => [r.town, r.county || '', r.population || '', r.median_household_income || '', r.poverty_rate || ''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ct_town_profiles.csv'; a.click()
  }

  if (isLoading) return <LoadingSpinner message="Loading CT town profile data…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">CT Town Profiles</h1>
          <p className="text-slate-500 text-sm mt-1">Population, income, and poverty indicators by municipality · CT OPM via data.ct.gov</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
          ⬇ Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Towns Tracked" value={profiles?.length || '—'} subtitle="All CT municipalities" icon="🗺️" color="blue" />
        <KPICard title="State Avg Income" value={fmt$(Math.round(stateAvgIncome))} subtitle="Median household" icon="💵" color="green" />
        <KPICard title="Highest Income Town" value={filtered[0]?.town || '—'} subtitle={filtered[0] ? fmt$(parseInt(filtered[0].median_household_income || '0')) : ''} icon="🏆" color="purple" />
        <KPICard title="Displayed Towns" value={filtered.length} subtitle={county !== 'All' ? county + ' County' : 'All counties'} icon="📍" color="slate" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-3 flex-wrap items-center">
        <span className="text-xs font-semibold text-slate-500">Filter:</span>
        <select value={county} onChange={e => setCounty(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600">
          {COUNTIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-xs font-semibold text-slate-500 ml-2">Sort by:</span>
        {(['income', 'population', 'poverty'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${sort === s ? 'bg-ct-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {s === 'income' ? 'Median Income' : s === 'population' ? 'Population' : 'Poverty Rate'}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search town…"
          className="ml-auto border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-ct-sky w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Median Household Income — Top 10" description={county !== 'All' ? county + ' County' : 'All towns'} live />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incomeChart} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={95} />
              <Tooltip formatter={(v: number) => [fmt$(v), 'Median Income']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="income" radius={[0, 4, 4, 0]}>
                {incomeChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Poverty Rate — Top 10 Highest" description="% of population below poverty line" live />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={povertyChart} layout="vertical">
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={95} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Poverty Rate']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="poverty" radius={[0, 4, 4, 0]} fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed town table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Town Data Table" description={`${filtered.length} towns · sorted by ${sort}`} />
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Town</th>
                <th className="text-left px-3 py-2">County</th>
                <th className="text-right px-3 py-2">Population</th>
                <th className="text-right px-3 py-2">Median Income</th>
                <th className="text-right px-3 py-2">Per Capita</th>
                <th className="text-right px-3 py-2">Poverty Rate</th>
                <th className="text-right px-3 py-2">Unemp Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.town} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-1.5 font-semibold text-slate-700">{r.town}</td>
                  <td className="px-3 py-1.5 text-slate-500">{r.county || '—'}</td>
                  <td className="px-3 py-1.5 text-right text-slate-600">{parseInt(r.population || '0').toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-800">{r.median_household_income ? fmt$(parseInt(r.median_household_income)) : '—'}</td>
                  <td className="px-3 py-1.5 text-right text-slate-500">{r.per_capita_income ? fmt$(parseInt(r.per_capita_income)) : '—'}</td>
                  <td className="px-3 py-1.5 text-right" style={{ color: parseFloat(r.poverty_rate || '0') > 15 ? '#ef4444' : '#64748b' }}>
                    {r.poverty_rate ? `${parseFloat(r.poverty_rate).toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-1.5 text-right" style={{ color: (r.avgUnemp || 0) > 6 ? '#ef4444' : '#64748b' }}>
                    {r.avgUnemp ? `${r.avgUnemp.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
