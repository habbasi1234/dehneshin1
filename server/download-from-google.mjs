import https from 'https'
import http from 'http'
import fs from 'fs'
import mongoose from 'mongoose'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = join(__dirname, 'uploads', 'products')
const MONGODB_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

const PRODUCT_QUERIES = {
  1:  'مبل کلاسیک سلطنتی',
  2:  'مبل مدرن مینیمال',
  3:  'مبل نئوکلاسیک',
  4:  'مبل چستر مجلسی',
  5:  'سرویس خواب سلطنتی',
  6:  'میز ناهارخوری بزرگ',
  7:  'ویترین لوکس',
  8:  'مبل طلایی ارنیت',
  9:  'مجسمه چوبی دکوراتیو',
  10: 'مبل ویا سینا',
  11: 'سرویس خواب مدرن',
  12: 'مبلمان لوئیزیانا',
}

const PROXIES = [
  (q) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.google.com/search?q=' + encodeURIComponent(q + ' furniture') + '&tbm=isch'),
]

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const m = url.startsWith('https') ? https : http
    m.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, res => {
      let d = []
      res.on('data', c => d.push(c))
      res.on('end', () => resolve({ data: Buffer.concat(d), headers: res.headers, status: res.statusCode }))
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')) })
  })
}

function extractImageUrls(html) {
  const urls = []
  const re = /"ou":"([^"]+\.(?:jpg|jpeg|png|webp))"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const u = m[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
    if (!urls.includes(u)) urls.push(u)
  }
  if (urls.length === 0) {
    const re2 = /"src":"([^"]+)"/gi
    while ((m = re2.exec(html)) !== null) {
      const u = m[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
      if ((u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.endsWith('.webp')) && !urls.includes(u))
        urls.push(u)
    }
  }
  return urls
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const m = url.startsWith('https') ? https : http
    const req = m.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, res => {
      function handleResponse(r) {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          const loc = r.headers.location.startsWith('http') ? r.headers.location : new URL(r.headers.location, url).href
          return m.get(loc, { headers: { 'User-Agent': 'Mozilla/5.0' } }, handleResponse).on('error', reject)
        }
        const ct = r.headers['content-type'] || ''
        if (!ct.startsWith('image/')) return reject(new Error('Not image: ' + ct))
        let d = []
        r.on('data', c => d.push(c))
        r.on('end', () => resolve(Buffer.concat(d)))
      }
      handleResponse(res)
    })
    req.on('error', reject)
    req.on('timeout', function() { this.destroy(); reject(new Error('timeout')) })
  })
}

async function downloadImagesForProduct(productId, query) {
  const results = []
  let html = ''

  for (const proxyFn of PROXIES) {
    try {
      const resp = await fetchUrl(proxyFn(query))
      if (resp.status === 200) { html = resp.data.toString(); break }
    } catch {}
  }

  if (!html) { console.log('  Failed to fetch search results'); return results }

  const urls = extractImageUrls(html)
  console.log(`  Found ${urls.length} image URLs`)

  for (let i = 0; i < Math.min(urls.length, 5); i++) {
    try {
      const buf = await downloadImage(urls[i])
      if (buf.length > 1000) {
        const filename = `product-${productId}-${i + 1}.jpg`
        const filepath = join(UPLOADS_DIR, filename)
        fs.writeFileSync(filepath, buf)
        results.push(`/uploads/products/${filename}`)
        console.log(`  Downloaded ${filename} (${buf.length} bytes)`)
      }
    } catch (e) { console.log(`  Failed image ${i+1}: ${e.message.slice(0, 50)}`) }
  }
  return results
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  await mongoose.connect(MONGODB_URI)
  const Product = (await import('./models/Product.js')).default

  for (const [idStr, query] of Object.entries(PRODUCT_QUERIES)) {
    const id = parseInt(idStr)
    const product = await Product.findOne({ id }).lean()
    if (!product) { console.log(`Skip ${id}: not found`); continue }
    console.log(`\n[${id}] ${product.name}`)
    const images = await downloadImagesForProduct(id, query)
    if (images.length > 0) {
      await Product.updateOne({ id }, { $set: { images } })
      console.log(`  ✓ ${images.length} images`)
    } else {
      console.log(`  ✗ No images`)
    }
  }
  await mongoose.disconnect()
  console.log('\nDone!')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
