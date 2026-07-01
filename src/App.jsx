import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { RARITY_ORDER, DEFAULT_TARGET, MIN_STEP, MAX_STEP } from './utils/rarity'
import CyclePicker from './components/CyclePicker'
import TargetStepper from './components/TargetStepper'
import DroidList from './components/DroidList'

// ── URL + localStorage state sync ──────────────────────────────────────────
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

// ── Droid list computation ──────────────────────────────────────────────────
function computeDroidList(allRequirements, target) {
  const byDroid = new Map()

  for (const req of allRequirements) {
    if (req.step > target) continue

    const { id, name } = req.droid
    const rarityRank = RARITY_ORDER.indexOf(req.rarity)

    if (!byDroid.has(id)) {
      byDroid.set(id, {
        id, name,
        firstStep: req.step,
        lastStep: req.step,
        maxRarityRank: rarityRank,
      })
    } else {
      const entry = byDroid.get(id)
      if (req.step > entry.lastStep) entry.lastStep = req.step
      if (rarityRank > entry.maxRarityRank) entry.maxRarityRank = rarityRank
    }
  }

  return [...byDroid.values()]
    .map(d => ({ ...d, maxRarity: RARITY_ORDER[d.maxRarityRank] }))
    .sort((a, b) => a.firstStep !== b.firstStep
      ? a.firstStep - b.firstStep
      : a.name.localeCompare(b.name))
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cycle, setCycleRaw]   = useState(() => readParam('cycle', 1, 1, 4))
  const [target, setTargetRaw] = useState(() => readParam('target', DEFAULT_TARGET, MIN_STEP, MAX_STEP))
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const setCycle = useCallback((c) => {
    setCycleRaw(c)
    setTargetRaw(prev => { writeState(c, prev); return prev })
  }, [])

  const setTarget = useCallback((t) => {
    setTargetRaw(t)
    setCycleRaw(prev => { writeState(prev, t); return prev })
  }, [])

  useEffect(() => {
    writeState(cycle, target)
  }, []) // write initial URL params on mount

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
    () => computeDroidList(requirements, target),
    [requirements, target]
  )

  return (
    <div className="min-h-screen bg-sw-void flex flex-col">

      {/* Header */}
      <header className="scanline-header border-b border-sw-border pt-safe">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-orbitron text-xl font-black text-sw-gold text-shadow-gold tracking-wider">
              DROID TYCOON
            </h1>
            <span className="font-rajdhani text-xs text-sw-dim uppercase tracking-widest">
              Rebirth Planner
            </span>
          </div>
          <p className="font-rajdhani text-[11px] text-sw-muted mt-0.5">
            Star Wars · Fortnite
          </p>
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

        {/* Divider with label */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="flex-1 h-px bg-sw-border" />
          <span className="text-[10px] font-orbitron text-sw-muted tracking-widest uppercase">
            Required Droids
          </span>
          <div className="flex-1 h-px bg-sw-border" />
        </div>
      </div>

      {/* Droid list — scrollable */}
      <div className="flex-1 overflow-auto pb-8">
        <div className="max-w-lg mx-auto w-full">
          <DroidList droids={droids} loading={loading} error={error} />
        </div>
      </div>

    </div>
  )
}
