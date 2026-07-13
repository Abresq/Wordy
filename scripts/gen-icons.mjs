import { readFileSync } from 'fs'
import sharp from 'sharp'

const src = readFileSync('public/WORDY ICON.png')

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size).png().toFile(`public/${name}`)
  console.log(`public/${name} ✓`)
}
