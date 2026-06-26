import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { useUnemployment, useSpending, useGraduation, useCrashes } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`

export default function OverviewPage() {
  const { data: unemp, isLoading: ul } = useUnemployment({ limit: 500, order: 'year DESC, month DESC' })
  const { data: spend } = useSpending()
  const { data: grad } = useGraduation()
  const { data: crashes } = useCrashes()

  const stats = useMemo(() => {
    const latestRate = unemp?.find(r => r.unemployment_rate)
    const avgRate = unemp?.length
      ? unemp.reduce((s, r) => s + parseFloat(r.unemployment_rate || '0'), 0) / unemp.length
      : 0
    const totalSpend = spend?.reduce((s, r) => s + parseFloat(r.amount || '0'), 0) || 0
    const latestGrad = grad?.filter(r => r.year === '2023')
    const avgGrad = latestGrad?.length
      ? latestGrad.reduce((s, r) => s + parseFloat(r.graduation_rate || '0'), 0) / latestGrad.length
      : 0
    const totalCrashes = crashes?.filter(r => r.year === '2023').reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0) || 0
    return { latestRate: latestRate?.unemployment_rate || '—', avgRate, totalSpend, avgGrad, totalCrashes }
  }, [unemp, spend, grad, crashes])

  // Statewide unemployment trend (aggregate monthly average)
  const unempTrend = useMemo(() => {
    if (!unemp) return []
    const byMonth: Record<string, number[]> = {}
    unemp.forEach(r => {
      const key = `${r.year}-${r.month}`
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(parseFloat(r.unemployment_rate || '0'))
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([k, vals]) => {
        const [yr, mo] = k.split('-')
        return {
          month: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mo)-1]} ${yr.slice(2)}`,
          rate: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
        }
      })
  }, [unemp])

  // Spending by agency (top 8)
  const spendByAgency = useMemo(() => {
    if (!spend) return []
    const byAgency: Record<string, number> = {}
    spend.forEach(r => { byAgency[r.agency] = (byAgency[r.agency] || 0) + parseFloat(r.amount || '0') })
    return Object.entries(byAgency)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 8)
      .map(([name, total]) => ({ name: name.replace('Department of ', 'Dept of '), total: Math.round(total / 1e6) }))
  }, [spend])

  if (ul) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Connecticut at a Glance</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time indicators across labor, finance, health, education, and public safety · Data: data.ct.gov</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Unemployment Rate" value={`${stats.latestRate}%`} subtitle="Latest available" icon="📉" color="blue" />
        <KPICard title="State Expenditures" value={fmt$(stats.totalSpend)} subtitle="All agencies, all years" icon="💰" color="green" />
        <KPICard title="Avg Graduation Rate" value={`${stats.avgGrad.toFixed(1)}%`} subtitle="2023 cohort, all districts" icon="🎓" color="purple" />
        <KPICard title="Annual Crashes" value={stats.totalCrashes.toLocaleString()} subtitle="2023 statewide" icon="🚗" color="yellow" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader
            title="Statewide Unemployment Trend"
            description="Monthly average across all CT towns (24-month rolling)"
            source="CT Dept of Labor via data.ct.gov"
            live
          />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={unempTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={3} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Unemployment Rate']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="rate" stroke="#003087" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader
            title="State Spending by Agency"
            description="Total expenditures ($M) — all available fiscal years"
            source="CT Open Checkbook via data.ct.gov"
            live
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spendByAgency} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
              <Tooltip formatter={(v: number) => [`$${v}M`, 'Expenditures']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="total" fill="#0072ce" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System status panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="CT Data Portal — Dataset Status" description="Live connectivity check for each data source" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: 'Labor / Unemployment', key: 'n7iy-f2vf' },
            { name: 'COVID-19 Cases', key: 'rf3k-f8fg' },
            { name: 'State Checkbook', key: 'cyay-hrve' },
            { name: 'Graduation Rates', key: '9k2y-kqxn' },
            { name: 'Crash Statistics', key: '73jg-3sby' },
            { name: 'Town Profiles', key: 'ukr5-vzdz' },
          ].map(ds => (
            <div key={ds.key} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-700 leading-tight">{ds.name}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ds.key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
