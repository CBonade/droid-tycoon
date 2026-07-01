import { MIN_STEP, MAX_STEP, STEP_COSTS } from '../utils/rarity'

export default function TargetStepper({ target, onChange }) {
  const dec = () => onChange(Math.max(MIN_STEP, target - 1))
  const inc = () => onChange(Math.min(MAX_STEP, target + 1))

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between bg-sw-surface border border-sw-border rounded-xl p-4">
        <div>
          <p className="text-xs font-rajdhani text-sw-dim uppercase tracking-widest">
            Super Rebirth Target
          </p>
          <p className="text-[11px] text-sw-gold font-rajdhani mt-0.5">
            Credits needed: <span className="font-bold">{STEP_COSTS[target] ?? '—'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={dec}
            disabled={target <= MIN_STEP}
            className="w-10 h-10 rounded-lg bg-sw-deep border border-sw-border
                       text-sw-gold font-orbitron text-lg font-bold
                       active:scale-90 transition-transform
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease target"
          >
            −
          </button>

          <div className="text-center min-w-[3rem]">
            <span className="font-orbitron text-3xl font-bold text-sw-gold text-shadow-gold">
              {target}
            </span>
          </div>

          <button
            onClick={inc}
            disabled={target >= MAX_STEP}
            className="w-10 h-10 rounded-lg bg-sw-deep border border-sw-border
                       text-sw-gold font-orbitron text-lg font-bold
                       active:scale-90 transition-transform
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase target"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
