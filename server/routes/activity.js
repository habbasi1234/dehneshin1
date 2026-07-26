import { Router } from 'express'
import ActivityLog from '../models/ActivityLog.js'

const router = Router()

export async function logActivity({ userId, username, action, resource, resourceId, details, ip, userAgent }) {
  try {
    await ActivityLog.create({ userId, username, action, resource, resourceId, details, ip, userAgent })
  } catch (e) {
    console.error('Activity log error:', e.message)
  }
}

export function activityMiddleware(req, res, next) {
  const originalJson = res.json.bind(res)
  res.json = function (body) {
    if (res.statusCode < 400 && req.method !== 'GET') {
      const token = req.headers.authorization?.slice(7)
      const userId = token ? parseInt(token.split('-')[0]?.replace('az-token-', '') || '0') : 0
      const username = req.headers['x-admin-username'] || 'unknown'
      const resource = req.baseUrl + req.route?.path || req.path
      const resourceId = req.params.id || req.body?.id || ''
      let action = ''
      if (req.method === 'POST') action = 'create'
      else if (req.method === 'PUT') action = 'update'
      else if (req.method === 'DELETE') action = 'delete'
      if (action && userId) {
        logActivity({
          userId, username, action, resource, resourceId,
          details: JSON.stringify({ body: sanitizeBody(req.body) }),
          ip: req.ip, userAgent: req.headers['user-agent'],
        })
      }
    }
    return originalJson(body)
  }
  next()
}

function sanitizeBody(body) {
  if (!body) return {}
  const safe = { ...body }
  delete safe.password
  delete safe.token
  delete safe.otp
  delete safe.apiKey
  return safe
}

router.get('/', async (req, res) => {
  try {
    const { limit = 100, skip = 0, action: actionFilter } = req.query
    const filter = actionFilter ? { action: actionFilter } : {}
    const [items, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)).lean(),
      ActivityLog.countDocuments(filter),
    ])
    res.json({ items, total })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const now = Date.now()
    const dayAgo = new Date(now - 86400000)
    const weekAgo = new Date(now - 7 * 86400000)
    const monthAgo = new Date(now - 30 * 86400000)

    const [total, today, week, month, byAction, byUser, hourlyActivity, dailyActivity] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ createdAt: { $gte: dayAgo } }),
      ActivityLog.countDocuments({ createdAt: { $gte: weekAgo } }),
      ActivityLog.countDocuments({ createdAt: { $gte: monthAgo } }),
      ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { username: '$username', userId: '$userId' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ])

    const hourly = Array(24).fill(0)
    hourlyActivity.forEach(h => { if (h._id >= 0 && h._id < 24) hourly[h._id] = h.count })

    res.json({ total, today, week, month, byAction, byUser, hourlyActivity: hourly, dailyActivity })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
