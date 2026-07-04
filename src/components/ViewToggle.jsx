const VIEWS = [
  { value: 'needed', label: 'Still Needed' },
  { value: 'upNext', label: 'Up Next' },
  { value: 'sell',   label: 'Ready to Sell' },
]

export default function ViewToggle({ view, onChange, neededCount, upNextCount, sellCount }) {
  const count = { needed: neededCount, upNext: upNextCount, sell: sellCount }

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-3 gap-2">
        {VIEWS.map(v => (
          <button
            key={v.value}
            onClick={() => onChange(v.value)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-orbitron border transition-colors
              ${view === v.value
                ? 'bg-sw-gold/20 border-sw-gold text-sw-gold'
                : 'bg-sw-surface border-sw-border text-sw-dim'}`}
          >
            {v.label}
            <span className="text-[10px] opacity-70">({count[v.value]})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
