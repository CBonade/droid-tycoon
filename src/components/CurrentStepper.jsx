import { MIN_CURRENT, MAX_STEP } from '../utils/rarity'

export default function CurrentStepper({ current, onChange }) {
  const dec = () => onChange(Math.max(MIN_CURRENT, current - 1))
  const inc = () => onChange(Math.min(MAX_STEP, current + 1))

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between bg-sw-surface border border-sw-border rounded-xl p-4">
        <div>
          <p className="text-xs font-rajdhani text-sw-dim uppercase tracking-widest">
            Current Rebirth Level
          </p>
          <p className="text-[11px] text-sw-muted font-rajdhani mt-0.5">
            Where you actually are right now
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={dec}
            disabled={current <= MIN_CURRENT}
            className="w-10 h-10 rounded-lg bg-sw-deep border border-sw-border
                       text-sw-gold font-orbitron text-lg font-bold
                       active:scale-90 transition-transform
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease current level"
          >
            −
          </button>

          <div className="text-center min-w-[3rem]">
            <span className="font-orbitron text-3xl font-bold text-sw-gold text-shadow-gold">
              {current}
            </span>
          </div>

          <button
            onClick={inc}
            disabled={current >= MAX_STEP}
            className="w-10 h-10 rounded-lg bg-sw-deep border border-sw-border
                       text-sw-gold font-orbitron text-lg font-bold
                       active:scale-90 transition-transform
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase current level"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
