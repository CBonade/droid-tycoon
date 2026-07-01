import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dir, '..', 'public')

const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0a0a14"/>
  <circle cx="256" cy="256" r="215" fill="none" stroke="#C9A84C" stroke-width="10"/>
  <circle cx="256" cy="256" r="195" fill="none" stroke="#C9A84C" stroke-width="2" opacity="0.4"/>
  <text x="256" y="210" font-family="Arial Black, sans-serif" font-weight="900"
        font-size="100" fill="#C9A84C" text-anchor="middle" letter-spacing="8">DROID</text>
  <text x="256" y="330" font-family="Arial Black, sans-serif" font-weight="900"
        font-size="100" fill="#C9A84C" text-anchor="middle" letter-spacing="8">TYCOON</text>
  <line x1="96" y1="250" x2="176" y2="250" stroke="#C9A84C" stroke-width="2" opacity="0.6"/>
  <line x1="336" y1="250" x2="416" y2="250" stroke="#C9A84C" stroke-width="2" opacity="0.6"/>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(192, 192).toFile(join(publicDir, 'icon-192.png'))
console.log('✓ icon-192.png')

await sharp(buf).resize(512, 512).toFile(join(publicDir, 'apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')
