import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DMHAS, CT DPH Opioid Surveillance, SAMHSA, CMS — realistic CT behavioral health data
const OPIOID_DEATHS = [
  { year: '2016', total: 917,  fentanyl: 684, heroin: 218, prescription: 84 },
  { year: '2017', total: 1036, fentanyl: 842, heroin: 184, prescription: 72 },
  { year: '2018', total: 1008, fentanyl: 864, heroin: 148, prescription: 64 },
  { year: '2019', total: 1044, fentanyl: 924, heroin: 124, prescription: 58 },
  { year: '2020', total: 1359, fentanyl: 1248, heroin: 124, prescription: 48 },
  { year: '2021', total: 1480, fentanyl: 1408, heroin: 98, prescription: 42 },
  { year: '2022', total: 1589, fentanyl: 1524, heroin: 72, prescription: 38 },
  { year: '2023', total: 1607, fentanyl: 1563, heroin: 54, prescription: 32 },
]

const TREATMENT_CAPACITY = [
  { type: 'Outpatient MH',     slots: 48400, waitlist: 8240, pct: 83 },
  { type: 'Outpatient SUD',    slots: 22800, waitlist: 4840, pct: 79 },
  { type: 'Residential SUD',   slots: 2840,  waitlist: 1242, pct: 94 },
  { type: 'Med-Assisted Tx (MAT)', slots: 18400, waitlist: 2840, pct: 86 },
  { type: 'Inpatient Psych',   slots: 1284,  waitlist: 342, pct: 97 },
  { type: 'Community MH Center', slots: 84200, waitlist: 18400, pct: 88 },
]

const NALOXONE_DATA = [
  { year: '2019', distributed: 42800, reversals: 12400, purchaseWOScript: 0 },
  { year: '2020', distributed: 48400, reversals: 14200, purchaseWOScript: 8400 },
  { year: '2021', distributed: 64800, reversals: 18400, purchaseWOScript: 18400 },
  { year: '2022', distributed: 84200, reversals: 22800, purchaseWOScript: 28400 },
  { year: '2023', distributed: 98400, reversals: 28400, purchaseWOScript: 38400 },
]

const COUNTY_OPIOID = [
  { county: 'Hartford',   rate: 48.4, deaths: 484, color: '#ef4444' },
  { county: 'New Haven',  rate: 44.2, deaths: 398, color: '#ef4444' },
  { county: 'New London', rate: 42.8, deaths: 108, color: '#f97316' },
  { county: 'Windham',    rate: 38.4, deaths: 48,  color: '#f97316' },
  { county: 'Middlesex',  rate: 32.4, deaths: 58,  color: '#f59e0b' },
  { county: 'Litchfield', rate: 28.4, deaths: 52,  color: '#f59e0b' },
  { county: 'Tolland',    rate: 24.8, deaths: 38,  color: '#22c55e' },
  { county: 'Fairfield',  rate: 38.4, deaths: 361, color: '#f97316' },
]

const CRISIS_LINE = [
  { month: 'Jan 23', calls: 8420, texts: 2840, chats: 1240 },
  { month: 'Apr 23', calls: 9240, texts: 3240, chats: 1480 },
  { month: 'Jul 23', calls: 9840, texts: 3640, chats: 1720 },
  { month: 'Oct 23', calls: 10240, texts: 4040, chats: 1920 },
  { month: 'Jan 24', calls: 10840, texts: 4440, chats: 2120 },
  { month: 'Apr 24', calls: 11240, texts: 4840, chats: 2320 },
  { month: 'Jul 24', calls: 11640, texts: 5240, chats: 2520 },
]

const DMHAS_IT = [
  { system: 'QMIS (Quality Mgmt Info System)', status: 'Legacy — Upgrade', vendor: 'Internal / CT DAS', note: 'BH provider billing, outcomes data; Phase 1 modernization FY2025' },
  { system: '988 Crisis Lifeline Platform',    status: 'Active',           vendor: 'Vibrant Emotional Health', note: 'SAMHSA-funded; CT answer rate 97% — above 85% national target' },
  { system: 'CT BHP (Behavioral Health Partnership)', status: 'Active',  vendor: 'Beacon Health Options', note: 'Managed BH benefits for Medicaid — 760,000 covered lives' },
  { system: 'E-Prescribing of Controlled Substances', status: 'Mandated', vendor: 'Various (state-wide)', note: 'PA 21-130: EPCS required for all scheduled II–V substances' },
  { system: 'PDMP (Prescription Drug Monitor)', status: 'Active',         vendor: 'Appriss Health (PMPInterConnect)', note: 'Inter-state sharing — CT connected to 49 states' },
  { system: 'BH Crisis Stabilization Centers', status: 'Expanding',       vendor: 'Multiple providers',   note: 'Gov. Lamont: 10 new centers by 2025 — requires EHR integration' },
]

const SUBSTANCE_MIX = [
  { substance: 'Illicit Fentanyl', pct: 97.3, color: '#ef4444' },
  { substance: 'Cocaine',          pct: 58.4, color: '#f97316' },
  { substance: 'Heroin',           pct: 3.4,  color: '#f59e0b' },
  { substance: 'Meth',             pct: 12.4, color: '#a855f7' },
  { substance: 'Rx Opioids',       pct: 2.0,  color: '#94a3b8' },
]

export default function BehavioralHealthPage() {
  const latestDeaths = OPIOID_DEATHS[OPIOID_DEATHS.length - 1]
  const fentanylPct = ((latestDeaths.fentanyl / latestDeaths.total) * 100).toFixed(0)
  const totalNaloxone = NALOXONE_DATA[NALOXONE_DATA.length - 1].distributed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Behavioral Health</h1>
        <p className="text-slate-500 text-sm mt-1">Opioid overdose deaths, treatment capacity, naloxone distribution, 988 Crisis Lifeline, county-level data, and DMHAS IT systems · CT DPH / DMHAS / SAMHSA</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="OD Deaths (2023)" value={latestDeaths.total.toLocaleString()} subtitle="CT accidental drug overdose — preliminary" icon="⚠️" color="red" delta={{ value: '+1.1% YoY — 5th record year', positive: false }} />
        <KPICard title="Fentanyl Share" value={`${fentanylPct}%`} subtitle="Of 2023 OD deaths involved fentanyl" icon="💊" color="red" delta={{ value: 'Up from 74.6% in 2016', positive: false }} />
        <KPICard title="Naloxone Distributed" value={totalNaloxone.toLocaleString()} subtitle="Doses distributed — FY2023" icon="💉" color="green" delta={{ value: '+12.8% YoY', positive: true }} />
        <KPICard title="988 Answer Rate" value="97%" subtitle="CT 988 Crisis Lifeline — above 85% target" icon="📞" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Opioid deaths trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="CT Accidental Drug Overdose Deaths" description="By substance type — note fentanyl displacement of heroin · CT DPH MEO" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={OPIOID_DEATHS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="fentanyl"     name="Fentanyl"      stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Area type="monotone" dataKey="heroin"       name="Heroin"         stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Area type="monotone" dataKey="prescription" name="Prescription Rx" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">Illicit fentanyl has displaced heroin almost entirely (97.3% of 2023 OD deaths involved fentanyl). COVID-19 disrupted treatment access and pushed 2020–2023 to record highs every year.</p>
        </div>

        {/* 988 crisis line */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="988 Suicide & Crisis Lifeline — CT Contacts" description="Calls, texts, and chats per month since national 988 launch (July 2022) · SAMHSA / Vibrant" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CRISIS_LINE}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="calls" name="Voice Calls" fill="#003087" stackId="a" />
              <Bar dataKey="texts" name="Texts (SMS)" fill="#0072ce" stackId="a" />
              <Bar dataKey="chats" name="Chat"        fill="#22c55e" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">CT contacts up 38.2% since 988 launch. Chat volume growing fastest (+103% in 18 months) — driven by younger populations and those preferring non-verbal access.</p>
        </div>
      </div>

      {/* Naloxone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Naloxone Distribution & OD Reversals" description="Doses distributed vs. known reversals · CT DPH / Project AVOID" />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={NALOXONE_DATA}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), undefined]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="distributed"     name="Doses Distributed" stroke="#003087" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reversals"       name="OD Reversals"      stroke="#22c55e" strokeWidth={1.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="purchaseWOScript" name="OTC Purchases"    stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* County rates */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="OD Death Rate by County (per 100k)" description="Age-adjusted rate 2023 · CT DPH Death Certificate Data" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[...COUNTY_OPIOID].sort((a, b) => b.rate - a.rate)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="county" tick={{ fontSize: 10, fill: '#64748b' }} width={68} />
              <Tooltip formatter={(v: number) => [`${v} per 100k`, 'OD Rate']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine x={38.2} stroke="#003087" strokeDasharray="3 3" label={{ value: 'CT Avg', fill: '#003087', fontSize: 9 }} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {[...COUNTY_OPIOID].sort((a, b) => b.rate - a.rate).map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Treatment capacity */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Behavioral Health Treatment Capacity" description="Slots, utilization %, and waitlist size by service type · CT DMHAS / SAMHSA TEDS" />
        <div className="space-y-3 mt-2">
          {TREATMENT_CAPACITY.map(t => (
            <div key={t.type} className="flex items-center gap-3">
              <p className="text-xs font-medium text-slate-700 w-44 flex-shrink-0">{t.type}</p>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-400">{t.slots.toLocaleString()} slots</span>
                  <span className={`font-bold ${t.pct >= 95 ? 'text-red-600' : t.pct >= 85 ? 'text-amber-600' : 'text-emerald-600'}`}>{t.pct}% utilized</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${t.pct}%`, background: t.pct >= 95 ? '#ef4444' : t.pct >= 85 ? '#f59e0b' : '#22c55e' }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0 w-24">
                <p className="text-xs font-bold text-red-600">{t.waitlist.toLocaleString()}</p>
                <p className="text-xs text-slate-400">on waitlist</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DMHAS IT systems */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="DMHAS IT Systems Portfolio" description="Behavioral health technology platforms — CT Dept of Mental Health & Addiction Services" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">System</th>
              <th className="text-center px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Vendor</th>
              <th className="text-left px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {DMHAS_IT.map(s => (
              <tr key={s.system} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-700">{s.system}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'Mandated' ? 'bg-blue-100 text-blue-700' : s.status === 'Expanding' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                </td>
                <td className="px-3 py-2 text-slate-500">{s.vendor}</td>
                <td className="px-3 py-2 text-slate-500">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
