import { useState, useEffect } from 'react'
import { MAX_CYCLE, MIN_SUPER_REBIRTH } from '../utils/rarity'
import { SRB_REWARDS } from './ReferenceDrawer'

export default function SuperRebirthButton({ cycle, current, onSuperRebirth }) {
  const [confirming, setConfirming] = useState(false)
  const nextCycle = (cycle % MAX_CYCLE) + 1
  const reward = SRB_REWARDS.find(r => r.rb === current)
  const locked = current < MIN_SUPER_REBIRTH

  // Any change to cycle or level cancels a pending confirmation
  useEffect(() => { setConfirming(false) }, [cycle, current])

  if (confirming) {
    return (
      <div className="px-4 pb-4">
        <div className="bg-sw-gold/10 border border-sw-gold rounded-xl p-3">
          <p className="font-rajdhani text-sm text-sw-gold-lt text-center">
            Move to <span className="font-bold">Cycle {nextCycle}</span> and reset to Rebirth 0?
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => setConfirming(false)}
              className="h-11 rounded-lg bg-sw-deep border border-sw-border font-orbitron text-xs text-sw-dim active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirming(false); onSuperRebirth() }}
              className="h-11 rounded-lg bg-sw-gold border border-sw-gold font-orbitron text-xs font-bold text-sw-void active:scale-95 transition-transform"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <button
        onClick={() => setConfirming(true)}
        disabled={locked}
        className="w-full rounded-xl border border-sw-gold/60 bg-sw-surface px-4 py-3 text-left
                   active:scale-[0.98] transition-transform
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:border-sw-border"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-orbitron text-sm font-bold text-sw-gold tracking-wider whitespace-nowrap">Super Rebirth</span>
          <span className="font-orbitron text-[11px] text-sw-dim whitespace-nowrap">to Cycle {nextCycle}</span>
        </span>
        <span className="block font-rajdhani text-[11px] text-sw-dim mt-0.5">
          {locked
            ? `Unlocks at Rebirth ${MIN_SUPER_REBIRTH}`
            : reward
              ? `+${reward.crystals} Nova crystals · +${reward.creditMult}% credits · +${reward.xpMult}% XP`
              : 'Start the next cycle at Rebirth 0'}
        </span>
      </button>
    </div>
  )
}
