import { useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT broadband data — FCC National Broadband Map, CT DEEP, CT DECD BEAD plan, NTIA
type DownloadSpeed = '25/3' | '100/20' | '1000/100'

const STATEWIDE_COVERAGE = [
  { label: '25/3 Mbps (FCC Basic)', pct: 94.2, color: '#003087' },
  { label: '100/20 Mbps (BEAD Goal)', pct: 86.8, color: '#0072ce' },
  { label: '1 Gig / 100 Mbps', pct: 71.4, color: '#22c55e' },
  { label: 'No Broadband Access', pct: 5.8, color: '#ef4444' },
]

const TOWNS_UNDERSERVED = [
  { town: 'Eastford',       pct25_3: 68.2, pct100_20: 44.1, addresses: 2140,  county: 'Windham',  bead: true },
  { town: 'Union',          pct25_3: 71.4, pct100_20: 48.2, addresses: 840,   county: 'Tolland',  bead: true },
  { town: 'Voluntown',      pct25_3: 72.8, pct100_20: 51.4, addresses: 1920,  county: 'New London', bead: true },
  { town: 'Sprague',        pct25_3: 74.1, pct100_20: 53.8, addresses: 2480,  county: 'New London', bead: true },
  { town: 'Scotland',       pct25_3: 75.2, pct100_20: 55.1, addresses: 1640,  county: 'Windham',  bead: true },
  { town: 'Canterbury',     pct25_3: 76.8, pct100_20: 57.4, addresses: 3240,  county: 'Windham',  bead: true },
  { town: 'Sterling',       pct25_3: 78.4, pct100_20: 59.8, addresses: 4820,  county: 'Windham',  bead: true },
  { town: 'Bozrah',         pct25_3: 79.2, pct100_20: 61.2, addresses: 2940,  county: 'New London', bead: false },
  { town: 'Lebanon',        pct25_3: 80.1, pct100_20: 63.4, addresses: 6820,  county: 'New London', bead: false },
  { town: 'Chaplin',        pct25_3: 81.4, pct100_20: 64.8, addresses: 2140,  county: 'Windham',  bead: false },
]

const TECHNOLOGY_MIX = [
  { name: 'Fiber (FTTH)',     pct: 38.4, color: '#003087' },
  { name: 'Cable (DOCSIS)',   pct: 44.8, color: '#0072ce' },
  { name: 'DSL',              pct: 8.2,  color: '#f59e0b' },
  { name: 'Fixed Wireless',   pct: 5.8,  color: '#22c55e' },
  { name: 'Satellite',        pct: 2.8,  color: '#94a3b8' },
]

const BEAD_PROGRESS = [
  { phase: 'Initial Proposal', status: 'Complete',   date: '2023-12-15', desc: 'CT DECD submitted to NTIA' },
  { phase: 'Challenge Process', status: 'Complete',  date: '2024-04-30', desc: 'ISP/local challenges resolved' },
  { phase: 'Final Proposal',    status: 'Complete',  date: '2024-09-30', desc: 'Approved by NTIA' },
  { phase: 'ISP Selection',     status: 'In Progress', date: '2025-03-31', desc: 'RFP out — 8 ISPs competing' },
  { phase: 'Grant Awards',      status: 'Planned',   date: '2025-06-30', desc: 'Subject to ISP selection timeline' },
  { phase: 'Construction',      status: 'Planned',   date: '2025-12-31', desc: 'Fiber buildout begins' },
  { phase: 'Service Launch',    status: 'Planned',   date: '2027-09-30', desc: 'All BEAD-eligible addresses served' },
]

const COUNTY_COVERAGE = [
  { county: 'Fairfield',  pct100: 92.4, pct1g: 84.2, addresses: 381200 },
  { county: 'Hartford',   pct100: 89.8, pct1g: 76.4, addresses: 354800 },
  { county: 'New Haven',  pct100: 88.2, pct1g: 74.8, addresses: 339200 },
  { county: 'New London', pct100: 82.4, pct1g: 64.2, addresses: 112400 },
  { county: 'Middlesex',  pct100: 84.8, pct1g: 68.4, addresses: 69100 },
  { county: 'Tolland',    pct100: 81.2, pct1g: 61.8, addresses: 61400 },
  { county: 'Litchfield', pct100: 79.4, pct1g: 58.2, addresses: 75200 },
  { county: 'Windham',    pct100: 72.8, pct1g: 48.4, addresses: 47200 },
]

const ADOPTION_BARRIERS = [
  { barrier: 'Cost / Affordability',   pct: 42 },
  { barrier: 'Not Interested',         pct: 18 },
  { barrier: 'No Available Service',   pct: 15 },
  { barrier: 'Device Availability',    pct: 12 },
  { barrier: 'Digital Literacy',       pct: 8 },
  { barrier: 'Other',                  pct: 5 },
]

const STATUS_MAP: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Planned: 'bg-slate-100 text-slate-600',
}

export default function BroadbandPage() {
  const [speedFilter, setSpeedFilter] = useState<'100_20' | '1000_100'>('100_20')
  const [sortUnderserved, setSortUnderserved] = useState<'pct' | 'addresses'>('pct')

  const unservedAddresses = useMemo(() =>
    TOWNS_UNDERSERVED.reduce((s, t) => s + Math.round(t.addresses * (100 - (speedFilter === '100_20' ? t.pct100_20 : t.pct25_3)) / 100), 0),
    [speedFilter]
  )

  const sorted = useMemo(() =>
    [...TOWNS_UNDERSERVED].sort((a, b) =>
      sortUnderserved === 'pct'
        ? (a[speedFilter === '100_20' ? 'pct100_20' : 'pct25_3'] - b[speedFilter === '100_20' ? 'pct100_20' : 'pct25_3'])
        : b.addresses - a.addresses
    ),
    [speedFilter, sortUnderserved]
  )

  const totalBEADAwardM = 144
  const obligatedM = 14
  const beadAddresses = 47200

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Broadband Access</h1>
        <p className="text-slate-500 text-sm mt-1">CT connectivity coverage, underserved towns, technology mix, and BEAD program progress · FCC NBM, CT DECD, NTIA</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="100/20 Mbps Coverage" value="86.8%" subtitle="Statewide addresses with broadband" icon="📡" color="blue" delta={{ value: '+3.2pt YoY', positive: true }} />
        <KPICard title="Unserved Addresses" value="47,200" subtitle="BEAD-eligible (<25/3 Mbps)" icon="❌" color="red" />
        <KPICard title="BEAD Award" value="$144M" subtitle="IIJA federal allocation for CT" icon="🏛" color="green" />
        <KPICard title="Fiber Deployment" value="38.4%" subtitle="Of CT addresses have FTTH today" icon="🔌" color="purple" delta={{ value: '+6.2pt YoY', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coverage by standard */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Statewide Broadband Coverage" description="% of addresses meeting each speed tier · FCC National Broadband Map 2024" />
          <div className="space-y-3 mt-2">
            {STATEWIDE_COVERAGE.map(s => (
              <div key={s.label} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">{s.label}</span>
                  <span className="font-black text-slate-700">{s.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">BEAD program targets: 100% of unserved (&lt;25/3) → 100% of underserved (&lt;100/20) as secondary</p>
        </div>

        {/* Technology mix */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Broadband Technology Mix" description="% of CT addresses by connection type · FCC 2024" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={180}>
              <PieChart>
                <Pie data={TECHNOLOGY_MIX} dataKey="pct" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={2}>
                  {TECHNOLOGY_MIX.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {TECHNOLOGY_MIX.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-slate-700">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* County coverage */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="County Coverage — 100/20 Mbps vs. 1 Gig" description="% of county addresses meeting each tier · FCC NBM 2024" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[...COUNTY_COVERAGE].sort((a, b) => a.pct100 - b.pct100)}>
            <XAxis dataKey="county" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[40, 100]} />
            <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="pct100" name="100/20 Mbps" fill="#003087" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pct1g"  name="1 Gig/100" fill="#0072ce" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Underserved towns */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SectionHeader title="Most Underserved Towns" description="Ranked by % of addresses below selected speed threshold" />
          <div className="ml-auto flex gap-1.5">
            <button onClick={() => setSpeedFilter('100_20')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${speedFilter === '100_20' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>100/20 Mbps</button>
            <button onClick={() => setSpeedFilter('1000_100')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${speedFilter === '1000_100' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>25/3 Mbps</button>
            <button onClick={() => setSortUnderserved(sortUnderserved === 'pct' ? 'addresses' : 'pct')} className="text-xs px-2 py-1 rounded-lg font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50">
              Sort: {sortUnderserved === 'pct' ? '% Coverage' : 'Addresses'}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {sorted.slice(0, 8).map(t => {
            const covPct = speedFilter === '100_20' ? t.pct100_20 : t.pct25_3
            return (
              <div key={t.town} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-32">
                  <span className="text-xs font-bold text-slate-700">{t.town}</span>
                  {t.bead && <span className="text-xs bg-ct-light text-ct-blue border border-ct-blue/20 px-1 rounded font-semibold">BEAD</span>}
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 relative">
                  <div className="h-3 rounded-full" style={{ width: `${covPct}%`, background: covPct < 75 ? '#ef4444' : covPct < 85 ? '#f59e0b' : '#003087' }} />
                </div>
                <span className="text-xs font-bold w-14 text-right" style={{ color: covPct < 75 ? '#ef4444' : covPct < 85 ? '#f59e0b' : '#003087' }}>{covPct}%</span>
                <span className="text-xs text-slate-400 w-20 text-right">{t.county}</span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">Est. {unservedAddresses.toLocaleString()} addresses below threshold across shown towns · BEAD tag = eligible for IIJA buildout funding</p>
      </div>

      {/* BEAD program timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT BEAD Program Timeline" description="Broadband Equity, Access, and Deployment — NTIA/IIJA $144M allocation · CT DECD" />
        </div>
        <div className="divide-y divide-slate-50">
          {BEAD_PROGRESS.map((p, i) => (
            <div key={p.phase} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 transition">
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: p.status === 'Complete' ? '#22c55e' : p.status === 'In Progress' ? '#003087' : '#94a3b8' }}>
                {p.status === 'Complete' ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700">{p.phase}</p>
                <p className="text-xs text-slate-400">{p.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_MAP[p.status]}`}>{p.status}</span>
                <p className="text-xs text-slate-400 mt-0.5">{p.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          CT BEAD allocation: <strong>$144M</strong> · Target: <strong>{beadAddresses.toLocaleString()} unserved addresses</strong> · Primary tech: <strong>Fiber (FTTH)</strong> · ISP selection underway Q1 2025
        </div>
      </div>

      {/* Adoption barriers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Non-Adoption Barriers" description="Why CT households without broadband don't subscribe · FCC Digital Equity Survey 2023" />
          <div className="space-y-2 mt-2">
            {ADOPTION_BARRIERS.map(b => (
              <div key={b.barrier} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{b.barrier}</span>
                  <span className="font-bold text-slate-700">{b.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-ct-blue" style={{ width: `${b.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Cost is the #1 barrier — CT ACP enrollment: 168,400 households (program ended May 2024; CT BEAD digital equity plan addresses replacement)</p>
        </div>

        <div className="bg-ct-light rounded-xl border border-ct-blue/20 p-4 space-y-3">
          <p className="text-sm font-black text-ct-navy">CT Digital Equity Programs</p>
          {[
            { name: 'BEAD Subgrantee Program', amt: '$144M', agency: 'CT DECD', note: 'Last-mile infrastructure for unserved areas' },
            { name: 'Digital Equity Act', amt: '$9.4M', agency: 'CT DECD / NTIA', note: 'Digital literacy, device access, navigator training' },
            { name: 'ACP Successor (CT Legislature)', amt: 'Pending', agency: 'CT PURA', note: 'State-funded affordability program post-ACP' },
            { name: 'E-Rate (Schools/Libraries)', amt: '$28.4M/yr', agency: 'FCC / DAS', note: 'Annual discounts for schools and public libraries' },
          ].map(p => (
            <div key={p.name} className="bg-white/70 rounded-lg p-3 border border-ct-blue/10">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-ct-navy">{p.name}</p>
                <span className="text-xs font-black text-ct-blue whitespace-nowrap">{p.amt}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{p.agency} · {p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
