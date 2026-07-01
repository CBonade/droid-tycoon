import { useState } from 'react'
import { RARITY_LABEL, RARITY_STYLES, getDroidImageUrl } from '../utils/rarity'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function DroidCard({ droid }) {
  const { name, firstStep, lastStep, maxRarity } = droid
  const style = RARITY_STYLES[maxRarity]
  const imgSrc = getDroidImageUrl(SUPABASE_URL, name, maxRarity)
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="droid-card">
      {/* Droid image */}
      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-sw-deep border border-sw-border flex items-center justify-center">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-sw-muted text-[10px] font-orbitron text-center leading-tight px-0.5">
            {name.slice(0, 3)}
          </span>
        )}
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
