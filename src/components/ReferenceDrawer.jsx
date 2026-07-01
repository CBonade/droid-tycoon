import { useEffect } from 'react'

const DROID_CLASSES = ['Common', 'Rare', 'Epic', 'Legendary']
const CLASS_COLOR = {
  Common:    'text-gray-400',
  Rare:      'text-blue-400',
  Epic:      'text-purple-400',
  Legendary: 'text-amber-400',
}

const CHIP_UPGRADE_COSTS = {
  Common:    { gold: 5,   diamond: 10,   rainbow: 15,   beskar: 80 },
  Rare:      { gold: 30,  diamond: 50,   rainbow: 75,   beskar: 250 },
  Epic:      { gold: 120, diamond: 180,  rainbow: 240,  beskar: 5000 },
  Legendary: { gold: 400, diamond: 1200, rainbow: 4000, beskar: 12000 },
}

const CHIP_SELL_VALUES = {
  Common:    { gold: 4,  diamond: 7,  rainbow: 10, beskar: 13 },
  Rare:      { gold: 6,  diamond: 9,  rainbow: 12, beskar: 15 },
  Epic:      { gold: 30, diamond: 33, rainbow: 36, beskar: 39 },
  Legendary: { gold: 84, diamond: 87, rainbow: 90, beskar: 93 },
}

const SRB_REWARDS = [
  { rb: 12, crystals: 11,  creditMult: 22,  xpMult: 110  },
  { rb: 13, crystals: 16,  creditMult: 32,  xpMult: 160  },
  { rb: 14, crystals: 22,  creditMult: 44,  xpMult: 220  },
  { rb: 15, crystals: 29,  creditMult: 58,  xpMult: 290  },
  { rb: 16, crystals: 37,  creditMult: 74,  xpMult: 370  },
  { rb: 17, crystals: 46,  creditMult: 92,  xpMult: 460  },
  { rb: 18, crystals: 56,  creditMult: 112, xpMult: 560  },
  { rb: 19, crystals: 67,  creditMult: 134, xpMult: 670  },
  { rb: 20, crystals: 79,  creditMult: 158, xpMult: 790  },
  { rb: 21, crystals: 92,  creditMult: 184, xpMult: 920  },
  { rb: 22, crystals: 106, creditMult: 212, xpMult: 1060 },
  { rb: 23, crystals: 121, creditMult: 242, xpMult: 1210 },
  { rb: 24, crystals: 137, creditMult: 274, xpMult: 1370 },
  { rb: 25, crystals: 154, creditMult: 308, xpMult: 1540 },
  { rb: 26, crystals: 172, creditMult: 344, xpMult: 1720 },
  { rb: 27, crystals: 191, creditMult: 382, xpMult: 1910 },
]

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-orbitron text-xs text-sw-gold tracking-widest uppercase mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ChipTable({ data, note }) {
  return (
    <>
      {note && <p className="text-[11px] text-sw-muted font-rajdhani mb-2">{note}</p>}
      <div className="rounded-lg border border-sw-border overflow-hidden text-xs font-rajdhani">
        <div className="grid grid-cols-5 bg-sw-surface px-3 py-2 text-[10px] font-orbitron tracking-wider">
          <span className="text-sw-muted">Class</span>
          <span className="text-center text-amber-400">Gold</span>
          <span className="text-center text-cyan-300">Dia</span>
          <span className="text-center text-pink-400">Rain</span>
          <span className="text-center text-slate-300">Besk</span>
        </div>
        {DROID_CLASSES.map((cls, i) => (
          <div key={cls} className={`grid grid-cols-5 px-3 py-2.5 ${i % 2 === 0 ? 'bg-sw-void' : 'bg-sw-deep'}`}>
            <span className={`font-semibold ${CLASS_COLOR[cls]}`}>{cls}</span>
            <span className="text-center text-white">{data[cls].gold.toLocaleString()}</span>
            <span className="text-center text-white">{data[cls].diamond.toLocaleString()}</span>
            <span className="text-center text-white">{data[cls].rainbow.toLocaleString()}</span>
            <span className="text-center text-white">{data[cls].beskar.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function ReferenceDrawer({ open, onClose }) {
  let startY = null

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />

      <div
        onTouchStart={e => { startY = e.touches[0].clientY }}
        onTouchEnd={e => { if (e.changedTouches[0].clientY - startY > 60) onClose() }}
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-sw-deep border-t border-sw-border
                    rounded-t-2xl flex flex-col transition-transform duration-300 ease-out
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-sw-border" />
        </div>
        <div className="px-5 pb-2 flex-shrink-0 flex items-center justify-between">
          <h2 className="font-orbitron text-base font-bold text-sw-gold tracking-wider">REFERENCE</h2>
          <button onClick={onClose} className="text-sw-dim font-rajdhani text-sm px-2 py-1">✕ Close</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-10">

          <Section title="Super Rebirth Rewards">
            <div className="rounded-lg border border-sw-border overflow-hidden text-xs font-rajdhani">
              <div className="grid grid-cols-4 bg-sw-surface px-3 py-2 text-[10px] font-orbitron tracking-wider text-sw-muted">
                <span>Rebirth</span>
                <span className="text-center text-cyan-300">Nova ✦</span>
                <span className="text-center text-sw-gold">Credits</span>
                <span className="text-center text-emerald-400">XP</span>
              </div>
              {SRB_REWARDS.map((row, i) => (
                <div key={row.rb} className={`grid grid-cols-4 px-3 py-2 ${i % 2 === 0 ? 'bg-sw-void' : 'bg-sw-deep'}`}>
                  <span className="font-bold text-white">RB{row.rb}</span>
                  <span className="text-center text-cyan-300">{row.crystals}</span>
                  <span className="text-center text-sw-gold">+{row.creditMult}%</span>
                  <span className="text-center text-emerald-400">+{row.xpMult}%</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Chip Upgrade Costs">
            <ChipTable
              data={CHIP_UPGRADE_COSTS}
              note="Chips to upgrade a droid slot to the target rarity"
            />
          </Section>

          <Section title="Chip Sell Values">
            <ChipTable
              data={CHIP_SELL_VALUES}
              note="Chips earned when selling a droid"
            />
          </Section>

        </div>
      </div>
    </div>
  )
}
