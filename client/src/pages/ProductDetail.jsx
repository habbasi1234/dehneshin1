import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ProductViewer from '../components/ProductViewer'
import track, { usePageTracking, useProductTracking } from '../hooks/useTracking'
import { useLanguage } from '../context/LanguageContext'
import useSEO from '../hooks/useSEO'
import { parsePrice } from '../utils/price'
import { useToast } from '../components/admin/Toast'

function StarRating({ value, onChange, size = 22, readonly = false }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          style={{
            fontSize: size, cursor: readonly ? 'default' : 'pointer',
            color: star <= value ? '#D4AF37' : '#444',
            transition: 'color 0.15s',
            filter: star <= value ? 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' : 'none',
          }}
          onMouseEnter={e => { if (!readonly) e.currentTarget.style.color = '#D4AF37' }}
          onMouseLeave={e => { if (!readonly) e.currentTarget.style.color = star <= value ? '#D4AF37' : '#444' }}
        >★</span>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addedQty, setAddedQty] = useState(1)
  const { lang } = useLanguage()

  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 0, comment: '' })
  const addToast = useToast()
  const [reviewMsg, setReviewMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const pName = (p) => p && (p[`name_${lang}`] || p.name || '')
  const pDesc = (p) => p && (p[`desc_${lang}`] || p.description || '')

  useSEO({ title: product ? `${pName(product)} | ده نشین` : 'محصول | ده نشین', description: product ? pDesc(product) : '' })
  usePageTracking()
  const tracking = useProductTracking(id, pName(product))

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`)
        setProduct(res.data)
      } catch {
        setProduct({
          id: parseInt(id),
          name: 'محصول ارگانیک',
          category: 'fruits',
          description: 'محصول ارگانیک و طبیعی از مزرعه',
          price: '150,000',
          salePrice: '120,000',
          image: '',
          images: [],
          colors: ['#4CAF50', '#388E3C', '#FDD835'],
        })
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    axios.get(`/api/reviews/product/${id}`)
      .then(({ data }) => setReviews(data))
      .catch(() => {})
  }, [id])

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.name || !reviewForm.rating || !reviewForm.comment) {
      setReviewMsg('نام، امتیاز و نظر الزامی است')
      return
    }
    setSubmitting(true)
    setReviewMsg('')
    try {
      await axios.post(`/api/reviews/product/${id}`, reviewForm)
      setReviewMsg('success')
      setReviewForm({ name: '', email: '', rating: 0, comment: '' })
    } catch (err) {
      setReviewMsg(err.response?.data?.error || 'خطا در ثبت نظر')
    }
    setSubmitting(false)
  }

  let images = []
  if (product) {
    if (Array.isArray(product.images)) images = product.images
    else if (typeof product.images === 'string') {
      try { images = JSON.parse(product.images) } catch { images = [] }
    }
    if (product.image) images = [product.image]
  }

  const parseColors = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [] } catch {}
      return val.split(',').map(c => c.trim()).filter(Boolean)
    }
    return []
  }
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const parseFeatures = (f) => {
    if (!f) return []
    if (Array.isArray(f)) return f
    if (typeof f === 'string') {
      try { const p = JSON.parse(f); return Array.isArray(p) ? p : [] } catch { return [] }
    }
    return []
  }
  const features = parseFeatures(product?.features)
  const initialShow = 5

  const addToCart = () => {
    if (!product) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(c => c.productId === product.id)
    const saleP = parsePrice(product.salePrice)
    const hasSale = saleP > 0
    const finalPrice = hasSale ? product.salePrice : (product.price || '')
    if (existing) {
      existing.quantity = (existing.quantity || 1) + addedQty
    } else {
      cart.push({
        productId: product.id,
        name: pName(product),
        price: finalPrice,
        quantity: addedQty,
        image: images[0] || '',
        originalPrice: hasSale ? product.price : '',
      })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-update'))
    addToast(`"${pName(product)}" به سبد خرید اضافه شد`)
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 50, height: 50, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%' }}
        />
      </div>
    )
  }

  if (!product) return (
    <div style={{ paddingTop: '100px', textAlign: 'center', color: '#D4AF37' }}>
      محصول یافت نشد
    </div>
  )

  return (
    <div className="page-bg" style={{ paddingTop: '70px', background: '#F5F0E8', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .pd-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
          .pd-grid h1 { font-size: 1.8rem !important; }
          .pd-grid .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .pd-grid h1 { font-size: 1.4rem !important; }
          .pd-grid .qty-btn { width: 32px !important; height: 32px !important; }
        }
      `}</style>
      <section className="section-padding">
        <div className="container">
          <Link to="/products" style={{ color: '#4CAF50', marginBottom: '30px', display: 'inline-block' }}>
            ← بازگشت به محصولات
          </Link>

          <div className="pd-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', marginTop: '20px' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProductViewer
                images={images}
                onImageEnter={tracking.onImageEnter}
                onImageLeave={tracking.onImageLeave}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span style={{ color: '#4CAF50', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {product.category}
              </span>
              <h1 style={{ color: '#2D2D2D', fontSize: '2.5rem', margin: '15px 0', fontFamily: "'Playfair Display', serif" }}>
                {pName(product)}
              </h1>
              <p style={{ color: '#6B6B6B', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '30px' }}>
                {pDesc(product)}
              </p>

              {reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <StarRating value={Math.round(avgRating)} readonly size={18} />
                  <span style={{ color: '#D4AF37', fontSize: 14, fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>({reviews.length} نظر)</span>
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <p style={{ color: '#6B6B6B', fontSize: '0.9rem', marginBottom: '5px' }}>قیمت:</p>
                {(() => {
                  const origP = parsePrice(product.price)
                  const saleP = parsePrice(product.salePrice)
                  const hasSale = saleP > 0
                  const pct = hasSale && origP > 0 ? Math.round((1 - saleP / origP) * 100) : 0
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ color: hasSale ? '#EF5350' : '#4CAF50', fontSize: '1.3rem', fontWeight: 700 }}>
                        {(hasSale ? saleP : origP).toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888' }}>تومان</span>
                      </span>
                      {hasSale && origP > 0 && (
                        <span style={{ color: '#888', fontSize: '1rem', textDecoration: 'line-through' }}>
                          {origP.toLocaleString()} تومان
                        </span>
                      )}
                      {hasSale && pct > 0 && (
                        <span style={{ background: '#E53935', color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                          ٪{pct} تخفیف
                        </span>
                      )}
                    </div>
                  )
                })()}
              </div>

              {features.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ color: '#2D2D2D', fontSize: '0.9rem', marginBottom: 10, fontWeight: 700 }}>مشخصات محصول</p>
                  <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    {features.slice(0, showAllFeatures ? features.length : initialShow).map((feat, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <span style={{ color: '#6B6B6B', fontSize: 13 }}>{feat.key}</span>
                        <span style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 600 }}>{feat.value}</span>
                      </div>
                    ))}
                  </div>
                  {features.length > initialShow && (
                    <button
                      onClick={() => setShowAllFeatures(!showAllFeatures)}
                      style={{
                        background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer',
                        fontSize: 12, marginTop: 8, padding: 0,
                      }}
                    >
                      {showAllFeatures ? 'نمایش کمتر' : `+ ${features.length - initialShow} مشخصات بیشتر`}
                    </button>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#6B6B6B', fontSize: 13, display: 'block', marginBottom: 6 }}>تعداد:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setAddedQty(Math.max(1, addedQty - 1))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #4CAF50', background: 'transparent', color: '#4CAF50', cursor: 'pointer', fontSize: 18 }}>−</motion.button>
                  <span style={{ color: '#2D2D2D', fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{addedQty}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setAddedQty(addedQty + 1)}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #4CAF50', background: 'transparent', color: '#4CAF50', cursor: 'pointer', fontSize: 18 }}>+</motion.button>
                </div>
              </div>

                <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                style={{
                  padding: '16px 44px', borderRadius: 10, border: 'none',
                  background: '#4CAF50',
                  color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  marginBottom: 16, width: '100%',
                }}>
                افزودن به سبد خرید
              </motion.button>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { const event = new CustomEvent('open-chat', { detail: { action: 'consult' } }); window.dispatchEvent(event); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="btn-primary" style={{ padding: '16px 44px', cursor: 'pointer' }}>
                  🗨️ مشاوره آنلاین
                </motion.button>
                <Link to="/wholesale">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-outline" style={{ padding: '16px 44px' }}>
                    خرید عمده
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div style={{ marginTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 32, height: 4, background: 'linear-gradient(90deg, #4CAF50, transparent)', borderRadius: 2 }} />
              <h2 style={{ color: '#2D2D2D', fontSize: 20, margin: 0 }}>نظرات کاربران</h2>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>

            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '16px 20px', background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#4CAF50' }}>{avgRating.toFixed(1)}</div>
                  <StarRating value={Math.round(avgRating)} readonly size={14} />
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>از {reviews.length} نظر</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => Math.round(r.rating) === star).length
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#888', fontSize: 11, minWidth: 30 }}>{star} ★</span>
                        <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#4CAF50', borderRadius: 3 }} />
                        </div>
                        <span style={{ color: '#666', fontSize: 10, minWidth: 20, textAlign: 'left' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ padding: '16px 20px', background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#4CAF50' }}>
                        {(review.userName || 'U').charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 600 }}>{review.userName}</div>
                        <div style={{ color: '#888', fontSize: 10 }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('fa-IR') : ''}</div>
                      </div>
                      <div style={{ marginRight: 'auto' }}>
                        <StarRating value={review.rating} readonly size={14} />
                      </div>
                    </div>
                    <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{review.text}</p>
                    {review.reply && (
                      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(76,175,80,0.05)', borderRadius: 8, borderRight: '2px solid #4CAF50' }}>
                        <span style={{ color: '#4CAF50', fontSize: 11, fontWeight: 700 }}>مدیریت: </span>
                        <span style={{ color: '#6B6B6B', fontSize: 12 }}>{review.reply}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ maxWidth: 500 }}>
              <h3 style={{ color: '#2D2D2D', fontSize: 15, margin: '0 0 16px' }}>ثبت نظر شما</h3>
              {reviewMsg === 'success' ? (
                <div style={{ padding: '14px 18px', background: 'rgba(76,175,80,0.1)', color: '#4CAF50', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود
                </div>
              ) : reviewMsg ? (
                <div style={{ padding: '14px 18px', background: 'rgba(239,83,80,0.1)', color: '#EF5350', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {reviewMsg}
                </div>
              ) : null}

              <form onSubmit={submitReview}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>امتیاز شما</label>
                  <StarRating value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} size={28} />
                </div>
                <input value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="نام شما" required
                  style={{ width: '100%', padding: '10px 12px', marginBottom: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, color: '#2D2D2D', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <input value={reviewForm.email} onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ایمیل (اختیاری)" type="email" dir="ltr"
                  style={{ width: '100%', padding: '10px 12px', marginBottom: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, color: '#2D2D2D', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="نظر شما" required rows={4}
                  style={{ width: '100%', padding: '10px 12px', marginBottom: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, color: '#2D2D2D', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                <button type="submit" disabled={submitting} style={{
                  padding: '10px 28px', border: 'none', borderRadius: 8,
                  background: submitting ? '#aaa' : '#4CAF50',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}>
                  {submitting ? '...' : 'ثبت نظر'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
