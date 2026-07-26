import { Router } from 'express'
import Visit from '../models/Visit.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.connection?.remoteAddress || '0.0.0.0'
}

function getSectionFromPath(path) {
  if (!path || path === '/' || path === '') return 'home'
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length === 0) return 'home'
  if (parts[0] === 'products' && parts[1]) return 'product-detail'
  if (parts[0] === 'products') return 'products'
  if (parts[0] === 'blog' && parts[1]) return 'blog-article'
  if (parts[0] === 'blog') return 'blog'
  if (parts[0] === 'about') return 'about'
  if (parts[0] === 'contact') return 'contact'
  if (parts[0] === 'cart') return 'cart'
  if (parts[0] === 'account') return 'account'
  if (parts[0] === 'wholesale') return 'wholesale'
  if (parts[0] === 'catalog') return 'catalog'
  if (parts[0] === 'farm-map') return 'farm-map'
  if (parts[0] === 'track') return 'track'
  if (parts[0] === 'customer-club') return 'customer-club'
  if (parts[0] === 'admin') return 'admin'
  return parts[0]
}

async function geoLookup(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: 'Local', province: 'Local', city: 'Local', lat: 0, lon: 0, isp: 'Local' }
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,query`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json()
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        province: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        lat: data.lat || 0,
        lon: data.lon || 0,
        isp: data.isp || '',
      }
    }
  } catch {}
  return { country: 'Unknown', province: 'Unknown', city: 'Unknown', lat: 0, lon: 0, isp: '' }
}

const geoCache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000

async function getGeo(ip) {
  const cached = geoCache.get(ip)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data
  const data = await geoLookup(ip)
  geoCache.set(ip, { data, ts: Date.now() })
  if (geoCache.size > 5000) {
    const firstKey = geoCache.keys().next().value
    if (firstKey) geoCache.delete(firstKey)
  }
  return data
}

router.post('/track', async (req, res) => {
  try {
    const { type, data, session, path: clientPath, referrer, screenSize, language } = req.body
    if (type === 'heartbeat') return res.json({ ok: true })
    const ip = getClientIP(req)
    const geo = await getGeo(ip)
    const section = getSectionFromPath(clientPath || data?.path || req.headers.referer || '')
    const metadata = type === 'interaction' ? {
      interactionType: data?.interactionType,
      interactionValue: data?.interactionValue,
      productId: data?.productId,
      productName: data?.productName,
    } : undefined
    const visit = new Visit({
      session: session || 'anon',
      ip,
      ...geo,
      path: clientPath || data?.path || '',
      section,
      productId: data?.productId || data?.product || undefined,
      userAgent: req.headers['user-agent'] || '',
      referrer: referrer || req.headers.referer || '',
      screenSize: screenSize || '',
      language: language || req.headers['accept-language'] || '',
      metadata,
    })
    await visit.save()
    res.json({ ok: true })
  } catch (e) {
    console.error('Track error:', e.message)
    res.json({ ok: true })
  }
})

router.post('/track/duration', async (req, res) => {
  try {
    const { session, duration, path } = req.body
    if (session && path && duration > 0) {
      const lastVisit = await Visit.findOne({ session, path }).sort({ createdAt: -1 })
      if (lastVisit) {
        await Visit.updateOne({ _id: lastVisit._id }, { $max: { duration } })
      }
    }
    res.json({ ok: true })
  } catch { res.json({ ok: true }) }
})

router.get('/admin/summary', requireAdmin, async (req, res) => {
  try {
    const now = Date.now()
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date(now - 7 * 86400000)
    const monthAgo = new Date(now - 30 * 86400000)

    const [totalEvents, todayViews, weekViews, monthViews, uniqueSessions, pageCounts, productCounts, hourlyActivity] = await Promise.all([
      Visit.countDocuments(),
      Visit.countDocuments({ createdAt: { $gte: todayStart } }),
      Visit.countDocuments({ createdAt: { $gte: weekAgo } }),
      Visit.countDocuments({ createdAt: { $gte: monthAgo } }),
      Visit.distinct('session', { createdAt: { $gte: monthAgo } }),
      Visit.aggregate([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { productId: { $ne: null } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ])

    const hourly = Array(24).fill(0)
    hourlyActivity.forEach(h => { if (h._id >= 0 && h._id < 24) hourly[h._id] = h.count })

    const dailyData = await Visit.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    const dailyLabels = dailyData.map(d => d._id).slice(-14)
    const dailyCounts = dailyData.map(d => d.count).slice(-14)

    res.json({
      totalEvents,
      totalPageViews: totalEvents,
      todayViews, weekViews, monthViews,
      uniqueSessions: uniqueSessions.length,
      topPages: pageCounts.map(p => [p._id, p.count]),
      topProducts: productCounts.map(p => [p._id, p.count]),
      hourlyActivity: hourly,
      dailyLabels,
      dailyData: dailyCounts,
    })
  } catch (e) {
    console.error('Summary error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

router.get('/admin/geo', requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query
    const now = new Date()
    let startDate
    if (period === 'today') { startDate = new Date(); startDate.setHours(0, 0, 0, 0) }
    else if (period === 'week') startDate = new Date(now - 7 * 86400000)
    else if (period === 'year') startDate = new Date(now - 365 * 86400000)
    else startDate = new Date(now - 30 * 86400000)

    const match = { createdAt: { $gte: startDate } }

    const [byCountry, byProvince, byCity, geoPoints, sectionByProvince] = await Promise.all([
      Visit.aggregate([
        { $match: match },
        { $group: { _id: '$country', count: { $sum: 1 }, visitors: { $addToSet: '$session' } } },
        { $addFields: { uniqueVisitors: { $size: '$visitors' } } },
        { $project: { visitors: 0 } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: { country: '$country', province: '$province' }, count: { $sum: 1 }, visitors: { $addToSet: '$session' } } },
        { $addFields: { uniqueVisitors: { $size: '$visitors' } } },
        { $project: { visitors: 0 } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: { country: '$country', province: '$province', city: '$city' }, count: { $sum: 1 }, visitors: { $addToSet: '$session' } } },
        { $addFields: { uniqueVisitors: { $size: '$visitors' } } },
        { $project: { visitors: 0 } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: { ...match, lat: { $ne: 0 }, lon: { $ne: 0 } } },
        { $group: { _id: { lat: '$lat', lon: '$lon', country: '$country', province: '$province', city: '$city' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: { province: '$province', country: '$country', section: '$section' }, count: { $sum: 1 } } },
        { $sort: { '_id.province': 1, count: -1 } },
      ]),
    ])

    const interestsByProvince = {}
    sectionByProvince.forEach(item => {
      const key = `${item._id.country}|${item._id.province}`
      if (!interestsByProvince[key]) interestsByProvince[key] = { country: item._id.country, province: item._id.province, sections: [], total: 0 }
      interestsByProvince[key].sections.push({ section: item._id.section, count: item.count })
      interestsByProvince[key].total += item.count
    })

    res.json({
      byCountry,
      byProvince,
      byCity,
      geoPoints,
      interestsByProvince: Object.values(interestsByProvince).sort((a, b) => b.total - a.total),
      period,
    })
  } catch (e) {
    console.error('Geo error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

router.get('/admin/interactions', requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query
    const now = new Date()
    let startDate
    if (period === 'today') { startDate = new Date(); startDate.setHours(0, 0, 0, 0) }
    else if (period === 'week') startDate = new Date(now - 7 * 86400000)
    else if (period === 'year') startDate = new Date(now - 365 * 86400000)
    else startDate = new Date(now - 30 * 86400000)

    const match = { 'metadata.interactionType': { $ne: null }, createdAt: { $gte: startDate } }

    const [byType, byProduct, colorPicks, fabricPicks, recent] = await Promise.all([
      Visit.aggregate([
        { $match: match },
        { $group: { _id: '$metadata.interactionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: { ...match, 'metadata.productId': { $ne: null } } },
        { $group: { _id: { productId: '$metadata.productId', productName: '$metadata.productName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      Visit.aggregate([
        { $match: { ...match, 'metadata.interactionType': 'color' } },
        { $group: { _id: '$metadata.interactionValue', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      Visit.aggregate([
        { $match: { ...match, 'metadata.interactionType': 'fabric' } },
        { $group: { _id: '$metadata.interactionValue', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      Visit.find(match).sort({ createdAt: -1 }).limit(30).lean(),
    ])

    res.json({ byType, byProduct, colorPicks, fabricPicks, recent, period })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/admin/geo/products', requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query
    const now = new Date()
    let startDate
    if (period === 'today') { startDate = new Date(); startDate.setHours(0, 0, 0, 0) }
    else if (period === 'week') startDate = new Date(now - 7 * 86400000)
    else if (period === 'year') startDate = new Date(now - 365 * 86400000)
    else startDate = new Date(now - 30 * 86400000)

    const productInterest = await Visit.aggregate([
      { $match: { createdAt: { $gte: startDate }, productId: { $ne: null } } },
      { $group: { _id: { province: '$province', country: '$country', productId: '$productId' }, count: { $sum: 1 } } },
      { $sort: { '_id.province': 1, count: -1 } },
    ])

    const productsByProvince = {}
    productInterest.forEach(item => {
      const key = `${item._id.country}|${item._id.province}`
      if (!productsByProvince[key]) productsByProvince[key] = { country: item._id.country, province: item._id.province, products: [], total: 0 }
      productsByProvince[key].products.push({ productId: item._id.productId, count: item.count })
      productsByProvince[key].total += item.count
    })

    const recentVisits = await Visit.find({ ...(period !== 'all' ? { createdAt: { $gte: startDate } } : {}), lat: { $ne: 0 }, lon: { $ne: 0 } })
      .sort({ createdAt: -1 }).limit(200).lean()

    res.json({
      productsByProvince: Object.values(productsByProvince).sort((a, b) => b.total - a.total),
      recentVisits: recentVisits.map(v => ({
        country: v.country, province: v.province, city: v.city,
        lat: v.lat, lon: v.lon, path: v.path, productId: v.productId,
        createdAt: v.createdAt,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
