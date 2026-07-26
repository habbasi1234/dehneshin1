import { Router } from 'express'
import Review from '../models/Review.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: parseInt(req.params.productId), approved: { $ne: false } })
      .sort({ id: -1 }).lean()
    res.json(reviews)
  } catch { res.json([]) }
})

router.post('/product/:productId', async (req, res) => {
  const { name, email, rating, comment } = req.body
  if (!name || !rating || !comment) return res.status(400).json({ error: 'نام، امتیاز و نظر الزامی است' })
  try {
    const review = await Review.create({
      id: Date.now(),
      productId: parseInt(req.params.productId),
      userName: name,
      email: email || '',
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      text: comment,
      approved: false,
      reply: '',
      replyDate: null,
      createdAt: new Date().toISOString(),
    })
    res.status(201).json(review.toObject())
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/', async (req, res) => {
  try {
    const { approved, productId } = req.query
    const filter = {}
    if (approved !== undefined) filter.approved = approved === 'true'
    if (productId) filter.productId = parseInt(productId)
    const reviews = await Review.find(filter).sort({ id: -1 }).lean()
    res.json(reviews)
  } catch { res.json([]) }
})

router.get('/stats/popular', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { approved: { $ne: false } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 20 },
    ])
    res.json(stats)
  } catch { res.json([]) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Review.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { $set: req.body },
      { new: true }
    ).lean()
    if (!doc) return res.status(404).json({ error: 'نظر یافت نشد' })
    res.json(doc)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Review.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch { res.json({ success: false }) }
})

export default router
