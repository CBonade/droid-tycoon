// Downloads droid portraits from gonk.tools and self-hosts them as 256px WebP.
// Source list: scripts/portrait-sources.json (one entry per droid, one URL path per tier).
// Output: public/droids/<slug>/<tier>.webp
//
// Usage: npm run fetch-portraits
// Kyber has no portrait art yet; the client falls back to the stellar file for kyber.

import sharp from 'sharp'
import { mkdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir   = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, '..', 'public', 'droids')
const HOST    = 'https://gonk.tools'

const { droids, fusions } = JSON.parse(await readFile(join(__dir, 'portrait-sources.json'), 'utf8'))
const missing = []
let saved = 0

for (const { name, slug, tiers } of [...droids, ...fusions]) {
  await mkdir(join(OUT_DIR, slug), { recursive: true })
  for (const [tier, path] of Object.entries(tiers)) {
    const res = await fetch(HOST + path)
    // gonk.tools answers unknown paths with its HTML app shell (200), so check the type, not the status
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) {
      missing.push(`${name} ${tier}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await sharp(buf).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82 }).toFile(join(OUT_DIR, slug, `${tier}.webp`))
    saved++
  }
}

console.log(`Saved ${saved} portraits to public/droids/`)
if (missing.length) console.log(`Missing (${missing.length}):\n  ${missing.join('\n  ')}`)
