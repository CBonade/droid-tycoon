import { useEffect, useRef } from 'react'

// Chip upgrade costs from the in-game infographic
const CHIP_UPGRADE_COSTS = [
  { rarity: 'Gold',    costs: [5, 30, 120, 400] },
  { rarity: 'Diamond', costs: [25, 50, 180, 1200] },
  { rarity: 'Rainbow', costs: [40, 100, 240, 4000] },
  { rarity: 'Beskar',  costs: [80, 250, 5000, 12000] },
]

const RARITY_COLOR = {
  Gold:    'text-amber-400',
  Diamond: 'text-cyan-300',
  Rainbow: 'text-pink-400',
  Beskar:  'text-slate-300',
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-orbitron text-xs text-sw-gold tracking-widest uppercase mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function ReferenceDrawer({ open, onClose }) {
  const sheetRef = useRef(null)
  const startY   = useRef(null)

  // Close on backdrop tap
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Swipe-down to close
  function onTouchStart(e) { startY.current = e.touches[0].clientY }
  function onTouchEnd(e) {
    if (startY.current !== null && e.changedTouches[0].clientY - startY.current > 60) onClose()
    startY.current = null
  }

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={handleBackdrop}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`absolute bottom-0 left-0 right-0 max-h-[80vh] bg-sw-deep border-t border-sw-border
                    rounded-t-2xl flex flex-col transition-transform duration-300 ease-out
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-sw-border" />
        </div>

        <div className="px-5 pb-2 flex-shrink-0">
          <h2 className="font-orbitron text-base font-bold text-sw-gold tracking-wider">REFERENCE</h2>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">

          <Section title="Chip Upgrade Costs">
            <p className="text-[11px] text-sw-muted font-rajdhani mb-2">Chips required to upgrade a droid slot</p>
            <div className="rounded-lg border border-sw-border overflow-hidden text-xs font-rajdhani">
              <div className="grid grid-cols-5 bg-sw-surface px-3 py-2 text-sw-muted uppercase tracking-wider text-[10px]">
                <span>Rarity</span>
                <span className="text-center">Lvl 1</span>
                <span className="text-center">Lvl 2</span>
                <span className="text-center">Lvl 3</span>
                <span className="text-center">Lvl 4</span>
              </div>
              {CHIP_UPGRADE_COSTS.map((row, i) => (
                <div key={row.rarity} className={`grid grid-cols-5 px-3 py-2.5 ${i % 2 === 0 ? 'bg-sw-void' : 'bg-sw-deep'}`}>
                  <span className={`font-semibold ${RARITY_COLOR[row.rarity]}`}>{row.rarity}</span>
                  {row.costs.map((c, j) => (
                    <span key={j} className="text-center text-white">{c}</span>
                  ))}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Chip Sell Values">
            <p className="text-sw-muted font-rajdhani text-sm">
              Chips earned when selling a droid vary by the droid's classification (Common → Mythic) and rarity tier.
              Fill this in from your in-game sell screen.
            </p>
          </Section>

          <Section title="Nova Crystals — Super Rebirth">
            <p className="text-sw-muted font-rajdhani text-sm">
              Nova crystals earned per Super Rebirth level. Add values here once sourced.
            </p>
          </Section>

        </div>
      </div>
    </div>
  )
}
