import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import mongoSanitize from 'express-mongo-sanitize'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import contactRoutes from './routes/contact.js'
import uploadRoutes from './routes/upload.js'
import productRoutes from './routes/products.js'
import adminRoutes from './routes/admin.js'
import contentRoutes from './routes/content.js'
import authRoutes from './routes/auth.js'
import ordersRoutes from './routes/orders.js'
import reviewsRoutes from './routes/reviews.js'
import analyticsRoutes from './routes/analytics.js'
import searchRoutes from './routes/search.js'
import activityRoutes from './routes/activity.js'
import seoRoutes from './routes/seo.js'
import { connectDB } from './db.js'
import { initTransporter } from './services/notifier.js'
import User from './models/User.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, 'data')
if (!existsSync(DATA_PATH)) {
  mkdirSync(DATA_PATH, { recursive: true })
  writeFileSync(join(DATA_PATH, 'products.json'), JSON.stringify([], null, 2))
  writeFileSync(join(DATA_PATH, 'categories.json'), JSON.stringify([
    { id: 1, name: 'میوه‌های ارگانیک', slug: 'fruits', icon: '🍎' },
    { id: 2, name: 'سبزیجات ارگانیک', slug: 'vegetables', icon: '🥬' },
    { id: 3, name: 'لبنیات سنتی', slug: 'dairy', icon: '🥛' },
    { id: 4, name: 'غلات و حبوبات', slug: 'grains', icon: '🌾' },
    { id: 5, name: 'خشکبار و آجیل', slug: 'nuts', icon: '🥜' },
    { id: 6, name: 'عسل و محصولات طبیعی', slug: 'honey', icon: '🍯' },
    { id: 7, name: 'نوشیدنی‌های سالم', slug: 'beverages', icon: '🧃' },
  ], null, 2))
  writeFileSync(join(DATA_PATH, 'messages.json'), JSON.stringify([], null, 2))
}

const app = express()
const PORT = process.env.PORT || 5000

app.disable('x-powered-by')

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5000', 'https://dehneshin.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
}))

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '0')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'درخواست بیش از حد. لطفاً بعداً تلاش کنید' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'تلاش بیش از حد برای ورود. ۱۵ دقیقه صبر کنید' },
  standardHeaders: true,
  legacyHeaders: false,
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: 'محدودیت آپلود. بعداً تلاش کنید' },
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/upload', uploadLimiter)

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.use(mongoSanitize())

app.use(hpp({
  whitelist: ['price', 'sort', 'page', 'limit', 'category', 'rating', 'discount'],
}))

app.use('/uploads', express.static(join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.avif')) res.setHeader('Content-Type', 'image/avif')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}))

app.use('/data', express.static(join(__dirname, '..', 'data'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}))

const distPath = join(__dirname, '..', 'client', 'dist')
console.log('[startup] distPath:', distPath)
console.log('[startup] dist exists:', existsSync(distPath))
console.log('[startup] index.html exists:', existsSync(join(distPath, 'index.html')))

app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8')
  }
}))

app.use('/api/contact', contactRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin/activity', activityRoutes)
app.use('/api/seo', seoRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Deh Neshin API is running' })
})

app.post('/api/translate', express.json(), async (req, res) => {
  try {
    const { text, to = 'en', from = 'auto' } = req.body
    if (!text) return res.status(400).json({ error: 'Text required' })
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await response.json()
    const translated = data[0]?.map(s => s[0]).filter(Boolean).join('') || text
    res.json({ translated, from: data[2] || from })
  } catch (e) {
    res.status(500).json({ error: 'Translate failed' })
  }
})

app.get('/api/rss/fetch', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: 'URL required' })
    const allowedDomains = ['blog.com', 'wordpress.com', 'medium.com', 'virgool.io']
    try {
      const parsed = new URL(url)
      if (!allowedDomains.some(d => parsed.hostname.endsWith(d))) {
        return res.status(403).json({ error: 'Domain not allowed' })
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL' })
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const xml = await response.text()
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const c = match[1]
      const g = (tag) => { const m = c.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')); return m ? m[1].trim() : '' }
      const gc = (tag) => { const m = c.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i')); return m ? m[1].trim() : g(tag) }
      items.push({
        title: gc('title'), link: g('link'),
        description: gc('description').replace(/<[^>]+>/g, '').slice(0, 300),
        pubDate: g('pubDate'), category: g('category'),
      })
    }
    const count = parseInt(req.query.count) || 10
    const cats = req.query.categories ? req.query.categories.split(',').map(c => c.trim()).filter(Boolean) : []
    let filtered = items
    if (cats.length > 0) {
      filtered = items.filter(item => {
        const itemCat = (item.category || '').toLowerCase()
        return cats.some(c => itemCat.includes(c.toLowerCase()))
      })
    }
    res.json({ items: filtered.slice(0, count), total: items.length })
  } catch (e) {
    res.status(500).json({ error: 'RSS fetch failed', items: [], total: 0 })
  }
})

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: https://dehneshin.com/sitemap.xml
`)
})

app.get('/sitemap.xml', async (req, res) => {
  try {
    const { default: Product } = await import('./models/Product.js')
    const products = await Product.find({}, { slug: 1, updatedAt: 1 }).lean()
    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/products', priority: 0.9, changefreq: 'daily' },
      { loc: '/about', priority: 0.7, changefreq: 'monthly' },
      { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
      { loc: '/contact', priority: 0.5, changefreq: 'monthly' },
      { loc: '/catalog', priority: 0.6, changefreq: 'weekly' },
      { loc: '/farm-map', priority: 0.5, changefreq: 'monthly' },
      { loc: '/wholesale', priority: 0.6, changefreq: 'monthly' },
      { loc: '/customer-club', priority: 0.4, changefreq: 'monthly' },
      { loc: '/cart', priority: 0.3, changefreq: 'monthly' },
      { loc: '/track', priority: 0.3, changefreq: 'monthly' },
    ]
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for (const page of staticPages) {
      xml += `  <url><loc>https://dehneshin.com${page.loc}</loc><priority>${page.priority}</priority><changefreq>${page.changefreq}</changefreq></url>\n`
    }
    for (const p of products) {
      const slug = p.slug || p._id
      xml += `  <url><loc>https://dehneshin.com/products/${slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n`
    }
    xml += '</urlset>'
    res.header('Content-Type', 'application/xml; charset=utf-8').send(xml)
  } catch { res.status(500).send('Error generating sitemap') }
})

app.get('*', (req, res) => {
  const indexPath = join(__dirname, '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('sendFile error:', err.message)
      res.status(200).type('html').send('<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>ده نشین</title></head><body style="background:#F5F0E8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1 style="color:#5a7a3a">ده نشین | محصولات ارگانیک</h1><p style="color:#666">سایت در حال راه‌اندازی است</p></body></html>')
    }
  })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'حجم فایل زیاد است' : err.code === 'LIMIT_FILE_COUNT' ? 'تعداد فایل زیاد است' : err.message
    return res.status(400).json({ error: msg })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'حجم درخواست بیش از حد مجاز است' })
  }
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, async () => {
  await connectDB()
  try {
    const existing = await User.findOne({ username: 'admin' }).lean()
    if (!existing) {
      await User.create({ id: 1, username: 'admin', password: 'dehnesin@1404', role: 'admin', name: 'مدیر سیستم' })
      console.log('✅ Default admin user created (admin / dehnesin@1404)')
    } else {
      console.log('✅ Admin user already exists')
    }
  } catch (e) {
    console.log('⚠️ Could not create admin user:', e.message)
  }
  console.log(`Server running on port ${PORT}`)
  const webUrl = await initTransporter()
})
