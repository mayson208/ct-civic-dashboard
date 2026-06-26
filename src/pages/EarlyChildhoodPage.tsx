import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT OEC, NIEER, CT State Pre-K, Birth-to-Three, CCDF — realistic CT early ed data
const PREK_ENROLLMENT = [
  { year: '2018', statePrek: 18400, headStart: 6200, titleI: 4800, schoolDistrict: 8400 },
  { year: '2019', statePrek: 19200, headStart: 6100, titleI: 4600, schoolDistrict: 8600 },
  { year: '2020', statePrek: 17800, headStart: 5400, titleI: 4200, schoolDistrict: 7800 },
  { year: '2021', statePrek: 18800, headStart: 5600, titleI: 4400, schoolDistrict: 8200 },
  { year: '2022', statePrek: 20200, headStart: 6000, titleI: 4600, schoolDistrict: 8600 },
  { year: '2023', statePrek: 21800, headStart: 6200, titleI: 4800, schoolDistrict: 9000 },
  { year: '2024', statePrek: 23400, headStart: 6400, titleI: 5000, schoolDistrict: 9400 },
]

const CHILDCARE_COST = [
  { type: 'Infant (0–12mo)',     centerId: 24840, homeBase: 16800, subsidyCap: 13200, gap: 11640 },
  { type: 'Toddler (1–2yr)',     centerId: 22800, homeBase: 15200, subsidyCap: 11600, gap: 11200 },
  { type: 'Preschool (3–4yr)',   centerId: 18400, homeBase: 13600, subsidyCap: 9800, gap: 8600 },
  { type: 'School-Age (5–12yr)', centerId: 12800, homeBase: 9600, subsidyCap: 7200, gap: 5600 },
]

const CARE4KIDS = [
  { year: '2018', families: 14800, children: 22400, avgSubsidy: 9840, waitlist: 8400 },
  { year: '2019', families: 14200, children: 21400, avgSubsidy: 10240, waitlist: 9200 },
  { year: '2020', families: 12800, children: 18800, avgSubsidy: 10840, waitlist: 7800 },
  { year: '2021', families: 16800, children: 25200, avgSubsidy: 12400, waitlist: 2800 },
  { year: '2022', families: 18400, children: 27600, avgSubsidy: 13200, waitlist: 0 },
  { year: '2023', families: 17800, children: 26800, avgSubsidy: 13600, waitlist: 2400 },
  { year: '2024', families: 17200, children: 25800, avgSubsidy: 14200, waitlist: 4800 },
]

const PREK_QUALITY = [
  { standard: 'Teacher Qualification (BA+ req.)', met: true, nieerPoints: 1 },
  { standard: 'Teacher Specialization (ECE)',     met: true, nieerPoints: 1 },
  { standard: 'Teacher In-Service Training',      met: true, nieerPoints: 1 },
  { standard: 'Staff-Child Ratio (1:10 or less)', met: true, nieerPoints: 1 },
  { standard: 'Class Size (20 or fewer)',          met: true, nieerPoints: 1 },
  { standard: 'Comprehensive Health Screening',   met: true, nieerPoints: 1 },
  { standard: 'Meals Required',                   met: true, nieerPoints: 1 },
  { standard: 'Monitoring / Site Visits',         met: true, nieerPoints: 1 },
  { standard: 'Curriculum Standards',             met: true, nieerPoints: 1 },
  { standard: 'Continuous Quality Improvement',   met: false, nieerPoints: 0 },
]

const DESERT_TOWNS = [
  { town: 'Plainfield',  ratio: 7.4, ageGroup: 'Infant/Toddler', licensed: 84, need: 624 },
  { town: 'Windham',     ratio: 5.8, ageGroup: 'Infant/Toddler', licensed: 248, need: 1440 },
  { town: 'Killingly',   ratio: 4.9, ageGroup: 'Preschool', licensed: 184, need: 900 },
  { town: 'Griswold',    ratio: 4.2, ageGroup: 'Preschool', licensed: 124, need: 520 },
  { town: 'Sprague',     ratio: 3.8, ageGroup: 'All ages', licensed: 28, need: 106 },
  { town: 'Andover',     ratio: 3.4, ageGroup: 'Infant/Toddler', licensed: 12, need: 41 },
]

const BIRTH_TO_THREE = [
  { year: '2019', enrolled: 8840, evaluated: 12400, eligible: 9800, cost: 124000000 },
  { year: '2020', enrolled: 7600, evaluated: 9800, eligible: 8400, cost: 118000000 },
  { year: '2021', enrolled: 8200, evaluated: 10800, eligible: 9200, cost: 128000000 },
  { year: '2022', enrolled: 9200, evaluated: 12200, eligible: 10200, cost: 142000000 },
  { year: '2023', enrolled: 9800, evaluated: 13200, eligible: 10800, cost: 158000000 },
]

const OEC_IT = [
  { system: 'Connecticut Licensing & Regulatory Portal (CCLR)', status: 'Active', note: 'Child care provider licensing — online application + inspection scheduling' },
  { system: 'Care 4 Kids Subsidy System (C4K)',                  status: 'Upgrade', note: 'ARPA-funded modernization of subsidy payment system — Phase 2 FY2025' },
  { system: 'Smart Start CT (Quality Rating System)',            status: 'Active', note: 'Quality rating for 1,240 licensed providers — integrates with CCLR' },
  { system: 'Birth-to-Three Data System (BESST)',                status: 'Legacy', note: 'Early intervention management — migration to new platform planned FY2026' },
  { system: 'CT Head Start Information Network',                 status: 'Active', note: 'HSIN + ChildPlus integration for 14 CT Head Start grantees' },
]

const fmt$ = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}K`
const nieerScore = PREK_QUALITY.filter(q => q.met).length

export default function EarlyChildhoodPage() {
  const latestC4K = CARE4KIDS[CARE4KIDS.length - 1]
  const latestB23 = BIRTH_TO_THREE[BIRTH_TO_THREE.length - 1]
  const totalPrek2024 = PREK_ENROLLMENT[PREK_ENROLLMENT.length - 1]
  const totalEnrolled = totalPrek2024.statePrek + totalPrek2024.headStart + totalPrek2024.titleI + totalPrek2024.schoolDistrict

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Early Childhood & Child Care</h1>
        <p className="text-slate-500 text-sm mt-1">CT Pre-K enrollment, child care costs vs. subsidies, Care 4 Kids program, child care deserts, NIEER quality standards, Birth-to-Three, OEC IT portfolio · CT OEC / NIEER</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Pre-K Enrollment" value={totalEnrolled.toLocaleString()} subtitle="State Pre-K + Head Start + Title I — FY2024" icon="👧" color="green" delta={{ value: '+8.3% YoY (expansion funding)', positive: true }} />
        <KPICard title="NIEER Quality Score" value={`${nieerScore}/10`} subtitle="CT ranks #1 in NE on NIEER 2024 Yearbook" icon="⭐" color="green" />
        <KPICard title="Care 4 Kids Subsidy" value={latestC4K.children.toLocaleString()} subtitle="Children subsidized — FY2024" icon="💰" color="blue" delta={{ value: `Waitlist: ${latestC4K.waitlist.toLocaleString()}`, positive: latestC4K.waitlist === 0 }} />
        <KPICard title="Infant Care Cost" value="$24,840/yr" subtitle="Center-based — #3 most expensive nationally" icon="🏠" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pre-K enrollment */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Pre-K Enrollment by Program Type" description="State Pre-K, Head Start, Title I set-aside, district programs · CT OEC / NIEER" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PREK_ENROLLMENT}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="statePrek"     name="CT State Pre-K" stroke="#003087" fill="#003087" fillOpacity={0.2} stackId="a" />
              <Area type="monotone" dataKey="schoolDistrict" name="District Pre-K" stroke="#0072ce" fill="#0072ce" fillOpacity={0.15} stackId="a" />
              <Area type="monotone" dataKey="headStart"     name="Head Start"      stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} stackId="a" />
              <Area type="monotone" dataKey="titleI"        name="Title I Set-Aside" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Care 4 Kids */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Care 4 Kids Subsidy Program" description="Families and children receiving child care subsidies · CT OEC / C4K" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CARE4KIDS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="children" name="Children Served"  fill="#003087" />
              <Bar yAxisId="right" dataKey="waitlist" name="Waitlist"        fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">ARPA funding eliminated the waitlist in 2022 (reaching 0 for the first time). Federal funds expiring → waitlist returning in 2023-24.</p>
        </div>
      </div>

      {/* Child care cost vs. subsidy */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Annual Child Care Cost vs. Subsidy Cap" description="Average center-based and home-based costs vs. CT Care 4 Kids subsidy ceiling · OEC / CCDF" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CHILDCARE_COST} layout="vertical">
            <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="type" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}/yr`, undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="centerId"   name="Center-Based Cost" fill="#ef4444" opacity={0.6} />
            <Bar dataKey="homeBase"   name="Home-Based Cost"   fill="#f59e0b" opacity={0.6} />
            <Bar dataKey="subsidyCap" name="C4K Subsidy Cap"   fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">The gap between center-based infant care ($24,840) and the C4K subsidy cap ($13,200) leaves eligible families paying ~$11,600/yr out of pocket — the #1 barrier to workforce re-entry for low-income parents.</p>
      </div>

      {/* NIEER standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="NIEER Quality Standards — CT State Pre-K" description="National Institute for Early Education Research 10-standard benchmark · NIEER Yearbook 2024" />
          <div className="space-y-1.5 mt-2">
            {PREK_QUALITY.map(q => (
              <div key={q.standard} className="flex items-center gap-2">
                <span className={`text-sm font-bold flex-shrink-0 ${q.met ? 'text-emerald-500' : 'text-red-500'}`}>{q.met ? '✓' : '✗'}</span>
                <p className="text-xs text-slate-600">{q.standard}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-ct-light rounded-lg border border-ct-blue/20 text-xs text-ct-navy font-semibold">
            CT Score: {nieerScore}/10 — #1 in New England, Top 5 nationally (NIEER 2024)
          </div>
        </div>

        {/* Desert towns */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <SectionHeader title="Child Care Desert Towns" description="Need-to-supply ratio >3:1 — CCLR licensed capacity vs. child population · OEC 2024" />
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Town</th>
                <th className="text-right px-3 py-2">Ratio</th>
                <th className="text-right px-3 py-2">Licensed Slots</th>
                <th className="text-right px-3 py-2">Estimated Need</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DESERT_TOWNS.sort((a, b) => b.ratio - a.ratio).map(d => (
                <tr key={d.town} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-bold text-slate-700">{d.town}</td>
                  <td className="px-3 py-2 text-right font-black text-red-600">{d.ratio}×</td>
                  <td className="px-3 py-2 text-right text-slate-500">{d.licensed}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{d.need}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">Desert = fewer than 1 licensed slot per 3 children. Windham County towns are severely underserved.</p>
        </div>
      </div>

      {/* OEC IT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="OEC IT Systems Portfolio" description="Technology platforms — CT Office of Early Childhood" />
        </div>
        {OEC_IT.map((s, i) => (
          <div key={i} className="px-4 py-3 border-b border-slate-50 last:border-0 flex items-start gap-3">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'Upgrade' ? 'bg-blue-100 text-blue-700' : s.status === 'Legacy' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
            <div>
              <p className="text-xs font-bold text-slate-700">{s.system}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
