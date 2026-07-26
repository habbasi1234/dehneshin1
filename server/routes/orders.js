import { Router } from 'express'
import { appendFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import Setting from '../models/Setting.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH = join(__dirname, '..', 'logs')
const router = Router()

if (!existsSync(LOG_PATH)) mkdirSync(LOG_PATH, { recursive: true })

const ORDER_STATUSES = ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled']
const STATUS_LABELS = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}

function normalizeMobile(m) {
  let s = String(m).replace(/[\s\-]/g, '').replace(/^(\+|00)?98/, '')
  if (s.startsWith('0')) s = s.slice(1)
  return s
}

function findSmsProvider(settings, purpose) {
  const providers = settings.smsProviders || []
  const legacy = (!providers.length && settings.smsApiKey) ? [{
    id: 'legacy', name: 'sms.ir', enabled: true,
    forOTP: true, forNotification: true,
    apiKey: settings.smsApiKey, lineNumber: settings.smsLineNumber || '',
    templateId: settings.smsTemplateId || '',
    apiBaseUrl: settings.smsApiBaseUrl || 'https://api.sms.ir/v1',
  }] : []
  const all = legacy.length ? legacy : providers
  return all.find(p => p.enabled && p.forNotification) || all.find(p => p.enabled) || null
}

async function sendSmsIrVerify(to, message) {
  try {
    const s = await Setting.findById('global').lean() || {}
    const provider = findSmsProvider(s, 'notification')
    if (!provider?.apiKey) return
    const mobile = normalizeMobile(to)
    const templateId = parseInt(provider.templateId)
    const baseUrl = (provider.apiBaseUrl || 'https://api.sms.ir/v1').replace(/\/+$/, '')
    let url, body
    if (templateId) {
      url = `${baseUrl}/send/verify`
      body = JSON.stringify({ mobile, templateId, parameters: [{ name: 'Code', value: String(message).slice(0, 25) }] })
    } else {
      url = `${baseUrl}/send/bulk`
      body = JSON.stringify({ lineNumber: provider.lineNumber || undefined, messageText: String(message).slice(0, 200), mobiles: [mobile] })
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'X-API-KEY': provider.apiKey, 'Content-Type': 'application/json' },
      body, signal: AbortSignal.timeout(10000),
    })
  } catch {}
}

async function sendNotification(type, to, subject, message) {
  const entry = { id: Date.now(), type, to, subject, message, sentAt: new Date().toISOString(), status: 'sent' }
  try { await Notification.create(entry) } catch {}
  appendFileSync(join(LOG_PATH, 'notifications.log'), `[${entry.sentAt}] ${type.toUpperCase()} => ${to} | ${subject} | ${message}\n`)
  console.log(`📧 ${type.toUpperCase()}: ${to} - ${subject}`)
  if (type === 'sms') sendSmsIrVerify(to, message)
}

function toPersianDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

async function notifyCustomer(order, event) {
  const user = order.userId ? await User.findOne({ id: order.userId }).lean() : null
  const email = user?.email || order.customerEmail
  const phone = user?.phone || order.customerPhone
  const name = user?.name || order.customerName || 'مشتری'
  const statusLabel = STATUS_LABELS[order.status] || order.status
  const date = toPersianDate(order.updatedAt || order.createdAt)

  if (event === 'created') {
    const msg = `🆕 سفارش ${order.code}\nوضعیت: ${statusLabel}\nتاریخ: ${date}\nده نشین`
    if (email) sendNotification('email', email, `ثبت سفارش ${order.code}`, msg)
    if (phone) sendNotification('sms', phone, '', msg)
  } else if (event === 'status_change') {
    const msg = `📦 سفارش ${order.code}\nوضعیت جدید: ${statusLabel}\nتاریخ: ${date}\nده نشین`
    if (email) sendNotification('email', email, `به‌روزرسانی سفارش ${order.code}`, msg)
    if (phone) sendNotification('sms', phone, '', msg)
  }
}

async function generateOrderCode() {
  const prefix = 'AZ'
  const date = new Date()
  const d = String(date.getFullYear()).slice(2) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0')
  const todayOrders = await Order.find({ code: { $regex: `^${prefix}-${d}` } }).lean()
  const num = String(todayOrders.length + 1).padStart(3, '0')
  return `${prefix}-${d}-${num}`
}

router.get('/', async (req, res) => {
  try {
    const { status, userId, search } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (userId) filter.userId = parseInt(userId)
    let orders = await Order.find(filter).sort({ id: -1 }).lean()
    if (search) {
      const s = search.toLowerCase()
      orders = orders.filter(o => o.code?.toLowerCase().includes(s) || o.customerName?.toLowerCase().includes(s))
    }
    res.json(orders)
  } catch { res.json([]) }
})

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: parseInt(req.params.id) }).lean()
    if (!order) return res.status(404).json({ error: 'سفارش یافت نشد' })
    res.json(order)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/', async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerEmail, address, notes, userId } = req.body
    if (!items || items.length === 0) return res.status(400).json({ error: 'حداقل یک محصول باید انتخاب شود' })
    const products = await Product.find({}).lean()
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId))
      return {
        productId: item.productId, name: product?.name || 'محصول نامشخص',
        quantity: item.quantity || 1, price: item.price || product?.price || '0',
        selectedWoodColor: item.selectedWoodColor || '', selectedFabric: item.selectedFabric || '',
      }
    })
    const estDelivery = new Date(); estDelivery.setDate(estDelivery.getDate() + 30)
    const order = await Order.create({
      id: Date.now(), code: await generateOrderCode(),
      userId: userId || null, items: orderItems,
      customerName: customerName || '', customerPhone: customerPhone || '',
      customerEmail: customerEmail || '', address: address || '', notes: notes || '',
      status: 'pending',
      statusHistory: [{ status: 'pending', date: new Date().toISOString(), note: 'ثبت سفارش' }],
      estimatedDelivery: estDelivery.toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    })
    notifyCustomer(order, 'created')
    res.status(201).json(order.toObject())
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ id: parseInt(req.params.id) })
    if (!order) return res.status(404).json({ error: 'سفارش یافت نشد' })
    const { status, items, customerName, customerPhone, customerEmail, address, notes } = req.body
    if (status && ORDER_STATUSES.includes(status) && status !== order.status) {
      order.statusHistory.push({ status, date: new Date().toISOString(), note: `وضعیت به "${STATUS_LABELS[status]}" تغییر یافت` })
      order.status = status
      notifyCustomer(order.toObject(), 'status_change')
    }
    if (items) order.items = items
    if (customerName !== undefined) order.customerName = customerName
    if (customerPhone !== undefined) order.customerPhone = customerPhone
    if (customerEmail !== undefined) order.customerEmail = customerEmail
    if (address !== undefined) order.address = address
    if (notes !== undefined) order.notes = notes
    order.updatedAt = new Date().toISOString()
    await order.save()
    res.json(order.toObject())
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Order.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch { res.json({ success: false }) }
})

router.get('/stats/summary', async (req, res) => {
  try {
    const orders = await Order.find({}).lean()
    const byStatus = {}
    ORDER_STATUSES.forEach(s => byStatus[s] = 0)
    orders.forEach(o => byStatus[o.status] = (byStatus[o.status] || 0) + 1)
    res.json({ total: orders.length, byStatus, pending: byStatus.pending || 0, processing: byStatus.processing || 0, design: byStatus.design || 0, delivery: byStatus.delivery || 0, completed: byStatus.completed || 0, cancelled: byStatus.cancelled || 0 })
  } catch { res.json({ total: 0, byStatus: {} }) }
})

router.get('/stats/notifications', async (req, res) => {
  try {
    const notifs = await Notification.find({}).lean()
    res.json({ total: notifs.length, email: notifs.filter(n => n.type === 'email').length, sms: notifs.filter(n => n.type === 'sms').length, last10: notifs.slice(-10).reverse() })
  } catch { res.json({ total: 0, email: 0, sms: 0, last10: [] }) }
})

router.get('/stats/report', async (req, res) => {
  try {
    const [orders, users, notifs, products] = await Promise.all([
      Order.find({}).lean(), User.find({}).lean(), Notification.find({}).lean(), Product.find({}).lean(),
    ])
    res.json({
      orders: { total: orders.length, pending: orders.filter(o => o.status === 'pending').length, processing: orders.filter(o => o.status === 'processing').length, design: orders.filter(o => o.status === 'design').length, production: orders.filter(o => o.status === 'production').length, delivery: orders.filter(o => o.status === 'delivery').length, completed: orders.filter(o => o.status === 'completed').length, cancelled: orders.filter(o => o.status === 'cancelled').length },
      users: { total: users.length, customers: users.filter(u => u.role === 'customer').length, admins: users.filter(u => u.role === 'admin').length, employees: users.filter(u => u.role === 'employee').length },
      notifications: { total: notifs.length, email: notifs.filter(n => n.type === 'email').length, sms: notifs.filter(n => n.type === 'sms').length },
      products: { total: products.length },
    })
  } catch { res.json({}) }
})

export { ORDER_STATUSES, STATUS_LABELS }
export default router
