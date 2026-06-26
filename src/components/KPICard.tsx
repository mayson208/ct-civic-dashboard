interface Props {
  title: string
  value: string | number
  subtitle?: string
  delta?: { value: string; positive: boolean }
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate'
}

const colorMap = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
  red:    'bg-red-50 border-red-200 text-red-700',
  yellow: 'bg-amber-50 border-amber-200 text-amber-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  slate:  'bg-slate-50 border-slate-200 text-slate-700',
}

export default function KPICard({ title, value, subtitle, delta, icon, color = 'blue' }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-black mt-1 text-slate-800">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
      {delta && (
        <p className={`text-xs mt-1 font-semibold ${delta.positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta.positive ? '▲' : '▼'} {delta.value} vs prior year
        </p>
      )}
    </div>
  )
}
