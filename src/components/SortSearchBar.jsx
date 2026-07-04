const SORT_OPTIONS = [
  { value: 'firstStep', label: 'First Needed' },
  { value: 'rarity',   label: 'Rarity' },
  { value: 'name',     label: 'Name' },
]

const SELL_SORT_OPTION = { value: 'recentSell', label: 'Recently Sellable' }

export default function SortSearchBar({ sort, onSort, search, onSearch, view }) {
  const sortOptions = view === 'sell' ? [...SORT_OPTIONS, SELL_SORT_OPTION] : SORT_OPTIONS

  return (
    <div className="px-4 pb-3 flex flex-col gap-2">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search droids…"
          className="w-full bg-sw-deep border border-sw-border rounded-lg pl-3 pr-9 py-2
                     text-sm font-rajdhani text-white placeholder:text-sw-muted
                     focus:outline-none focus:border-sw-gold/60
                     [&::-webkit-search-cancel-button]:appearance-none"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                       rounded-full text-sw-dim active:scale-90 transition-transform"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {sortOptions.map(o => (
          <button
            key={o.value}
            onClick={() => onSort(o.value)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-orbitron border transition-colors
              ${sort === o.value
                ? 'bg-sw-gold/20 border-sw-gold text-sw-gold'
                : 'bg-sw-surface border-sw-border text-sw-dim'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
