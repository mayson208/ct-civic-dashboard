interface Props {
  title: string
  description?: string
  source?: string
  lastUpdated?: string
  live?: boolean
}

export default function SectionHeader({ title, description, source, lastUpdated, live }: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {live && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live Data
          </span>
        )}
      </div>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      {(source || lastUpdated) && (
        <p className="text-xs text-slate-400 mt-1">
          {source && <>Source: <span className="text-ct-sky">{source}</span></>}
          {source && lastUpdated && ' · '}
          {lastUpdated && <>Updated: {lastUpdated}</>}
        </p>
      )}
    </div>
  )
}
