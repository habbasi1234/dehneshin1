import { Router } from 'express'
import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import Category from '../models/Category.js'
import CrawlResult from '../models/CrawlResult.js'
import Setting from '../models/Setting.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const pageDefaults = [
  { path: '/', label: 'صفحه اصلی', langKey: 'home', title: 'ده نشین | محصولات ارگانیک', description: 'ده نشین، فروشگاه محصولات ارگانیک و طبیعی', keywords: 'محصولات ارگانیک, ده نشین, فروشگاه ارگانیک' },
  { path: '/products', label: 'محصولات', langKey: 'products', title: 'محصولات | ده نشین', description: 'مجموعه‌ای از بهترین محصولات ارگانیک و طبیعی', keywords: 'خرید محصولات ارگانیک, میوه ارگانیک, سبزیجات ارگانیک' },
  { path: '/about', label: 'درباره ما', langKey: 'about', title: 'درباره ما | ده نشین', description: 'ده نشین، از مزرعه تا سفره', keywords: 'درباره ده نشین, محصولات طبیعی' },
  { path: '/blog', label: 'مقالات', langKey: 'blog', title: 'مقالات | ده نشین', description: 'جدیدترین مطالب در زمینه تغذیه سالم و ارگانیک', keywords: 'تغذیه سالم, محصولات ارگانیک, مقالات سلامت' },
  { path: '/contact', label: 'تماس با ما', langKey: 'contact', title: 'تماس با ما | ده نشین', description: 'راه‌های ارتباطی با ده نشین', keywords: 'تماس با ده نشین, آدرس فروشگاه' },
  { path: '/catalog', label: 'کاتالوگ', langKey: 'catalog', title: 'کاتالوگ | ده نشین', description: 'دانلود کاتالوگ محصولات ده نشین', keywords: 'کاتالوگ محصولات ارگانیک, دانلود کاتالوگ' },
  { path: '/wholesale', label: 'خرید عمده', langKey: 'wholesale', title: 'خرید عمده | ده نشین', description: 'خرید عمده محصولات ارگانیک با تخفیف ویژه', keywords: 'خرید عمده, محصولات ارگانیک عمده' },
  { path: '/farm-map', label: 'نقشه مزارع', langKey: 'farmMap', title: 'نقشه مزارع | ده نشین', description: 'نقشه مزارع و مراکز تولید', keywords: 'نقشه مزارع, مراکز تولید ارگانیک' },
  { path: '/cart', label: 'سبد خرید', langKey: 'cart', title: 'سبد خرید | ده نشین', description: 'سبد خرید شما', keywords: 'سبد خرید, خرید محصصولات ارگانیک' },
  { path: '/track', label: 'پیگیری سفارش', langKey: 'track', title: 'پیگیری سفارش | ده نشین', description: 'پیگیری سفارش آنلاین', keywords: 'پیگیری سفارش, رهگیری خرید' },
]

router.get('/pages', (req, res) => {
  res.json({ pages: pageDefaults })
})

router.put('/pages', requireAdmin, async (req, res) => {
  const settings = await import('../models/Setting.js').then(m => m.default)
  await settings.findByIdAndUpdate('global', { $set: { seoPages: req.body.pages } }, { upsert: true })
  res.json({ success: true })
})

router.get('/report', async (req, res) => {
  const [products, blogs, categories] = await Promise.all([
    Product.find({}).lean(),
    Blog.find({}).lean(),
    Category.find({}).lean(),
  ])
  const missingTitle = products.filter(p => !p.name).length + blogs.filter(b => !b.title).length
  const missingDesc = products.filter(p => !p.description && !p.desc_fa).length + blogs.filter(b => !b.description).length
  const missingKeywords = products.filter(p => !p.keywords).length + blogs.filter(b => !b.keywords).length
  const missingSlug = products.filter(p => !p.slug).length + blogs.filter(b => !b.slug).length + categories.filter(c => !c.slug).length
  const totalContent = products.length + blogs.length
  const optimized = totalContent - missingTitle - missingDesc - missingKeywords - missingSlug

  res.json({
    totalContent,
    optimized: Math.max(0, optimized),
    issues: { missingTitle, missingDesc, missingKeywords, missingSlug },
    products: products.length,
    blogs: blogs.length,
    categories: categories.length,
  })
})

const stopWords = ['این', 'آن', 'که', 'با', 'از', 'برای', 'و', 'به', 'در', 'یا', 'تا', 'یک', 'را', 'شد', 'شود', 'های', 'شما', 'ما', 'هم', 'نیز', 'اگر', 'اما', 'است', 'باش', 'عنوان', 'هر', 'بین', 'شدن', 'باید', 'خواهد', 'می', 'شده', 'کرد', 'کنید', 'دارد', 'دارای', 'بیشتر', 'شامل', 'دیگر', 'بوده', 'بود', 'گرفت', 'گرفته', 'دهد', 'کردن', 'کرده', 'باشند', 'کننده', 'مانند', 'زیر', 'فوق', 'پس', 'قبل', 'حدود', 'بر', 'بدون', 'نوع', 'گونه', 'های', 'هایی', 'تری', 'ترین', 'اش', 'یم', 'ید', 'ند', 'ام', 'ای']

function extractImages(html, pageUrl) {
  const imgs = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let m
  while ((m = imgRegex.exec(html)) !== null) {
    try {
      const src = m[1].trim()
      const resolved = new URL(src, pageUrl).href
      if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|#|$)/i.test(resolved)) {
        const altMatch = m[0].match(/alt=["']([^"']*)["']/i)
        imgs.push({ src: resolved, alt: altMatch?.[1]?.trim() || '' })
      }
    } catch {}
  }
  return imgs
}

function extractPageData(html, pageUrl) {
  const metaKeywords = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i)
  const metaDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  const title = html.match(/<title>([^<]+)<\/title>/i)

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const persianWords = text.match(/[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u0698\u06CC]{3,}/g) || []
  const wordFreq = {}
  persianWords.forEach(w => {
    const lower = w.toLowerCase()
    wordFreq[lower] = (wordFreq[lower] || 0) + 1
  })

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .filter(([w]) => !stopWords.includes(w))
    .slice(0, 20)

  const links = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1])
  }

  const images = extractImages(html, pageUrl)

  return {
    url: pageUrl,
    title: title?.[1]?.trim() || null,
    metaDescription: metaDescription?.[1]?.trim() || null,
    metaKeywords: metaKeywords?.[1]?.trim() || null,
    wordCount: persianWords.length,
    topWords: topWords.map(([w]) => w),
    links,
    images,
  }
}

function normalizeUrl(href, baseUrl) {
  try {
    const base = new URL(baseUrl)
    const resolved = new URL(href, baseUrl)
    if (resolved.hostname !== base.hostname && !resolved.hostname.endsWith('.' + base.hostname)) return null
    if (resolved.hostname !== base.hostname) return null
    const clean = (resolved.origin + resolved.pathname).replace(/\/$/, '') || resolved.origin + '/'
    const excl = /\.(pdf|zip|rar|doc|docx|xls|xlsx|png|jpg|jpeg|gif|svg|webp|ico|css|js|json|xml)(\?|#|$)/i
    if (excl.test(clean)) return null
    return clean
  } catch { return null }
}

const crawlJobs = new Map()
let jobCounter = 0

async function runCrawl(jobId, url, label, isCompetitor, maxPages, maxDepth, crawlImages) {
  const excludePatterns = [/\.(pdf|zip|rar|doc|docx|xls|xlsx|png|jpg|jpeg|gif|svg|webp|ico|css|js|json|xml)(\?|#|$)/i, /#/, /mailto:/, /tel:/, /javascript:/, /whatsapp:/, /telegram:/, /instagram:/]
  const visited = new Set()
  const queue = [{ url: normalizeUrl(url, url) || url, depth: 0 }]
  const pages = []
  const errors = []
  const allImages = []

  while (queue.length > 0 && visited.size < maxPages) {
    const item = queue.shift()
    const normUrl = normalizeUrl(item.url, url)
    if (!normUrl || visited.has(normUrl)) continue
    if (excludePatterns.some(p => p.test(normUrl))) continue
    visited.add(normUrl)

    try {
      const response = await fetch(normUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzChoobBot/1.0; SEO Crawler)' },
      })
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) continue

      const html = await response.text()
      const data = extractPageData(html, normUrl)
      pages.push(data)
      if (crawlImages && data.images) {
        data.images.forEach(img => {
          if (!allImages.some(ex => ex.src === img.src)) allImages.push(img)
        })
      }

      if (item.depth < maxDepth) {
        const newLinks = data.links
          .map(link => normalizeUrl(link, normUrl))
          .filter(l => l && !visited.has(l) && !excludePatterns.some(p => p.test(l)))
          .filter((l, idx, arr) => arr.indexOf(l) === idx)

        const existingUrls = new Set(queue.map(q => q.url))
        for (const link of newLinks) {
          if (!existingUrls.has(link) && queue.length + visited.size < maxPages) {
            queue.push({ url: link, depth: item.depth + 1 })
          }
        }
      }
    } catch (e) {
      errors.push({ url: normUrl, error: e.message })
    }
    crawlJobs.set(jobId, { status: 'running', progress: { pages: pages.length, visited: visited.size, errors: errors.length } })
    if (queue.length > 0) await new Promise(r => setTimeout(r, 200))
  }

  const globalFreq = {}
  pages.forEach(p => p.topWords.forEach(w => { globalFreq[w] = (globalFreq[w] || 0) + 1 }))
  const sortedGlobal = Object.entries(globalFreq).sort((a, b) => b[1] - a[1])

  const pagesWithMeta = pages.filter(p => p.metaKeywords || p.metaDescription)
  const pagesWithoutTitle = pages.filter(p => !p.title)
  const pagesWithoutDesc = pages.filter(p => !p.metaDescription)
  const pagesWithoutKeywords = pages.filter(p => !p.metaKeywords)

  const result = {
    domain: new URL(url).hostname,
    label: label || new URL(url).hostname,
    isCompetitor: isCompetitor || false,
    stats: {
      totalCrawled: pages.length,
      totalVisited: visited.size,
      totalErrors: errors.length,
      avgWordsPerPage: pages.length ? Math.round(pages.reduce((s, p) => s + p.wordCount, 0) / pages.length) : 0,
      pagesWithMeta: pagesWithMeta.length,
      pagesWithoutTitle: pagesWithoutTitle.length,
      pagesWithoutDesc: pagesWithoutDesc.length,
      pagesWithoutKeywords: pagesWithoutKeywords.length,
    },
    globalKeywords: sortedGlobal.map(([w, c]) => ({ word: w, count: c })),
    globalTopWords: sortedGlobal.slice(0, 50).map(([w]) => w),
    errors,
    images: crawlImages ? allImages.slice(0, 200) : [],
    pages: pages.slice(0, 100).map(p => ({
      url: p.url, title: p.title, metaDescription: p.metaDescription,
      metaKeywords: p.metaKeywords, wordCount: p.wordCount, topWords: p.topWords,
    })),
  }

  try {
    await CrawlResult.findOneAndUpdate(
      { domain: result.domain },
      { ...result, lastCrawled: new Date() },
      { upsert: true, new: true }
    )
    crawlJobs.set(jobId, { status: 'done', result: { ...result, saved: true } })
  } catch (e) {
    crawlJobs.set(jobId, { status: 'error', error: e.message })
  }
}

router.post('/crawl-keywords', requireAdmin, async (req, res) => {
  const { url, label, isCompetitor, maxPages = 50, maxDepth = 3, crawlImages } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  const jobId = 'crawl-' + (++jobCounter) + '-' + Date.now()
  crawlJobs.set(jobId, { status: 'running', progress: { pages: 0, visited: 0, errors: 0 } })

  runCrawl(jobId, url, label, isCompetitor, maxPages, maxDepth, crawlImages).catch(e => {
    crawlJobs.set(jobId, { status: 'error', error: e.message })
  })

  res.json({ jobId, status: 'running', message: 'خزش در پس‌زمینه شروع شد' })
})

router.get('/crawl-status/:jobId', requireAdmin, async (req, res) => {
  const job = crawlJobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'job not found' })
  if (job.status === 'done') {
    crawlJobs.delete(req.params.jobId)
    return res.json({ status: 'done', ...job.result })
  }
  if (job.status === 'error') {
    crawlJobs.delete(req.params.jobId)
    return res.json({ status: 'error', error: job.error })
  }
  res.json({ status: 'running', progress: job.progress })
})

router.post('/extract-keywords', requireAdmin, async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzChoobBot/1.0)' },
    })
    const html = await response.text()

    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)

    const data = extractPageData(html, url)

    res.json({
      keywords: data.topWords,
      metaKeywords: data.metaKeywords,
      metaDescription: data.metaDescription,
      title: data.title,
      ogTitle: ogTitle?.[1] || null,
      ogDescription: ogDescription?.[1] || null,
      ogImage: ogImage?.[1] || null,
      canonical: canonical?.[1] || null,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch URL', detail: e.message })
  }
})

router.get('/crawl-results', requireAdmin, async (req, res) => {
  const results = await CrawlResult.find({}).sort({ lastCrawled: -1 }).lean()
  res.json({ results })
})

router.get('/crawl-results/:id', requireAdmin, async (req, res) => {
  const result = await CrawlResult.findById(req.params.id).lean()
  if (!result) return res.status(404).json({ error: 'نتیجه‌ای یافت نشد' })
  res.json(result)
})

router.delete('/crawl-results/:id', requireAdmin, async (req, res) => {
  await CrawlResult.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

router.put('/crawl-results/:id', requireAdmin, async (req, res) => {
  const updates = {}
  if (req.body.label) updates.label = req.body.label
  if (req.body.isCompetitor !== undefined) updates.isCompetitor = req.body.isCompetitor
  const result = await CrawlResult.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean()
  if (!result) return res.status(404).json({ error: 'نتیجه‌ای یافت نشد' })
  res.json(result)
})

router.get('/competitor-compare', requireAdmin, async (req, res) => {
  const all = await CrawlResult.find({}).lean()
  const main = all.find(r => !r.isCompetitor)
  const competitors = all.filter(r => r.isCompetitor)

  if (!main) return res.json({ main: null, competitors, comparison: null })

  const mainWords = new Set((main.globalTopWords || []).map(w => w))
  const competitorWordSets = competitors.map(c => ({
    domain: c.domain,
    label: c.label,
    words: new Set((c.globalTopWords || []).map(w => w)),
  }))

  const allWords = new Set()
  ;[main, ...competitors].forEach(r => (r.globalTopWords || []).forEach(w => allWords.add(w)))

  const commonWords = []
  const uniqueToMain = []
  const competitorSpecific = {}

  allWords.forEach(word => {
    const inMain = mainWords.has(word)
    const inCompetitors = competitorWordSets.map(c => c.words.has(word))
    const countInCompetitors = inCompetitors.filter(Boolean).length

    if (inMain && countInCompetitors === competitors.length) {
      commonWords.push(word)
    } else if (inMain && countInCompetitors === 0) {
      uniqueToMain.push(word)
    }
  })

  competitorWordSets.forEach(c => {
    const unique = []
    c.words.forEach(word => {
      if (!mainWords.has(word)) {
        const onlyInThis = competitorWordSets.every(other =>
          other.domain === c.domain || !other.words.has(word)
        )
        if (onlyInThis) unique.push(word)
      }
    })
    competitorSpecific[c.domain] = { label: c.label, uniqueWords: unique }
  })

  res.json({
    main: { domain: main.domain, label: main.label, topWords: main.globalTopWords || [] },
    competitors: competitors.map(c => ({
      domain: c.domain, label: c.label, topWords: c.globalTopWords || [],
    })),
    comparison: {
      commonWords,
      uniqueToMain,
      competitorSpecific,
      totalCommon: commonWords.length,
      totalUniqueToMain: uniqueToMain.length,
    },
  })
})

router.post('/generate-sitemap', requireAdmin, async (req, res) => {
  try {
    const domain = 'https://dehneshin.com'
    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/products', priority: 0.9, changefreq: 'daily' },
      { loc: '/about', priority: 0.7, changefreq: 'monthly' },
      { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
      { loc: '/contact', priority: 0.5, changefreq: 'monthly' },
      { loc: '/catalog', priority: 0.6, changefreq: 'weekly' },
      { loc: '/farm-map', priority: 0.5, changefreq: 'monthly' },
      { loc: '/wholesale', priority: 0.6, changefreq: 'monthly' },
      { loc: '/cart', priority: 0.3, changefreq: 'monthly' },
      { loc: '/track', priority: 0.3, changefreq: 'monthly' },
    ]

    const [products, blogs, categories] = await Promise.all([
      Product.find({}, { slug: 1, updatedAt: 1 }).lean(),
      Blog.find({}, { slug: 1, updatedAt: 1 }).lean(),
      Category.find({}, { slug: 1 }).lean(),
    ])

    const urls = []

    for (const page of staticPages) {
      urls.push({ ...page, type: 'static' })
    }
    for (const p of products) {
      urls.push({ loc: `/products/${p.slug}`, priority: 0.8, changefreq: 'weekly', lastmod: p.updatedAt, type: 'product' })
    }
    for (const b of blogs) {
      urls.push({ loc: `/blog/${b.slug}`, priority: 0.7, changefreq: 'monthly', lastmod: b.updatedAt, type: 'blog' })
    }
    for (const c of categories) {
      urls.push({ loc: `/categories/${c.slug}`, priority: 0.6, changefreq: 'weekly', type: 'category' })
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for (const u of urls) {
      xml += `  <url><loc>${domain}${u.loc}</loc>`
      if (u.lastmod) xml += `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>`
      xml += `<priority>${u.priority}</priority><changefreq>${u.changefreq}</changefreq></url>\n`
    }
    xml += '</urlset>'

    await Setting.findByIdAndUpdate('global', { $set: { sitemap: { xml, generatedAt: new Date(), urlCount: urls.length } } }, { upsert: true })

    const stats = {}
    urls.forEach(u => { stats[u.type] = (stats[u.type] || 0) + 1 })

    res.json({ xml, stats, totalUrls: urls.length, generatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/sitemap', requireAdmin, async (req, res) => {
  try {
    const settings = await Setting.findById('global').lean()
    const sitemap = settings?.sitemap
    if (!sitemap) return res.json({ xml: null, stats: null, totalUrls: 0 })
    res.json({ xml: sitemap.xml, stats: sitemap.stats, totalUrls: sitemap.urlCount, generatedAt: sitemap.generatedAt })
  } catch {
    res.json({ xml: null, stats: null, totalUrls: 0 })
  }
})

function parseSiteMapXml(xml) {
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/gi
  let m
  while ((m = locRegex.exec(xml)) !== null) {
    urls.push(m[1].trim())
  }
  return urls
}

const sitemapJobStore = new Map()
let sitemapJobCounter = 0

async function processSiteMap(jobId, siteUrl, label, isCompetitor, maxPages) {
  const base = new URL(siteUrl)
  const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap/sitemap.xml']
  let sitemapXml = null

  for (const p of sitemapPaths) {
    try {
      const resp = await fetch(base.origin + p, { signal: AbortSignal.timeout(10000) })
      if (resp.ok) { sitemapXml = await resp.text(); break }
    } catch {}
  }

  if (!sitemapXml) {
    sitemapJobStore.set(jobId, { status: 'error', error: 'sitemap.xml یافت نشد' })
    return
  }

  let allUrls = parseSiteMapXml(sitemapXml)
  if (allUrls.length === 0) {
    sitemapJobStore.set(jobId, { status: 'error', error: 'هیچ URLای در sitemap یافت نشد' })
    return
  }

  const excludePatterns = [/\.(pdf|zip|rar|doc|docx|xls|xlsx|png|jpg|jpeg|gif|svg|webp|ico|css|js)(\?|#|$)/i, /#/]
  allUrls = allUrls.filter(u => !excludePatterns.some(p => p.test(u)))
  allUrls = [...new Set(allUrls)]

  const pages = []
  const errors = []
  const batchSize = 5

  for (let i = 0; i < Math.min(allUrls.length, maxPages); i++) {
    const url = allUrls[i]
    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzChoobBot/1.0; SEO Crawler)' },
      })
      const contentType = resp.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) continue
      const html = await resp.text()
      const data = extractPageData(html, url)
      if (data) pages.push(data)
    } catch (e) {
      errors.push({ url, error: e.message })
    }
    sitemapJobStore.set(jobId, { status: 'running', progress: { pages: pages.length, total: Math.min(allUrls.length, maxPages), errors: errors.length } })
    if (i < allUrls.length - 1 && i < maxPages - 1) await new Promise(r => setTimeout(r, 100))
  }

  const globalFreq = {}
  pages.forEach(p => p.topWords?.forEach(w => { globalFreq[w] = (globalFreq[w] || 0) + 1 }))
  const sortedGlobal = Object.entries(globalFreq).sort((a, b) => b[1] - a[1])

  const result = {
    domain: base.hostname,
    label: label || base.hostname,
    isCompetitor: isCompetitor || false,
    stats: {
      totalCrawled: pages.length,
      totalVisited: Math.min(allUrls.length, maxPages),
      totalErrors: errors.length,
      avgWordsPerPage: pages.length ? Math.round(pages.reduce((s, p) => s + (p.wordCount || 0), 0) / pages.length) : 0,
      pagesWithMeta: pages.filter(p => p.metaKeywords || p.metaDescription).length,
      pagesWithoutTitle: pages.filter(p => !p.title).length,
      pagesWithoutDesc: pages.filter(p => !p.metaDescription).length,
      pagesWithoutKeywords: pages.filter(p => !p.metaKeywords).length,
    },
    globalKeywords: sortedGlobal.map(([w, c]) => ({ word: w, count: c })),
    globalTopWords: sortedGlobal.slice(0, 50).map(([w]) => w),
    errors,
    pages: pages.slice(0, 100).map(p => ({
      url: p.url, title: p.title, metaDescription: p.metaDescription,
      metaKeywords: p.metaKeywords, wordCount: p.wordCount, topWords: p.topWords,
    })),
    source: 'sitemap',
    sitemapUrlCount: allUrls.length,
  }

  try {
    await CrawlResult.findOneAndUpdate(
      { domain: result.domain },
      { ...result, lastCrawled: new Date() },
      { upsert: true, new: true }
    )
    sitemapJobStore.set(jobId, { status: 'done', result: { ...result, saved: true } })
  } catch (e) {
    sitemapJobStore.set(jobId, { status: 'error', error: e.message })
  }
}

router.post('/process-sitemap', requireAdmin, async (req, res) => {
  const { url, label, isCompetitor, maxPages = 100 } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  const jobId = 'smap-' + (++sitemapJobCounter) + '-' + Date.now()
  sitemapJobStore.set(jobId, { status: 'running', progress: { pages: 0, total: 0, errors: 0 } })

  processSiteMap(jobId, url, label, isCompetitor, maxPages).catch(e => {
    sitemapJobStore.set(jobId, { status: 'error', error: e.message })
  })

  res.json({ jobId, status: 'running', message: 'پردازش sitemap در پس‌زمینه شروع شد' })
})

router.get('/sitemap-status/:jobId', requireAdmin, async (req, res) => {
  const job = sitemapJobStore.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'job not found' })
  if (job.status === 'done') {
    sitemapJobStore.delete(req.params.jobId)
    return res.json({ status: 'done', ...job.result })
  }
  if (job.status === 'error') {
    sitemapJobStore.delete(req.params.jobId)
    return res.json({ status: 'error', error: job.error })
  }
  res.json({ status: 'running', progress: job.progress })
})

router.post('/download-images', requireAdmin, async (req, res) => {
  const { urls } = req.body
  if (!urls || !Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'URLs required' })
  const results = []
  for (const url of urls.slice(0, 20)) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!resp.ok) { results.push({ url, error: `HTTP ${resp.status}` }); continue }
      const buffer = Buffer.from(await resp.arrayBuffer())
      const name = url.split('/').pop()?.split('?')[0] || 'image.jpg'
      results.push({ url, name, data: buffer.toString('base64'), contentType: resp.headers.get('content-type') || 'image/jpeg' })
    } catch (e) { results.push({ url, error: e.message }) }
  }
  res.json({ results })
})

export default router
