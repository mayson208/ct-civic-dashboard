import { useMemo, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { useTownProfiles, useUnemployment, useCrashes, useGraduation } from '../hooks/useSocrataData'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const TOWNS = ['Bridgeport', 'Danbury', 'Greenwich', 'Hartford', 'New Britain', 'New Haven', 'Norwalk', 'Stamford', 'Waterbury', 'West Hartford']
const COLOR_A = '#003087'
const COLOR_B = '#f59e0b'

const fmt$ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface CompareMetric {
  label: string
  a: number
  b: number
  unit: string
  higherIsBetter: boolean
}

export default function TownComparePage() {
  const [townA, setTownA] = useState('Hartford')
  const [townB, setTownB] = useState('Greenwich')

  const { data: profiles, isLoading: pl } = useTownProfiles()
  const { data: unemp } = useUnemployment({ limit: 2000 })
  const { data: crashes } = useCrashes()
  const { data: grad } = useGraduation()

  const getProfile = (town: string) => profiles?.find(p => p.town === town)
  const getUnemp = (town: string) => {
    const rows = unemp?.filter(u => u.town === town) || []
    return rows.length ? rows.reduce((s, r) => s + parseFloat(r.unemployment_rate || '0'), 0) / rows.length : 0
  }
  const getCrashes = (town: string) => {
    const rows = crashes?.filter(c => c.town === town && c.year === '2023') || []
    return rows.reduce((s, r) => s + parseInt(r.total_crashes || '0'), 0)
  }
  const getGrad = (town: string) => {
    const rows = grad?.filter(g => g.district.toLowerCase() === town.toLowerCase() && g.year === '2023') || []
    return rows.length ? rows.reduce((s, r) => s + parseFloat(r.graduation_rate || '0'), 0) / rows.length : 0
  }

  const metrics: CompareMetric[] = useMemo(() => {
    const profA = getProfile(townA), profB = getProfile(townB)
    return [
      { label: 'Median Household Income', a: parseInt(profA?.median_household_income || '0'), b: parseInt(profB?.median_household_income || '0'), unit: '$', higherIsBetter: true },
      { label: 'Per Capita Income',        a: parseInt(profA?.per_capita_income || '0'), b: parseInt(profB?.per_capita_income || '0'), unit: '$', higherIsBetter: true },
      { label: 'Population',               a: parseInt(profA?.population || '0'), b: parseInt(profB?.population || '0'), unit: '', higherIsBetter: false },
      { label: 'Poverty Rate',             a: parseFloat(profA?.poverty_rate || '0'), b: parseFloat(profB?.poverty_rate || '0'), unit: '%', higherIsBetter: false },
      { label: 'Unemployment Rate',        a: parseFloat(getUnemp(townA).toFixed(2)), b: parseFloat(getUnemp(townB).toFixed(2)), unit: '%', higherIsBetter: false },
      { label: 'Graduation Rate',          a: parseFloat(getGrad(townA).toFixed(1)), b: parseFloat(getGrad(townB).toFixed(1)), unit: '%', higherIsBetter: true },
      { label: 'Annual Crashes (2023)',    a: getCrashes(townA), b: getCrashes(townB), unit: '', higherIsBetter: false },
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, unemp, crashes, grad, townA, townB])

  // Normalize 0-100 for radar
  const radarData = useMemo(() => {
    const dims = [
      { key: 'Income', a: getUnemp(townA), b: getUnemp(townB), flip: false, src: 'income' },
      { key: 'Low Poverty', a: parseFloat(getProfile(townA)?.poverty_rate || '20'), b: parseFloat(getProfile(townB)?.poverty_rate || '20'), flip: true },
      { key: 'Graduation', a: getGrad(townA), b: getGrad(townB), flip: false },
      { key: 'Low Unemp', a: getUnemp(townA), b: getUnemp(townB), flip: true },
      { key: 'Safety', a: getCrashes(townA), b: getCrashes(townB), flip: true },
    ]
    return [
      { metric: 'Income',      [townA]: Math.min(100, parseInt(getProfile(townA)?.median_household_income || '0') / 1200), [townB]: Math.min(100, parseInt(getProfile(townB)?.median_household_income || '0') / 1200) },
      { metric: 'Low Poverty', [townA]: Math.max(0, 100 - parseFloat(getProfile(townA)?.poverty_rate || '20') * 3), [townB]: Math.max(0, 100 - parseFloat(getProfile(townB)?.poverty_rate || '20') * 3) },
      { metric: 'Graduation',  [townA]: getGrad(townA), [townB]: getGrad(townB) },
      { metric: 'Low Unemp',   [townA]: Math.max(0, 100 - getUnemp(townA) * 10), [townB]: Math.max(0, 100 - getUnemp(townB) * 10) },
      { metric: 'Safety',      [townA]: Math.max(0, 100 - getCrashes(townA) / 25), [townB]: Math.max(0, 100 - getCrashes(townB) / 25) },
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, unemp, crashes, grad, townA, townB])

  const barData = metrics.filter(m => m.unit !== '$').map(m => ({
    label: m.label,
    [townA]: m.a,
    [townB]: m.b,
  }))

  if (pl) return <LoadingSpinner message="Loading town data for comparison…" />

  const winnerFor = (m: CompareMetric) => {
    if (m.a === m.b) return 'tie'
    return (m.higherIsBetter ? m.a > m.b : m.a < m.b) ? townA : townB
  }

  const scoreA = metrics.filter(m => winnerFor(m) === townA).length
  const scoreB = metrics.filter(m => winnerFor(m) === townB).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Town Comparison Tool</h1>
        <p className="text-slate-500 text-sm mt-1">Side-by-side comparison of any two CT municipalities across income, education, safety, and labor</p>
      </div>

      {/* Town pickers */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Town A</label>
            <select value={townA} onChange={e => setTownA(e.target.value)}
              className="w-full border-2 border-ct-blue rounded-xl px-3 py-2.5 text-sm font-bold text-ct-navy focus:outline-none">
              {TOWNS.filter(t => t !== townB).map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="h-1.5 rounded-full mt-2" style={{ background: COLOR_A }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Town B</label>
            <select value={townB} onChange={e => setTownB(e.target.value)}
              className="w-full border-2 border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-700 focus:outline-none">
              {TOWNS.filter(t => t !== townA).map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="h-1.5 rounded-full mt-2" style={{ background: COLOR_B }} />
          </div>
        </div>

        {/* Score banner */}
        <div className="mt-4 flex items-center justify-center gap-6 py-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: COLOR_A }}>{scoreA}</p>
            <p className="text-xs text-slate-500">{townA} wins</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">metrics compared</p>
            <p className="text-xs text-slate-400">({metrics.length} total)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: COLOR_B }}>{scoreB}</p>
            <p className="text-xs text-slate-500">{townB} wins</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Multi-Dimensional Profile" description="Normalized score (higher = better on each dimension)" />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} outerRadius={100}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Radar name={townA} dataKey={townA} stroke={COLOR_A} fill={COLOR_A} fillOpacity={0.15} strokeWidth={2} />
              <Radar name={townB} dataKey={townB} stroke={COLOR_B} fill={COLOR_B} fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <SectionHeader title="Side-by-Side Metrics" description="Unemployment, poverty, graduation, crashes" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey={townA} fill={COLOR_A} radius={[0, 3, 3, 0]} />
              <Bar dataKey={townB} fill={COLOR_B} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed metrics table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SectionHeader title="Detailed Comparison" description="Head-to-head across all available metrics" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200 text-xs">
                <th className="text-left px-4 py-2.5">Metric</th>
                <th className="text-right px-4 py-2.5" style={{ color: COLOR_A }}>{townA}</th>
                <th className="text-right px-4 py-2.5" style={{ color: COLOR_B }}>{townB}</th>
                <th className="text-center px-4 py-2.5">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {metrics.map(m => {
                const winner = winnerFor(m)
                const fmtVal = (v: number) => m.unit === '$' ? fmt$(v) : m.unit === '%' ? `${v.toFixed(1)}%` : v.toLocaleString()
                return (
                  <tr key={m.label} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{m.label}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${winner === townA ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {fmtVal(m.a)}
                      {winner === townA && <span className="ml-1 text-emerald-500">✓</span>}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${winner === townB ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {fmtVal(m.b)}
                      {winner === townB && <span className="ml-1 text-emerald-500">✓</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {winner === 'tie'
                        ? <span className="text-xs text-slate-400">Tie</span>
                        : <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: winner === townA ? COLOR_A : COLOR_B }}>{winner}</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-700 text-xs uppercase tracking-widest">Overall Score</td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-lg font-black" style={{ color: COLOR_A }}>{scoreA}</span>
                  <span className="text-xs text-slate-400"> / {metrics.length}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-lg font-black" style={{ color: COLOR_B }}>{scoreB}</span>
                  <span className="text-xs text-slate-400"> / {metrics.length}</span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  {scoreA !== scoreB && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: scoreA > scoreB ? COLOR_A : COLOR_B }}>
                      {scoreA > scoreB ? townA : townB} leads
                    </span>
                  )}
                  {scoreA === scoreB && <span className="text-xs text-slate-400">Tied</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-slate-400 px-4 py-2 border-t border-slate-100">
          ✓ indicates the better-performing town on that metric. Winner determined by which value is more favorable (higher income, lower poverty, higher graduation = better).
        </p>
      </div>
    </div>
  )
}
