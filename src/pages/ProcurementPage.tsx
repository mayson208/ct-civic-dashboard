import { useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DAS / OPM procurement data — active state IT contracts
type ContractStatus = 'Active' | 'Expiring Soon' | 'Under Renewal' | 'Rebidding' | 'Expired'
type VendorType = 'Large Enterprise' | 'Mid-Market' | 'SBE (CT Small Business)' | 'Nonprofit'

interface Contract {
  id: string
  vendor: string
  description: string
  agency: string
  value: number
  annualValue: number
  startDate: string
  endDate: string
  status: ContractStatus
  vendorType: VendorType
  category: string
  primeOrSub: 'Prime' | 'Sub'
  renewalOptions: number
}

const CONTRACTS: Contract[] = [
  { id: 'DAS-IT-001', vendor: 'IBM Corporation',          description: 'State mainframe hosting & operations — DCF, CTDOL, DMV legacy systems',   agency: 'BEST / Multiple',  value: 148000000, annualValue: 24600000, startDate: '2021-07-01', endDate: '2025-06-30', status: 'Expiring Soon', vendorType: 'Large Enterprise', category: 'Infrastructure', primeOrSub: 'Prime', renewalOptions: 1 },
  { id: 'DAS-IT-002', vendor: 'Deloitte Consulting',      description: 'CTDOL Benefits Portal modernization — ARPA-funded',                          agency: 'CT DOL',           value: 62000000,  annualValue: 20600000, startDate: '2022-10-01', endDate: '2025-09-30', status: 'Active',           vendorType: 'Large Enterprise', category: 'Application Dev', primeOrSub: 'Prime', renewalOptions: 0 },
  { id: 'DAS-IT-003', vendor: 'Microsoft Corporation',    description: 'Microsoft 365 & Azure enterprise agreement — 18,400 seats statewide',         agency: 'BEST / All Agencies', value: 89000000, annualValue: 29600000, startDate: '2023-01-01', endDate: '2026-12-31', status: 'Active',           vendorType: 'Large Enterprise', category: 'SaaS / Cloud', primeOrSub: 'Prime', renewalOptions: 2 },
  { id: 'DAS-IT-004', vendor: 'Salesforce Inc.',          description: 'CRM platform — CT DEEP environmental permitting, CT DPH licensing',           agency: 'DEEP / DPH',      value: 18400000,  annualValue: 6100000,  startDate: '2022-04-01', endDate: '2025-03-31', status: 'Under Renewal',    vendorType: 'Large Enterprise', category: 'SaaS / Cloud', primeOrSub: 'Prime', renewalOptions: 1 },
  { id: 'DAS-IT-005', vendor: 'Tyler Technologies',       description: 'Courts e-filing platform (Tyler Odyssey) — phased deployment',                 agency: 'Judicial Branch', value: 44800000,  annualValue: 11200000, startDate: '2023-07-01', endDate: '2027-06-30', status: 'Active',           vendorType: 'Large Enterprise', category: 'Application Dev', primeOrSub: 'Prime', renewalOptions: 2 },
  { id: 'DAS-IT-006', vendor: 'Accenture Federal',        description: 'Enterprise Data Lake — CT BEST analytics platform (Phase 1)',                  agency: 'BEST',             value: 38400000,  annualValue: 19200000, startDate: '2024-01-01', endDate: '2025-12-31', status: 'Active',           vendorType: 'Large Enterprise', category: 'Data / Analytics', primeOrSub: 'Prime', renewalOptions: 1 },
  { id: 'DAS-IT-007', vendor: 'Optum Government',         description: 'CT Medicaid MMIS replacement — DeltaT platform',                               agency: 'DSS',             value: 124000000, annualValue: 24800000, startDate: '2020-10-01', endDate: '2025-09-30', status: 'Expiring Soon',    vendorType: 'Large Enterprise', category: 'Application Dev', primeOrSub: 'Prime', renewalOptions: 0 },
  { id: 'DAS-IT-008', vendor: 'CrowdStrike',              description: 'Endpoint detection & response — 14,200 managed endpoints, BEST CISO office',   agency: 'BEST',             value: 8400000,   annualValue: 2800000,  startDate: '2023-10-01', endDate: '2026-09-30', status: 'Active',           vendorType: 'Large Enterprise', category: 'Cybersecurity', primeOrSub: 'Prime', renewalOptions: 2 },
  { id: 'DAS-IT-009', vendor: 'NetSol Technologies CT',   description: 'DMV registration module customization — CT SBE-certified subcontractor',        agency: 'DMV',             value: 4200000,   annualValue: 1400000,  startDate: '2023-07-01', endDate: '2026-06-30', status: 'Active',           vendorType: 'SBE (CT Small Business)', category: 'Application Dev', primeOrSub: 'Sub', renewalOptions: 0 },
  { id: 'DAS-IT-010', vendor: 'Granicus LLC',             description: 'CT.gov content management, public notification, and civic engagement platform', agency: 'DAS / BEST',      value: 6800000,   annualValue: 1700000,  startDate: '2021-10-01', endDate: '2025-09-30', status: 'Expiring Soon',    vendorType: 'Mid-Market', category: 'SaaS / Cloud', primeOrSub: 'Prime', renewalOptions: 1 },
  { id: 'DAS-IT-011', vendor: 'Lumen Technologies',       description: 'Statewide network services — CT Education Network (CEN) & DCN backbone',       agency: 'BEST',             value: 84000000,  annualValue: 14000000, startDate: '2020-01-01', endDate: '2025-12-31', status: 'Under Renewal',    vendorType: 'Large Enterprise', category: 'Infrastructure', primeOrSub: 'Prime', renewalOptions: 0 },
  { id: 'DAS-IT-012', vendor: 'Palo Alto Networks',       description: 'Next-gen firewall and SASE solution — CT Zero Trust Phase 1',                   agency: 'BEST',             value: 12800000,  annualValue: 4200000,  startDate: '2024-04-01', endDate: '2027-03-31', status: 'Active',           vendorType: 'Large Enterprise', category: 'Cybersecurity', primeOrSub: 'Prime', renewalOptions: 1 },
]

const SPEND_BY_CATEGORY = Object.entries(
  CONTRACTS.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + c.annualValue; return acc }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value: Math.round(value / 1e6 * 10) / 10 })).sort((a, b) => b.value - a.value)

const SPEND_TREND = [
  { year: 'FY2021', largeEnt: 98.4, midMkt: 12.8, sbe: 8.4 },
  { year: 'FY2022', largeEnt: 118.2, midMkt: 14.2, sbe: 9.8 },
  { year: 'FY2023', largeEnt: 134.8, midMkt: 16.4, sbe: 12.2 },
  { year: 'FY2024', largeEnt: 148.4, midMkt: 18.2, sbe: 14.8 },
  { year: 'FY2025E', largeEnt: 138.2, midMkt: 22.4, sbe: 18.2 },
]

const STATUS_CFG: Record<ContractStatus, { color: string; bg: string; icon: string }> = {
  'Active': { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '✓' },
  'Expiring Soon': { color: 'text-amber-700', bg: 'bg-amber-100', icon: '⏳' },
  'Under Renewal': { color: 'text-blue-700', bg: 'bg-blue-100', icon: '🔄' },
  'Rebidding': { color: 'text-purple-700', bg: 'bg-purple-100', icon: '📋' },
  'Expired': { color: 'text-slate-500', bg: 'bg-slate-100', icon: '✕' },
}

const CAT_COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7']
const fmt$ = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

export default function ProcurementPage() {
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'All'>('All')
  const [filterCat, setFilterCat] = useState<string>('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const daysLeft = (endDate: string) => Math.round((new Date(endDate).getTime() - Date.now()) / 86400000)

  const filtered = useMemo(() =>
    CONTRACTS.filter(c =>
      (filterStatus === 'All' || c.status === filterStatus) &&
      (filterCat === 'All' || c.category === filterCat) &&
      (!search || c.vendor.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.agency.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => b.annualValue - a.annualValue),
    [filterStatus, filterCat, search]
  )

  const categories = [...new Set(CONTRACTS.map(c => c.category))]
  const totalAnnual = CONTRACTS.reduce((s, c) => s + c.annualValue, 0)
  const expiring = CONTRACTS.filter(c => daysLeft(c.endDate) < 365 && c.status !== 'Expired').length
  const sbeAnnual = CONTRACTS.filter(c => c.vendorType === 'SBE (CT Small Business)').reduce((s, c) => s + c.annualValue, 0)
  const selectedContract = CONTRACTS.find(c => c.id === selected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">IT Procurement & Contracts</h1>
        <p className="text-slate-500 text-sm mt-1">Active CT state technology contracts — vendor registry, spend by category, expiration monitoring, renewal flags · CT DAS / OPM</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Annual IT Spend" value={fmt$(totalAnnual)} subtitle={`Across ${CONTRACTS.length} active contracts`} icon="💳" color="blue" />
        <KPICard title="Expiring ≤1 Year" value={expiring} subtitle="Require renewal or rebid action" icon="⏳" color={expiring > 3 ? 'red' : 'yellow'} />
        <KPICard title="SBE Contract Spend" value={fmt$(sbeAnnual)} subtitle={`${(sbeAnnual / totalAnnual * 100).toFixed(1)}% of annual spend`} icon="🏪" color="green" />
        <KPICard title="Vendors" value={[...new Set(CONTRACTS.map(c => c.vendor))].length} subtitle="Unique vendors on contract" icon="🤝" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spend by category */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Spend by Category" description="Annualized contract values ($M) · FY2024-25" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SPEND_BY_CATEGORY} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={120} />
              <Tooltip formatter={(v: number) => [`$${v}M/yr`, 'Annual Spend']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {SPEND_BY_CATEGORY.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spend trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="IT Contract Spend Trend" description="Annual spend by vendor size class ($M) · FY2021–FY2025E" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SPEND_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `$${v}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => `$${v}M`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="largeEnt" name="Large Enterprise" stackId="a" fill="#003087" />
              <Bar dataKey="midMkt"   name="Mid-Market"       stackId="a" fill="#0072ce" />
              <Bar dataKey="sbe"      name="CT SBE"           stackId="a" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex gap-2 flex-wrap items-center text-xs">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor, agency, or description…"
          className="flex-1 min-w-48 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-ct-blue" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ContractStatus | 'All')}
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-ct-blue">
          <option value="All">All Statuses</option>
          {(Object.keys(STATUS_CFG) as ContractStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-ct-blue">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-slate-400">{filtered.length} contracts · {fmt$(filtered.reduce((s, c) => s + c.annualValue, 0))}/yr</span>
      </div>

      {/* Contract list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500">
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Vendor</th>
                  <th className="text-left px-3 py-2">Agency</th>
                  <th className="text-right px-3 py-2">Annual</th>
                  <th className="text-right px-3 py-2">Expires</th>
                  <th className="text-center px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const days = daysLeft(c.endDate)
                  const cfg = STATUS_CFG[c.status]
                  return (
                    <tr key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${selected === c.id ? 'bg-ct-light ring-1 ring-ct-blue/30' : ''}`}>
                      <td className="px-3 py-2 font-mono text-slate-400">{c.id}</td>
                      <td className="px-3 py-2">
                        <p className="font-bold text-slate-700">{c.vendor}</p>
                        <p className="text-slate-400">{c.vendorType === 'SBE (CT Small Business)' ? '🏪 SBE' : c.category}</p>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{c.agency}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt$(c.annualValue)}</td>
                      <td className={`px-3 py-2 text-right font-medium ${days < 180 ? 'text-red-600' : days < 365 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {c.endDate}
                        {days < 365 && <p className="text-xs font-bold">{days < 0 ? 'EXPIRED' : `${days}d`}</p>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${cfg.bg} ${cfg.color}`}>{cfg.icon} {c.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 sticky top-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-slate-400">{selectedContract.id}</p>
                  <p className="font-black text-sm text-slate-800">{selectedContract.vendor}</p>
                  <p className="text-xs text-ct-sky">{selectedContract.agency}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-500">✕</button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedContract.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Total Value', fmt$(selectedContract.value)],
                  ['Annual Value', fmt$(selectedContract.annualValue)],
                  ['Category', selectedContract.category],
                  ['Vendor Type', selectedContract.vendorType.replace('(CT Small Business)', '')],
                  ['Contract Dates', `${selectedContract.startDate} → ${selectedContract.endDate}`],
                  ['Renewal Options', `${selectedContract.renewalOptions} remaining`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-xs font-bold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
              <div className={`rounded-lg p-2 border text-xs ${STATUS_CFG[selectedContract.status].bg} ${STATUS_CFG[selectedContract.status].color} border-current/20`}>
                <strong>Status: {selectedContract.status}</strong>
                {selectedContract.status === 'Expiring Soon' && <p className="mt-0.5">Action required: initiate {selectedContract.renewalOptions > 0 ? 'renewal option' : 'rebid / RFP'} at least 6 months before expiration ({selectedContract.endDate}).</p>}
                {selectedContract.status === 'Under Renewal' && <p className="mt-0.5">Negotiation in progress with {selectedContract.vendor}. Ensure continuity of service plan if renewal is delayed.</p>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center h-48 flex flex-col items-center justify-center">
              <p className="text-2xl mb-2">🤝</p>
              <p className="text-slate-500 text-xs font-medium">Click a contract to see details</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-600 mb-1">Data note</p>
        <p>Contract data drawn from CT DAS procurement records, OPM IT Portfolio submissions, and public award notices. Dollar figures are approximate annual run-rate values. Full contract terms and line-item detail available through CT Open Data Portal (CT DAS procurement dataset) and BizNet. SBE designations per CT DAS Set-Aside program eligibility list.</p>
      </div>
    </div>
  )
}
