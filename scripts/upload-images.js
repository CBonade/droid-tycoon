// Uploads all files from droid-crops/ to the Supabase "droid-images" storage bucket.
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (not VITE_ prefixed — server-side only).
//
// Pre-reqs:
//   1. Create a PUBLIC bucket named "droid-images" in the Supabase dashboard (Storage tab)
//   2. Add SUPABASE_SERVICE_ROLE_KEY=<key> to .env
//   3. npm run crop-droids (or node scripts/crop-droids.js) to generate droid-crops/
//   4. node scripts/upload-images.js

import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config()

const __dir = dirname(fileURLToPath(import.meta.url))
const CROP_DIR = join(__dir, '..', 'droid-crops')
const BUCKET = 'droid-images'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

// Verify we have a real service-role key (not anon)
let role
try {
  const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
  role = payload.role
} catch {}
if (role !== 'service_role') {
  console.error(`SUPABASE_SERVICE_ROLE_KEY has role="${role}" — that is not a service_role key.`)
  console.error('Get the real service role key from: Supabase dashboard → Project Settings → API → service_role secret')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const files = (await readdir(CROP_DIR)).filter(f => f.endsWith('.png'))
console.log(`Uploading ${files.length} images to ${BUCKET}…\n`)

let ok = 0
let fail = 0

for (const file of files) {
  const buf  = await readFile(join(CROP_DIR, file))
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(file, buf, { contentType: 'image/png', upsert: true })

  if (error) {
    console.error(`  FAIL ${file}: ${error.message}`)
    fail++
  } else {
    process.stdout.write('.')
    ok++
  }
}

console.log(`\n\nDone: ${ok} uploaded, ${fail} failed.`)
if (ok > 0) {
  console.log(`\nPublic URL pattern: ${url}/storage/v1/object/public/${BUCKET}/<name>__<rarity>.png`)
}
