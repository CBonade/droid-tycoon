import { useEffect, useState } from 'react'
import { RARITY_ORDER, RARITY_LABEL, RARITY_STYLES } from '../utils/rarity'

const DROID_CLASSES = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic']
const CLASS_SHORT = { Common: 'Com', Rare: 'Rare', Epic: 'Epic', Legendary: 'Leg', Mythic: 'Myth' }
const CLASS_COLOR = {
  Common:    'text-gray-400',
  Rare:      'text-blue-400',
  Epic:      'text-purple-400',
  Legendary: 'text-amber-400',
  Mythic:    'text-rose-400',
}

// Chips to upgrade a slot INTO each tier (e.g. kyber = Stellar → Kyber)
const CHIP_UPGRADE_COSTS = {
  Common:    { gold: 10,   diamond: 25,   rainbow: 40,    beskar: 80,    galactic: 120,   stellar: 180,   kyber: 240 },
  Rare:      { gold: 30,   diamond: 60,   rainbow: 100,   beskar: 250,   galactic: 400,   stellar: 750,   kyber: 1000 },
  Epic:      { gold: 120,  diamond: 180,  rainbow: 240,   beskar: 2000,  galactic: 5000,  stellar: 8000,  kyber: 12000 },
  Legendary: { gold: 400,  diamond: 1200, rainbow: 2500,  beskar: 6000,  galactic: 16000, stellar: 24000, kyber: 30000 },
  Mythic:    { gold: 4000, diamond: 8000, rainbow: 14000, beskar: 30000, galactic: 60000, stellar: 90000, kyber: 110000 },
}

// Chips earned selling a droid of each tier (base droids sell for 0 chips)
const CHIP_SELL_VALUES = {
  Common:    { gold: 4,   diamond: 7,   rainbow: 10,  beskar: 13,  galactic: 16,  stellar: 19,  kyber: 22 },
  Rare:      { gold: 6,   diamond: 9,   rainbow: 12,  beskar: 15,  galactic: 18,  stellar: 21,  kyber: 24 },
  Epic:      { gold: 30,  diamond: 33,  rainbow: 36,  beskar: 39,  galactic: 42,  stellar: 45,  kyber: 48 },
  Legendary: { gold: 84,  diamond: 87,  rainbow: 90,  beskar: 93,  galactic: 96,  stellar: 99,  kyber: 102 },
  Mythic:    { gold: 192, diamond: 195, rainbow: 198, beskar: 201, galactic: 204, stellar: 207, kyber: 210 },
}

// Base-tier bay bonuses (%). Each tier multiplies them by its tier number: Base ×1 … Kyber ×8.
const PROTOCOL_DROIDS = [
  { name: 'SA-5', cls: 'Rare',      cps: 8,  crafting: 120 },
  { name: 'LOM',  cls: 'Epic',      cps: 12, crafting: 180 },
  { name: 'PZ',   cls: 'Legendary', cps: 16, crafting: 240 },
  { name: 'TDA',  cls: 'Mythic',    cps: 20, crafting: 300 },
]

const SRB_REWARDS = [
  { rb: 12, crystals: 11,  creditMult: 22,   xpMult: 110  },
  { rb: 13, crystals: 16,  creditMult: 32,   xpMult: 160  },
  { rb: 14, crystals: 22,  creditMult: 44,   xpMult: 220  },
  { rb: 15, crystals: 29,  creditMult: 58,   xpMult: 290  },
  { rb: 16, crystals: 37,  creditMult: 74,   xpMult: 370  },
  { rb: 17, crystals: 46,  creditMult: 92,   xpMult: 460  },
  { rb: 18, crystals: 56,  creditMult: 112,  xpMult: 560  },
  { rb: 19, crystals: 67,  creditMult: 134,  xpMult: 670  },
  { rb: 20, crystals: 79,  creditMult: 158,  xpMult: 790  },
  { rb: 21, crystals: 92,  creditMult: 184,  xpMult: 920  },
  { rb: 22, crystals: 106, creditMult: 212,  xpMult: 1060 },
  { rb: 23, crystals: 121, creditMult: 242,  xpMult: 1210 },
  { rb: 24, crystals: 137, creditMult: 274,  xpMult: 1370 },
  { rb: 25, crystals: 154, creditMult: 308,  xpMult: 1540 },
  { rb: 26, crystals: 172, creditMult: 344,  xpMult: 1720 },
  { rb: 27, crystals: 191, creditMult: 382,  xpMult: 1910 },
  { rb: 28, crystals: 211, creditMult: 422,  xpMult: 2110 },
  { rb: 29, crystals: 232, creditMult: 464,  xpMult: 2320 },
  { rb: 30, crystals: 254, creditMult: 508,  xpMult: 2540 },
  { rb: 31, crystals: 277, creditMult: 554,  xpMult: 2770 },
  { rb: 32, crystals: 301, creditMult: 602,  xpMult: 3010 },
  { rb: 33, crystals: 326, creditMult: 652,  xpMult: 3260 },
  { rb: 34, crystals: 352, creditMult: 704,  xpMult: 3520 },
  { rb: 35, crystals: 379, creditMult: 758,  xpMult: 3790 },
  { rb: 36, crystals: 407, creditMult: 814,  xpMult: 4070 },
  { rb: 37, crystals: 436, creditMult: 872,  xpMult: 4360 },
  { rb: 38, crystals: 466, creditMult: 932,  xpMult: 4660 },
  { rb: 39, crystals: 497, creditMult: 994,  xpMult: 4970 },
  { rb: 40, crystals: 529, creditMult: 1058, xpMult: 5290 },
]

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-orbitron text-xs text-sw-gold tracking-widest uppercase mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 mb-2">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-orbitron tracking-wider border transition-colors
            ${value === o.value ? 'bg-sw-gold/20 border-sw-gold text-sw-gold' : 'bg-sw-surface border-sw-border text-sw-dim'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function TierPill({ tier }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-orbitron ${RARITY_STYLES[tier].badge}`}>
      {RARITY_LABEL[tier]}
    </span>
  )
}

// Tiers as rows, droid classes as columns — eight tiers don't fit across a phone screen.
function ChipTable({ data, note }) {
  const classes = DROID_CLASSES.filter(cls => data[cls])
  const tiers = RARITY_ORDER.filter(t => classes.some(cls => data[cls][t] != null))
  const cols = { gridTemplateColumns: `4.75rem repeat(${classes.length}, minmax(0, 1fr))` }

  return (
    <>
      {note && <p className="text-[11px] text-sw-muted font-rajdhani mb-2">{note}</p>}
      <div className="rounded-lg border border-sw-border overflow-hidden text-xs font-rajdhani">
        <div className="grid bg-sw-surface px-3 py-2 text-[10px] font-orbitron tracking-wider" style={cols}>
          <span className="text-sw-muted">Tier</span>
          {classes.map(cls => <span key={cls} className={`text-right ${CLASS_COLOR[cls]}`}>{CLASS_SHORT[cls]}</span>)}
        </div>
        {tiers.map((tier, i) => (
          <div key={tier} className={`grid items-center px-3 py-2 ${i % 2 === 0 ? 'bg-sw-void' : 'bg-sw-deep'}`} style={cols}>
            <span><TierPill tier={tier} /></span>
            {classes.map(cls => (
              <span key={cls} className="text-right text-white tabular-nums">{data[cls][tier]?.toLocaleString() ?? '—'}</span>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function ProtocolTable() {
  const [picked, setPicked] = useState('TDA')
  const droid = PROTOCOL_DROIDS.find(d => d.name === picked)

  return (
    <>
      <p className="text-[11px] text-sw-muted font-rajdhani mb-2">
        Each droid bay has one protocol slot for credits per second and one for crafting speed. The bonus applies to that bay.
      </p>
      <Segmented
        options={PROTOCOL_DROIDS.map(d => ({ value: d.name, label: d.name }))}
        value={picked}
        onChange={setPicked}
      />
      <div className="rounded-lg border border-sw-border overflow-hidden text-xs font-rajdhani">
        <div className="grid grid-cols-3 bg-sw-surface px-3 py-2 text-[10px] font-orbitron tracking-wider">
          <span className={CLASS_COLOR[droid.cls]}>{droid.cls}</span>
          <span className="text-right text-sw-gold">CPS</span>
          <span className="text-right text-emerald-400">Crafting</span>
        </div>
        {RARITY_ORDER.map((tier, i) => (
          <div key={tier} className={`grid grid-cols-3 items-center px-3 py-2 ${i % 2 === 0 ? 'bg-sw-void' : 'bg-sw-deep'}`}>
            <span><TierPill tier={tier} /></span>
            <span className="text-right text-sw-gold tabular-nums">+{(droid.cps * (i + 1)).toLocaleString()}%</span>
            <span className="text-right text-emerald-400 tabular-nums">+{(droid.crafting * (i + 1)).toLocaleString()}%</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function ReferenceDrawer({ open, onClose }) {
  let startY = null
  const [chipMode, setChipMode] = useState('upgrade')

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

          <Section title="Upgrade Chips">
            <Segmented
              options={[{ value: 'upgrade', label: 'UPGRADE COST' }, { value: 'sell', label: 'SELL VALUE' }]}
              value={chipMode}
              onChange={setChipMode}
            />
            {chipMode === 'upgrade'
              ? <ChipTable data={CHIP_UPGRADE_COSTS} note="Chips to upgrade a droid slot into each tier, from the tier below" />
              : <ChipTable data={CHIP_SELL_VALUES} note="Chips earned when selling a droid of each tier" />}
          </Section>

          <Section title="Protocol Droids">
            <ProtocolTable />
          </Section>

        </div>
      </div>
    </div>
  )
}
