import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { RARITY_ORDER, DEFAULT_TARGET, MIN_STEP, MAX_STEP } from './utils/rarity'
import CyclePicker from './components/CyclePicker'
import TargetStepper from './components/TargetStepper'
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

function writeState(cycle, target) {
  localStorage.setItem('dt_cycle', cycle)
  localStorage.setItem('dt_target', target)
  const url = new URL(window.location)
  url.searchParams.set('cycle', cycle)
  url.searchParams.set('target', target)
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
  const [cycle, setCycleRaw]   = useState(() => readParam('cycle', 1, 1, 4))
  const [target, setTargetRaw] = useState(() => readParam('target', DEFAULT_TARGET, MIN_STEP, MAX_STEP))
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState(null)
  const [sort, setSort]        = useState('firstStep')
  const [search, setSearch]    = useState('')
  const [refOpen, setRefOpen]  = useState(false)

  const setCycle = useCallback((c) => {
    setCycleRaw(c)
    setTargetRaw(prev => { writeState(c, prev); return prev })
  }, [])

  const setTarget = useCallback((t) => {
    setTargetRaw(t)
    setCycleRaw(prev => { writeState(prev, t); return prev })
  }, [])

  useEffect(() => { writeState(cycle, target) }, [])

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

  const droids = useMemo(
    () => computeDroidList(requirements, target, sort, search),
    [requirements, target, sort, search]
  )

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
          <CyclePicker cycle={cycle} onChange={c => { setCycle(c); writeState(c, target) }} />
        </div>

        <div className="border-t border-sw-border/50 pt-4">
          <TargetStepper target={target} onChange={t => { setTarget(t); writeState(cycle, t) }} />
        </div>

        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="flex-1 h-px bg-sw-border" />
          <span className="text-[10px] font-orbitron text-sw-muted tracking-widest uppercase">Required Droids</span>
          <div className="flex-1 h-px bg-sw-border" />
        </div>

        <SortSearchBar sort={sort} onSort={setSort} search={search} onSearch={setSearch} />
      </div>

      {/* Droid list */}
      <div className="flex-1 overflow-auto pb-8">
        <div className="max-w-lg mx-auto w-full">
          <DroidList droids={droids} loading={loading} error={error} />
        </div>
      </div>

      <ReferenceDrawer open={refOpen} onClose={() => setRefOpen(false)} />
    </div>
  )
}
