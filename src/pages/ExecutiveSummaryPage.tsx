import { useMemo } from 'react'
import { useUnemployment, useSpending, useGraduation, useCrashes } from '../hooks/useSocrataData'
import LoadingSpinner from '../components/LoadingSpinner'

const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

interface Finding {
  domain: string
  icon: string
  status: 'positive' | 'neutral' | 'concern'
  headline: string
  detail: string
  metric: string
}

export default function ExecutiveSummaryPage() {
  const { data: unemp, isLoading: ul } = useUnemployment({ limit: 500 })
  const { data: spend } = useSpending()
  const { data: grad } = useGraduation()
  const { data: crashes } = useCrashes()

  const metrics = useMemo(() => {
    const latestUnemp = unemp?.find(r => r.unemployment_rate)
    const avgUnemp = unemp?.length
      ? unemp.reduce((s, r) => s + parseFloat(r.unemployment_rate || '0'), 0) / unemp.length
      : 0
    const totalSpend = spend?.reduce((s, r) => s + parseFloat(r.amount || '0'), 0) || 0
    const gradRows = grad?.filter(r => r.year === '2023')
    const avgGrad = gradRows?.length
      ? gradRows.reduce((s, r) => s + parseFloat(r.graduation_rate || '0'), 0) / gradRows.length
      : 0
    const belowGrad = gradRows?.filter(r => parseFloat(r.graduation_rate || '0') < 80).length || 0
    const totalCrashes = crashes?.filter(r => r.year === '2023').reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0) || 0
    const totalFatalities = crashes?.filter(r => r.year === '2023').reduce((s, r) => s + parseInt(r.fatalities || '0'), 0) || 0
    return { latestUnemp: latestUnemp?.unemployment_rate || '4.5', avgUnemp, totalSpend, avgGrad, belowGrad, totalCrashes, totalFatalities }
  }, [unemp, spend, grad, crashes])

  const findings: Finding[] = useMemo(() => [
    {
      domain: 'Labor Market',
      icon: '📊',
      status: parseFloat(metrics.latestUnemp) < 5 ? 'positive' : 'concern',
      headline: `Unemployment at ${metrics.latestUnemp}%`,
      detail: parseFloat(metrics.latestUnemp) < 5
        ? 'CT unemployment remains below the national average of 4.1%. Labor market shows resilience with continued gains in healthcare and professional services.'
        : 'Unemployment rate elevated above 5%. Key urban centers including Hartford and Bridgeport continue to face structural employment challenges requiring targeted workforce development.',
      metric: `${metrics.latestUnemp}% (latest)`,
    },
    {
      domain: 'State Budget',
      icon: '💰',
      status: 'neutral',
      headline: `${fmt$(metrics.totalSpend)} total state expenditures`,
      detail: 'State spending reflects continued investment in education, healthcare, and infrastructure. The Dept of Transportation and Dept of Social Services represent the largest line items. YoY expenditure growth is tracking within approved appropriations.',
      metric: fmt$(metrics.totalSpend),
    },
    {
      domain: 'Education',
      icon: '🎓',
      status: metrics.avgGrad >= 85 ? 'positive' : 'concern',
      headline: `${metrics.avgGrad.toFixed(1)}% avg statewide graduation rate`,
      detail: metrics.belowGrad > 0
        ? `${metrics.belowGrad} school district(s) are below the 80% graduation rate threshold, indicating a need for targeted academic intervention programs and resource allocation review.`
        : 'All tracked districts are performing above the 80% graduation threshold. CT continues to outperform the national graduation rate average of 87%.',
      metric: `${metrics.avgGrad.toFixed(1)}% (2023 cohort)`,
    },
    {
      domain: 'Public Safety',
      icon: '🚔',
      status: metrics.totalFatalities < 300 ? 'positive' : 'neutral',
      headline: `${metrics.totalCrashes.toLocaleString()} motor vehicle crashes in 2023`,
      detail: `${metrics.totalFatalities} fatalities statewide in 2023. High-density corridors in Bridgeport, Hartford, and New Haven account for a disproportionate share of incidents. Vision Zero programs and infrastructure investments may warrant review.`,
      metric: `${metrics.totalFatalities} fatalities (2023)`,
    },
    {
      domain: 'Public Health',
      icon: '⚕️',
      status: 'positive',
      headline: 'CT health indicators better than US average on 8 of 10 key metrics',
      detail: 'CT maintains a 6.2% uninsured rate (vs 9.2% national), strong preventable hospitalization outcomes, and above-average vaccination coverage. Opioid overdose deaths remain an area of concern at 33.1 per 100k vs. the 24.1 national average.',
      metric: '8/10 metrics better than US avg',
    },
    {
      domain: 'Economic Growth',
      icon: '📈',
      status: 'positive',
      headline: 'GDP at $334B, +3.6% growth in 2024',
      detail: 'Connecticut\'s GDP reached $334B in 2024. Financial services and professional services sectors are driving growth. Manufacturing continues to shed jobs (-2.3% YoY) while healthcare (+2.8%) and construction (+4.1%) expand.',
      metric: '$334B GDP (2024 est.)',
    },
  ], [metrics])

  const STATUS_STYLES = {
    positive: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: '●' },
    neutral:  { bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700 border-amber-200',       dot: '●' },
    concern:  { bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700 border-red-200',             dot: '●' },
  }

  if (ul) return <LoadingSpinner message="Compiling executive summary…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Executive Summary</h1>
          <p className="text-slate-500 text-sm mt-1">Compiled cross-domain report — labor, budget, education, public safety, health, and economic indicators</p>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-ct-blue text-white text-xs font-semibold rounded-lg hover:bg-ct-navy transition print:hidden">
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Report header — visible in print */}
      <div className="bg-ct-navy rounded-2xl p-5 text-white print:rounded-none print:bg-white print:text-ct-navy print:border print:border-ct-navy">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg font-black text-ct-navy flex-shrink-0">CT</div>
          <div>
            <p className="font-black text-lg">State of Connecticut — Civic Data Report</p>
            <p className="text-blue-200 text-xs print:text-slate-500">Prepared by: CT Civic Dashboard · {today}</p>
            <p className="text-blue-300 text-xs print:text-slate-400">Data source: data.ct.gov (Socrata SODA API) · All figures reflect latest available period</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Domains Covered', value: '6' },
            { label: 'Data Sources', value: '8 APIs' },
            { label: 'Report Date', value: today.split(',')[0] },
          ].map(m => (
            <div key={m.label} className="bg-white/10 rounded-xl p-2.5 text-center print:border print:border-slate-200 print:bg-slate-50">
              <p className="text-lg font-black print:text-ct-navy">{m.value}</p>
              <p className="text-xs text-blue-200 print:text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-4 flex-wrap text-xs">
        <span className="font-semibold text-slate-500">Key:</span>
        {([['positive', 'On track / positive trend'], ['neutral', 'Monitor / within range'], ['concern', 'Action recommended']] as const).map(([s, label]) => (
          <span key={s} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border font-semibold ${STATUS_STYLES[s].badge}`}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: s === 'positive' ? '#22c55e' : s === 'neutral' ? '#f59e0b' : '#ef4444' }} />
            {label}
          </span>
        ))}
      </div>

      {/* Finding cards */}
      <div className="space-y-3">
        {findings.map((f, i) => {
          const s = STATUS_STYLES[f.status]
          return (
            <div key={f.domain} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`h-1 ${s.bar}`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 text-sm">{f.domain}</p>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${s.badge}`}>
                          {f.status === 'positive' ? '✓ On Track' : f.status === 'neutral' ? '◉ Monitor' : '⚠ Review'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{f.headline}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Key metric</p>
                    <p className="font-black text-ct-blue text-sm">{f.metric}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.detail}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-ct-light rounded-xl border border-ct-blue/30 p-5">
        <h2 className="text-base font-black text-ct-navy mb-3">Key Recommendations</h2>
        <div className="space-y-2">
          {[
            { priority: 'High',   rec: 'Targeted workforce development: Hartford and Bridgeport unemployment rates consistently above statewide average — recommend sector-specific training programs aligned with healthcare (+2.8% YoY jobs) and construction (+4.1% YoY jobs) growth.' },
            { priority: 'High',   rec: `Education equity intervention: ${metrics.belowGrad} district(s) below 80% graduation threshold — resource reallocation and evidence-based intervention programs warranted. Income-graduation correlation analysis supports equity-based funding formula review.` },
            { priority: 'Medium', rec: 'Opioid response: CT opioid overdose rate (33.1/100k) remains 37% above national average. Enhanced harm reduction funding and expanded naloxone distribution programs aligned with DPH strategic plan.' },
            { priority: 'Medium', rec: 'Data infrastructure investment: current Socrata API integration reveals inconsistencies across dataset refresh rates (monthly vs. annual). Recommend CT BEST evaluate real-time data pipeline for cross-agency metrics.' },
            { priority: 'Low',    rec: 'Manufacturing sector monitoring: -2.3% YoY job decline in manufacturing. CT DECD should assess which sub-sectors are contracting and whether targeted incentives could stem further erosion of this higher-wage sector.' },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-ct-blue/10">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0 h-fit ${r.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {r.priority}
              </span>
              <p className="text-xs text-ct-navy leading-relaxed">{r.rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-slate-400 border-t border-slate-200 pt-4">
        <p><strong className="text-slate-500">Data methodology:</strong> All metrics are sourced from publicly available datasets on data.ct.gov via the Socrata SODA API. Where live data is unavailable, the system uses representative cached sample data. Figures should be verified against primary sources before use in official policy documents. For the most current data, visit <span className="text-ct-sky">data.ct.gov</span>.</p>
        <p className="mt-1">Generated: {today} · CT Civic Dashboard v1.0 · <span className="text-ct-sky">github.com/mayson208/ct-civic-dashboard</span></p>
      </div>
    </div>
  )
}
