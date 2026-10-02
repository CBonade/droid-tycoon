// Exclusive fusion recipes: three crafted droids in, one fusion-only droid out.
// Input names match droid_tycoon_droids.name. Input order doesn't matter in-game;
// a repeated name means that many copies. The output takes the lowest input tier.
// Fusion-only droids are never rebirth requirements, so they live here, not in the database.
export const FUSION_RECIPES = [
  { output: 'WHL-EX',   cls: 'Rare',      inputs: ['MOUSE', 'MOUSE', 'ARG'] },
  { output: 'ZRO-TEC',  cls: 'Rare',      inputs: ['ID10', 'ID10', '2BB'] },
  { output: 'BTL-R',    cls: 'Rare',      inputs: ['B1 BATTLE', 'BDX EXPLORER', 'R9'] },
  { output: 'N-UL',     cls: 'Epic',      inputs: ['GUNRUNNER', 'BB', 'B1 HEAVY'] },
  { output: 'SCRP-R',   cls: 'Epic',      inputs: ['GONK', 'GROUNDMECH', 'R6'] },
  { output: 'ARM-CORE', cls: 'Epic',      inputs: ['ARG', 'ARG', 'B2 HEAVY'] },
  { output: 'OPT-AR',   cls: 'Epic',      inputs: ['R2', 'R2', 'B2 SUPER'] },
  { output: 'RO-TOR',   cls: 'Legendary', inputs: ['PIT', 'B1 BATTLE', 'BB9'] },
  { output: 'FUS-3',    cls: 'Legendary', inputs: ['B-U4D', 'B-U4D', 'R7'] },
  { output: 'QIK-BIT',  cls: 'Legendary', inputs: ['GROUNDMECH', 'GROUNDMECH', 'BB9'] },
  { output: 'ORB-XL',   cls: 'Legendary', inputs: ['CB', 'GUNRUNNER', 'B2-RP'] },
  { output: 'RIV-3T',   cls: 'Mythic',    inputs: ['RIC', 'IG', 'KX'] },
  { output: 'LUG-G',    cls: 'Mythic',    inputs: ['ID10', 'R5', 'LOADLIFTER'] },
  { output: 'LOW-MO',   cls: 'Mythic',    inputs: ['A-LT', 'A-LT', 'LOADLIFTER'] },
  { output: 'AXI-POD',  cls: 'Mythic',    inputs: ['BDX EXPLORER', 'R7', 'RIC'] },
  { output: 'SRV-O',    cls: 'Mythic',    inputs: ['B1 HEAVY', 'B1 HEAVY', 'RIC-1200'] },
  { output: 'X-ONK',    cls: 'Mythic',    inputs: ['GONK', 'KX', 'KX'] },
]

export function recipesUsing(name) {
  return FUSION_RECIPES.filter(r => r.inputs.includes(name))
}

export function fusionPortrait(output) {
  return `/droids/${output.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/base.webp`
}
