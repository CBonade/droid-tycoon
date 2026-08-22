import { CYCLE_IDENTIFIERS, CYCLE_TIEBREAKERS } from '../utils/rarity'

export default function CyclePicker({ cycle, onChange }) {
  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-rajdhani text-sw-dim uppercase tracking-widest mb-2">
        Select Your Cycle
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`cycle-btn ${cycle === c ? 'active' : ''}`}
          >
            <span className={`font-orbitron text-sm font-bold ${cycle === c ? 'text-sw-gold' : 'text-sw-dim'}`}>
              {c}
            </span>
            <div className="flex flex-col items-center gap-0.5">
              {CYCLE_IDENTIFIERS[c].map(d => (
                <span key={d} className="text-[9px] font-rajdhani text-sw-dim leading-tight text-center">
                  {d}
                </span>
              ))}
              {CYCLE_TIEBREAKERS[c] && (
                <span className="text-[8px] font-rajdhani text-sw-blue leading-tight text-center">
                  {CYCLE_TIEBREAKERS[c]}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-sw-muted mt-1.5">
        Match your Rebirth 1 droids to identify your cycle. Cycles 2 & 5 share a trio — check which droid your Rebirth 2 needs.
      </p>
    </div>
  )
}
