import mongoose from 'mongoose'
import { readdirSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import Product from './models/Product.js'
import Setting from './models/Setting.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'data')
const MONGO_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']
const skipPatterns = [/screenshot/i, /\.heic/i, /۲۰۲۴/, /RAYSHA/i, /Untitled/i]

async function assignImages() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  const files = readdirSync(DATA_PATH)
    .filter(f => imageExts.includes(extname(f).toLowerCase()))
    .filter(f => !skipPatterns.some(p => p.test(f)))
    .sort()

  console.log(`Found ${files.length} usable images in data folder`)

  const products = await Product.find({}).sort({ id: 1 }).lean()
  console.log(`Found ${products.length} products`)

  const perProduct = Math.max(1, Math.floor(files.length / products.length))
  let idx = 0

  for (const product of products) {
    const assigned = []
    for (let i = 0; i < perProduct && idx < files.length; i++) {
      assigned.push(`/data/${files[idx]}`)
      idx++
    }
    if (assigned.length > 0) {
      await Product.updateOne({ id: product.id }, { $set: { images: assigned } })
      console.log(`  Product #${product.id} (${product.name_fa || product.name}): ${assigned.length} images`)
    }
  }

  const galleryImages = files.slice(idx)
  console.log(`\n${galleryImages.length} images remaining for gallery`)

  const galleryItems = galleryImages.map(f => ({ src: `/data/${f}`, title: '', active: true }))

  const settings = await Setting.findById('global')
  const update = { gallerySettings: { type: 'grid', images: galleryItems } }
  await Setting.findByIdAndUpdate('global', { $set: update }, { upsert: true })
  console.log(`Gallery updated with ${galleryItems.length} images`)

  await mongoose.disconnect()
  console.log('\nDone!')
}

assignImages().catch(e => { console.error(e); process.exit(1) })
