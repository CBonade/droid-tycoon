// Crops individual droid images from the cycle infographics.
// For each (droid, rarity) pair we need, finds the first occurrence across any cycle
// and crops that cell. Output: /tmp/droid-crops/{name}_{rarity}.png

import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const IMGS   = '/Users/cbonade/.claude/image-cache/cf6a6ef3-6ed4-4280-bc62-fecded52ec68'
const OUTDIR = join(__dir, '..', 'droid-crops')

// ── Grid layout (1055 × 1490px) ─────────────────────────────────────────────
// Left col  = steps 1-10,  Right col = steps 11-20
// Beskar   21-22 = bottom-left, 23 = bottom-right
const GRID_TOP    = 62
const ROW_H       = 125
const CELL_W      = 120  // droid image crop width
const CELL_H      = 90   // droid image crop height (excludes most of the label text)
const CELL_PAD_Y  = 6    // offset from top of row

// x starting positions for each column position (left / right)
const COL_X = {
  left:  [88,  218, 348],
  right: [615, 745, 875],
}

// Beskar rows are below the 10 main rows
const BESKAR_TOP = GRID_TOP + 10 * ROW_H + 10
const BESKAR_H   = 73

// Beskar x positions match left/right columns
// Steps 21-22 are on the left side, step 23 on the right
function cellCoords(step, pos0) {
  if (step >= 1 && step <= 10) {
    return {
      left: COL_X.left[pos0],
      top:  GRID_TOP + (step - 1) * ROW_H + CELL_PAD_Y,
      width: CELL_W, height: CELL_H,
    }
  }
  if (step >= 11 && step <= 20) {
    return {
      left: COL_X.right[pos0],
      top:  GRID_TOP + (step - 11) * ROW_H + CELL_PAD_Y,
      width: CELL_W, height: CELL_H,
    }
  }
  // Beskar 21-23
  if (step === 21 || step === 22) {
    return {
      left:  COL_X.left[pos0],
      top:   BESKAR_TOP + (step - 21) * BESKAR_H + CELL_PAD_Y,
      width: CELL_W, height: BESKAR_H - CELL_PAD_Y,
    }
  }
  if (step === 23) {
    return {
      left:  COL_X.right[pos0],
      top:   BESKAR_TOP + CELL_PAD_Y,
      width: CELL_W, height: BESKAR_H - CELL_PAD_Y,
    }
  }
  return null
}

// ── All requirements (cycle, step, pos0=0|1|2, droid, rarity) ───────────────
// pos0 = 0-indexed position within the row
const REQUIREMENTS = [
  // CYCLE 1
  [1,  1, 0, 'CB',            'base'],
  [1,  1, 1, 'PIT',           'base'],
  [1,  1, 2, 'DRK-1 PROBE',  'base'],
  [1,  2, 0, 'BDX EXPLORER', 'base'],
  [1,  2, 1, '2BB',           'base'],
  [1,  2, 2, 'BAL-CORE',     'base'],
  [1,  3, 0, 'A-LT',         'base'],
  [1,  3, 1, 'D-U4D',        'base'],
  [1,  3, 2, 'R9',           'gold'],
  [1,  4, 0, 'ARG',          'gold'],
  [1,  4, 1, 'B1 SECURITY',  'gold'],
  [1,  4, 2, 'GROUNDMECH',   'base'],
  [1,  5, 0, 'D-U4D',        'gold'],
  [1,  5, 1, 'HOV-R',        'gold'],
  [1,  5, 2, 'R9',           'diamond'],
  [1,  6, 0, 'GROUNDMECH',   'gold'],
  [1,  6, 1, 'ARG',          'diamond'],
  [1,  6, 2, 'A-LT',         'diamond'],
  [1,  7, 0, 'BB',           'gold'],
  [1,  7, 1, 'B1 SECURITY',  'diamond'],
  [1,  7, 2, 'D-U4D',        'diamond'],
  [1,  8, 0, 'UTIL-TEC',     'gold'],
  [1,  8, 1, 'LO',           'gold'],
  [1,  8, 2, 'NOV-R',        'diamond'],
  [1,  9, 0, 'GROUNDMECH',   'rainbow'],
  [1,  9, 1, 'R6',           'gold'],
  [1,  9, 2, 'TRAK-R',       'gold'],
  [1, 10, 0, 'LO',           'rainbow'],
  [1, 10, 1, 'HAUL-R',       'rainbow'],
  [1, 10, 2, 'STRIKE-ORB',   'gold'],
  [1, 11, 0, 'AMP WALKER',   'rainbow'],
  [1, 11, 1, 'B1 HEAVY',     'rainbow'],
  [1, 11, 2, 'BB9',          'base'],
  [1, 12, 0, 'PROTO-ROLLER', 'gold'],
  [1, 12, 1, 'MONO-WLKR',   'base'],
  [1, 12, 2, 'MECHA-DROID',  'base'],
  [1, 13, 0, 'R7',           'base'],
  [1, 13, 1, 'CYCLO-GRAV',   'base'],
  [1, 13, 2, 'B2-RP',        'base'],
  [1, 14, 0, 'OPTI-STRK',    'base'],
  [1, 14, 1, 'MONO-WLKR',   'gold'],
  [1, 14, 2, 'MECHA-DROID',  'gold'],
  [1, 15, 0, 'B2-RP',        'gold'],
  [1, 15, 1, 'BB9',          'gold'],
  [1, 15, 2, 'R7',           'gold'],
  [1, 16, 0, 'OPTI-STRK',    'gold'],
  [1, 16, 1, 'MONO-WLKR',   'diamond'],
  [1, 16, 2, 'PROTO-ROLLER', 'diamond'],
  [1, 17, 0, 'B2-RP',        'diamond'],
  [1, 17, 1, 'CYCLO-GRAV',   'diamond'],
  [1, 17, 2, 'MECHA-DROID',  'diamond'],
  [1, 18, 0, 'BB9',          'diamond'],
  [1, 18, 1, 'R7',           'diamond'],
  [1, 18, 2, 'MONO-WLKR',   'rainbow'],
  [1, 19, 0, 'B2-RP',        'rainbow'],
  [1, 19, 1, 'CYCLO-GRAV',   'rainbow'],
  [1, 19, 2, 'PROTO-ROLLER', 'rainbow'],
  [1, 20, 0, 'R7',           'rainbow'],
  [1, 20, 1, 'OPTI-STRK',    'rainbow'],
  [1, 20, 2, 'MECHA-DROID',  'rainbow'],
  [1, 21, 0, 'BB',           'beskar'],
  [1, 21, 1, 'ORB-WALKER',   'beskar'],
  [1, 21, 2, 'GROUNDMECH',   'beskar'],
  [1, 22, 0, 'AMP WALKER',   'beskar'],
  [1, 22, 1, 'B1 HEAVY',     'beskar'],
  [1, 22, 2, 'PROTO-ROLLER', 'beskar'],
  [1, 23, 0, 'OPTI-STRK',    'beskar'],
  [1, 23, 1, 'MONO-WLKR',   'beskar'],
  [1, 23, 2, 'R7',           'beskar'],
  // CYCLE 2
  [2,  1, 0, 'MOUSE',           'base'],
  [2,  1, 1, 'GONK',            'base'],
  [2,  1, 2, 'ID10',            'base'],
  [2,  2, 0, 'ROLL-R',          'base'],
  [2,  2, 1, 'NAV-EX',          'base'],
  [2,  2, 2, 'SENATE HOVERCAM', 'base'],
  [2,  3, 0, 'R4',              'base'],
  [2,  3, 1, 'VECT-ARM',        'base'],
  [2,  3, 2, 'BDX EXPLORER',    'gold'],
  [2,  4, 0, '2BB',             'gold'],
  [2,  4, 1, 'BAL-CORE',        'gold'],
  [2,  4, 2, 'ORB-WALKER',      'base'],
  [2,  5, 0, 'R4',              'gold'],
  [2,  5, 1, 'VECT-ARM',        'gold'],
  [2,  5, 2, 'NAV-EX',          'gold'],
  [2,  6, 0, 'GUNRUNNER',       'base'],
  [2,  6, 1, '2BB',             'diamond'],
  [2,  6, 2, 'BAL-CORE',        'diamond'],
  [2,  7, 0, 'ROLL-R',          'diamond'],
  [2,  7, 1, 'BDX EXPLORER',    'diamond'],
  [2,  7, 2, 'R2',              'gold'],
  [2,  8, 0, 'R4',              'diamond'],
  [2,  8, 1, 'B2 SUPER',        'gold'],
  [2,  8, 2, 'GUNRUNNER',       'gold'],
  [2,  9, 0, 'NAV-EX',          'rainbow'],
  [2,  9, 1, 'AMP WALKER',      'gold'],
  [2,  9, 2, 'STRIKE-ORB',      'gold'],
  [2, 10, 0, 'VECT-ARM',        'rainbow'],
  [2, 10, 1, 'R2',              'diamond'],
  [2, 10, 2, 'B2 SUPER',        'diamond'],
  [2, 11, 0, 'STRIKE-ORB',      'diamond'],
  [2, 11, 1, 'B2 HEAVY',        'diamond'],
  [2, 11, 2, 'BAL-CORE',        'rainbow'],
  [2, 12, 0, 'ORB-WALKER',      'rainbow'],
  [2, 12, 1, 'R2',              'rainbow'],
  [2, 12, 2, 'BB9',             'base'],
  [2, 13, 0, 'B2 SUPER',        'rainbow'],
  [2, 13, 1, 'MECHA-DROID',     'base'],
  [2, 13, 2, 'PROTO-ROLLER',    'base'],
  [2, 14, 0, 'B2 HEAVY',        'rainbow'],
  [2, 14, 1, 'B2-RP',           'base'],
  [2, 14, 2, 'R7',              'gold'],
  [2, 15, 0, 'STRIKE-ORB',      'rainbow'],
  [2, 15, 1, 'BB9',             'gold'],
  [2, 15, 2, 'PROTO-ROLLER',    'gold'],
  [2, 16, 0, 'B2-RP',           'diamond'],
  [2, 16, 1, 'AMP WALKER',      'rainbow'],
  [2, 16, 2, 'MECHA-DROID',     'gold'],
  [2, 17, 0, 'OPTI-POD',        'rainbow'],
  [2, 17, 1, 'R7',              'diamond'],
  [2, 17, 2, 'MONO-WLKR',      'diamond'],
  [2, 18, 0, 'UTIL-TEC',        'rainbow'],
  [2, 18, 1, 'BB9',             'diamond'],
  [2, 18, 2, 'PROTO-ROLLER',    'diamond'],
  [2, 19, 0, 'MECHA-DROID',     'diamond'],
  [2, 19, 1, 'R7',              'rainbow'],
  [2, 19, 2, 'B2-RP',           'rainbow'],
  [2, 20, 0, 'MONO-WLKR',      'rainbow'],
  [2, 20, 1, 'OPTI-STRK',       'rainbow'],
  [2, 20, 2, 'CYCLO-GRAV',      'rainbow'],
  [2, 21, 0, 'LO',              'beskar'],
  [2, 21, 1, 'R6',              'beskar'],
  [2, 21, 2, 'HAUL-R',          'beskar'],
  [2, 22, 0, 'SEN-TRI',         'beskar'],
  [2, 22, 1, 'STRIKE-ORB',      'beskar'],
  [2, 22, 2, 'PROTO-ROLLER',    'beskar'],
  [2, 23, 0, 'BB9',             'beskar'],
  [2, 23, 1, 'CYCLO-GRAV',      'beskar'],
  [2, 23, 2, 'B2-RP',           'beskar'],
  // CYCLE 3
  [3,  1, 0, 'MOUSE',           'base'],
  [3,  1, 1, 'PIT',             'base'],
  [3,  1, 2, 'GONK',            'base'],
  [3,  2, 0, '2BB',             'base'],
  [3,  2, 1, 'R3',              'base'],
  [3,  2, 2, 'SENATE HOVERCAM', 'base'],
  [3,  3, 0, 'R4',              'base'],
  [3,  3, 1, 'R5',              'base'],
  [3,  3, 2, 'R8',              'base'],
  [3,  4, 0, 'R9',              'gold'],
  [3,  4, 1, 'B1 BATTLE',       'gold'],
  [3,  4, 2, 'B1 SECURITY',     'gold'],
  [3,  5, 0, '2BB',             'gold'],
  [3,  5, 1, 'R3',              'gold'],
  [3,  5, 2, 'SENATE HOVERCAM', 'gold'],
  [3,  6, 0, 'BDX EXPLORER',    'diamond'],
  [3,  6, 1, 'R4',              'diamond'],
  [3,  6, 2, 'R5',              'diamond'],
  [3,  7, 0, 'R8',              'diamond'],
  [3,  7, 1, 'R9',              'diamond'],
  [3,  7, 2, 'B1 BATTLE',       'diamond'],
  [3,  8, 0, 'B1 SECURITY',     'rainbow'],
  [3,  8, 1, 'R3',              'rainbow'],
  [3,  8, 2, '2BB',             'rainbow'],
  [3,  9, 0, 'BDX EXPLORER',    'rainbow'],
  [3,  9, 1, 'R4',              'rainbow'],
  [3,  9, 2, 'R5',              'rainbow'],
  [3, 10, 0, 'TRAK-R',          'base'],
  [3, 10, 1, 'GROUNDMECH',      'base'],
  [3, 10, 2, 'SENATE HOVERCAM', 'rainbow'],
  [3, 11, 0, 'B2 HEAVY',        'base'],
  [3, 11, 1, 'B2 SUPER',        'base'],
  [3, 11, 2, 'UTIL-TEC',        'base'],
  [3, 12, 0, 'TRAK-R',          'gold'],
  [3, 12, 1, 'GROUNDMECH',      'gold'],
  [3, 12, 2, 'BAL-CORE',        'rainbow'],
  [3, 13, 0, 'B2 SUPER',        'rainbow'],
  [3, 13, 1, 'MECHA-DROID',     'base'],
  [3, 13, 2, 'PROTO-ROLLER',    'base'],
  [3, 14, 0, 'B2 HEAVY',        'rainbow'],
  [3, 14, 1, 'B2-RP',           'base'],
  [3, 14, 2, 'R7',              'gold'],
  [3, 15, 0, 'STRIKE-ORB',      'rainbow'],
  [3, 15, 1, 'BB9',             'gold'],
  [3, 15, 2, 'PROTO-ROLLER',    'gold'],
  [3, 16, 0, 'AMP WALKER',      'rainbow'],
  [3, 16, 1, 'B2-RP',           'diamond'],
  [3, 16, 2, 'MECHA-DROID',     'gold'],
  [3, 17, 0, 'OPTI-POD',        'rainbow'],
  [3, 17, 1, 'R7',              'diamond'],
  [3, 17, 2, 'MONO-WLKR',      'diamond'],
  [3, 18, 0, 'UTIL-TEC',        'rainbow'],
  [3, 18, 1, 'BB9',             'diamond'],
  [3, 18, 2, 'PROTO-ROLLER',    'diamond'],
  [3, 19, 0, 'MECHA-DROID',     'diamond'],
  [3, 19, 1, 'R7',              'rainbow'],
  [3, 19, 2, 'B2-RP',           'rainbow'],
  [3, 20, 0, 'MONO-WLKR',      'rainbow'],
  [3, 20, 1, 'OPTI-STRK',       'rainbow'],
  [3, 20, 2, 'CYCLO-GRAV',      'rainbow'],
  [3, 21, 0, 'LO',              'beskar'],
  [3, 21, 1, 'R6',              'beskar'],
  [3, 21, 2, 'HAUL-R',          'beskar'],
  [3, 22, 0, 'SEN-TRI',         'beskar'],
  [3, 22, 1, 'STRIKE-ORB',      'beskar'],
  [3, 22, 2, 'PROTO-ROLLER',    'beskar'],
  [3, 23, 0, 'BB9',             'beskar'],
  [3, 23, 1, 'CYCLO-GRAV',      'beskar'],
  [3, 23, 2, 'B2-RP',           'beskar'],
  // CYCLE 4
  [4,  1, 0, 'ID10',            'base'],
  [4,  1, 1, 'PIT',             'base'],
  [4,  1, 2, 'DRK-1 PROBE',    'base'],
  [4,  2, 0, 'R3',              'base'],
  [4,  2, 1, '2BB',             'base'],
  [4,  2, 2, 'SENATE HOVERCAM', 'base'],
  [4,  3, 0, 'R4',              'base'],
  [4,  3, 1, 'R5',              'base'],
  [4,  3, 2, 'R8',              'gold'],
  [4,  4, 0, 'R9',              'gold'],
  [4,  4, 1, 'B1 BATTLE',       'gold'],
  [4,  4, 2, 'B1 SECURITY',     'gold'],
  [4,  5, 0, '2BB',             'gold'],
  [4,  5, 1, 'R3',              'gold'],
  [4,  5, 2, 'SENATE HOVERCAM', 'gold'],
  [4,  6, 0, 'BDX EXPLORER',    'diamond'],
  [4,  6, 1, 'R4',              'diamond'],
  [4,  6, 2, 'R5',              'diamond'],
  [4,  7, 0, 'R8',              'diamond'],
  [4,  7, 1, 'R9',              'diamond'],
  [4,  7, 2, 'B1 BATTLE',       'diamond'],
  [4,  8, 0, 'B1 SECURITY',     'rainbow'],
  [4,  8, 1, 'R3',              'rainbow'],
  [4,  8, 2, '2BB',             'rainbow'],
  [4,  9, 0, 'BDX EXPLORER',    'rainbow'],
  [4,  9, 1, 'R4',              'rainbow'],
  [4,  9, 2, 'R5',              'rainbow'],
  [4, 10, 0, 'TRAK-R',          'base'],
  [4, 10, 1, 'GROUNDMECH',      'base'],
  [4, 10, 2, 'SENATE HOVERCAM', 'rainbow'],
  [4, 11, 0, 'B2 HEAVY',        'base'],
  [4, 11, 1, 'B2 SUPER',        'base'],
  [4, 11, 2, 'UTIL-TEC',        'base'],
  [4, 12, 0, 'BAL-CORE',        'rainbow'],
  [4, 12, 1, 'GROUNDMECH',      'gold'],
  [4, 12, 2, 'TRAK-R',          'gold'],
  [4, 13, 0, 'B2 SUPER',        'rainbow'],
  [4, 13, 1, 'MECHA-DROID',     'base'],
  [4, 13, 2, 'PROTO-ROLLER',    'base'],
  [4, 14, 0, 'BAL-CORE',        'diamond'],
  [4, 14, 1, 'GROUNDMECH',      'diamond'],
  [4, 14, 2, 'TRAK-R',          'rainbow'],
  [4, 15, 0, 'B2 HEAVY',        'diamond'],
  [4, 15, 1, 'B2 SUPER',        'rainbow'],
  [4, 15, 2, 'B2-RP',           'base'],
  [4, 16, 0, 'UTIL-TEC',        'rainbow'],
  [4, 16, 1, 'BB9',             'base'],
  [4, 16, 2, 'R7',              'gold'],
  [4, 17, 0, 'OPTI-STRK',       'base'],
  [4, 17, 1, 'CYCLO-GRAV',      'gold'],
  [4, 17, 2, 'MECHA-DROID',     'gold'],
  [4, 18, 0, 'B2-RP',           'gold'],
  [4, 18, 1, 'BB9',             'gold'],
  [4, 18, 2, 'R7',              'diamond'],
  [4, 19, 0, 'MECHA-DROID',     'diamond'],
  [4, 19, 1, 'R7',              'rainbow'],
  [4, 19, 2, 'B2-RP',           'rainbow'],
  [4, 20, 0, 'MONO-WLKR',      'rainbow'],
  [4, 20, 1, 'OPTI-STRK',       'rainbow'],
  [4, 20, 2, 'CYCLO-GRAV',      'rainbow'],
  [4, 21, 0, 'LO',              'beskar'],
  [4, 21, 1, 'R6',              'beskar'],
  [4, 21, 2, 'HAUL-R',          'beskar'],
  [4, 22, 0, 'SEN-TRI',         'beskar'],
  [4, 22, 1, 'STRIKE-ORB',      'beskar'],
  [4, 22, 2, 'PROTO-ROLLER',    'beskar'],
  [4, 23, 0, 'BB9',             'beskar'],
  [4, 23, 1, 'CYCLO-GRAV',      'beskar'],
  [4, 23, 2, 'B2-RP',           'beskar'],
]

// ── Build lookup: (droid, rarity) → first occurrence ────────────────────────
const RARITY_RANK = { base: 1, gold: 2, diamond: 3, rainbow: 4, beskar: 5 }

// For each (droid, rarity), record the first [cycle, step, pos] it appears
const needed = new Map()
for (const [cycle, step, pos, droid, rarity] of REQUIREMENTS) {
  const key = `${droid}__${rarity}`
  if (!needed.has(key)) {
    needed.set(key, { droid, rarity, cycle, step, pos })
  }
}

// ── Crop each ───────────────────────────────────────────────────────────────
await mkdir(OUTDIR, { recursive: true })

const jobs = [...needed.values()].map(async ({ droid, rarity, cycle, step, pos }) => {
  const coords = cellCoords(step, pos)
  if (!coords) { console.warn(`No coords for step ${step}`); return }

  const src  = join(IMGS, `${cycle}.png`)
  const safe = droid.replace(/[^a-zA-Z0-9-]/g, '_')
  const out  = join(OUTDIR, `${safe}__${rarity}.png`)

  try {
    await sharp(src)
      .extract({ left: coords.left, top: coords.top, width: coords.width, height: coords.height })
      .resize(96, 96, { fit: 'contain', background: { r: 20, g: 20, b: 40, alpha: 1 } })
      .toFile(out)
  } catch (e) {
    console.error(`Failed ${droid}/${rarity} (C${cycle} S${step} P${pos}):`, e.message)
  }
})

await Promise.all(jobs)
console.log(`\nCropped ${needed.size} unique (droid, rarity) pairs → ${OUTDIR}`)
