import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from 'recharts'
import { useUnemployment } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import type { UnemploymentRow } from '../api/socrata'

const CT_TOWNS = ['Hartford', 'Bridgeport', 'New Haven', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich']
const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#ec4899','#14b8a6']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function EmploymentPage() {
  const { data, isLoading } = useUnemployment({ limit: 5000 })
  const [selectedTowns, setSelectedTowns] = useState<string[]>(['Hartford', 'Stamford', 'New Haven', 'Greenwich'])
  const [selectedYear, setSelectedYear] = useState<string>('2024')

  const years = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(r => r.year))].sort((a, b) => b.localeCompare(a))
  }, [data])

  // Multi-town trend
  const trendData = useMemo(() => {
    if (!data) return []
    const filtered = data.filter(r => selectedTowns.includes(r.town))
    const byMonth: Record<string, Record<string, number>> = {}
    filtered.forEach(r => {
      const key = `${r.year}-${r.month?.padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = {}
      byMonth[key][r.town] = parseFloat(r.unemployment_rate || '0')
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-36)
      .map(([k, vals]) => {
        const [yr, mo] = k.split('-')
        return { month: `${MONTHS[parseInt(mo) - 1]} ${yr.slice(2)}`, ...vals }
      })
  }, [data, selectedTowns])

  // Town ranking for selected year
  const townRanking = useMemo(() => {
    if (!data) return []
    return CT_TOWNS.map(town => {
      const rows = (data as UnemploymentRow[]).filter(r => r.town === town && r.year === selectedYear)
      const avg = rows.length ? rows.reduce((s, r) => s + parseFloat(r.unemployment_rate || '0'), 0) / rows.length : 0
      return { town, rate: parseFloat(avg.toFixed(2)) }
    }).sort((a, b) => b.rate - a.rate)
  }, [data, selectedYear])

  // State avg
  const stateAvg = useMemo(() => {
    if (!data) return 0
    const rows = (data as UnemploymentRow[]).filter(r => r.year === selectedYear)
    return rows.length ? rows.reduce((s, r) => s + parseFloat(r.unemployment_rate || '0'), 0) / rows.length : 0
  }, [data, selectedYear])

  const exportCSV = () => {
    if (!data) return
    const rows = [['Town', 'Year', 'Month', 'Rate', 'Labor Force', 'Unemployed'],
      ...data.map(r => [r.town, r.year, r.month, r.unemployment_rate || '', r.labor_force || '', r.unemployed || ''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ct_unemployment.csv'; a.click()
  }

  if (isLoading) return <LoadingSpinner message="Loading CT unemployment data…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Labor & Employment</h1>
          <p className="text-slate-500 text-sm mt-1">Unemployment rates by town — CT Dept of Labor · data.ct.gov</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
          ⬇ Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="State Average" value={`${stateAvg.toFixed(1)}%`} subtitle={`FY ${selectedYear}`} icon="📊" color="blue" />
        <KPICard title="Highest Rate" value={`${townRanking[0]?.rate}%`} subtitle={townRanking[0]?.town} icon="⚠️" color="red" />
        <KPICard title="Lowest Rate" value={`${townRanking[townRanking.length - 1]?.rate}%`} subtitle={townRanking[townRanking.length - 1]?.town} icon="✅" color="green" />
        <KPICard title="Towns Tracked" value={CT_TOWNS.length} subtitle="Major municipalities" icon="📍" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Town selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-1">
          <SectionHeader title="Compare Towns" description="Select up to 5 to chart together" />
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {CT_TOWNS.map((town, i) => (
              <label key={town} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm hover:bg-slate-50 transition ${selectedTowns.includes(town) ? 'bg-blue-50 text-ct-blue font-semibold' : 'text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedTowns.includes(town)}
                  onChange={e => {
                    if (e.target.checked && selectedTowns.length < 5) setSelectedTowns(p => [...p, town])
                    else if (!e.target.checked) setSelectedTowns(p => p.filter(t => t !== town))
                  }}
                  className="w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />
                {town}
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Max 5 towns for readability</p>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
          <SectionHeader title="Unemployment Rate Trend" description="Monthly rate by selected town (36-month rolling)" live />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={5} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selectedTowns.map((town, i) => (
                <Line key={town} type="monotone" dataKey={town} stroke={COLORS[CT_TOWNS.indexOf(town)]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Town ranking bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <SectionHeader title="Town Ranking by Unemployment Rate" />
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={townRanking}>
            <XAxis dataKey="town" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 'auto']} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Unemployment Rate']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <ReferenceLine y={stateAvg} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: `CT Avg ${stateAvg.toFixed(1)}%`, fill: '#f59e0b', fontSize: 9 }} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {townRanking.map((_, i) => (
                <rect key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
