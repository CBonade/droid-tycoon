import { useState } from 'react'
import { RARITY_LABEL, RARITY_STYLES } from '../utils/rarity'

function initials(name) {
  return name.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase()
}

function Avatar({ name, imageUrl, rarity }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showImage = imageUrl && !failed

  return (
    <div className={`relative w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center font-orbitron text-[10px] font-bold border border-sw-border overflow-hidden ${RARITY_AVATAR[rarity]}`}>
      {!(showImage && loaded) && initials(name)}
      {showImage && (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-contain"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

const RARITY_AVATAR = {
  base:    'bg-gray-700 text-gray-300',
  gold:    'bg-amber-900/60 text-amber-400',
  diamond: 'bg-cyan-900/60 text-cyan-300',
  rainbow: 'rainbow-badge text-gray-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]',
  beskar:  'beskar-badge text-slate-900',
  galactic: 'galactic-badge text-white',
  stellar:  'stellar-badge text-amber-950',
  kyber:    'kyber-badge text-white',
}

export default function DroidCard({ droid, variant = 'default' }) {
  if (variant === 'upNext') {
    const { name, imageUrl, rarity, step } = droid
    const style = RARITY_STYLES[rarity]

    return (
      <div className="droid-card">
        <Avatar name={name} imageUrl={imageUrl} rarity={rarity} />

        <div className="flex-1 min-w-0">
          <p className="font-rajdhani font-semibold text-white text-sm leading-tight truncate">
            {name}
          </p>
          <p className="text-[11px] text-sw-dim font-rajdhani mt-0.5">
            Required for <span className="text-sw-blue">R{step}</span>
          </p>
        </div>

        <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-orbitron ${style.badge}`}>
          {RARITY_LABEL[rarity]}
        </div>
      </div>
    )
  }

  const { name, imageUrl, firstStep, lastStep, maxRarity, isNew } = droid
  const style = RARITY_STYLES[maxRarity]

  return (
    <div className="droid-card">
      <Avatar name={name} imageUrl={imageUrl} rarity={maxRarity} />

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-rajdhani font-semibold text-white text-sm leading-tight truncate">
            {name}
          </p>
          {isNew && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-orbitron font-bold uppercase tracking-wider bg-emerald-500 text-emerald-950">
              New
            </span>
          )}
        </div>
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
