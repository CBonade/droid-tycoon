import DroidCard from './DroidCard'

export default function DroidList({ droids, loading, error, countLabel = 'required', emptyText = 'No droids needed for this target.' }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-sw-surface border border-sw-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-4 p-4 rounded-lg border border-sw-red/30 bg-sw-red/10 text-sw-red text-sm font-rajdhani">
        Failed to load requirements. Check your connection and try again.
      </div>
    )
  }

  if (droids.length === 0) {
    return (
      <div className="mx-4 p-6 text-center text-sw-dim font-rajdhani text-sm">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      <p className="text-[11px] text-sw-muted font-rajdhani uppercase tracking-wider mb-1">
        {droids.length} droid{droids.length !== 1 ? 's' : ''} {countLabel}
      </p>
      {droids.map(d => (
        <DroidCard key={d.id} droid={d} />
      ))}
    </div>
  )
}
