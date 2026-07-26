import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = join(__dirname, 'uploads', 'products')
const GAL_DIR = join(__dirname, 'uploads', 'gallery')
const MONGODB_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

const PRODUCT_QUERIES = {
  1: 'مبل کلاسیک سلطنتی',
  2: 'مبل مدرن مینیمال',
  3: 'مبل نئوکلاسیک',
  4: 'مبل چستر مجلسی',
  5: 'سرویس خواب سلطنتی',
  6: 'میز ناهارخوری ۱۲ نفره',
  7: 'ویترین لوکس',
  8: 'مبل طلایی ارنیت',
  9: 'مجسمه چوبی دکوراتیو',
  10: 'مبل ویا سینا',
  11: 'سرویس خواب مدرن',
  12: 'مبلمان لوئیزیانا',
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function searchGoogleImages(driver, query) {
  const url = 'https://www.google.com/search?q=' + encodeURIComponent(query) +
    '&tbm=isch&hl=en&gbv=1&tbs=isz:m'
  await driver.get(url)
  await sleep(2000)
  try {
    const btn = await driver.findElement(By.css('[aria-label="Accept all"]'))
    await btn.click()
    await sleep(500)
  } catch {}
  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)')
  await sleep(1500)
  for (let s = 0; s < 3; s++) {
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)')
    await sleep(1000)
  }
  const urls = await driver.executeScript(`
    const urls = [];
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if ((src.startsWith('http://') || src.startsWith('https://')) &&
          (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png') || src.endsWith('.webp') ||
           src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
        urls.push(src);
      }
    });
    return [...new Set(urls)];
  `)
  return urls.filter(u =>
    !u.includes('google') && !u.includes('gstatic.com') &&
    u.match(/https?:\/\/[^\/]+\/.+\.(jpg|jpeg|png|webp)/i)
  ).slice(0, 15)
}

async function main() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

  let driver
  try {
    driver = await new Builder().forBrowser('chrome')
      .setChromeOptions(new chrome.Options()
        .addArguments('--headless=new', '--no-sandbox', '--disable-gpu',
          '--window-size=1920,1080', '--lang=en'))
      .build()

    await mongoose.connect(MONGODB_URI)
    const Product = (await import('./models/Product.js')).default
    const Setting = (await import('./models/Setting.js')).default

    for (const [idStr, query] of Object.entries(PRODUCT_QUERIES)) {
      const id = parseInt(idStr)
      const product = await Product.findOne({ id }).lean()
      if (!product) { console.log(`Skip ${id}`); continue }
      console.log(`\n[${id}] ${product.name}`)
      console.log(`  Searching: ${query}...`)
      const urls = await searchGoogleImages(driver, query)
      console.log(`  Found ${urls.length} image URLs`)
      let downloaded = 0
      for (let i = 0; i < Math.min(urls.length, 5) && downloaded < 5; i++) {
        try {
          await driver.get(urls[i])
          await sleep(500)
        } catch {}
        try {
          const buf = Buffer.from(await driver.executeScript(`
            return fetch(arguments[0]).then(r => r.arrayBuffer()).then(b => {
              const u8 = new Uint8Array(b);
              return Array.from(u8.slice(0, 500000));
            }).catch(() => null);
          `, urls[i]))
          if (buf.length > 2000) {
            const filename = `product-${id}-${downloaded + 1}.jpg`
            writeFileSync(join(UPLOADS_DIR, filename), buf)
            downloaded++
            console.log(`  [${downloaded}/5] Downloaded (${buf.length} bytes)`)
          }
        } catch {}
      }
      if (downloaded > 0) {
        const images = []
        for (let i = 0; i < downloaded; i++)
          images.push(`/uploads/products/product-${id}-${i + 1}.jpg`)
        await Product.updateOne({ id }, { $set: { images } })
        console.log(`  ✓ ${downloaded} images`)
      } else {
        console.log('  ✗ No images downloaded')
      }
    }

    console.log('\nDone with products!')

  } catch (err) {
    console.error('Fatal:', err)
  } finally {
    if (driver) await driver.quit()
    await mongoose.disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
