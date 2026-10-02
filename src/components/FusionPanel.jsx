import { RARITY_ORDER, RARITY_LABEL } from '../utils/rarity'
import { fusionPortrait } from '../data/fusions'
import { portraitUrl } from '../utils/portrait'

const CLASS_COLOR = {
  Rare:      'text-blue-400',
  Epic:      'text-purple-400',
  Legendary: 'text-amber-400',
  Mythic:    'text-rose-400',
}

const STATUS = {
  needed:   { label: s => `Need to R${s.until}`, cls: 'text-sw-blue' },
  sellable: { label: () => 'Sellable',           cls: 'text-emerald-400' },
  none:     { label: () => 'Not in plan',        cls: 'text-sw-dim' },
}

function initials(name) {
  return name.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase()
}

function Tile({ name, src, ring }) {
  return (
    <div className={`relative w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center
                     font-orbitron text-[9px] font-bold bg-sw-deep text-sw-dim border ${ring}`}>
      {initials(name)}
      {src && (
        <img src={src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain"
             onError={e => { e.currentTarget.style.display = 'none' }} />
      )}
    </div>
  )
}

function recipeNote(inputs, statusOf) {
  const unique = [...new Set(inputs)]
  const needed  = unique.filter(n => statusOf(n).kind === 'needed')
  const missing = unique.filter(n => statusOf(n).kind === 'none')

  if (!needed.length && !missing.length) {
    return { text: 'Every input is sellable now. Fuse these instead of selling them.', cls: 'text-emerald-400 font-semibold' }
  }
  if (needed.length) {
    let text = `Fusing uses up ${needed.map(n => `${n} (needed to R${statusOf(n).until})`).join(', ')}. Wait until after that step.`
    if (missing.length) text += ` Also needs ${missing.join(', ')}.`
    return { text, cls: 'text-amber-400' }
  }
  return { text: `Also needs ${missing.join(', ')}, which ${missing.length > 1 ? 'are' : 'is'} not in your plan.`, cls: 'text-sw-dim' }
}

// Expanded detail under a droid card: the tier-up fusion (3 of the tier below → 1 of this tier)
// and every exclusive recipe this droid is an input to, with each input's status at current progress.
export default function FusionPanel({ name, rarity, recipes, showTierUp, plan }) {
  const prev = RARITY_ORDER[RARITY_ORDER.indexOf(rarity) - 1]

  return (
    <div className="border-t border-sw-border px-4 pt-3 pb-4 flex flex-col gap-3 bg-sw-deep">
      {showTierUp && prev && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-sw-border">
          <span className="font-orbitron text-[9px] tracking-wider text-sw-dim w-12 flex-shrink-0">TIER UP</span>
          <span className="text-[13px] text-gray-200 font-rajdhani">
            Fuse 3× {RARITY_LABEL[prev]} {name} to get 1× {RARITY_LABEL[rarity]} {name}
          </span>
        </div>
      )}

      {recipes.length > 0 && (
        <p className="font-orbitron text-[10px] tracking-widest text-teal-300">
          {recipes.length === 1 ? 'FUSION RECIPE' : `FUSION RECIPES · ${recipes.length}`}
        </p>
      )}

      {recipes.map(r => {
        const note = recipeNote(r.inputs, plan.statusOf)
        return (
          <div key={r.output} className="flex flex-col gap-2 p-2.5 rounded-lg bg-sw-surface border border-sw-border">
            <div className="flex items-start gap-1">
              {r.inputs.map((input, i) => {
                const s = plan.statusOf(input)
                return (
                  <div key={i} className="flex items-start gap-1">
                    <div className="w-[3.6rem] flex flex-col items-center gap-0.5 text-center">
                      <Tile
                        name={input}
                        src={portraitUrl(plan.imageOf(input), 'base')}
                        ring={input === name ? 'border-2 border-sw-gold shadow-gold' : 'border-sw-border'}
                      />
                      <span className="text-[11px] font-semibold text-white leading-tight font-rajdhani">{input}</span>
                      <span className={`text-[10px] font-bold leading-tight font-rajdhani ${STATUS[s.kind].cls}`}>
                        {STATUS[s.kind].label(s)}
                      </span>
                    </div>
                    <span className="text-sw-muted pt-3 font-rajdhani">{i < 2 ? '+' : '='}</span>
                  </div>
                )
              })}
              <div className="w-16 flex flex-col items-center gap-0.5 text-center">
                <Tile name={r.output} src={fusionPortrait(r.output)} ring="border-teal-400 bg-teal-950/40" />
                <span className="text-[11px] font-bold text-teal-300 leading-tight font-rajdhani">{r.output}</span>
                <span className={`text-[10px] leading-tight font-rajdhani ${CLASS_COLOR[r.cls]}`}>{r.cls}</span>
              </div>
            </div>
            <p className={`text-xs leading-snug font-rajdhani ${note.cls}`}>{note.text}</p>
          </div>
        )
      })}
    </div>
  )
}
