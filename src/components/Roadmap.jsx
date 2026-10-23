import { useMemo } from 'react'
import { RARITY_STYLES, RARITY_LABEL, STEP_COSTS } from '../utils/rarity'

// Every rebirth between where you are and your target, with its droids.
// Only shown in the wide (unfolded) layout, where there is room beside the list.
export default function Roadmap({ requirements, loading, current, target }) {
  const steps = useMemo(() => {
    const byStep = new Map()
    for (const req of requirements) {
      if (req.step <= current || req.step > target) continue
      if (!byStep.has(req.step)) byStep.set(req.step, [])
      byStep.get(req.step).push({ name: req.droid.name, rarity: req.rarity })
    }
    return [...byStep.entries()]
      .sort(([a], [b]) => a - b)
      .map(([step, droids]) => ({ step, droids: droids.sort((a, b) => a.name.localeCompare(b.name)) }))
  }, [requirements, current, target])

  return (
    <section className="px-4 pb-6" aria-label="Rebirth roadmap">
      <div className="flex items-center gap-3 pb-3">
        <div className="flex-1 h-px bg-sw-border" />
        <span className="text-[10px] font-orbitron text-sw-muted tracking-widest uppercase">Roadmap</span>
        <div className="flex-1 h-px bg-sw-border" />
      </div>

      {loading ? null : steps.length === 0 ? (
        <p className="font-rajdhani text-xs text-sw-dim text-center">
          You're at your target. Raise it to see what's ahead.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {steps.map(({ step, droids }, i) => (
            <li
              key={step}
              className={`rounded-lg border px-3 py-2 ${i === 0 ? 'border-sw-gold/70 bg-sw-gold/10' : 'border-sw-border bg-sw-surface'}`}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-orbitron text-xs font-bold ${i === 0 ? 'text-sw-gold' : 'text-sw-dim'}`}>
                  R{step}{i === 0 && <span className="font-rajdhani font-semibold text-[10px] tracking-widest ml-2">NEXT</span>}
                </span>
                <span className="font-rajdhani text-[11px] text-sw-dim">{STEP_COSTS[step]}</span>
              </div>
              <ul className="flex flex-wrap gap-1 mt-1.5">
                {droids.map(d => (
                  <li
                    key={d.name}
                    title={`${RARITY_LABEL[d.rarity]} ${d.name}`}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-rajdhani font-bold leading-tight ${RARITY_STYLES[d.rarity].badge}`}
                  >
                    {d.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
