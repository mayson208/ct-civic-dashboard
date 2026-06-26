import { useMemo, useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { useCovid } from '../hooks/useSocrataData'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import type { CovidRow } from '../api/socrata'

// Deterministic mock public-health indicators (CT-realistic values)
const HEALTH_INDICATORS = [
  { indicator: 'Adult Obesity Rate',             value: '27.4%', benchmark: '30.2% (US avg)', status: 'good',    source: 'CT DPH' },
  { indicator: 'Adult Smoking Rate',             value: '13.1%', benchmark: '14.0% (US avg)', status: 'good',    source: 'CT DPH' },
  { indicator: 'Uninsured Rate',                 value: '6.2%',  benchmark: '9.2% (US avg)',  status: 'good',    source: 'CT DPH' },
  { indicator: 'Opioid Overdose Deaths/100k',    value: '33.1',  benchmark: '24.1 (US avg)',  status: 'warning', source: 'CT DPH' },
  { indicator: 'Mental Health Provider Rate',    value: '340/100k', benchmark: '210 (US avg)', status: 'good',   source: 'HRSA' },
  { indicator: 'Preventable Hosp. Rate/100k',   value: '1,890', benchmark: '2,100 (US avg)', status: 'good',    source: 'CT DPH' },
  { indicator: 'Childhood Lead Poisoning Rate',  value: '0.8%',  benchmark: '1.9% (US avg)', status: 'good',    source: 'CT DPH' },
  { indicator: 'Teen Birth Rate/1,000',          value: '10.2',  benchmark: '15.4 (US avg)',  status: 'good',    source: 'CT DPH' },
  { indicator: 'Flu Vaccination Rate (65+)',     value: '71.3%', benchmark: '64.1% (US avg)', status: 'good',    source: 'CDC' },
  { indicator: 'Low-Birthweight Infants',        value: '8.2%',  benchmark: '8.5% (US avg)',  status: 'good',    source: 'CT DPH' },
]

const HOSPITAL_SYSTEMS = [
  { name: 'Yale New Haven Health',    beds: 2614, region: 'South CT',    trauma: 'Level I',   er24h: true  },
  { name: 'Hartford HealthCare',      beds: 2290, region: 'North CT',    trauma: 'Level II',  er24h: true  },
  { name: 'Trinity Health of NE',     beds: 1180, region: 'Central CT',  trauma: 'Level II',  er24h: true  },
  { name: 'Nuvance Health',           beds: 980,  region: 'West CT',     trauma: 'Level III', er24h: true  },
  { name: 'Backus Hospital',          beds: 213,  region: 'East CT',     trauma: 'Level III', er24h: true  },
  { name: 'Windham Hospital',         beds: 130,  region: 'Northeast CT',trauma: 'None',      er24h: true  },
]

export default function PublicHealthPage() {
  const { data: covid, isLoading } = useCovid({ limit: 500, order: 'date DESC' })
  const [metric, setMetric] = useState<'cases' | 'deaths'>('cases')

  const sortedCovid = useMemo(() => {
    if (!covid) return []
    return [...covid]
      .filter(r => r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [covid])

  const covidTrend = useMemo(() => {
    return sortedCovid.map(r => ({
      date: r.date.slice(0, 10),
      label: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      cases: parseInt(r.towntotalcases || '0'),
      deaths: parseInt(r.towntotaldeaths || '0'),
    }))
  }, [sortedCovid])

  // Week-over-week new cases (delta)
  const newCasesTrend = useMemo(() => {
    return covidTrend.slice(1).map((r, i) => ({
      label: r.label,
      newCases: Math.max(0, r.cases - covidTrend[i].cases),
      newDeaths: Math.max(0, r.deaths - covidTrend[i].deaths),
    })).filter(r => r.newCases > 0 || r.newDeaths > 0).slice(-40)
  }, [covidTrend])

  const peak = useMemo(() => {
    if (!newCasesTrend.length) return { cases: 0, deaths: 0 }
    return {
      cases: Math.max(...newCasesTrend.map(r => r.newCases)),
      deaths: Math.max(...newCasesTrend.map(r => r.newDeaths)),
    }
  }, [newCasesTrend])

  const latest = covidTrend[covidTrend.length - 1]

  const exportCSV = () => {
    if (!covid) return
    const rows: string[][] = [['Date', 'Total Cases', 'Confirmed', 'Probable', 'Total Deaths'],
      ...covid.map((r: CovidRow) => [r.date, r.towntotalcases || '', r.confirmedcases || '', r.probablecases || '', r.towntotaldeaths || ''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ct_covid_data.csv'; a.click()
  }

  if (isLoading) return <LoadingSpinner message="Loading CT public health data…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Public Health</h1>
          <p className="text-slate-500 text-sm mt-1">COVID-19 surveillance, health indicators, and hospital capacity · CT DPH via data.ct.gov</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition">
          ⬇ Export COVID CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Confirmed Cases" value={latest?.cases?.toLocaleString() || '—'} subtitle="Cumulative statewide" icon="🦠" color="red" />
        <KPICard title="Total Deaths" value={latest?.deaths?.toLocaleString() || '—'} subtitle="Cumulative statewide" icon="📉" color="slate" />
        <KPICard title="Case Fatality Rate" value={latest?.cases ? `${(latest.deaths / latest.cases * 100).toFixed(2)}%` : '—'} subtitle="Deaths / confirmed cases" icon="⚕️" color="yellow" />
        <KPICard title="Peak Daily New Cases" value={peak.cases.toLocaleString()} subtitle="Highest single-period spike" icon="📈" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cumulative area chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <SectionHeader title="Cumulative COVID-19 Trend" description="Total cases & deaths over time" live />
            <div className="ml-auto flex gap-1">
              {(['cases', 'deaths'] as const).map(m => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${metric === m ? 'bg-ct-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {m === 'cases' ? 'Cases' : 'Deaths'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={covidTrend}>
              <defs>
                <linearGradient id="covidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric === 'cases' ? '#ef4444' : '#64748b'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric === 'cases' ? '#ef4444' : '#64748b'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={15} />
              <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey={metric} fill="url(#covidGrad)" stroke={metric === 'cases' ? '#ef4444' : '#64748b'} strokeWidth={2} dot={false} name={metric === 'cases' ? 'Total Cases' : 'Total Deaths'} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* New cases per period */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="New Cases per Reporting Period" description="Period-over-period change — spike detection" live />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newCasesTrend}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={8} />
              <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="newCases" name="New Cases" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health indicators table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Population Health Indicators" description="Key public health metrics vs. US national benchmarks · CT DPH, CDC" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-3 py-2">Indicator</th>
                <th className="text-right px-3 py-2">CT Value</th>
                <th className="text-right px-3 py-2">Benchmark</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {HEALTH_INDICATORS.map(h => (
                <tr key={h.indicator} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{h.indicator}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800">{h.value}</td>
                  <td className="px-3 py-2 text-right text-slate-400">{h.benchmark}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${h.status === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {h.status === 'good' ? '✓ Better' : '⚠ Monitor'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{h.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital capacity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Hospital Systems — Capacity Overview" description="Major health systems by bed count, region, and trauma designation · CT DPH" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {HOSPITAL_SYSTEMS.map(h => (
            <div key={h.name} className="border border-slate-100 rounded-xl p-3 bg-slate-50 hover:bg-white hover:border-slate-200 transition">
              <p className="font-bold text-slate-800 text-sm">{h.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{h.region}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-bold text-ct-blue">{h.beds.toLocaleString()} beds</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${h.trauma === 'Level I' ? 'bg-red-100 text-red-700' : h.trauma === 'Level II' ? 'bg-amber-100 text-amber-700' : h.trauma === 'Level III' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {h.trauma}
                </span>
                {h.er24h && <span className="text-xs text-emerald-600 font-semibold">24h ER</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
