import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT workforce data — CT DOL, CT DECD, US DOL WIOA, CT State Board for WFD
const CREDENTIAL_TREND = [
  { year: '2019', credentials: 34200, employed90days: 28400, medianWage: 18.4 },
  { year: '2020', credentials: 28400, employed90days: 22100, medianWage: 17.8 },
  { year: '2021', credentials: 32800, employed90days: 28600, medianWage: 19.2 },
  { year: '2022', credentials: 38400, employed90days: 34200, medianWage: 21.4 },
  { year: '2023', credentials: 41800, employed90days: 37800, medianWage: 23.1 },
  { year: '2024', credentials: 44200, employed90days: 40400, medianWage: 24.8 },
]

const SECTOR_PARTNERSHIPS = [
  { sector: 'Healthcare',           participants: 8420, completers: 6840, employed: 6120, avgWage: 28.4, employer: 'Hartford Healthcare, Yale-NH Health' },
  { sector: 'Advanced Manufacturing', participants: 6240, completers: 4980, employed: 4420, avgWage: 31.2, employer: 'Pratt & Whitney, Electric Boat, Sikorsky' },
  { sector: 'IT & Cybersecurity',   participants: 4180, completers: 3240, employed: 2980, avgWage: 38.2, employer: 'Travelers, Cigna, Infosys' },
  { sector: 'Construction Trades',  participants: 5840, completers: 4820, employed: 4640, avgWage: 34.8, employer: 'Building CT (MBT)' },
  { sector: 'Financial Services',   participants: 3420, completers: 2840, employed: 2440, avgWage: 27.8, employer: 'Webster Bank, Aetna, Lincoln Financial' },
  { sector: 'Transportation/Logistics', participants: 2840, completers: 2240, employed: 2080, avgWage: 26.2, employer: 'Amazon, FedEx, CTtransit' },
  { sector: 'Clean Energy',         participants: 2120, completers: 1640, employed: 1480, avgWage: 29.6, employer: 'Eversource, Avangrid, CT Green Bank' },
]

const AMERICAN_JOB_CENTERS = [
  { ajc: 'Capital Region (Hartford)', participants: 8420, exitedEmployed: 6120, credentialRate: 72, arpaFunded: true },
  { ajc: 'Northwest (Waterbury)',      participants: 5840, exitedEmployed: 4180, credentialRate: 68, arpaFunded: true },
  { ajc: 'South Central (New Haven)', participants: 7240, exitedEmployed: 5220, credentialRate: 71, arpaFunded: true },
  { ajc: 'Southwest (Bridgeport)',     participants: 6480, exitedEmployed: 4620, credentialRate: 66, arpaFunded: true },
  { ajc: 'Eastern (Norwich)',          participants: 4120, exitedEmployed: 2940, credentialRate: 74, arpaFunded: false },
  { ajc: 'North Central (Enfield)',    participants: 3840, exitedEmployed: 2840, credentialRate: 70, arpaFunded: false },
]

const IT_PIPELINE = [
  { program: 'CompTIA A+ / Network+ Boot Camp', provider: 'Goodwin University', duration: '12 weeks', cost: 4200, completers2024: 284, placed: 241 },
  { program: 'Full Stack Web Dev (MERN)',        provider: 'Hartford Promise', duration: '16 weeks', cost: 5800, completers2024: 148, placed: 128 },
  { program: 'Cybersecurity Analyst (SOC)',      provider: 'ECSU / CT DOL',   duration: '20 weeks', cost: 6400, completers2024: 98, placed: 87 },
  { program: 'Cloud Computing (AWS/Azure)',       provider: 'SNHU Online / AJC', duration: '24 weeks', cost: 7200, completers2024: 128, placed: 112 },
  { program: 'Data Analytics & BI Tools',        provider: 'Quinebaug CC',    duration: '14 weeks', cost: 3800, completers2024: 184, placed: 158 },
  { program: 'IT Project Mgmt (PMP Prep)',        provider: 'Tunxis CC / DAS', duration: '10 weeks', cost: 2800, completers2024: 88, placed: 78 },
]

const APPRENTICESHIP = [
  { year: '2019', registered: 4840, active: 3920, completed: 820 },
  { year: '2020', registered: 4120, active: 3480, completed: 640 },
  { year: '2021', registered: 5240, active: 4280, completed: 960 },
  { year: '2022', registered: 6480, active: 5240, completed: 1240 },
  { year: '2023', registered: 7820, active: 6420, completed: 1400 },
  { year: '2024', registered: 8640, active: 7120, completed: 1520 },
]

const SKILLS_GAP = [
  { occupation: 'Registered Nurse',      openings2024: 4820, qualified: 2840, gap: 1980, avgWage: 88400 },
  { occupation: 'Software Developer',    openings2024: 3640, qualified: 1840, gap: 1800, avgWage: 118200 },
  { occupation: 'CNC Machinist',         openings2024: 2840, qualified: 1280, gap: 1560, avgWage: 58800 },
  { occupation: 'Electrician (JW)',      openings2024: 2420, qualified: 1120, gap: 1300, avgWage: 72400 },
  { occupation: 'Cybersecurity Analyst', openings2024: 1840, qualified: 680, gap: 1160, avgWage: 94200 },
  { occupation: 'Home Health Aide',      openings2024: 5840, qualified: 4820, gap: 1020, avgWage: 34800 },
  { occupation: 'HVAC Technician',       openings2024: 1640, qualified: 820, gap: 820, avgWage: 62400 },
  { occupation: 'Data Analyst',          openings2024: 2140, qualified: 1380, gap: 760, avgWage: 84200 },
]

const COLORS = ['#003087','#0072ce','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316']
const fmt$ = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`

export default function WorkforcePage() {
  const [sectorSort, setSectorSort] = useState<'participants' | 'wage'>('participants')
  const [gapSort, setGapSort] = useState<'gap' | 'wage'>('gap')

  const sortedSectors = useMemo(() =>
    [...SECTOR_PARTNERSHIPS].sort((a, b) => sectorSort === 'participants' ? b.participants - a.participants : b.avgWage - a.avgWage),
    [sectorSort]
  )

  const sortedGaps = useMemo(() =>
    [...SKILLS_GAP].sort((a, b) => gapSort === 'gap' ? b.gap - a.gap : b.avgWage - a.avgWage),
    [gapSort]
  )

  const totalITCompleters = IT_PIPELINE.reduce((s, p) => s + p.completers2024, 0)
  const totalITPlaced = IT_PIPELINE.reduce((s, p) => s + p.placed, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Workforce Development</h1>
        <p className="text-slate-500 text-sm mt-1">CT WIOA programs, credential attainment, sector partnerships, apprenticeships, skills gaps, and IT talent pipeline · CT DOL, CT DECD, US DOL</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="2024 Credentials" value="44,200" subtitle="Issued through WIOA-aligned programs" icon="🎓" color="blue" delta={{ value: '+5.7% YoY', positive: true }} />
        <KPICard title="Employment Rate" value="91.4%" subtitle="Employed 90 days post-credential" icon="💼" color="green" />
        <KPICard title="Median Wage" value="$24.80/hr" subtitle="Post-training for WIOA exiters" icon="💰" color="purple" delta={{ value: '+$1.70 YoY', positive: true }} />
        <KPICard title="Registered Apprentices" value="7,120" subtitle="Currently active in CT programs" icon="🔧" color="yellow" delta={{ value: '+10.9% YoY', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Credential trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Annual Credentials & Employment Outcomes" description="WIOA-aligned programs — credential count and 90-day employment · CT DOL" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CREDENTIAL_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${v}/hr`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="credentials"     name="Credentials" stroke="#003087" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="employed90days"  name="Employed 90d" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="medianWage"     name="Median Wage" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Apprenticeship trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Registered Apprenticeship Programs" description="Active, registered, and completing annually · CT DOL Apprenticeship Division" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={APPRENTICESHIP}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="active"    name="Active"     fill="#003087" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector partnerships */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SectionHeader title="Industry Sector Partnership Programs" description="CT's workforce development sector strategy — participants, completers, employment outcomes" />
          <div className="ml-auto flex gap-1">
            <button onClick={() => setSectorSort('participants')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sectorSort === 'participants' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Participants</button>
            <button onClick={() => setSectorSort('wage')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${sectorSort === 'wage' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Wage</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Sector</th>
                <th className="text-right px-3 py-2">Participants</th>
                <th className="text-right px-3 py-2">Completers</th>
                <th className="text-right px-3 py-2">% Employed</th>
                <th className="text-right px-3 py-2">Avg Wage</th>
                <th className="text-left px-3 py-2">Key Employers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedSectors.map((s, i) => (
                <tr key={s.sector} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.sector}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">{s.participants.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{s.completers.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: s.employed / s.completers >= 0.9 ? '#22c55e' : '#f59e0b' }}>
                    {(s.employed / s.completers * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800">${s.avgWage}/hr</td>
                  <td className="px-3 py-2 text-slate-400 max-w-xs">{s.employer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IT talent pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeader title="IT & Technology Talent Pipeline" description="CT training programs producing job-ready tech workers · CT DOL / AJC System" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">2024 totals</p>
              <p className="text-xs font-black text-ct-blue">{totalITCompleters} completers · {(totalITPlaced / totalITCompleters * 100).toFixed(0)}% placed</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Program</th>
                <th className="text-left px-3 py-2">Provider</th>
                <th className="text-center px-3 py-2">Duration</th>
                <th className="text-right px-3 py-2">Cost</th>
                <th className="text-right px-3 py-2">2024 Completers</th>
                <th className="text-right px-3 py-2">% Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {IT_PIPELINE.map(p => (
                <tr key={p.program} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-medium text-slate-700">{p.program}</td>
                  <td className="px-3 py-2 text-slate-500">{p.provider}</td>
                  <td className="px-3 py-2 text-center text-slate-500">{p.duration}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{fmt$(p.cost)}</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">{p.completers2024}</td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: p.placed / p.completers2024 >= 0.9 ? '#22c55e' : '#003087' }}>
                    {(p.placed / p.completers2024 * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills gap */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <SectionHeader title="CT Skills Gap — Openings vs. Qualified Workers" description="Job demand vs. available qualified candidates · CT DOL OOH / DECD" />
          <div className="ml-auto flex gap-1">
            <button onClick={() => setGapSort('gap')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${gapSort === 'gap' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Gap Size</button>
            <button onClick={() => setGapSort('wage')} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition ${gapSort === 'wage' ? 'bg-ct-blue text-white border-ct-blue' : 'border-slate-200 text-slate-500'}`}>By Wage</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sortedGaps} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="occupation" tick={{ fontSize: 9, fill: '#64748b' }} width={150} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="openings2024" name="Job Openings" fill="#003087" radius={[0, 0, 0, 0]} />
            <Bar dataKey="qualified"    name="Qualified Workers" fill="#22c55e" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">Gap size = openings minus qualified available workers. Software Developer gap: <strong>1,800 unfilled roles</strong>; Cybersecurity Analyst gap: <strong>1,160 unfilled roles</strong>.</p>
      </div>

      {/* AJC performance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="American Job Center Performance" description="WIOA-funded career centers — enrollment, employment rates, credential attainment · CT DOL" />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500">
              <th className="text-left px-3 py-2">American Job Center</th>
              <th className="text-right px-3 py-2">Participants</th>
              <th className="text-right px-3 py-2">Employed at Exit</th>
              <th className="text-right px-3 py-2">Employment %</th>
              <th className="text-right px-3 py-2">Credential Rate</th>
              <th className="text-center px-3 py-2">ARPA-Funded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {AMERICAN_JOB_CENTERS.map(a => (
              <tr key={a.ajc} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-700">{a.ajc}</td>
                <td className="px-3 py-2 text-right text-slate-600">{a.participants.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-600">{a.exitedEmployed.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold" style={{ color: a.exitedEmployed / a.participants >= 0.72 ? '#22c55e' : '#f59e0b' }}>
                  {(a.exitedEmployed / a.participants * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{a.credentialRate}%</td>
                <td className="px-3 py-2 text-center">
                  {a.arpaFunded
                    ? <span className="px-1.5 py-0.5 bg-ct-light text-ct-blue border border-ct-blue/20 rounded text-xs font-bold">Yes</span>
                    : <span className="text-slate-300">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
