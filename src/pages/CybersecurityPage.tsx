import { useMemo, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT BEST, CISO Office, NIST CSF, MS-ISAC — CT cybersecurity posture data
const NIST_SCORES = [
  { function: 'Identify',     score: 3.2, target: 4.0, description: 'Asset management, risk assessment, governance' },
  { function: 'Protect',      score: 3.6, target: 4.0, description: 'Access control, awareness training, data security' },
  { function: 'Detect',       score: 2.9, target: 3.5, description: 'Anomaly detection, monitoring, detection processes' },
  { function: 'Respond',      score: 3.1, target: 3.8, description: 'Response planning, communications, mitigation' },
  { function: 'Recover',      score: 2.7, target: 3.5, description: 'Recovery planning, improvements, communications' },
]

const INCIDENT_TREND = [
  { month: 'Jan 24', phishing: 184, malware: 28, bruteForce: 64, insider: 4, total: 280 },
  { month: 'Feb 24', phishing: 196, malware: 22, bruteForce: 58, insider: 2, total: 278 },
  { month: 'Mar 24', phishing: 212, malware: 18, bruteForce: 72, insider: 6, total: 308 },
  { month: 'Apr 24', phishing: 168, malware: 24, bruteForce: 54, insider: 3, total: 249 },
  { month: 'May 24', phishing: 198, malware: 20, bruteForce: 62, insider: 2, total: 282 },
  { month: 'Jun 24', phishing: 228, malware: 32, bruteForce: 68, insider: 5, total: 333 },
  { month: 'Jul 24', phishing: 244, malware: 18, bruteForce: 74, insider: 3, total: 339 },
  { month: 'Aug 24', phishing: 186, malware: 14, bruteForce: 58, insider: 2, total: 260 },
  { month: 'Sep 24', phishing: 202, malware: 26, bruteForce: 66, insider: 4, total: 298 },
  { month: 'Oct 24', phishing: 218, malware: 20, bruteForce: 72, insider: 3, total: 313 },
  { month: 'Nov 24', phishing: 194, malware: 16, bruteForce: 60, insider: 2, total: 272 },
  { month: 'Dec 24', phishing: 208, malware: 22, bruteForce: 64, insider: 4, total: 298 },
]

const ZERO_TRUST_PILLARS = [
  { pillar: 'Identity',       complete: 82, inProgress: 14, notStarted: 4, priority: 'Critical' },
  { pillar: 'Devices',        complete: 68, inProgress: 22, notStarted: 10, priority: 'High' },
  { pillar: 'Networks',       complete: 44, inProgress: 38, notStarted: 18, priority: 'High' },
  { pillar: 'Applications',   complete: 36, inProgress: 28, notStarted: 36, priority: 'Medium' },
  { pillar: 'Data',           complete: 28, inProgress: 32, notStarted: 40, priority: 'Medium' },
  { pillar: 'Automation',     complete: 18, inProgress: 24, notStarted: 58, priority: 'Low' },
]

const AGENCY_POSTURE = [
  { agency: 'BEST',     identity: 92, endpoint: 88, network: 78, data: 72, apps: 68, overall: 79.6 },
  { agency: 'DAS',      identity: 84, endpoint: 78, network: 68, data: 62, apps: 58, overall: 70.0 },
  { agency: 'CT DOL',   identity: 72, endpoint: 68, network: 58, data: 52, apps: 64, overall: 62.8 },
  { agency: 'CTDPH',    identity: 68, endpoint: 62, network: 54, data: 74, apps: 52, overall: 62.0 },
  { agency: 'CTDMV',    identity: 74, endpoint: 70, network: 62, data: 58, apps: 72, overall: 67.2 },
  { agency: 'DEEP',     identity: 62, endpoint: 58, network: 52, data: 48, apps: 44, overall: 52.8 },
  { agency: 'DSS',      identity: 58, endpoint: 52, network: 48, data: 84, apps: 48, overall: 58.0 },
  { agency: 'Judicial', identity: 78, endpoint: 74, network: 68, data: 76, apps: 64, overall: 72.0 },
]

const VULN_BY_SEVERITY = [
  { name: 'Critical',    count: 24,  color: '#ef4444' },
  { name: 'High',        count: 142, color: '#f97316' },
  { name: 'Medium',      count: 684, color: '#f59e0b' },
  { name: 'Low',         count: 2840, color: '#22c55e' },
  { name: 'Informational', count: 8420, color: '#94a3b8' },
]

const COMPLIANCE_ITEMS = [
  { control: 'Multi-Factor Authentication (all privileged)', framework: 'NIST 800-53 IA-2', status: 'Compliant', coverage: 96 },
  { control: 'Endpoint Detection & Response (EDR)',           framework: 'NIST 800-53 SI-3', status: 'Compliant', coverage: 94 },
  { control: 'Privileged Access Workstations (PAW)',          framework: 'CIS Control 5',    status: 'Partial',   coverage: 62 },
  { control: 'Continuous Vulnerability Scanning',             framework: 'NIST 800-53 RA-5', status: 'Compliant', coverage: 98 },
  { control: 'Data Loss Prevention (DLP)',                    framework: 'NIST 800-53 SC-7', status: 'Partial',   coverage: 48 },
  { control: 'SIEM / Security Monitoring',                    framework: 'NIST 800-53 AU-6', status: 'Compliant', coverage: 88 },
  { control: 'Security Awareness Training (annual)',          framework: 'NIST 800-53 AT-2', status: 'Compliant', coverage: 92 },
  { control: 'Third-Party Vendor Risk Assessment',            framework: 'NIST 800-53 SA-9', status: 'Partial',   coverage: 54 },
  { control: 'Tabletop / IR Exercise (annual)',               framework: 'NIST 800-61',       status: 'Compliant', coverage: 100 },
  { control: 'Cloud Security Posture Management (CSPM)',      framework: 'CIS Benchmark',    status: 'Planned',   coverage: 12 },
]

const STATUS_CFG = {
  Compliant: 'bg-emerald-100 text-emerald-700',
  Partial:   'bg-amber-100 text-amber-700',
  Planned:   'bg-slate-100 text-slate-600',
  'Non-Compliant': 'bg-red-100 text-red-700',
}

const PRI_CFG = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#22c55e' }

export default function CybersecurityPage() {
  const [radarAgency, setRadarAgency] = useState('BEST')

  const selectedAgency = useMemo(() => AGENCY_POSTURE.find(a => a.agency === radarAgency)!, [radarAgency])
  const radarData = [
    { dim: 'Identity',    value: selectedAgency.identity },
    { dim: 'Endpoint',    value: selectedAgency.endpoint },
    { dim: 'Network',     value: selectedAgency.network },
    { dim: 'Data',        value: selectedAgency.data },
    { dim: 'Applications', value: selectedAgency.apps },
  ]

  const totalIncidents2024 = INCIDENT_TREND.reduce((s, m) => s + m.total, 0)
  const criticalVulns = VULN_BY_SEVERITY.find(v => v.name === 'Critical')!.count
  const overallNIST = (NIST_SCORES.reduce((s, n) => s + n.score, 0) / NIST_SCORES.length).toFixed(1)
  const compliantPct = Math.round(COMPLIANCE_ITEMS.filter(c => c.status === 'Compliant').length / COMPLIANCE_ITEMS.length * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Cybersecurity Posture</h1>
        <p className="text-slate-500 text-sm mt-1">NIST CSF scores, Zero Trust implementation, incident trends, vulnerability management, and BEST compliance · CT CISO / MS-ISAC</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="NIST CSF Score" value={`${overallNIST} / 5.0`} subtitle="Average across 5 functions (target: 3.8)" icon="🛡" color={parseFloat(overallNIST) >= 3.5 ? 'green' : 'yellow'} />
        <KPICard title="2024 Incidents" value={totalIncidents2024.toLocaleString()} subtitle="Security events handled by CT BEST SOC" icon="🚨" color="red" delta={{ value: '+4.2% YoY', positive: false }} />
        <KPICard title="Critical Vulns" value={criticalVulns} subtitle="Open critical-severity findings" icon="⚠️" color={criticalVulns > 20 ? 'red' : 'yellow'} />
        <KPICard title="Compliance" value={`${compliantPct}%`} subtitle={`${COMPLIANCE_ITEMS.filter(c => c.status === 'Compliant').length}/${COMPLIANCE_ITEMS.length} NIST controls met`} icon="✅" color={compliantPct >= 70 ? 'green' : 'yellow'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NIST CSF scores */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="NIST CSF 2.0 — CT Statewide Maturity Scores" description="Self-assessed maturity vs. target maturity by function · CT BEST CISO" />
          <div className="space-y-3 mt-2">
            {NIST_SCORES.map(n => (
              <div key={n.function} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700">{n.function}</span>
                    <span className="text-slate-400 ml-2">{n.description}</span>
                  </div>
                  <span className="font-black" style={{ color: n.score >= n.target * 0.85 ? '#22c55e' : '#f59e0b' }}>{n.score}/{n.target}</span>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${n.score / 5 * 100}%`, background: n.score >= n.target * 0.85 ? '#22c55e' : '#f59e0b' }} />
                  <div className="absolute h-4 w-0.5 -top-0.5 bg-ct-blue opacity-50" style={{ left: `${n.target / 5 * 100}%` }} title={`Target: ${n.target}`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Blue marker = target maturity. CT participates in MS-ISAC peer benchmarking (state gov avg: 3.1 overall)</p>
        </div>

        {/* Agency radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <SectionHeader title="Agency Security Posture" />
            <select value={radarAgency} onChange={e => setRadarAgency(e.target.value)}
              className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
              {AGENCY_POSTURE.map(a => <option key={a.agency}>{a.agency}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="#003087" fill="#003087" fillOpacity={0.18} strokeWidth={2} dot />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-2">Overall Score</p>
              <p className="text-3xl font-black" style={{ color: selectedAgency.overall >= 75 ? '#22c55e' : selectedAgency.overall >= 60 ? '#f59e0b' : '#ef4444' }}>
                {selectedAgency.overall.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400">/ 100</p>
              <div className="mt-3 space-y-1">
                {(['identity', 'endpoint', 'network', 'data', 'apps'] as const).map(k => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-20 capitalize">{k}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-ct-blue" style={{ width: `${selectedAgency[k]}%` }} />
                    </div>
                    <span className="font-bold text-slate-700 w-8 text-right">{selectedAgency[k]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Security Incident Trend — 2024 (Monthly)" description="Events handled by CT BEST Security Operations Center · MS-ISAC reporting" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={INCIDENT_TREND}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="phishing"   name="Phishing"    stackId="a" fill="#003087" />
            <Bar dataKey="bruteForce" name="Brute Force" stackId="a" fill="#0072ce" />
            <Bar dataKey="malware"    name="Malware"     stackId="a" fill="#f59e0b" />
            <Bar dataKey="insider"    name="Insider"     stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">Phishing remains the dominant attack vector (64–73% of monthly incidents). Q3 surge coincides with CT election systems heightened alerting period.</p>
      </div>

      {/* Zero Trust progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Zero Trust Implementation — CISA Architecture Pillars" description="% complete vs. in-progress by pillar · CT BEST Zero Trust Program FY2025" />
        <div className="space-y-2 mt-1">
          {ZERO_TRUST_PILLARS.map(p => (
            <div key={p.pillar} className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 w-24">{p.pillar}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: PRI_CFG[p.priority as keyof typeof PRI_CFG] + '20', color: PRI_CFG[p.priority as keyof typeof PRI_CFG] }}>
                    {p.priority}
                  </span>
                </div>
                <span className="font-bold text-slate-600">{p.complete}% done</span>
              </div>
              <div className="flex w-full gap-0.5 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${p.complete}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${p.inProgress}%` }} className="bg-blue-300 h-full" />
                <div style={{ width: `${p.notStarted}%` }} className="bg-slate-100 h-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" />Complete</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-300" />In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200" />Not Started</span>
        </div>
      </div>

      {/* Compliance checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="NIST 800-53 / CIS Control Compliance Status" description="Key cybersecurity control coverage across CT state systems · CT CISO Office Q4 2024" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Security Control</th>
                <th className="text-left px-3 py-2">Framework</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COMPLIANCE_ITEMS.map(c => (
                <tr key={c.control} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{c.control}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">{c.framework}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${STATUS_CFG[c.status as keyof typeof STATUS_CFG]}`}>{c.status}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${c.coverage}%`, background: c.coverage >= 80 ? '#22c55e' : c.coverage >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="font-bold text-slate-700 w-8">{c.coverage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-600 mb-1">Data Sources & Methodology</p>
        <p>NIST CSF maturity scores self-reported by CT BEST CISO office and validated against MS-ISAC CIS Controls Assessment Tool. Incident data from CT SOC monthly reporting. Zero Trust pillar assessments per CISA Zero Trust Maturity Model v2.0. Vulnerability counts from Tenable/Qualys continuous scan aggregate. Compliance data from BEST quarterly security posture review.</p>
      </div>
    </div>
  )
}
