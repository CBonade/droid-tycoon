import { RARITY_LABEL, RARITY_STYLES } from '../utils/rarity'

function initials(name) {
  return name.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase()
}

const RARITY_AVATAR = {
  base:    'bg-gray-700 text-gray-300',
  gold:    'bg-amber-900/60 text-amber-400',
  diamond: 'bg-cyan-900/60 text-cyan-300',
  rainbow: 'rainbow-badge text-gray-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]',
  beskar:  'beskar-badge text-slate-900',
}

export default function DroidCard({ droid }) {
  const { name, firstStep, lastStep, maxRarity } = droid
  const style = RARITY_STYLES[maxRarity]

  return (
    <div className="droid-card">
      {/* Avatar */}
      <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center font-orbitron text-[10px] font-bold border border-sw-border ${RARITY_AVATAR[maxRarity]}`}>
        {initials(name)}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="font-rajdhani font-semibold text-white text-sm leading-tight truncate">
          {name}
        </p>
        <p className="text-[11px] text-sw-dim font-rajdhani mt-0.5">
          First needed: <span className="text-sw-blue">R{firstStep}</span>
        </p>
        <p className="text-[11px] text-sw-dim font-rajdhani">
          Safe to sell: <span className="text-emerald-400">after R{lastStep}</span>
        </p>
      </div>

      {/* Rarity badge */}
      <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-orbitron ${style.badge}`}>
        {RARITY_LABEL[maxRarity]}
      </div>
    </div>
  )
}
