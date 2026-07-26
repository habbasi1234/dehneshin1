import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, unlinkSync, readdirSync } from 'fs'
import { requireAdmin } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_PATH = join(__dirname, '..', 'uploads')
const THUMB_PATH = join(UPLOAD_PATH, 'thumbs')
const MEDIUM_PATH = join(UPLOAD_PATH, 'medium')

if (!existsSync(UPLOAD_PATH)) mkdirSync(UPLOAD_PATH, { recursive: true })
if (!existsSync(THUMB_PATH)) mkdirSync(THUMB_PATH, { recursive: true })
if (!existsSync(MEDIUM_PATH)) mkdirSync(MEDIUM_PATH, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_PATH),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('فرمت فایل مجاز نیست'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 30 * 1024 * 1024 } })
const router = Router()

async function processImage(filePath, generateSizes = true) {
  const ext = extname(filePath).toLowerCase()
  if (['.svg', '.pdf', '.gif'].includes(ext)) return filePath
  try {
    const meta = await sharp(filePath).metadata()
    const baseName = filePath.split('\\').pop().split('/').pop().replace(ext, '')
    const dir = filePath.substring(0, filePath.lastIndexOf('\\'))

    const kernel = sharp.kernel.lanczos3
    const resizeOpts = { fit: 'inside', withoutEnlargement: true, kernel }

    if (generateSizes) {
      await sharp(filePath)
        .resize(480, 320, { fit: 'cover', kernel })
        .sharpen({ sigma: 1.2, m1: 0.8, m2: 0.5 })
        .webp({ quality: 90, effort: 6 })
        .toFile(join(THUMB_PATH, `${baseName}.webp`))
      await sharp(filePath)
        .resize(1600, undefined, resizeOpts)
        .sharpen({ sigma: 1, m1: 0.6, m2: 0.4 })
        .webp({ quality: 95, effort: 6 })
        .toFile(join(MEDIUM_PATH, `${baseName}.webp`))
    }

    const outPath = join(dir, `${baseName}.webp`)
    const pipeline = sharp(filePath)
    if (meta.width > 3840) {
      pipeline.resize(3840, undefined, { ...resizeOpts, withoutReduction: false })
    }
    await pipeline
      .sharpen({ sigma: 1.5, m1: 0.8, m2: 0.5, x1: 3, y2: 10, y3: 70 })
      .webp({ quality: 97, effort: 6, smartSubsample: true })
      .toFile(outPath)

    try {
      const avifPath = join(dir, `${baseName}.avif`)
      const avifPipeline = sharp(filePath)
      if (meta.width > 3840) {
        avifPipeline.resize(3840, undefined, resizeOpts)
      }
      await avifPipeline
        .sharpen({ sigma: 1.2, m1: 0.6, m2: 0.4 })
        .avif({ quality: 90, effort: 4 })
        .toFile(avifPath)
    } catch {}

    try { unlinkSync(filePath) } catch {}
    return outPath
  } catch (e) {
    console.error('Image processing error:', e.message)
  }
  return filePath
}

router.post('/single', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی انتخاب نشده' })
  try {
    const processed = await processImage(req.file.path)
    const filename = processed.split('\\').pop().split('/').pop()
    const base = filename.replace('.webp', '')
    res.json({
      url: `/uploads/${filename}`,
      filename,
      thumb: `/uploads/thumbs/${base}.webp`,
      medium: `/uploads/medium/${base}.webp`,
      avif: `/uploads/${base}.avif`
    })
  } catch {
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename })
  }
})

router.post('/multiple', requireAdmin, upload.array('images', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'فایلی انتخاب نشده' })
  try {
    const results = await Promise.all(req.files.map(async (f) => {
      const processed = await processImage(f.path)
      const filename = processed.split('\\').pop().split('/').pop()
      const base = filename.replace('.webp', '')
      return { url: `/uploads/${filename}`, filename, thumb: `/uploads/thumbs/${base}.webp`, medium: `/uploads/medium/${base}.webp`, avif: `/uploads/${base}.avif` }
    }))
    res.json({ urls: results })
  } catch {
    const urls = req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename }))
    res.json({ urls })
  }
})

router.post('/optimize-existing', requireAdmin, async (req, res) => {
  try {
    const files = readdirSync(UPLOAD_PATH).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.includes('.webp'))
    let done = 0, errors = 0
    for (const file of files) {
      try {
        await processImage(join(UPLOAD_PATH, file))
        done++
      } catch { errors++ }
    }
    res.json({ optimized: done, errors, total: files.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
