import { Router } from 'express'
import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import Category from '../models/Category.js'

const router = Router()

function matchQuery(text, q) {
  if (!text || !q) return false
  return String(text).toLowerCase().includes(q.toLowerCase())
}

async function searchInProducts(q, categorySlugs) {
  const products = await Product.find({}).lean()
  return products
    .filter(p => {
      if (matchQuery(p.name, q)) return true
      if (matchQuery(p.description, q)) return true
      if (matchQuery(p.slug, q)) return true
      if (matchQuery(p.category, q)) return true
      if (categorySlugs.has(p.category)) return true
      if (matchQuery(p.material, q)) return true
      if (matchQuery(p.colors, q)) return true
      if (matchQuery(p.woodColors, q)) return true
      if (matchQuery(p.fabrics, q)) return true
      try {
        const features = JSON.parse(p.features || '[]')
        if (features.some(f => matchQuery(f.key, q) || matchQuery(f.value, q))) return true
      } catch {}
      const langFields = ['name_fa', 'name_en', 'name_ar', 'desc_fa', 'desc_en', 'desc_ar']
      if (langFields.some(k => matchQuery(p[k], q))) return true
      return false
    })
    .map(p => ({
      type: 'product', id: p.id,
      title: p.name || '', description: p.description || '',
      slug: p.slug || '', category: p.category || '',
      image: (() => { try { const imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); return imgs[0] || '' } catch { return '' } })(),
      price: p.price || '', url: `/products/${p.id}`,
    }))
}

async function searchInBlog(q) {
  const articles = await Blog.find({}).lean()
  return articles
    .filter(a => {
      if (matchQuery(a.title, q)) return true
      if (matchQuery(a.description, q)) return true
      if (matchQuery(a.content, q)) return true
      if (matchQuery(a.tags, q)) return true
      if (matchQuery(a.category, q)) return true
      if (matchQuery(a.subcategory, q)) return true
      return false
    })
    .map(a => ({
      type: 'article', id: a.id,
      title: a.title || '', description: a.description || '',
      category: a.category || '', image: a.image || '',
      date: a.date || a.createdAt || '', tags: a.tags || '',
      url: `/blog?id=${a.id}`,
    }))
}

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json({ results: [], total: 0, query: '' })

  const categories = await Category.find({}).lean().catch(() => [])
  const categorySlugs = new Set()
  categories.forEach(c => {
    if (matchQuery(c.name, q)) categorySlugs.add(c.slug)
  })

  const products = await searchInProducts(q, categorySlugs)
  const articles = await searchInBlog(q)
  const results = [...products, ...articles]
  res.json({ results, total: results.length, query: q, counts: { products: products.length, articles: articles.length } })
})

export default router
