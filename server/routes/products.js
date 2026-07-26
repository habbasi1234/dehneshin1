import { Router } from 'express'
import Product from '../models/Product.js'
import Setting from '../models/Setting.js'
import { requireAdmin, validateId } from '../middleware/auth.js'

const router = Router()

async function getViews() {
  const doc = await Setting.findById('global').lean()
  return doc?.productViews || {}
}

async function saveViews(views) {
  await Setting.findByIdAndUpdate('global', { $set: { productViews: views } }, { upsert: true })
}

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query
    const filter = {}
    if (category && category !== 'all') filter.category = category
    if (status) filter.status = status
    let products = await Product.find(filter).sort({ id: -1 }).lean()
    res.json(products)
  } catch {
    res.json([])
  }
})

router.get('/stats/popular', async (req, res) => {
  try {
    const views = await getViews()
    const products = await Product.find({ status: 'active' }).lean()
    const sorted = products.sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0)).slice(0, 10)
    res.json(sorted)
  } catch {
    res.json([])
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) }).lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })
    const views = await getViews()
    views[product.id] = (views[product.id] || 0) + 1
    await saveViews(views)
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body }
    body.id = Date.now()
    const doc = await Product.create(body)
    res.status(201).json(doc.toObject())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/import', requireAdmin, async (req, res) => {
  try {
    const { products } = req.body
    if (!Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'آرایه محصولات الزامی است' })
    let count = 0
    for (const item of products) {
      const body = { ...item, id: Date.now() + count }
      if (body.images && typeof body.images === 'string') body.images = body.images
      await Product.create(body)
      count++
    }
    res.json({ success: true, count, message: `${count} محصول با موفقیت وارد شد` })
  } catch (e) {
    res.status(500).json({ error: 'خطا در ورود محصولات: ' + e.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { $set: req.body },
      { new: true }
    ).lean()
    if (!doc) return res.status(404).json({ error: 'Product not found' })
    res.json(doc)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Product.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
