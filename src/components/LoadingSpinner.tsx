export default function LoadingSpinner({ message = 'Loading data from data.ct.gov…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-ct-sky rounded-full animate-spin mb-3" style={{ borderWidth: 3 }} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
      <p className="font-semibold">Data unavailable</p>
      <p className="text-xs mt-1 text-red-500">{message}</p>
      <p className="text-xs mt-1 text-red-400">Showing cached sample data instead.</p>
    </div>
  )
}
