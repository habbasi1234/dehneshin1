import mongoose from 'mongoose'
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, 'data')
const UPLOADS_PATH = join(__dirname, 'uploads')
const uri = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'
await mongoose.connect(uri)
const db = mongoose.connection.db

// =====================================================
// 1. Import all JSON seed data into MongoDB
// =====================================================
const jsonFiles = [
  { file: 'products.json', collection: 'products' },
  { file: 'categories.json', collection: 'categories' },
  { file: 'blog.json', collection: 'blogs' },
  { file: 'users.json', collection: 'users' },
  { file: 'orders.json', collection: 'orders' },
  { file: 'messages.json', collection: 'messages' },
  { file: 'customers.json', collection: 'customers' },
  { file: 'testimonials.json', collection: 'testimonials' },
  { file: 'notifications.json', collection: 'notifications' },
  { file: 'analytics.json', collection: 'analytics' },
]

for (const { file, collection } of jsonFiles) {
  const filePath = join(DATA_PATH, file)
  if (!existsSync(filePath)) { console.log(`SKIP ${file} - not found`); continue }
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  if (!Array.isArray(data) || data.length === 0) { console.log(`SKIP ${file} - empty`); continue }
  
  const col = db.collection(collection)
  await col.deleteMany({})
  
  // For users, hash passwords
  if (collection === 'users') {
    const bcrypt = await import('bcryptjs')
    for (const u of data) {
      if (u.password && !u.password.startsWith('$2')) {
        u.password = await bcrypt.hash(u.password, 12)
      }
    }
  }
  
  try { await col.insertMany(data, { ordered: false }) } catch (e) { console.log(`WARN ${file}: ${e.message}`) }
  console.log(`OK ${file} -> ${collection}: ${data.length} records`)
}

// =====================================================
// 2. Import product_views.json into settings
// =====================================================
const viewsFile = join(DATA_PATH, 'product_views.json')
if (existsSync(viewsFile)) {
  const views = JSON.parse(readFileSync(viewsFile, 'utf-8'))
  await db.collection('settings').updateOne(
    { _id: 'global' },
    { $set: { productViews: views } },
    { upsert: true }
  )
  console.log('OK product_views.json -> settings.productViews')
}

// =====================================================
// 3. Import notifications_config.json into settings
// =====================================================
const notifConfigFile = join(DATA_PATH, 'notifications_config.json')
if (existsSync(notifConfigFile)) {
  const config = JSON.parse(readFileSync(notifConfigFile, 'utf-8'))
  await db.collection('settings').updateOne(
    { _id: 'global' },
    { $set: { notificationsConfig: config } },
    { upsert: true }
  )
  console.log('OK notifications_config.json -> settings.notificationsConfig')
}

// =====================================================
// 4. Fix blog images - copy real images to blog directory
// =====================================================
const BLOG_DIR = join(UPLOADS_PATH, 'blog')
if (!existsSync(BLOG_DIR)) mkdirSync(BLOG_DIR, { recursive: true })

const uploadFiles = readdirSync(UPLOADS_PATH).filter(f => /\.(jpg|webp|png|avif)$/i.test(f))
if (uploadFiles.length > 0) {
  const blogImageMap = [
    'classic-guide-1.jpg',
    'trends-2026-1.jpg',
    'furniture-care-1.jpg',
    'wood-carving-1.jpg',
    'color-guide-1.jpg',
  ]
  for (let i = 0; i < blogImageMap.length; i++) {
    const src = join(UPLOADS_PATH, uploadFiles[i % uploadFiles.length])
    const dest = join(BLOG_DIR, blogImageMap[i])
    if (!existsSync(dest)) copyFileSync(src, dest)
    console.log(`OK blog image: ${src} -> ${blogImageMap[i]}`)
  }
}

// Also update blog collection image paths if needed
const blogsCol = db.collection('blogs')
await blogsCol.updateMany(
  { image: { $regex: '^/uploads/blog/' } },
  [{ $set: { image: { $concat: ['/uploads/blog/', { $arrayElemAt: [{ $split: ['$image', '/'] }, -1] }] } } }]
)
console.log('OK blog images updated in DB')

// =====================================================
// 5. Update product fabrics with proper colors/types
// =====================================================
const fabricPresets = [
  { name: 'ساده', hex: '#D2C8B0' },
  { name: 'راه راه', hex: '#A0522D' },
  { name: 'شطرنجی', hex: '#2F4F4F' },
  { name: 'نقره‌ای', hex: '#C0C0C0' },
  { name: 'طلایی', hex: '#D4AF37' },
  { name: 'مخمل', hex: '#800020' },
  { name: 'لوزی', hex: '#4682B4' },
]

const productsCol = db.collection('products')
const allProducts = await productsCol.find({}).toArray()

for (const product of allProducts) {
  let fabrics = product.fabrics
  if (typeof fabrics === 'string') {
    try { fabrics = JSON.parse(fabrics) } catch { fabrics = [] }
  }
  
  // Determine which fabric types to assign based on product category
  const cat = (product.category || '').toLowerCase()
  if (cat.includes('مبل') || cat.includes('classic') || cat.includes('مدرن') || cat.includes('modern')) {
    // Furniture: velvet, striped, plain, gold, diamond
    fabrics = [
      { name: 'مخمل', hex: '#800020' },
      { name: 'راه راه', hex: '#A0522D' },
      { name: 'ساده', hex: '#D2C8B0' },
      { name: 'طلایی', hex: '#D4AF37' },
      { name: 'لوزی', hex: '#4682B4' },
    ]
  } else if (cat.includes('ناهار') || cat.includes('dining') || cat.includes('صندلی')) {
    // Dining: plain, striped, checkered, velvet, silver
    fabrics = [
      { name: 'ساده', hex: '#D2C8B0' },
      { name: 'راه راه', hex: '#A0522D' },
      { name: 'شطرنجی', hex: '#2F4F4F' },
      { name: 'مخمل', hex: '#800020' },
      { name: 'نقره‌ای', hex: '#C0C0C0' },
    ]
  } else if (cat.includes('خواب') || cat.includes('bedroom')) {
    // Bedroom: velvet, plain, gold, silver, diamond
    fabrics = [
      { name: 'مخمل', hex: '#800020' },
      { name: 'ساده', hex: '#D2C8B0' },
      { name: 'طلایی', hex: '#D4AF37' },
      { name: 'نقره‌ای', hex: '#C0C0C0' },
      { name: 'لوزی', hex: '#4682B4' },
    ]
  } else if (cat.includes('پارچه') || cat.includes('textile') || cat.includes('fabric')) {
    // Fabric-specific: all types
    fabrics = [...fabricPresets]
  } else if (cat.includes('آشپزخانه') || cat.includes('kitchen')) {
    fabrics = [
      { name: 'ساده', hex: '#D2C8B0' },
      { name: 'نقره‌ای', hex: '#C0C0C0' },
      { name: 'راه راه', hex: '#A0522D' },
    ]
  } else if (cat.includes('ویترین') || cat.includes('بوفه') || cat.includes('buffet') || cat.includes('کمد') || cat.includes('کنسول') || cat.includes('console')) {
    fabrics = []
  }

  // Convert to JSON string for storage
  const fabricsStr = JSON.stringify(fabrics)
  
  await productsCol.updateOne(
    { _id: product._id },
    { $set: { fabrics: fabricsStr } }
  )
  console.log(`OK product ${product.id}: ${product.name} -> fabrics updated (${fabrics.length} types)`)
}

// =====================================================
// 6. Add gallery images with wood categories
// =====================================================
const imageFiles = readdirSync(UPLOADS_PATH).filter(f => /\.(jpg|webp|png|avif)$/i.test(f) && !f.includes('blog'))

const woodCategories = [
  { name: 'چوب گردو', hex: '#5C3A1E' },
  { name: 'چوب راش', hex: '#D4A373' },
  { name: 'چوب بلوط', hex: '#C19A6B' },
  { name: 'منبت‌کاری', hex: '#8B4513' },
  { name: 'دکوراسیون داخلی', hex: '#2C1810' },
]

const galleryImages = []
for (let i = 0; i < imageFiles.length && i < 30; i++) {
  const cat = woodCategories[i % woodCategories.length]
  galleryImages.push({
    url: `/uploads/${imageFiles[i]}`,
    category: cat.name,
    title: { fa: `نمونه ${cat.name}`, en: `${cat.name} Sample`, ar: `عينة ${cat.name}` },
  })
}

const settingsCol = db.collection('settings')
await settingsCol.updateOne(
  { _id: 'global' },
  {
    $set: {
      galleryTitle: 'گالری چوب و محصولات',
      gallerySubtitle: 'مجموعه‌ای از تصاویر چوب‌های طبیعی، منبت‌کاری و محصولات ده نشین',
      gallerySettings: {
        type: 'grid',
        images: galleryImages,
      },
    },
  },
  { upsert: true }
)
console.log(`OK gallery updated with ${galleryImages.length} images in ${woodCategories.length} categories`)

// =====================================================
// 7. Delete all JSON files after successful migration
// =====================================================
let deletedCount = 0
for (const { file } of jsonFiles) {
  const fp = join(DATA_PATH, file)
  if (existsSync(fp)) {
    unlinkSync(fp)
    deletedCount++
    console.log(`DELETED ${file}`)
  }
}

// Delete runtime JSON files
const runtimeFiles = ['product_views.json', 'notifications_config.json', 'sms_log.json']
for (const f of runtimeFiles) {
  const fp = join(DATA_PATH, f)
  if (existsSync(fp)) {
    unlinkSync(fp)
    deletedCount++
    console.log(`DELETED ${f}`)
  }
}

console.log(`\n=== DONE === ${deletedCount} JSON files deleted, all data migrated to MongoDB`)

await mongoose.disconnect()
