import { useState } from 'react'
import { RARITY_LABEL, RARITY_STYLES } from '../utils/rarity'
import { portraitUrl } from '../utils/portrait'
import { recipesUsing } from '../data/fusions'
import FusionPanel from './FusionPanel'

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

function FusionChip({ label }) {
  return (
    <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-orbitron font-bold tracking-wide
                     text-teal-300 border border-teal-500 bg-teal-500/10">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
        <path d="M9 6h3a4 4 0 0 1 4 4v1" /><path d="M9 18h3a4 4 0 0 0 4-4v-1" /><path d="M16 12h5" />
      </svg>
      {label}
    </span>
  )
}

// view: 'needed' | 'upNext' | 'sell'. Cards open a FusionPanel when the droid has exclusive
// recipes, or (outside Ready to Sell) when a tier-up fusion can reach its required tier.
export default function DroidCard({ droid, view, expanded, onToggle, plan }) {
  const upNext = view === 'upNext'
  const { name, imageUrl, isNew } = droid
  const rarity = upNext ? droid.rarity : droid.maxRarity
  const style = RARITY_STYLES[rarity]

  const recipes = recipesUsing(name)
  const showTierUp = view !== 'sell' && rarity !== 'base'
  const expandable = recipes.length > 0 || showTierUp
  const open = expandable && expanded
  const chip = recipes.length === 0 ? null
    : view === 'sell' ? 'FUSION INPUT'
    : recipes.length > 1 ? `FUSION ×${recipes.length}` : 'FUSION'

  const Row = expandable ? 'button' : 'div'

  return (
    <div className={`rounded-lg border bg-sw-surface overflow-hidden transition-colors ${open ? 'border-teal-500' : 'border-sw-border'}`}>
      <Row
        {...(expandable ? { type: 'button', onClick: onToggle, 'aria-expanded': open } : {})}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <Avatar key={rarity} name={name} imageUrl={portraitUrl(imageUrl, rarity)} rarity={rarity} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-rajdhani font-semibold text-white text-sm leading-tight truncate">
              {name}
            </p>
            {isNew && (
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-orbitron font-bold uppercase tracking-wider bg-emerald-500 text-emerald-950">
                New
              </span>
            )}
            {chip && <FusionChip label={chip} />}
          </div>
          {upNext ? (
            <p className="text-[11px] text-sw-dim font-rajdhani mt-0.5">
              Required for <span className="text-sw-blue">R{droid.step}</span>
            </p>
          ) : (
            <>
              <p className="text-[11px] text-sw-dim font-rajdhani mt-0.5">
                First needed: <span className="text-sw-blue">R{droid.firstStep}</span>
              </p>
              <p className="text-[11px] text-sw-dim font-rajdhani">
                Safe to sell: <span className="text-emerald-400">after R{droid.lastStep}</span>
              </p>
            </>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <div className={`px-2.5 py-1 rounded-md text-[11px] font-orbitron ${style.badge}`}>
            {RARITY_LABEL[rarity]}
          </div>
          {expandable && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                 className={`text-sw-dim transition-transform ${open ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </div>
      </Row>

      {open && <FusionPanel name={name} rarity={rarity} recipes={recipes} showTierUp={showTierUp} plan={plan} />}
    </div>
  )
}
