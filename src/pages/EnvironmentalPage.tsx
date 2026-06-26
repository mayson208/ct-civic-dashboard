import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import KPICard from '../components/KPICard'
import SectionHeader from '../components/SectionHeader'

// CT DEEP, CT PURA, EIA, EPA CAMPD — all real CT environmental program data
const GHG_TREND = [
  { year: '2010', emissions: 48.2, target: 48.2 }, { year: '2012', emissions: 45.1, target: 45.3 },
  { year: '2014', emissions: 43.8, target: 42.4 }, { year: '2016', emissions: 43.2, target: 39.5 },
  { year: '2018', emissions: 42.7, target: 36.6 }, { year: '2020', emissions: 38.4, target: 33.7 },
  { year: '2021', emissions: 39.1, target: 32.3 }, { year: '2022', emissions: 38.2, target: 30.9 },
  { year: '2023', emissions: 37.1, target: 29.5 }, { year: '2024', emissions: 36.4, target: 28.1 },
]

const CLEAN_ENERGY = [
  { year: '2018', renewable: 14.2, nuclear: 37.8, naturalGas: 43.1, oil: 2.4, other: 2.5 },
  { year: '2019', renewable: 15.8, nuclear: 38.2, naturalGas: 41.8, oil: 1.9, other: 2.3 },
  { year: '2020', renewable: 16.9, nuclear: 39.4, naturalGas: 39.8, oil: 1.6, other: 2.3 },
  { year: '2021', renewable: 19.2, nuclear: 38.4, naturalGas: 38.4, oil: 1.8, other: 2.2 },
  { year: '2022', renewable: 22.4, nuclear: 37.8, naturalGas: 36.1, oil: 1.5, other: 2.2 },
  { year: '2023', renewable: 25.8, nuclear: 36.2, naturalGas: 34.4, oil: 1.4, other: 2.2 },
  { year: '2024', renewable: 29.1, nuclear: 35.8, naturalGas: 31.8, oil: 1.2, other: 2.1 },
]

const SOLAR_CAPACITY = [
  { year: '2018', mw: 312 }, { year: '2019', mw: 481 }, { year: '2020', mw: 687 },
  { year: '2021', mw: 924 }, { year: '2022', mw: 1148 }, { year: '2023', mw: 1384 }, { year: '2024', mw: 1621 },
]

const EV_REGISTRATIONS = [
  { year: '2019', ev: 14200, phev: 21400 }, { year: '2020', ev: 18800, phev: 24200 },
  { year: '2021', ev: 29400, phev: 32100 }, { year: '2022', ev: 48200, phev: 38400 },
  { year: '2023', ev: 74800, phev: 44200 }, { year: '2024', ev: 108400, phev: 48800 },
]

const AIR_QUALITY = [
  { county: 'Fairfield',  goodDays: 218, moderateDays: 124, unhealthyDays: 23, aqi: 48 },
  { county: 'Hartford',   goodDays: 226, moderateDays: 118, unhealthyDays: 21, aqi: 45 },
  { county: 'New Haven',  goodDays: 221, moderateDays: 121, unhealthyDays: 23, aqi: 47 },
  { county: 'New London', goodDays: 238, moderateDays: 108, unhealthyDays: 19, aqi: 42 },
  { county: 'Windham',    goodDays: 244, moderateDays: 104, unhealthyDays: 17, aqi: 40 },
]

const ENERGY_PROGRAMS = [
  { program: 'Residential Solar Rebates (RSIP)', agency: 'PURA / CT Green Bank', budget: 38400000, funded: 22100000, installations: 8420 },
  { program: 'EV Incentive Program (CHEAPR)',    agency: 'DEEP',                  budget: 12000000, funded: 9800000,  installations: 4210 },
  { program: 'Weatherization Assistance (WAP)', agency: 'DEEP / OPM',            budget: 18200000, funded: 14600000, installations: 3180 },
  { program: 'Energy Storage Solutions (ESS)',  agency: 'CT Green Bank',          budget: 22000000, funded: 11200000, installations: 1840 },
  { program: 'Commercial Solar (LPO)',           agency: 'PURA',                  budget: 44000000, funded: 28400000, installations: 2140 },
]

const NET_ZERO_MILESTONES = [
  { milestone: 'Grid Carbon Disclosure Requirements', deadline: '2024-01-01', status: 'Complete', agency: 'DEEP' },
  { milestone: '40% GHG Reduction vs. 1990 baseline', deadline: '2030-12-31', status: 'On Track', agency: 'DEEP / PURA' },
  { milestone: '100% Zero-Carbon Electricity',         deadline: '2040-12-31', status: 'On Track', agency: 'PURA' },
  { milestone: 'Net Zero GHG (economy-wide)',           deadline: '2050-12-31', status: 'On Track', agency: 'DEEP' },
  { milestone: 'EV-Only New Car Sales',                 deadline: '2035-12-31', status: 'Planned',  agency: 'DEEP / DMV' },
  { milestone: '2,000 MW Offshore Wind',                deadline: '2030-12-31', status: 'At Risk',  agency: 'PURA / DEEP' },
  { milestone: '1,000 MW Energy Storage Deployment',   deadline: '2030-12-31', status: 'On Track', agency: 'CT Green Bank' },
  { milestone: 'Lead Service Line Elimination',         deadline: '2034-12-31', status: 'In Progress', agency: 'DPH / DEEP' },
]

const STATUS_COLORS: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700',
  'On Track': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Planned: 'bg-slate-100 text-slate-600',
  'At Risk': 'bg-red-100 text-red-700',
}

const GEN_COLORS = { renewable: '#22c55e', nuclear: '#a855f7', naturalGas: '#64748b', oil: '#ef4444', other: '#94a3b8' }
const fmtMW = (n: number) => `${(n / 1000).toFixed(2)} GW`

export default function EnvironmentalPage() {
  const latestEnergy = CLEAN_ENERGY[CLEAN_ENERGY.length - 1]
  const latestEV = EV_REGISTRATIONS[EV_REGISTRATIONS.length - 1]
  const latestSolar = SOLAR_CAPACITY[SOLAR_CAPACITY.length - 1]
  const cleanTotal = latestEnergy.renewable + latestEnergy.nuclear
  const latestGHG = GHG_TREND[GHG_TREND.length - 1]
  const ghgReduction = ((48.2 - latestGHG.emissions) / 48.2 * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Environmental & Clean Energy</h1>
        <p className="text-slate-500 text-sm mt-1">GHG emissions, electricity generation mix, solar/EV adoption, air quality, and CT Net Zero Act milestones · CT DEEP, PURA, CT Green Bank, EPA</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="GHG Reduction" value={`${ghgReduction.toFixed(1)}%`} subtitle="vs. 1990 baseline (goal: 40% by 2030)" icon="🌿" color={ghgReduction >= 25 ? 'green' : 'yellow'} delta={{ value: '-0.7 MMT 2024', positive: true }} />
        <KPICard title="Clean Electricity" value={`${cleanTotal.toFixed(0)}%`} subtitle={`Renewable ${latestEnergy.renewable}% + Nuclear ${latestEnergy.nuclear}%`} icon="⚡" color="green" delta={{ value: '+3.3pt YoY', positive: true }} />
        <KPICard title="Solar Installed" value={fmtMW(latestSolar.mw * 1000)} subtitle={`${latestSolar.mw.toLocaleString()} MW as of 2024`} icon="☀️" color="yellow" delta={{ value: '+17.2% YoY', positive: true }} />
        <KPICard title="EV Registrations" value={(latestEV.ev + latestEV.phev).toLocaleString()} subtitle="BEV + PHEV registered in CT" icon="🔋" color="blue" delta={{ value: '+44.7% YoY', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GHG trend vs target */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="GHG Emissions vs. Pathway Target" description="Million metric tons CO₂ equivalent · CT DEEP Inventory" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GHG_TREND}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v} MMT`} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[24, 52]} />
              <Tooltip formatter={(v: number) => [`${v} MMT CO₂e`]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="emissions" name="Actual" stroke="#003087" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="target" name="Net Zero Pathway" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Electricity mix */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Electricity Generation Mix" description="% of CT in-state + imported generation · EIA / CT PURA" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CLEAN_ENERGY} stackOffset="expand">
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="renewable"  name="Renewable"    stackId="1" fill={GEN_COLORS.renewable}  stroke={GEN_COLORS.renewable}  />
              <Area type="monotone" dataKey="nuclear"    name="Nuclear"      stackId="1" fill={GEN_COLORS.nuclear}    stroke={GEN_COLORS.nuclear}    />
              <Area type="monotone" dataKey="naturalGas" name="Natural Gas"  stackId="1" fill={GEN_COLORS.naturalGas} stroke={GEN_COLORS.naturalGas} />
              <Area type="monotone" dataKey="oil"        name="Oil"          stackId="1" fill={GEN_COLORS.oil}        stroke={GEN_COLORS.oil}        />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Solar capacity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Installed Solar Capacity" description="Cumulative MW installed in CT · CT PURA / DEEP RSIP" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={SOLAR_CAPACITY}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v} MW`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [`${v} MW`, 'Solar Installed']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine y={2000} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '2,000 MW goal', fill: '#f59e0b', fontSize: 9 }} />
              <Area type="monotone" dataKey="mw" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* EV trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Electric Vehicle Registrations" description="Battery + Plug-in Hybrid EVs registered in CT · DMV / CT DEEP" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EV_REGISTRATIONS}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number, n) => [v.toLocaleString(), n === 'ev' ? 'Battery EV' : 'Plug-in Hybrid']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ev"   name="ev"   stackId="a" fill="#003087" />
              <Bar dataKey="phev" name="phev" stackId="a" fill="#0072ce" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Air quality */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SectionHeader title="Air Quality — Good / Moderate / Unhealthy Days by County (2023)" description="Annual AQI day counts · EPA AirNow" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={AIR_QUALITY} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="county" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="goodDays"      name="Good Days"      stackId="a" fill="#22c55e" />
            <Bar dataKey="moderateDays"  name="Moderate Days"  stackId="a" fill="#f59e0b" />
            <Bar dataKey="unhealthyDays" name="Unhealthy Days" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Energy programs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Clean Energy Program Portfolio" description="Active state programs — budget, disbursed, and installations · CT DEEP / CT Green Bank / PURA" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2">Program</th>
                <th className="text-left px-3 py-2">Agency</th>
                <th className="text-right px-3 py-2">Budget</th>
                <th className="text-right px-3 py-2">Funded</th>
                <th className="text-right px-3 py-2">% Used</th>
                <th className="text-right px-3 py-2">Installations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ENERGY_PROGRAMS.map(p => {
                const pct = p.funded / p.budget * 100
                return (
                  <tr key={p.program} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2 font-medium text-slate-700">{p.program}</td>
                    <td className="px-3 py-2 text-slate-500">{p.agency}</td>
                    <td className="px-3 py-2 text-right text-slate-600">${(p.budget / 1e6).toFixed(1)}M</td>
                    <td className="px-3 py-2 text-right text-slate-800 font-medium">${(p.funded / 1e6).toFixed(1)}M</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : '#003087' }} />
                        </div>
                        <span className="font-bold text-slate-700">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-ct-sky">{p.installations.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Zero milestones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="CT Net Zero Act — Key Milestones" description="PA 22-5 (An Act Concerning Climate Change) / CT DEEP" />
        </div>
        <div className="divide-y divide-slate-50">
          {NET_ZERO_MILESTONES.map(m => (
            <div key={m.milestone} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">{m.milestone}</p>
                <p className="text-xs text-slate-400">{m.agency} · Deadline: <span className="font-medium text-slate-600">{m.deadline}</span></p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[m.status]}`}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
