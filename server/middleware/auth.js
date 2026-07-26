import User from '../models/User.js'
import Customer from '../models/Customer.js'

export const ADMIN_ROLES = ['superadmin', 'admin', 'manager', 'support', 'editor']

export function validateToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('-')
  if (parts.length < 2) return null
  const ts = parseInt(parts[parts.length - 1])
  if (!ts || Date.now() - ts > 86400000) return null
  if (parts[0] === 'az' && parts[1] === 'token') {
    const userId = parseInt(parts[2])
    if (!userId || userId <= 0) return null
    return String(userId)
  }
  return null
}

export async function findUserByToken(token) {
  if (!token) return null
  const parts = token.split('-')
  if (parts.length < 2) return null
  const ts = parseInt(parts[parts.length - 1])
  if (!ts || Date.now() - ts > 86400000) return null
  if (parts[0] === 'az' && parts[1] === 'token') {
    const userId = parseInt(parts[2])
    if (!userId || userId <= 0) return null
    let user = await User.findOne({ id: userId }).lean()
    if (!user) user = await Customer.findOne({ id: userId }).lean()
    return user
  }
  return null
}

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'احراز هویت نشده' })
    const user = await findUserByToken(authHeader.slice(7))
    if (!user) return res.status(401).json({ error: 'نشست منقضی شده' })
    if (!ADMIN_ROLES.includes(user.role)) return res.status(403).json({ error: 'دسترسی غیرمجاز' })
    req.user = user
    next()
  } catch { res.status(500).json({ error: 'خطای احراز هویت' }) }
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'احراز هویت نشده' })
    const user = await findUserByToken(authHeader.slice(7))
    if (!user) return res.status(401).json({ error: 'نشست منقضی شده' })
    req.user = user
    next()
  } catch { res.status(500).json({ error: 'خطای احراز هویت' }) }
}

export function validateId(param = 'id') {
  return (req, res, next) => {
    const val = parseInt(req.params[param])
    if (!val || val <= 0) return res.status(400).json({ error: 'شناسه نامعتبر' })
    req.params[param] = val
    next()
  }
}

export function sanitizeBody(allowedFields) {
  return (req, res, next) => {
    if (typeof req.body !== 'object' || req.body === null) return res.status(400).json({ error: 'بدنه نامعتبر' })
    const clean = {}
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) clean[key] = req.body[key]
    }
    req.body = clean
    next()
  }
}
