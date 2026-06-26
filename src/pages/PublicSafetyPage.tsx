import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts'
import { useCrashes } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const TOWNS = ['Hartford', 'Bridgeport', 'New Haven', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich']
const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#ec4899','#14b8a6']

export default function PublicSafetyPage() {
  const { data, isLoading } = useCrashes({ limit: 2000 })
  const [selectedTown, setSelectedTown] = useState<string>('All')

  const years = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(r => r.year))].sort()
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return selectedTown === 'All' ? data : data.filter(r => r.town === selectedTown)
  }, [data, selectedTown])

  // Year trend
  const yearTrend = useMemo(() => {
    return years.map(yr => {
      const rows = filtered.filter(r => r.year === yr)
      return {
        year: yr,
        crashes: rows.reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0),
        injuries: rows.reduce((s, r) => s + parseInt(r.injuries || '0'), 0),
        fatalities: rows.reduce((s, r) => s + parseInt(r.fatalities || '0'), 0),
      }
    })
  }, [filtered, years])

  // Town comparison (latest year)
  const latestYear = years[years.length - 1]
  const townComparison = useMemo(() => {
    if (!data || !latestYear) return []
    return TOWNS.map(town => {
      const rows = data.filter(r => r.town === town && r.year === latestYear)
      return {
        town,
        crashes: rows.reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0),
        injuries: rows.reduce((s, r) => s + parseInt(r.injuries || '0'), 0),
        fatalities: rows.reduce((s, r) => s + parseInt(r.fatalities || '0'), 0),
      }
    }).sort((a, b) => b.crashes - a.crashes)
  }, [data, latestYear])

  const totals = useMemo(() => ({
    crashes: filtered.reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0),
    injuries: filtered.reduce((s, r) => s + parseInt(r.injuries || '0'), 0),
    fatalities: filtered.reduce((s, r) => s + parseInt(r.fatalities || '0'), 0),
  }), [filtered])

  const exportCSV = () => {
    if (!data) return
    const rows = [['Town', 'Year', 'Total Crashes', 'Injuries', 'Fatalities'],
      ...data.map(r => [r.town || '', r.year, r.total_crashes || '', r.injuries || '', r.fatalities || ''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ct_crash_data.csv'; a.click()
  }

  if (isLoading) return <LoadingSpinner message="Loading CT crash statistics…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Public Safety</h1>
          <p className="text-slate-500 text-sm mt-1">Motor vehicle crash statistics by town and year · CT DMV via data.ct.gov</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedTown} onChange={e => setSelectedTown(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600">
            <option>All</option>
            {TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KPICard title="Total Crashes" value={totals.crashes.toLocaleString()} subtitle="All available years" icon="💥" color="yellow" />
        <KPICard title="Total Injuries" value={totals.injuries.toLocaleString()} subtitle="All available years" icon="🚑" color="red" />
        <KPICard title="Fatalities" value={totals.fatalities.toLocaleString()} subtitle="All available years" icon="⚠️" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Crash Trend Over Time" description={`${selectedTown === 'All' ? 'Statewide' : selectedTown} — crashes, injuries, fatalities`} live />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yearTrend}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="crashes" stroke="#003087" strokeWidth={2} dot={false} name="Crashes" />
              <Line type="monotone" dataKey="injuries" stroke="#f59e0b" strokeWidth={2} dot={false} name="Injuries" />
              <Line type="monotone" dataKey="fatalities" stroke="#ef4444" strokeWidth={2} dot={false} name="Fatalities" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title={`Town Comparison — ${latestYear}`} description="Total crashes by municipality" live />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={townComparison}>
              <XAxis dataKey="town" tick={{ fontSize: 9, fill: '#64748b' }} angle={-20} textAnchor="end" height={36} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="crashes" name="Crashes" radius={[4, 4, 0, 0]}>
                {townComparison.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Injury / fatality severity table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title={`Crash Severity — ${latestYear} by Town`} description="Crashes, injuries, fatalities and severity ratio" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Town</th>
                <th className="text-right px-3 py-2">Crashes</th>
                <th className="text-right px-3 py-2">Injuries</th>
                <th className="text-right px-3 py-2">Fatalities</th>
                <th className="text-right px-3 py-2">Injury Rate</th>
                <th className="px-3 py-2">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {townComparison.map(r => {
                const injuryRate = r.crashes > 0 ? r.injuries / r.crashes * 100 : 0
                return (
                  <tr key={r.town} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2 font-medium text-slate-700">{r.town}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{r.crashes.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-amber-600 font-medium">{r.injuries.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-red-600 font-bold">{r.fatalities}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{injuryRate.toFixed(0)}%</td>
                    <td className="px-3 py-2 w-24">
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${Math.min(100, injuryRate)}%` }} />
                      </div>
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
