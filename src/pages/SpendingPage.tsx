import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useSpending } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#ec4899','#14b8a6']
const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

export default function SpendingPage() {
  const { data, isLoading } = useSpending({ limit: 5000 })
  const [selectedYear, setSelectedYear] = useState('2024')
  const [view, setView] = useState<'agency' | 'category'>('agency')

  const years = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(r => r.fiscal_year))].sort((a, b) => b.localeCompare(a))
  }, [data])

  const filtered = useMemo(() => data?.filter(r => r.fiscal_year === selectedYear) || [], [data, selectedYear])

  const totalSpend = useMemo(() => filtered.reduce((s, r) => s + parseFloat(r.amount || '0'), 0), [filtered])

  const byAgency = useMemo(() => {
    const agg: Record<string, number> = {}
    filtered.forEach(r => { agg[r.agency] = (agg[r.agency] || 0) + parseFloat(r.amount || '0') })
    return Object.entries(agg).sort(([,a],[,b]) => b - a).map(([name, val]) => ({ name: name.replace('Department of ', 'Dept of '), value: Math.round(val) }))
  }, [filtered])

  const byCategory = useMemo(() => {
    const agg: Record<string, number> = {}
    filtered.forEach(r => { const k = r.category || 'Other'; agg[k] = (agg[k] || 0) + parseFloat(r.amount || '0') })
    return Object.entries(agg).sort(([,a],[,b]) => b - a).map(([name, value]) => ({ name, value: Math.round(value) }))
  }, [filtered])

  const chartData = view === 'agency' ? byAgency.slice(0, 10) : byCategory

  const yoy = useMemo(() => {
    if (!data) return 0
    const cur = data.filter(r => r.fiscal_year === selectedYear).reduce((s, r) => s + parseFloat(r.amount || '0'), 0)
    const prevYr = String(parseInt(selectedYear) - 1)
    const prev = data.filter(r => r.fiscal_year === prevYr).reduce((s, r) => s + parseFloat(r.amount || '0'), 0)
    return prev > 0 ? (cur - prev) / prev * 100 : 0
  }, [data, selectedYear])

  const exportCSV = () => {
    if (!data) return
    const rows = [['Fiscal Year', 'Agency', 'Category', 'Amount'],
      ...data.map(r => [r.fiscal_year, r.agency, r.category || '', r.amount || ''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ct_spending.csv'; a.click()
  }

  if (isLoading) return <LoadingSpinner message="Loading CT Open Checkbook data…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">State Budget & Expenditures</h1>
          <p className="text-slate-500 text-sm mt-1">Agency-level spending from the CT Open Checkbook · data.ct.gov</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600">
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Expenditures" value={fmt$(totalSpend)} subtitle={`FY ${selectedYear}`} icon="💰" color="blue" />
        <KPICard title="Agencies" value={byAgency.length} subtitle="State agencies tracked" icon="🏛" color="slate" />
        <KPICard title="YoY Change" value={`${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}%`} subtitle={`vs FY ${parseInt(selectedYear) - 1}`} icon={yoy > 0 ? '📈' : '📉'} color={yoy > 0 ? 'red' : 'green'} />
        <KPICard title="Largest Agency" value={byAgency[0]?.name?.split(' ').slice(-1)[0] || '—'} subtitle={fmt$(byAgency[0]?.value || 0)} icon="🏆" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie by category */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Spend by Category" description={`FY ${selectedYear} — all agencies`} live />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt$(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <SectionHeader title={view === 'agency' ? 'Top 10 Agencies by Spend' : 'Spend by Category'} description={`FY ${selectedYear}`} live />
            <div className="ml-auto flex gap-1">
              {(['agency', 'category'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${view === v ? 'bg-ct-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {v === 'agency' ? 'By Agency' : 'By Category'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tickFormatter={v => fmt$(v)} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={120} />
              <Tooltip formatter={(v: number) => [fmt$(v), 'Expenditure']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              {chartData.map((_, i) => null)}
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title={`Spending Detail — FY ${selectedYear}`} description={`${filtered.length.toLocaleString()} records`} />
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Agency</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-right px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice(0, 50).map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-1.5 text-slate-700">{r.agency}</td>
                  <td className="px-3 py-1.5 text-slate-500">{r.category || '—'}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-medium text-slate-800">{fmt$(parseFloat(r.amount || '0'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && <p className="text-xs text-slate-400 px-3 py-2 border-t border-slate-100">Showing 50 of {filtered.length.toLocaleString()} — export CSV for full dataset</p>}
      </div>
    </div>
  )
}
