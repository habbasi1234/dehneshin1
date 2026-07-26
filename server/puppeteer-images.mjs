import puppeteer from 'puppeteer-core'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import https from 'https'
import http from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = join(__dirname, 'uploads', 'products')
const GAL_DIR = join(__dirname, 'uploads', 'gallery')
const MONGODB_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

const PRODUCT_QUERIES = {
  1: 'classic luxury sofa furniture',
  2: 'modern minimalist sofa furniture',
  3: 'neoclassical sofa furniture',
  4: 'chesterfield sofa furniture',
  5: 'luxury bedroom set furniture',
  6: 'large dining table furniture',
  7: 'luxury display cabinet furniture',
  8: 'golden ornate sofa furniture',
  9: 'wooden decorative sculpture',
  10: 'modern luxury sofa set',
  11: 'modern bedroom set furniture',
  12: 'french provincial furniture',
}

const GALLERY_QUERIES = {
  classic: 'classic luxury furniture',
  modern: 'modern minimalist furniture',
  neoclassic: 'neoclassical furniture interior',
  dining: 'luxury dining room furniture',
  decorative: 'wooden decorative art sculpture',
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const m = url.startsWith('https') ? https : http
    const req = m.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 }, res => {
      function handle(r) {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          const loc = r.headers.location.startsWith('http') ? r.headers.location : new URL(r.headers.location, url).href
          return m.get(loc, { headers: { 'User-Agent': 'Mozilla/5.0' } }, handle).on('error', reject)
        }
        const ct = r.headers['content-type'] || ''
        if (!ct.startsWith('image/')) return reject(new Error('Not image: ' + ct))
        let d = []
        r.on('data', c => d.push(c))
        r.on('end', () => resolve(Buffer.concat(d)))
      }
      handle(res)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function scrapeGoogleImages(page, query) {
  const url = 'https://www.google.com/search?q=' + encodeURIComponent(query) +
    '&tbm=isch&hl=en&tbs=isz:m'
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(2000)
  try {
    const acceptBtn = await page.$('[aria-label="Accept all"], [aria-label="Accept"], #L2AGLb')
    if (acceptBtn) await acceptBtn.click()
  } catch {}
  await sleep(1000)
  for (let s = 0; s < 4; s++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await sleep(1500)
  }
  const urls = await page.evaluate(() => {
    const urls = []
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || ''
      if (src.startsWith('http') && !src.includes('google') && !src.includes('gstatic'))
        urls.push(src)
    })
    return [...new Set(urls)]
  })
  return urls.filter(u => u.match(/\.(jpg|jpeg|png|webp)/i)).slice(0, 10)
}

async function downloadForPage(page, id, query, dir, prefix, count = 5) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  console.log(`  Searching: ${query}`)
  let urls = []
  try {
    urls = await scrapeGoogleImages(page, query)
  } catch (e) {
    console.log(`  Search error: ${e.message.slice(0, 60)}`)
    return []
  }
  console.log(`  Found ${urls.length} URLs`)
  const results = []
  let success = 0
  for (let i = 0; i < Math.min(urls.length, count * 3) && success < count; i++) {
    try {
      const buf = await downloadImage(urls[i])
      if (buf.length > 2000) {
        const filename = `${prefix}-${id}-${success + 1}.jpg`
        writeFileSync(join(dir, filename), buf)
        results.push(`/uploads/${prefix}/${filename}`)
        console.log(`  [${success + 1}/${count}] Downloaded (${buf.length} bytes)`)
        success++
      }
    } catch {}
  }
  return results
}

async function main() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  let browser
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1920,1080'],
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36')

    await mongoose.connect(MONGODB_URI)
    const Product = (await import('./models/Product.js')).default
    const Setting = (await import('./models/Setting.js')).default

    for (const [idStr, query] of Object.entries(PRODUCT_QUERIES)) {
      const id = parseInt(idStr)
      const product = await Product.findOne({ id }).lean()
      if (!product) { console.log(`Skip ${id}`); continue }
      console.log(`\n[${id}] ${product.name}`)
      const images = await downloadForPage(page, id, query, UPLOADS_DIR, 'products', 5)
      if (images.length > 0) {
        await Product.updateOne({ id }, { $set: { images } })
        console.log(`  ✓ ${images.length} images`)
      } else { console.log('  ✗ Failed') }
    }

    for (const [cat, query] of Object.entries(GALLERY_QUERIES)) {
      const imgDir = join(GAL_DIR, cat)
      console.log(`\n[gallery/${cat}] ${query}`)
      const images = await downloadForPage(page, cat, query, imgDir, 'gallery', 6)
      console.log(`  ✓ ${images.length} images`)
    }

    console.log('\nDone!')
  } catch (err) {
    console.error('Fatal:', err)
  } finally {
    if (browser) await browser.close()
    await mongoose.disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
