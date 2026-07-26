import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Blog from '../models/Blog.js'
import Testimonial from '../models/Testimonial.js'
import Customer from '../models/Customer.js'
import { requireAdmin } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

const COLLECTIONS = ['testimonials', 'blog', 'customers']

const modelMap = {
  testimonials: Testimonial,
  blog: Blog,
  customers: Customer,
}

router.get('/:type', async (req, res) => {
  const { type } = req.params
  if (!COLLECTIONS.includes(type)) return res.status(404).json({ error: 'نوع محتوا یافت نشد' })
  try {
    const items = await modelMap[type].find({}).sort({ id: -1 }).lean()
    res.json(items)
  } catch {
    res.json([])
  }
})

router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params
  if (!COLLECTIONS.includes(type)) return res.status(404).json({ error: 'نوع محتوا یافت نشد' })
  try {
    const item = await modelMap[type].findOne({ id: parseInt(id) }).lean()
    if (!item) return res.status(404).json({ error: 'مورد یافت نشد' })
    res.json(item)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

function generateCustomerCode(existingCodes) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = 'AZ'
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    if (!existingCodes.includes(code)) return code
  }
  return 'AZ' + Date.now().toString(36).toUpperCase()
}

router.post('/:type', requireAdmin, async (req, res) => {
  const { type } = req.params
  if (!COLLECTIONS.includes(type)) return res.status(404).json({ error: 'نوع محتوا یافت نشد' })
  try {
    const body = { ...req.body, id: Date.now() }
    if (type === 'customers' && !body.customerCode) {
      const existing = await modelMap[type].find({}).lean()
      const codes = existing.map(c => c.customerCode).filter(Boolean)
      body.customerCode = generateCustomerCode(codes)
    }
    const doc = await modelMap[type].create(body)
    res.status(201).json(doc.toObject())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:type/:id', requireAdmin, async (req, res) => {
  const { type, id } = req.params
  if (!COLLECTIONS.includes(type)) return res.status(404).json({ error: 'نوع محتوا یافت نشد' })
  try {
    const doc = await modelMap[type].findOneAndUpdate(
      { id: parseInt(id) },
      { $set: req.body },
      { new: true }
    ).lean()
    if (!doc) return res.status(404).json({ error: 'مورد یافت نشد' })
    res.json(doc)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params
  if (!COLLECTIONS.includes(type)) return res.status(404).json({ error: 'نوع محتوا یافت نشد' })
  try {
    await modelMap[type].deleteOne({ id: parseInt(id) })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
