import { useMemo, useState } from 'react'
import KPICard from '../components/KPICard'

type Impact = 1 | 2 | 3 | 4 | 5
type Likelihood = 1 | 2 | 3 | 4 | 5
type Category = 'Technical' | 'Security' | 'Budget' | 'Schedule' | 'Vendor' | 'Policy' | 'Operational'
type MitigationStatus = 'Planned' | 'In Progress' | 'Monitoring' | 'Accepted' | 'Resolved'

interface Risk {
  id: string
  title: string
  description: string
  category: Category
  impact: Impact
  likelihood: Likelihood
  owner: string
  program: string
  dueDate: string
  status: MitigationStatus
  mitigation: string
  contingency: string
  lastReviewed: string
}

const RISKS: Risk[] = [
  {
    id: 'R-001', title: 'Legacy Mainframe Migration — Data Loss During Cutover',
    description: 'DMV legacy mainframe holds 40+ years of motor vehicle records. Parallel-run window of 72 hours may be insufficient to validate all record types before irreversible cutover.',
    category: 'Technical', impact: 5, likelihood: 2, owner: 'R. Chudworth', program: 'DMV Modernization',
    dueDate: '2025-03-01', status: 'In Progress', lastReviewed: '2024-12-10',
    mitigation: 'Extend parallel-run to 14 days; implement automated record count reconciliation hourly; dedicated rollback DBA on standby.',
    contingency: 'Rollback to mainframe if reconciliation errors exceed 0.01% threshold; delay go-live by up to 60 days.',
  },
  {
    id: 'R-002', title: 'CTDOL Benefits Portal — Vendor Delivery Delay',
    description: 'Primary vendor (Deloitte) is running 6 weeks behind on UAT deliverables. If delay extends to 8 weeks it will breach the ARPA expenditure deadline for the benefits module.',
    category: 'Vendor', impact: 4, likelihood: 3, owner: 'R. Chudworth', program: 'CTDOL Benefits Portal',
    dueDate: '2025-01-15', status: 'In Progress', lastReviewed: '2024-12-12',
    mitigation: 'Weekly vendor delivery reviews with escalation to VP level; SLA penalty clauses invoked; parallel CT in-house dev team standing by for critical path modules.',
    contingency: 'Request OPM extension for ARPA deadline; activate contingency vendor (IBM) for remaining 3 modules.',
  },
  {
    id: 'R-003', title: 'Zero Trust — Identity Provider Scope Creep',
    description: 'Statewide IdP migration initially scoped for 8,400 employees has expanded to include 12,200 contractors and vendor accounts. Original licensing and infrastructure sizing underestimated by ~35%.',
    category: 'Budget', impact: 4, likelihood: 4, owner: 'BEST / R. Chudworth', program: 'Zero Trust Cybersecurity',
    dueDate: '2025-02-28', status: 'In Progress', lastReviewed: '2024-12-08',
    mitigation: 'Phased rollout: state employees only in Phase 1; contractors in Phase 2 (FY2026 budget). Renegotiating Microsoft E5 licensing for volume discount.',
    contingency: 'FY2026 supplemental appropriation of $4.2M submitted to OPM. Fallback: exclude contractor accounts until FY2026 funding secured.',
  },
  {
    id: 'R-004', title: 'CT.gov Accessibility — Third-Party Widget Non-Compliance',
    description: '14 third-party embedded widgets (payment processor, chat, maps) are not WCAG 2.1 AA compliant. DOJ settlement terms require full compliance by June 2025.',
    category: 'Policy', impact: 4, likelihood: 3, owner: 'DAS / BEST', program: 'CT.gov Accessibility',
    dueDate: '2025-06-01', status: 'In Progress', lastReviewed: '2024-11-30',
    mitigation: 'Vendor remediation contracts issued for 9 of 14 widgets. Remaining 5 will be replaced with WCAG-compliant alternatives (3 identified, 2 under RFP).',
    contingency: 'DOJ extension request submitted through AG office. Worst case: remove non-compliant widgets temporarily (affects 3 citizen-facing services).',
  },
  {
    id: 'R-005', title: 'Data Lake — PII Data Classification Gap',
    description: 'Phase 1 ingestion included 3 agency datasets later found to contain unmasked PII (SSN fragments, DOB). Current NIST 800-53 control gap may constitute a reportable incident under CGS §36a-701b.',
    category: 'Security', impact: 5, likelihood: 3, owner: 'CISO / R. Chudworth', program: 'Enterprise Data Lake',
    dueDate: '2024-12-31', status: 'In Progress', lastReviewed: '2024-12-14',
    mitigation: 'Immediate quarantine of 3 datasets; retroactive DLP scan in progress; updated data classification schema with automated PII detection (Macie) being deployed.',
    contingency: 'Notify AG per CGS §36a-701b if PII confirmed accessible. Forensic log review to determine if any unauthorized access occurred.',
  },
  {
    id: 'R-006', title: 'e-Filing Rollout — Judicial Staff Change Resistance',
    description: 'Pilot survey of 240 court clerks showed 38% strongly oppose mandatory e-filing workflow. Union representatives have requested delay pending additional training (CT JJPOA).',
    category: 'Operational', impact: 3, likelihood: 4, owner: 'Judicial / PM Office', program: 'Courts e-Filing',
    dueDate: '2025-04-01', status: 'Planned', lastReviewed: '2024-12-01',
    mitigation: 'Mandatory 4-hour training program launched; dedicated help desk queue; superuser program (1 per 15 clerks); union liaison added to project steering committee.',
    contingency: 'Defer mandatory adoption by 90 days; extend voluntary adoption period; escalate to Judicial Administrator if union dispute continues.',
  },
  {
    id: 'R-007', title: 'DCF Case Management — Cloud Migration Latency',
    description: 'Preliminary load testing showed 2.8-second average page load in the new cloud environment vs 0.9 seconds on-prem. DCF workers require sub-1.5s performance for field tablet use.',
    category: 'Technical', impact: 3, likelihood: 3, owner: 'BEST / Vendor', program: 'DCF Case Management',
    dueDate: '2025-05-01', status: 'Planned', lastReviewed: '2024-11-15',
    mitigation: 'CDN configuration review; database query optimization sprint; edge caching for static assets; upgrade cloud region from us-east-1 to us-east-2 (lower latency to CT).',
    contingency: 'If latency goal not met by load-test deadline, defer cloud migration for field-facing modules; hybrid deployment (cloud admin, on-prem field).',
  },
  {
    id: 'R-008', title: 'BEAD Broadband — Rural Last-Mile Cost Overrun',
    description: 'Engineering surveys for Windham and Tolland counties show ISP cost estimates 22% above BEAD grant allocation for last-mile fiber. Potential $12M funding gap.',
    category: 'Budget', impact: 3, likelihood: 4, owner: 'DECD / NTIA liaison', program: 'BEAD Broadband',
    dueDate: '2025-09-30', status: 'Monitoring', lastReviewed: '2024-12-05',
    mitigation: 'Request BEAD waiver for 3 highest-cost areas; explore supplemental USDA ReConnect funding; co-fund with municipal dark fiber in Windham.',
    contingency: 'Deprioritize satellite-alternative areas; redraw service maps to exclude highest-cost parcels (est. 840 addresses) from grant scope.',
  },
]

const riskScore = (r: Risk) => r.impact * r.likelihood
const riskLevel = (score: number) => score >= 16 ? 'critical' : score >= 9 ? 'high' : score >= 4 ? 'medium' : 'low'
const RISK_COLORS: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e' }
const RISK_BG: Record<string, string> = { critical: 'bg-red-50 border-red-200', high: 'bg-amber-50 border-amber-200', medium: 'bg-blue-50 border-blue-200', low: 'bg-emerald-50 border-emerald-200' }
const STATUS_COLORS: Record<MitigationStatus, string> = {
  'Planned': 'bg-slate-100 text-slate-600', 'In Progress': 'bg-blue-100 text-blue-700',
  'Monitoring': 'bg-amber-100 text-amber-700', 'Accepted': 'bg-purple-100 text-purple-700', 'Resolved': 'bg-emerald-100 text-emerald-700',
}
const CAT_ICONS: Record<Category, string> = {
  Technical: '⚙️', Security: '🔒', Budget: '💰', Schedule: '📅', Vendor: '🤝', Policy: '📜', Operational: '🏢',
}

export default function RiskRegisterPage() {
  const [filterCat, setFilterCat] = useState<Category | 'All'>('All')
  const [filterLevel, setFilterLevel] = useState<'All' | 'critical' | 'high' | 'medium' | 'low'>('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [showMatrix, setShowMatrix] = useState(false)

  const withScores = useMemo(() => RISKS.map(r => ({ ...r, score: riskScore(r), level: riskLevel(riskScore(r)) })), [])

  const filtered = useMemo(() =>
    withScores
      .filter(r => (filterCat === 'All' || r.category === filterCat) && (filterLevel === 'All' || r.level === filterLevel))
      .sort((a, b) => b.score - a.score),
    [withScores, filterCat, filterLevel]
  )

  const selectedRisk = selected ? withScores.find(r => r.id === selected) : null

  const counts = useMemo(() => ({
    critical: withScores.filter(r => r.level === 'critical').length,
    high: withScores.filter(r => r.level === 'high').length,
    medium: withScores.filter(r => r.level === 'medium').length,
    low: withScores.filter(r => r.level === 'low').length,
  }), [withScores])

  // 5x5 risk matrix data
  const matrixCell = (i: Likelihood, l: Impact) => withScores.filter(r => r.impact === l && r.likelihood === i)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">IT Program Risk Register</h1>
        <p className="text-slate-500 text-sm mt-1">Active risks across CT state IT programs — impact × likelihood scoring, mitigation status, and contingency plans</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([['critical', '🚨', 'Critical'], ['high', '⚠️', 'High'], ['medium', 'ℹ️', 'Medium'], ['low', '✅', 'Low']] as const).map(([level, icon, label]) => (
          <button key={level} onClick={() => setFilterLevel(filterLevel === level ? 'All' : level)}
            className={`rounded-xl border p-3 text-center transition hover:shadow-md ${filterLevel === level ? 'ring-2 ring-offset-1 ring-ct-blue' : ''} ${RISK_BG[level]}`}>
            <p className="text-2xl">{icon}</p>
            <p className="text-xl font-black text-slate-800">{counts[level]}</p>
            <p className="text-xs font-semibold text-slate-500">{label} Risk</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex gap-1.5 flex-wrap flex-1">
          <span className="font-semibold text-slate-500 self-center">Category:</span>
          {(['All', 'Technical', 'Security', 'Budget', 'Schedule', 'Vendor', 'Policy', 'Operational'] as const).map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-2 py-1 rounded-lg font-semibold transition border ${filterCat === c ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {c !== 'All' && CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>
        <button onClick={() => setShowMatrix(!showMatrix)}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold transition shadow-sm ${showMatrix ? 'bg-ct-blue text-white border-ct-blue' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {showMatrix ? '▼ Hide' : '▶ Show'} Risk Matrix
        </button>
      </div>

      {/* 5x5 Risk Matrix */}
      {showMatrix && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-3">5×5 Risk Probability-Impact Matrix</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-slate-400 font-normal text-right pr-3 w-20">Impact →<br/>Likelihood ↓</th>
                  {[1,2,3,4,5].map(i => <th key={i} className="p-1 text-center text-slate-500 w-24">{['Negligible','Minor','Moderate','Major','Catastrophic'][i-1]}<br/><span className="text-slate-300">({i})</span></th>)}
                </tr>
              </thead>
              <tbody>
                {([5,4,3,2,1] as Likelihood[]).map(l => (
                  <tr key={l}>
                    <td className="p-1 text-right pr-3 text-slate-500">{['Rare','Unlikely','Possible','Likely','Almost Certain'][l-1]} ({l})</td>
                    {([1,2,3,4,5] as Impact[]).map(i => {
                      const score = i * l
                      const level = riskLevel(score)
                      const risks = matrixCell(l, i)
                      const bg = score >= 16 ? 'bg-red-100 border-red-200' : score >= 9 ? 'bg-amber-100 border-amber-200' : score >= 4 ? 'bg-blue-100 border-blue-200' : 'bg-emerald-100 border-emerald-200'
                      return (
                        <td key={i} className={`p-1 border text-center ${bg} min-w-20`}>
                          <div className="text-slate-500 text-xs font-bold">{score}</div>
                          {risks.map(r => (
                            <div key={r.id} onClick={() => setSelected(r.id)}
                              className="mt-0.5 text-xs px-1 py-0.5 bg-white/70 rounded cursor-pointer hover:bg-white font-medium text-slate-700 leading-tight">
                              {r.id}
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-2">Click a risk ID in the matrix to view its detail card below.</p>
          </div>
        </div>
      )}

      {/* Risk list + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-slate-500 px-1">{filtered.length} risk{filtered.length !== 1 ? 's' : ''} — sorted by score</p>
          {filtered.map(r => (
            <button key={r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}
              className={`w-full text-left rounded-xl border p-3 transition shadow-sm ${selected === r.id ? 'ring-2 ring-ct-blue border-ct-blue' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-400">{r.id}</span>
                    <span className="text-xs">{CAT_ICONS[r.category]}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded`} style={{ background: RISK_COLORS[r.level] + '20', color: RISK_COLORS[r.level] }}>
                      {r.level.toUpperCase()}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">{r.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.program}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: RISK_COLORS[r.level] }}>
                    {r.score}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{r.impact}×{r.likelihood}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-400 text-xs">No risks match filters</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedRisk ? (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-4" style={{ borderColor: RISK_COLORS[selectedRisk.level] + '60' }}>
              <div className="h-1.5" style={{ background: RISK_COLORS[selectedRisk.level] }} />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-400 text-sm">{selectedRisk.id}</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full text-white" style={{ background: RISK_COLORS[selectedRisk.level] }}>
                        {selectedRisk.level.toUpperCase()} · Score {selectedRisk.score}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedRisk.status]}`}>{selectedRisk.status}</span>
                    </div>
                    <h2 className="text-sm font-black text-slate-800 mt-1">{selectedRisk.title}</h2>
                    <p className="text-xs text-ct-sky font-semibold">{selectedRisk.program} · Owner: {selectedRisk.owner}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-500 text-lg">✕</button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{selectedRisk.description}</p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Impact', String(selectedRisk.impact) + ' / 5', RISK_COLORS[selectedRisk.level]],
                    ['Likelihood', String(selectedRisk.likelihood) + ' / 5', RISK_COLORS[selectedRisk.level]],
                    ['Risk Score', String(selectedRisk.score) + ' / 25', RISK_COLORS[selectedRisk.level]],
                  ].map(([label, val, color]) => (
                    <div key={label} className="rounded-lg p-2 border border-slate-100 bg-slate-50 text-center">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-base font-black" style={{ color }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1">Mitigation Strategy</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedRisk.mitigation}</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1">Contingency Plan</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedRisk.contingency}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                  <span>Category: {CAT_ICONS[selectedRisk.category]} {selectedRisk.category}</span>
                  <span>Due: <strong className="text-slate-600">{selectedRisk.dueDate}</strong></span>
                  <span>Last reviewed: <strong className="text-slate-600">{selectedRisk.lastReviewed}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-10 text-center h-64 flex flex-col items-center justify-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-slate-500 font-medium">Select a risk to view details</p>
              <p className="text-slate-400 text-xs mt-1">Impact, likelihood, mitigation, and contingency plans</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-ct-light rounded-xl border border-ct-blue/20 p-4 text-xs text-ct-navy">
        <p className="font-bold mb-1">Risk Register Methodology</p>
        <p>Risks scored using PMBOK-aligned 5×5 probability-impact matrix. Scores ≥16 are Critical (immediate escalation), 9–15 are High (weekly review), 4–8 are Medium (biweekly), &lt;4 are Low (monthly). All risks owned by program PMs and reviewed at monthly steering committee. Register maintained in JIRA/Confluence and updated after each phase gate.</p>
      </div>
    </div>
  )
}
