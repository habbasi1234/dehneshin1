import sharp from 'sharp'
import { readdirSync, existsSync, mkdirSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const PRODS_DIR = join(__dirname, 'uploads', 'products')
const THUMBS_DIR = join(__dirname, 'uploads', 'thumbs')
const MEDIUM_DIR = join(__dirname, 'uploads', 'medium')

for (const d of [PRODS_DIR, THUMBS_DIR, MEDIUM_DIR]) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
}

const files = readdirSync(DATA_DIR).filter(f => /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(f))
console.log(`Images found: ${files.length}`)

let ok = 0, err = 0
for (const file of files) {
  const src = join(DATA_DIR, file)
  const ext = extname(file).toLowerCase()
  const base = file.replace(ext, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
  const ts = Date.now() + ok
  const name = `${base}-${ts}.webp`
  const out = join(PRODS_DIR, name)
  const thumb = join(THUMBS_DIR, name)
  const medium = join(MEDIUM_DIR, name)
  if (existsSync(out)) { ok++; continue }
  try {
    const meta = await sharp(src).metadata()
    await sharp(src).resize(480, 320, { fit: 'cover', kernel: sharp.kernel.lanczos3 }).sharpen({ sigma: 1.2, m1: 0.8, m2: 0.5 }).webp({ quality: 90, effort: 6 }).toFile(thumb)
    await sharp(src).resize(1600, undefined, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 }).sharpen({ sigma: 1, m1: 0.6, m2: 0.4 }).webp({ quality: 95, effort: 6 }).toFile(medium)
    const p = sharp(src)
    if (meta.width > 3840) p.resize(3840, undefined, { fit: 'inside', withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    await p.sharpen({ sigma: 1.5, m1: 0.8, m2: 0.5, x1: 3, y2: 10, y3: 70 }).webp({ quality: 97, effort: 6, smartSubsample: true }).toFile(out)
    ok++
  } catch (e) { err++; console.log(`ERR: ${file} - ${e.message}`) }
}
console.log(`Done! Processed: ${ok}, Errors: ${err}`)
