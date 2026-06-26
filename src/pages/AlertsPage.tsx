import { useMemo, useState } from 'react'
import { useUnemployment, useGraduation, useCrashes } from '../hooks/useSocrataData'
import LoadingSpinner from '../components/LoadingSpinner'

type Severity = 'critical' | 'warning' | 'info' | 'ok'
type Domain = 'labor' | 'education' | 'safety' | 'health' | 'budget' | 'housing'

interface Alert {
  id: string
  domain: Domain
  severity: Severity
  title: string
  description: string
  metric: string
  threshold: string
  actual: string
  action: string
  ts: string
}

const STATIC_ALERTS: Alert[] = [
  {
    id: 'a1', domain: 'health', severity: 'warning',
    title: 'Opioid Overdose Rate Exceeds National Benchmark',
    description: 'CT opioid overdose deaths per 100k (33.1) remain 37% above the US average (24.1). Rate has not declined for 3 consecutive reporting periods.',
    metric: 'Opioid Deaths per 100k', threshold: '≤24.1 (US avg)', actual: '33.1', ts: '2024-11-15',
    action: 'Escalate to CT DPH — review naloxone distribution coverage and harm reduction funding allocation in FY2026 budget request.',
  },
  {
    id: 'a2', domain: 'housing', severity: 'warning',
    title: 'Housing Inventory at 2.3 Months — Below Balanced Market Threshold',
    description: 'CT housing inventory is at 2.3 months supply, well below the 5-6 months considered a balanced market. Multiple counties under 2 months. Year-over-year price growth of 7.5%+ risks affordability erosion.',
    metric: 'Months of Housing Supply', threshold: '≥4.0 months (balanced)', actual: '2.3 months', ts: '2024-12-01',
    action: 'Flag for CT DECD housing task force. Accelerated permitting streamlining via HB 6580 implementation may help unlock supply.',
  },
  {
    id: 'a3', domain: 'budget', severity: 'info',
    title: 'Cybersecurity Portfolio 44% Through Spend, On Pace for FY2026 Request',
    description: 'The statewide Zero Trust cybersecurity program has expended $7.2M of $18M FY2024-25 budget. BEST will likely need FY2026 supplemental appropriation of $4-6M for identity provider migration completion.',
    metric: 'Zero Trust Budget Burn', threshold: '≤70% at midpoint', actual: '40% at midpoint', ts: '2024-12-10',
    action: 'Budget memo to OPM recommended. Preemptive FY2026 supplemental request should be submitted by March 31.',
  },
  {
    id: 'a4', domain: 'labor', severity: 'info',
    title: 'Manufacturing Sector Employment Declining — 3rd Consecutive Year',
    description: 'CT manufacturing employment has declined 2.3% YoY in 2024, following -1.8% in 2023 and -0.9% in 2022. Cumulative 5% job loss over 3 years. Defense manufacturing sub-sector remains stable (Electric Boat, Pratt & Whitney).',
    metric: 'Manufacturing YoY Job Growth', threshold: '≥0%', actual: '-2.3%', ts: '2024-11-30',
    action: 'CT DECD workforce development briefing recommended. Analysis of which sub-sectors are declining vs. stable needed for targeted response.',
  },
]

const SEVERITY_CONFIG: Record<Severity, { bg: string; border: string; badge: string; icon: string; label: string; bar: string }> = {
  critical: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700 border-red-200',       icon: '🚨', label: 'Critical', bar: 'bg-red-500' },
  warning:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⚠️', label: 'Warning',  bar: 'bg-amber-400' },
  info:     { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700 border-blue-200',    icon: 'ℹ️', label: 'Monitor',  bar: 'bg-blue-400' },
  ok:       { bg: 'bg-emerald-50',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',icon:'✅',label:'On Track',bar:'bg-emerald-500' },
}

const DOMAIN_LABELS: Record<Domain, string> = {
  labor: 'Labor', education: 'Education', safety: 'Public Safety', health: 'Health', budget: 'Budget', housing: 'Housing',
}

export default function AlertsPage() {
  const { data: unemp, isLoading } = useUnemployment({ limit: 500 })
  const { data: grad } = useGraduation()
  const { data: crashes } = useCrashes()
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')
  const [filterDomain, setFilterDomain] = useState<Domain | 'all'>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Generate dynamic alerts from live data
  const dynamicAlerts: Alert[] = useMemo(() => {
    const alerts: Alert[] = []

    // Unemployment threshold checks
    const TOWNS_TO_WATCH = ['Hartford', 'Bridgeport', 'New Haven', 'Waterbury']
    TOWNS_TO_WATCH.forEach(town => {
      const rows = unemp?.filter(r => r.town === town) || []
      const latest = rows.sort((a, b) => `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`))[0]
      const rate = parseFloat(latest?.unemployment_rate || '0')
      if (rate >= 7.0) {
        alerts.push({
          id: `unemp-${town}`, domain: 'labor',
          severity: rate >= 9 ? 'critical' : 'warning',
          title: `${town} Unemployment Rate at ${rate}%`,
          description: `${town}'s unemployment rate (${rate}%) exceeds the 7% watch threshold, indicating significant labor market stress. This is ${(rate - 4.1).toFixed(1)} percentage points above the current national rate of 4.1%.`,
          metric: `${town} Unemployment Rate`, threshold: '<7.0%', actual: `${rate}%`, ts: `${latest?.year}-${latest?.month}-01`,
          action: `Coordinate with CT DOL regional office for ${town} — evaluate eligibility for targeted employment programs and workforce development grant applications.`,
        })
      }
    })

    // Graduation threshold check
    const lowGradDistricts = grad?.filter(r => r.year === '2023' && parseFloat(r.graduation_rate || '100') < 80) || []
    if (lowGradDistricts.length > 0) {
      alerts.push({
        id: 'grad-low', domain: 'education',
        severity: lowGradDistricts.length >= 3 ? 'critical' : 'warning',
        title: `${lowGradDistricts.length} District(s) Below 80% Graduation Rate`,
        description: `${lowGradDistricts.map(d => d.district).join(', ')} reported graduation rates below 80% for the 2023 cohort. These districts may be subject to increased CSDE oversight and intervention requirements.`,
        metric: 'Districts below 80% graduation', threshold: '0 districts', actual: `${lowGradDistricts.length} districts`, ts: '2024-01-15',
        action: 'Notify CSDE Office of Student Support — initiate tiered support review and consider redistribution of Title I/II funding.',
      })
    }

    // Crash fatality threshold
    const fatalities2023 = crashes?.filter(r => r.year === '2023').reduce((s, r) => s + parseInt(r.fatalities || '0'), 0) || 0
    if (fatalities2023 > 0) {
      alerts.push({
        id: 'crash-fatal', domain: 'safety',
        severity: fatalities2023 > 350 ? 'critical' : 'warning',
        title: `${fatalities2023} Traffic Fatalities in 2023 — Vision Zero Monitoring`,
        description: `CT recorded ${fatalities2023} traffic fatalities in 2023. Under the CT Vision Zero framework, any year exceeding 280 fatalities triggers mandatory program review and enhanced data reporting requirements.`,
        metric: 'Annual Traffic Fatalities', threshold: '≤280 (Vision Zero target)', actual: String(fatalities2023), ts: '2024-02-01',
        action: 'CT DOT Vision Zero team should review crash hot spots and assess whether high-injury network interventions are on schedule.',
      })
    }

    return alerts
  }, [unemp, grad, crashes])

  const allAlerts = useMemo(() => [...dynamicAlerts, ...STATIC_ALERTS].filter(a => !dismissed.has(a.id)), [dynamicAlerts, dismissed])

  const filtered = useMemo(() =>
    allAlerts.filter(a =>
      (filterSeverity === 'all' || a.severity === filterSeverity) &&
      (filterDomain === 'all' || a.domain === filterDomain)
    ),
    [allAlerts, filterSeverity, filterDomain]
  )

  const counts = useMemo(() => ({
    critical: allAlerts.filter(a => a.severity === 'critical').length,
    warning:  allAlerts.filter(a => a.severity === 'warning').length,
    info:     allAlerts.filter(a => a.severity === 'info').length,
    ok:       allAlerts.filter(a => a.severity === 'ok').length,
  }), [allAlerts])

  if (isLoading) return <LoadingSpinner message="Evaluating metric thresholds…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Governance Alerts</h1>
        <p className="text-slate-500 text-sm mt-1">Automated threshold monitoring — metrics that require attention, escalation, or action from CT agencies</p>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([['critical', counts.critical], ['warning', counts.warning], ['info', counts.info], ['ok', counts.ok]] as [Severity, number][]).map(([sev, count]) => {
          const cfg = SEVERITY_CONFIG[sev]
          return (
            <button key={sev} onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
              className={`rounded-xl border p-3 text-center transition cursor-pointer hover:shadow-md ${cfg.bg} ${cfg.border} ${filterSeverity === sev ? 'ring-2 ring-offset-1 ring-ct-blue' : ''}`}>
              <p className="text-2xl">{cfg.icon}</p>
              <p className="text-xl font-black text-slate-800">{count}</p>
              <p className="text-xs font-semibold text-slate-500">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-2 flex-wrap items-center text-xs">
        <span className="font-semibold text-slate-500">Domain:</span>
        {(['all', 'labor', 'education', 'safety', 'health', 'budget', 'housing'] as const).map(d => (
          <button key={d} onClick={() => setFilterDomain(d)}
            className={`px-2 py-1 rounded-lg font-semibold transition border ${filterDomain === d ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {d === 'all' ? 'All' : DOMAIN_LABELS[d]}
          </button>
        ))}
        <span className="ml-auto text-slate-400">{filtered.length} alert{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-emerald-700">No alerts for selected filters</p>
            <p className="text-sm text-emerald-600 mt-1">All tracked metrics are within acceptable thresholds</p>
          </div>
        )}
        {filtered.map(alert => {
          const cfg = SEVERITY_CONFIG[alert.severity]
          return (
            <div key={alert.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${alert.severity === 'critical' ? 'border-red-200' : ''}`}>
              <div className={`h-1.5 ${cfg.bar}`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0 mt-0.5">{cfg.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-medium">{DOMAIN_LABELS[alert.domain]}</span>
                        <span className="text-xs text-slate-400">{alert.ts}</span>
                      </div>
                      <p className="font-bold text-slate-800 mt-1 text-sm">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setDismissed(d => new Set([...d, alert.id]))}
                    className="text-slate-300 hover:text-slate-500 text-xs flex-shrink-0 print:hidden" title="Dismiss">✕</button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-xs text-slate-400">Metric</p>
                    <p className="text-xs font-semibold text-slate-700">{alert.metric}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-xs text-slate-400">Threshold</p>
                    <p className="text-xs font-semibold text-emerald-700">{alert.threshold}</p>
                  </div>
                  <div className={`rounded-lg p-2 border ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' : alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                    <p className="text-xs text-slate-400">Actual</p>
                    <p className={`text-xs font-bold ${alert.severity === 'critical' ? 'text-red-700' : alert.severity === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>{alert.actual}</p>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-slate-500"><span className="font-semibold text-amber-700">Recommended Action: </span>{alert.action}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {dismissed.size > 0 && (
        <button onClick={() => setDismissed(new Set())} className="text-xs text-ct-sky hover:underline">
          Restore {dismissed.size} dismissed alert{dismissed.size !== 1 ? 's' : ''}
        </button>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-600 mb-1">How alerts work</p>
        <p>Dynamic alerts (labor, education, safety) are generated in real-time by evaluating live data from data.ct.gov against configurable thresholds. Static alerts represent pre-loaded policy findings from CT agency reports. All alerts are local to this session — production deployment would persist alerts to a database and support email/SMS notification routing.</p>
      </div>
    </div>
  )
}
