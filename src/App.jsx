import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { RARITY_ORDER, DEFAULT_TARGET, MIN_STEP, MAX_STEP, MIN_CURRENT, DEFAULT_CURRENT } from './utils/rarity'
import CyclePicker from './components/CyclePicker'
import TargetStepper from './components/TargetStepper'
import CurrentStepper from './components/CurrentStepper'
import ViewToggle from './components/ViewToggle'
import DroidList from './components/DroidList'
import SortSearchBar from './components/SortSearchBar'
import ReferenceDrawer from './components/ReferenceDrawer'

function readParam(key, fallback, min, max) {
  const url = new URLSearchParams(window.location.search)
  const urlVal = parseInt(url.get(key))
  if (!isNaN(urlVal) && urlVal >= min && urlVal <= max) return urlVal
  const stored = parseInt(localStorage.getItem(`dt_${key}`))
  if (!isNaN(stored) && stored >= min && stored <= max) return stored
  return fallback
}

function writeState(cycle, target, current) {
  localStorage.setItem('dt_cycle', cycle)
  localStorage.setItem('dt_target', target)
  localStorage.setItem('dt_current', current)
  const url = new URL(window.location)
  url.searchParams.set('cycle', cycle)
  url.searchParams.set('target', target)
  url.searchParams.set('current', current)
  window.history.replaceState({}, '', url)
}

function computeDroidList(allRequirements, target, sort, search) {
  const byDroid = new Map()

  for (const req of allRequirements) {
    if (req.step > target) continue
    const { id, name } = req.droid
    const rarityRank = RARITY_ORDER.indexOf(req.rarity)

    if (!byDroid.has(id)) {
      byDroid.set(id, { id, name, firstStep: req.step, lastStep: req.step, maxRarityRank: rarityRank })
    } else {
      const entry = byDroid.get(id)
      if (req.step > entry.lastStep) entry.lastStep = req.step
      if (rarityRank > entry.maxRarityRank) entry.maxRarityRank = rarityRank
    }
  }

  let list = [...byDroid.values()].map(d => ({ ...d, maxRarity: RARITY_ORDER[d.maxRarityRank] }))

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter(d => d.name.toLowerCase().includes(q))
  }

  list.sort((a, b) => {
    switch (sort) {
      case 'lastStep':  return a.lastStep  !== b.lastStep  ? a.lastStep  - b.lastStep  : a.name.localeCompare(b.name)
      case 'rarity':    return a.maxRarityRank !== b.maxRarityRank ? b.maxRarityRank - a.maxRarityRank : a.name.localeCompare(b.name)
      case 'name':      return a.name.localeCompare(b.name)
      default:          return a.firstStep !== b.firstStep ? a.firstStep - b.firstStep : a.name.localeCompare(b.name)
    }
  })

  return list
}

export default function App() {
  const [cycle, setCycleRaw]     = useState(() => readParam('cycle', 1, 1, 4))
  const [target, setTargetRaw]   = useState(() => readParam('target', DEFAULT_TARGET, MIN_STEP, MAX_STEP))
  const [current, setCurrentRaw] = useState(() => readParam('current', DEFAULT_CURRENT, MIN_CURRENT, MAX_STEP))
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState(null)
  const [sort, setSort]        = useState('firstStep')
  const [search, setSearch]    = useState('')
  const [refOpen, setRefOpen]  = useState(false)
  const [view, setView]        = useState('needed')

  const setCycle = useCallback((c) => {
    setCycleRaw(c)
    writeState(c, target, current)
  }, [target, current])

  const setTarget = useCallback((t) => {
    setTargetRaw(t)
    writeState(cycle, t, current)
  }, [cycle, current])

  const setCurrent = useCallback((cur) => {
    setCurrentRaw(cur)
    writeState(cycle, target, cur)
  }, [cycle, target])

  useEffect(() => { writeState(cycle, target, current) }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    supabase
      .from('droid_tycoon_requirements')
      .select('step, rarity, droid:droid_id(id, name)')
      .eq('cycle', cycle)
      .order('step', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) { setError(err); setLoading(false); return }
        setRequirements(data ?? [])
        setLoading(false)
      })
  }, [cycle])

  const allDroids = useMemo(
    () => computeDroidList(requirements, target, sort, search),
    [requirements, target, sort, search]
  )

  const neededDroids = useMemo(() => allDroids.filter(d => d.lastStep > current), [allDroids, current])
  const sellDroids   = useMemo(() => allDroids.filter(d => d.lastStep <= current), [allDroids, current])
  const droids = view === 'needed' ? neededDroids : sellDroids

  return (
    <div className="min-h-screen bg-sw-void flex flex-col">

      {/* Header */}
      <header className="scanline-header border-b border-sw-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="font-orbitron text-xl font-black text-sw-gold text-shadow-gold tracking-wider">
                DROID TYCOON
              </h1>
              <span className="font-rajdhani text-xs text-sw-dim uppercase tracking-widest">
                Rebirth Planner
              </span>
            </div>
            <p className="font-rajdhani text-[11px] text-sw-muted mt-0.5">Star Wars · Fortnite</p>
          </div>

          {/* Reference button */}
          <button
            onClick={() => setRefOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border border-sw-border bg-sw-surface active:scale-95 transition-transform"
          >
            <span className="text-[18px] leading-none">📋</span>
            <span className="font-orbitron text-[9px] text-sw-dim tracking-wider">REF</span>
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-lg mx-auto w-full">
        <div className="pt-4">
          <CyclePicker cycle={cycle} onChange={setCycle} />
        </div>

        <div className="border-t border-sw-border/50 pt-4">
          <TargetStepper target={target} onChange={setTarget} />
        </div>

        <div className="border-t border-sw-border/50 pt-4">
          <CurrentStepper current={current} onChange={setCurrent} />
        </div>

        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="flex-1 h-px bg-sw-border" />
          <span className="text-[10px] font-orbitron text-sw-muted tracking-widest uppercase">Droids</span>
          <div className="flex-1 h-px bg-sw-border" />
        </div>

        <ViewToggle view={view} onChange={setView} neededCount={neededDroids.length} sellCount={sellDroids.length} />

        <SortSearchBar sort={sort} onSort={setSort} search={search} onSearch={setSearch} />
      </div>

      {/* Droid list */}
      <div className="flex-1 overflow-auto pb-8">
        <div className="max-w-lg mx-auto w-full">
          <DroidList
            droids={droids}
            loading={loading}
            error={error}
            countLabel={view === 'needed' ? 'still needed' : 'ready to sell'}
            emptyText={view === 'needed'
              ? 'No droids left to get — everything up to your target is already past its sell point.'
              : 'Nothing to sell yet — no droids have passed their sell point.'}
          />
        </div>
      </div>

      <ReferenceDrawer open={refOpen} onClose={() => setRefOpen(false)} />
    </div>
  )
}
