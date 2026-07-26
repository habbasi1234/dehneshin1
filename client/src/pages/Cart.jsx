import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import axios from 'axios'
import useSEO from '../hooks/useSEO'
import { parsePrice } from '../utils/price'

const statusFlow = ['pending', 'processing', 'delivery', 'completed']
const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش',
  delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusColors = {
  pending: '#FFA726', processing: '#42A5F5',
  delivery: '#26A69A', completed: '#4CAF50', cancelled: '#EF5350',
}

const shippingMethods = [
  { id: 'post', label: 'پست پیشتاز', icon: '📮', time: '۲ تا ۳ روز کاری', cost: 30000, desc: 'ارسال از طریق پست پیشتاز با قابلیت رهگیری' },
  { id: 'tipax', label: 'تیپاکس', icon: '🚚', time: '۱ تا ۲ روز کاری', cost: 45000, desc: 'ارسال سریع با تیپاکس به سراسر کشور' },
  { id: 'freight', label: 'باربری', icon: '📦', time: '۳ تا ۵ روز کاری', cost: 20000, desc: 'مناسب برای سفارش‌های سنگین و عمده' },
  { id: 'express', label: 'ارسال فوری', icon: '⚡', time: 'همان روز (تهران)', cost: 80000, desc: 'ارسال در همان روز برای تهران و حومه' },
]

const trustBadges = [
  { icon: '🛡', title: 'ضمانت کیفیت', desc: 'محصولات ارگانیک با ضمانت بازگشت کالا' },
  { icon: '🚀', title: 'ارسال سریع', desc: 'تحویل در سریع‌ترین زمان ممکن' },
  { icon: '💳', title: 'پرداخت امن', desc: 'پرداخت در محل با کارت بانکی' },
  { icon: '✅', title: 'ضمانت تازگی', desc: 'تازه‌ترین محصولات از مزرعه تا خانه' },
]

export default function Cart() {
  useSEO({ title: 'سبد خرید | ده نشین', description: 'سبد خرید شما - محصولات انتخاب شده را بررسی و سفارش دهید' })
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '', telegram: '', address: '', notes: '' })
  const [shipping, setShipping] = useState('post')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [products, setProducts] = useState([])
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setCart(JSON.parse(saved))
    } catch { }
    axios.get('/api/products').then(({ data }) => setProducts(data)).catch(() => {})
  }, [])

  const getCartProduct = (item) => products.find(p => p.id === item.productId)

  const getCartImage = (item) => {
    if (item.image) return item.image
    const p = getCartProduct(item)
    if (!p) return ''
    let imgs = p.images
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    return Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
  }

  const saveCart = (items) => {
    setCart(items)
    localStorage.setItem('cart', JSON.stringify(items))
  }

  const removeItem = (id) => {
    saveCart(cart.filter(item => item.productId !== id))
    window.dispatchEvent(new Event('cart-update'))
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return
    saveCart(cart.map(item => item.productId === id ? { ...item, quantity: qty } : item))
    window.dispatchEvent(new Event('cart-update'))
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getItemPrice = (item) => {
    return parsePrice(item.price)
  }

  const getItemOrigPrice = (item) => {
    if (item.originalPrice) return parsePrice(item.originalPrice)
    const p = getCartProduct(item)
    if (p) return parsePrice(p?.price)
    return parsePrice(item.price)
  }

  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  const totalOrig = cart.reduce((sum, item) => sum + getItemOrigPrice(item) * item.quantity, 0)
  const discountAmt = totalOrig - subtotal
  const shippingCost = shippingMethods.find(s => s.id === shipping)?.cost || 0
  const freeShippingThreshold = 500000
  const freeShippingEligible = subtotal >= freeShippingThreshold
  const finalShipping = freeShippingEligible ? 0 : shippingCost
  const total = subtotal + finalShipping - promoDiscount

  const shippingMethod = shippingMethods.find(s => s.id === shipping)

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const applyPromo = () => {
    if (!promoCode.trim()) return
    const code = promoCode.trim().toLowerCase()
    if (code === 'dehnesin10') {
      setPromoDiscount(Math.round(subtotal * 0.1))
      setPromoError('')
    } else if (code === 'dehnesin20') {
      setPromoDiscount(Math.round(subtotal * 0.2))
      setPromoError('')
    } else {
      setPromoDiscount(0)
      setPromoError('کد تخفیف نامعتبر است')
    }
  }

  const cartCategories = [...new Set(cart.map(item => {
    const p = getCartProduct(item)
    return p?.category || p?.categoryEn || ''
  }).filter(Boolean))]

  const suggestedProducts = products
    .filter(p => !cart.find(c => c.productId === p.id) && (cartCategories.includes(p.category) || cartCategories.includes(p.categoryEn)))
    .slice(0, 4)

  const addToCart = (product) => {
    const exists = cart.find(item => item.productId === product.id)
    const saleP = parsePrice(product.salePrice)
    const hasSale = saleP > 0
    const finalPrice = hasSale ? product.salePrice : (product.price || '')
    if (exists) {
      updateQty(product.id, exists.quantity + 1)
    } else {
      const newCart = [...cart, { productId: product.id, name: product.name, price: finalPrice, quantity: 1, originalPrice: hasSale ? product.price : '' }]
      saveCart(newCart)
      window.dispatchEvent(new Event('cart-update'))
    }
  }

  const submitOrder = async () => {
    if (cart.length === 0) return
    if (!form.name || !form.phone) { alert('لطفاً نام و موبایل خود را وارد کنید'); return }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/orders', {
        items: cart.map(item => ({
          productId: item.productId, quantity: item.quantity, price: String(getItemPrice(item)),
        })),
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        customerTelegram: form.telegram,
        address: form.address,
        notes: `شیوه ارسال: ${shippingMethod?.label || shipping} | ${form.notes}`,
        shippingMethod: shipping,
        shippingCost: finalShipping,
        discount: promoDiscount,
      })
      setOrderCode(data.code)
      setSubmitted(true)
      localStorage.removeItem('cart')
    } catch (e) {
      alert(e.response?.data?.error || 'خطا در ثبت سفارش')
    }
    setSubmitting(false)
  }

  const inputStyle = (icon) => ({
    width: '100%',
    padding: '12px 12px 12px 36px',
    background: '#F5F0E8',
    border: '1px solid #D4D0C8',
    borderRadius: 8,
    color: '#2D2D2D',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  })

  const inputWrap = (icon) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  })

  if (submitted) {
    return (
      <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#F5F0E8' }}>
        <section className="section-padding">
          <div className="container" style={{ maxWidth: 700 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                background: '#FFFFFF', borderRadius: 20, padding: 48, textAlign: 'center',
                boxShadow: '0 4px 30px rgba(0,0,0,0.06)', border: '1px solid #E8E4DC',
              }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, margin: '0 auto 24px',
                  }}>✅</motion.div>
                <h1 style={{ color: '#2D2D2D', fontSize: 28, marginBottom: 8 }}>سفارش شما ثبت شد</h1>
                <p style={{ color: '#6B6B6B', fontSize: 15, marginBottom: 4 }}>از خرید شما سپاسگزاریم</p>
                <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 20 }}>کد پیگیری سفارش:</p>
                <div style={{
                  display: 'inline-block', background: '#F5F0E8', borderRadius: 12, padding: '12px 32px',
                  marginBottom: 28,
                }}>
                  <span style={{ color: '#4CAF50', fontSize: 28, fontWeight: 900, letterSpacing: 3, direction: 'ltr' }}>{orderCode}</span>
                </div>

                <div style={{
                  background: '#FAFAF7', borderRadius: 16, padding: 24,
                  border: '1px solid #E8E4DC', textAlign: 'right', marginBottom: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '16px 0' }}>
                    {statusFlow.map((s, i) => (
                      <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: i === 0 ? (statusColors[s] || '#4CAF50') : '#E8E4DC',
                          border: `2px solid ${i === 0 ? (statusColors[s] || '#4CAF50') : '#D4D0C8'}`,
                          fontSize: 18, fontWeight: 700, color: i === 0 ? '#FFF' : '#999',
                          boxShadow: i === 0 ? `0 0 20px ${(statusColors[s] || '#4CAF50')}44` : 'none',
                        }}>
                          {['📋', '⚙️', '🚚', '✅'][i]}
                        </div>
                        <span style={{ fontSize: 10, color: i === 0 ? '#4CAF50' : '#999', textAlign: 'center', whiteSpace: 'nowrap' }}>{statusLabels[s]}</span>
                      </div>
                    ))}
                    <div style={{ position: 'absolute', top: 39, left: '5%', right: '5%', height: 2, background: '#E8E4DC', zIndex: 0 }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #4CAF50, #4CAF50)', width: '16%' }} />
                    </div>
                  </div>
                  <p style={{ color: '#6B6B6B', fontSize: 13, textAlign: 'center', marginTop: 20, lineHeight: 1.8 }}>
                    سفارش شما در صف بررسی قرار گرفت. از طریق کد <strong style={{ color: '#4CAF50', direction: 'ltr', display: 'inline-block' }}>{orderCode}</strong> می‌توانید وضعیت آن را پیگیری کنید.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <Link to="/track" style={{
                    padding: '12px 32px', background: '#4CAF50', color: '#FFF',
                    borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  }}>پیگیری سفارش</Link>
                  <Link to="/products" style={{
                    padding: '12px 24px', background: '#E8E4DC', color: '#6B6B6B',
                    borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  }}>خرید مجدد</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#F5F0E8' }}>
      <section className="section-padding">
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title" style={{ fontSize: '2rem', color: '#2D2D2D' }}>سبد خرید</h1>
            <p className="section-subtitle" style={{ color: '#6B6B6B', marginBottom: 40 }}>
              {cart.length > 0 ? `${totalItems} عدد محصول در سبد خرید شما` : 'محصولات انتخاب شده خود را بررسی و سفارش دهید'}
            </p>
          </ScrollReveal>

          {cart.length === 0 ? (
            <div style={{
              background: '#FFFFFF', borderRadius: 20, padding: '80px 40px', textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E8E4DC',
            }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', background: '#F5F0E8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
                margin: '0 auto 24px',
              }}>🛒</div>
              <h3 style={{ color: '#2D2D2D', fontSize: 20, marginBottom: 8 }}>سبد خرید شما خالی است</h3>
              <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 28, lineHeight: 1.8 }}>
                به فروشگاه ده نشین خوش آمدید!<br />
                محصولات ارگانیک و تازه ما را در بخش محصولات مشاهده کنید.
              </p>
              <Link to="/products" style={{
                display: 'inline-block', padding: '14px 40px', background: '#4CAF50', color: '#FFF',
                borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15,
              }}>مشاهده محصولات</Link>
            </div>
          ) : (
            <>
              {/* Trust Badges */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap',
                  background: '#FFFFFF', borderRadius: 14, padding: '16px 24px',
                  border: '1px solid #E8E4DC', justifyContent: 'center',
                }}>
                {trustBadges.map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                    <span style={{ fontSize: 24 }}>{badge.icon}</span>
                    <div>
                      <div style={{ color: '#2D2D2D', fontSize: 12, fontWeight: 600 }}>{badge.title}</div>
                      <div style={{ color: '#999', fontSize: 10 }}>{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
                {/* Left Column */}
                <div>
                  {/* Cart Items */}
                  <div style={{
                    background: '#FFFFFF', borderRadius: 16, padding: 24,
                    border: '1px solid #E8E4DC', marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ color: '#6B6B6B', fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: '#2D2D2D' }}>{totalItems}</span> عدد محصول
                      </span>
                      <button onClick={() => { saveCart([]); window.dispatchEvent(new Event('cart-update')) }}
                        style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                        🗑 حذف همه
                      </button>
                    </div>
                    <AnimatePresence>
                      {cart.map((item, i) => {
                        const img = getCartImage(item)
                        const p = getCartProduct(item)
                        const hasSale = !!(item.originalPrice) || (parsePrice(p?.salePrice) > 0)
                        return (
                        <motion.div key={item.cartKey || item.productId} layout
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                          style={{
                            display: 'flex', gap: 16, padding: '16px 0',
                            borderBottom: i < cart.length - 1 ? '1px solid #F0ECE4' : 'none',
                            alignItems: 'center',
                          }}>
                          {img ? (
                            <img src={img} alt="" onError={e => { e.target.style.display = 'none' }}
                              style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{
                              width: 90, height: 90, borderRadius: 12,
                              background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0,
                            }}>🥬</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={`/product/${item.productId}`} style={{
                              color: '#2D2D2D', fontSize: 14, fontWeight: 600, display: 'block',
                              marginBottom: 4, textDecoration: 'none', lineHeight: 1.3,
                            }}>{item.name}</Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ color: hasSale ? '#EF5350' : '#4CAF50', fontSize: 14, fontWeight: 700, direction: 'ltr' }}>
                                {(getItemPrice(item)).toLocaleString()} <span style={{ fontWeight: 400, fontSize: 11, color: '#999' }}>تومان</span>
                              </span>
                              {hasSale && (() => {
                                const orig = getItemOrigPrice(item)
                                const sale = getItemPrice(item)
                                const pct = orig > 0 ? Math.round((1 - sale / orig) * 100) : 0
                                return (
                                  <span style={{ background: '#E53935', color: '#fff', padding: '1px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                                    ٪{pct}
                                  </span>
                                )
                              })()}
                            </div>
                            {hasSale && (
                              <div style={{ color: '#999', fontSize: 12, textDecoration: 'line-through', direction: 'ltr' }}>
                                {(getItemOrigPrice(item)).toLocaleString()} تومان
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#F5F0E8', borderRadius: 8, padding: '2px',
                            }}>
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                                style={{
                                  width: 32, height: 32, borderRadius: 6, border: 'none',
                                  background: '#FFFFFF', color: '#2D2D2D', cursor: 'pointer', fontSize: 16, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>−</button>
                              <span style={{
                                color: '#2D2D2D', fontSize: 14, fontWeight: 700, minWidth: 28, textAlign: 'center',
                              }}>{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                                style={{
                                  width: 32, height: 32, borderRadius: 6, border: 'none',
                                  background: '#4CAF50', color: '#FFF', cursor: 'pointer', fontSize: 16, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>+</button>
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.productId)}
                            style={{
                              width: 32, height: 32, borderRadius: 6, border: '1px solid #E8E4DC',
                              background: '#FFF', color: '#CCC', cursor: 'pointer', fontSize: 14,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>
                        </motion.div>
                      )})}
                    </AnimatePresence>
                  </div>

                  {/* Customer Info Form */}
                  <div style={{
                    background: '#FFFFFF', borderRadius: 16, padding: 24,
                    border: '1px solid #E8E4DC', marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <span style={{ fontSize: 20 }}>📋</span>
                      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: 0, fontWeight: 700 }}>اطلاعات دریافت‌کننده</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={inputWrap()}>
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1, opacity: 0.5 }}>👤</span>
                        <input value={form.name} onChange={e => hc('name', e.target.value)} placeholder="نام و نام خانوادگی *" style={inputStyle()} />
                      </div>
                      <div style={inputWrap()}>
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1, opacity: 0.5 }}>📱</span>
                        <input value={form.phone} onChange={e => hc('phone', e.target.value)} placeholder="موبایل *" style={{ ...inputStyle(), direction: 'ltr' }} />
                      </div>
                      <div style={inputWrap()}>
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, zIndex: 1, opacity: 0.5 }}>✉</span>
                        <input value={form.email} onChange={e => hc('email', e.target.value)} placeholder="ایمیل" style={{ ...inputStyle(), direction: 'ltr' }} />
                      </div>
                      <div style={inputWrap()}>
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, zIndex: 1, opacity: 0.5 }}>✈</span>
                        <input value={form.telegram} onChange={e => hc('telegram', e.target.value)} placeholder="آیدی تلگرام (برای اطلاع‌رسانی)" style={{ ...inputStyle(), direction: 'ltr' }} />
                      </div>
                    </div>
                    <div style={inputWrap({ marginTop: 12 })}>
                      <span style={{ position: 'absolute', right: 12, top: 16, fontSize: 16, zIndex: 1, opacity: 0.5 }}>📍</span>
                      <input value={form.address} onChange={e => hc('address', e.target.value)} placeholder="آدرس پستی" style={{ ...inputStyle(), paddingRight: 36 }} />
                    </div>
                    <div style={inputWrap({ marginTop: 12 })}>
                      <span style={{ position: 'absolute', right: 12, top: 16, fontSize: 14, zIndex: 1, opacity: 0.5 }}>✏</span>
                      <textarea value={form.notes} onChange={e => hc('notes', e.target.value)} placeholder="توضیحات سفارش (اختیاری)" rows={2}
                        style={{ ...inputStyle(), paddingRight: 36, resize: 'vertical' }} />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div style={{
                    background: '#FFFFFF', borderRadius: 16, padding: 24,
                    border: '1px solid #E8E4DC', marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <span style={{ fontSize: 20 }}>🚚</span>
                      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: 0, fontWeight: 700 }}>روش ارسال</h3>
                    </div>
                    <p style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                      برای سفارش‌های بالای {freeShippingThreshold.toLocaleString()} تومان، ارسال رایگان می‌باشد.
                      {freeShippingEligible && <strong style={{ color: '#4CAF50', display: 'block', marginTop: 4 }}>🎉 سفارش شما مشمول ارسال رایگان شد!</strong>}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {shippingMethods.map(method => {
                        const isFree = freeShippingEligible
                        const displayCost = isFree ? 0 : method.cost
                        return (
                          <label key={method.id} onClick={() => setShipping(method.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                              borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                              background: shipping === method.id ? '#E8F5E9' : '#F5F0E8',
                              border: shipping === method.id ? '2px solid #4CAF50' : '2px solid transparent',
                            }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', border: `2px solid ${shipping === method.id ? '#4CAF50' : '#D4D0C8'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                            }}>
                              {shipping === method.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50' }} />}
                            </div>
                            <span style={{ fontSize: 24, flexShrink: 0 }}>{method.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 600 }}>{method.label}</div>
                              <div style={{ color: '#999', fontSize: 11 }}>{method.desc}</div>
                              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                <span style={{ color: '#4CAF50', fontSize: 11, fontWeight: 600 }}>⏱ {method.time}</span>
                                <span style={{ color: shipping === method.id ? '#4CAF50' : '#999', fontSize: 11, fontWeight: 600 }}>
                                  💰 {displayCost === 0 ? 'رایگان' : `${displayCost.toLocaleString()} تومان`}
                                </span>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Suggested Products */}
                  {suggestedProducts.length > 0 && (
                    <div style={{
                      background: '#FFFFFF', borderRadius: 16, padding: 24,
                      border: '1px solid #E8E4DC',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 20 }}>🔥</span>
                        <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: 0, fontWeight: 700 }}>محصولات پیشنهادی</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {suggestedProducts.map((p) => {
                          const saleP = parsePrice(p?.salePrice)
                          const origP = parsePrice(p?.price)
                          const hasSale = saleP > 0
                          let imgs = p.images
                          if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
                          const img = Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
                          return (
                            <div key={p.id} style={{
                              background: '#FAFAF7', borderRadius: 12, padding: 12,
                              border: '1px solid #F0ECE4', textAlign: 'center',
                            }}>
                              {img ? (
                                <img src={img} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                              ) : (
                                <div style={{ height: 80, borderRadius: 8, background: '#E8F5E9', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🥬</div>
                              )}
                              <Link to={`/product/${p.id}`} style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</Link>
                              <div style={{ color: hasSale ? '#EF5350' : '#4CAF50', fontSize: 11, fontWeight: 700, direction: 'ltr', marginBottom: 6 }}>
                                {hasSale ? saleP.toLocaleString() : origP.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 10, color: '#999' }}>تومان</span>
                              </div>
                              <button onClick={() => addToCart(p)}
                                style={{
                                  padding: '6px 16px', background: '#4CAF50', color: '#FFF',
                                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                  width: '100%',
                                }}>+ افزودن به سبد</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Order Summary */}
                <div style={{ position: 'sticky', top: 100 }}>
                  <div style={{
                    background: '#FFFFFF', borderRadius: 16, padding: 24,
                    border: '1px solid #E8E4DC', marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <span style={{ fontSize: 20 }}>🧾</span>
                      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: 0, fontWeight: 700 }}>خلاصه سفارش</h3>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#6B6B6B', fontSize: 14 }}>تعداد محصولات</span>
                        <span style={{ color: '#2D2D2D', fontSize: 14, fontWeight: 600 }}>{totalItems}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#6B6B6B', fontSize: 14 }}>مبلغ کل</span>
                        <span style={{ color: '#2D2D2D', fontSize: 14, direction: 'ltr' }}>{totalOrig.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 11, color: '#999' }}>تومان</span></span>
                      </div>
                      {discountAmt > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ color: '#4CAF50', fontSize: 14 }}>تخفیف محصولات</span>
                          <span style={{ color: '#4CAF50', fontSize: 14, direction: 'ltr' }}>-{discountAmt.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 11 }}>تومان</span></span>
                        </div>
                      )}
                      {promoDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ color: '#4CAF50', fontSize: 14 }}>کد تخفیف</span>
                          <span style={{ color: '#4CAF50', fontSize: 14, direction: 'ltr' }}>-{promoDiscount.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 11 }}>تومان</span></span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#6B6B6B', fontSize: 14 }}>هزینه ارسال</span>
                        <span style={{ color: finalShipping === 0 ? '#4CAF50' : '#2D2D2D', fontSize: 14, fontWeight: 600, direction: 'ltr' }}>
                          {finalShipping === 0 ? 'رایگان 🎉' : `${finalShipping.toLocaleString()} تومان`}
                        </span>
                      </div>
                      <div style={{ paddingTop: 16, borderTop: '2px solid #F0ECE4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#2D2D2D', fontSize: 18, fontWeight: 700 }}>قابل پرداخت</span>
                          <span style={{ color: '#4CAF50', fontSize: 22, fontWeight: 900, direction: 'ltr' }}>{total.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 12, color: '#999' }}>تومان</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                          placeholder="کد تخفیف" onKeyDown={e => e.key === 'Enter' && applyPromo()}
                          style={{
                            flex: 1, padding: '10px 12px', background: '#F5F0E8', border: '1px solid #D4D0C8',
                            borderRadius: 8, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
                          }} />
                        <button onClick={applyPromo}
                          style={{
                            padding: '10px 20px', background: promoCode ? '#4CAF50' : '#D4D0C8', color: '#FFF',
                            border: 'none', borderRadius: 8, cursor: promoCode ? 'pointer' : 'default', fontSize: 13, fontWeight: 600,
                          }}>اعمال</button>
                      </div>
                      {promoError && <p style={{ color: '#EF5350', fontSize: 11, marginTop: 6 }}>{promoError}</p>}
                      {promoDiscount > 0 && <p style={{ color: '#4CAF50', fontSize: 11, marginTop: 6 }}>✅ کد تخفیف با موفقیت اعمال شد</p>}
                    </div>

                    {/* Delivery Estimate */}
                    {shippingMethod && (
                      <div style={{
                        background: '#FAFAF7', borderRadius: 10, padding: 14, marginBottom: 20,
                        border: '1px solid #F0ECE4',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>📅</span>
                          <span style={{ color: '#2D2D2D', fontSize: 12, fontWeight: 600 }}>زمان تحویل تخمینی</span>
                        </div>
                        <p style={{ color: '#6B6B6B', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                          با انتخاب <strong style={{ color: '#4CAF50' }}>{shippingMethod.label}</strong>، سفارش شما در بازه <strong style={{ color: '#2D2D2D' }}>{shippingMethod.time}</strong> به دستتان می‌رسد.
                        </p>
                      </div>
                    )}

                    <motion.button onClick={submitOrder} disabled={submitting}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                        background: submitting ? '#CCC' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
                        color: submitting ? '#999' : '#FFF', fontWeight: 700, fontSize: 16,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: submitting ? 'none' : '0 4px 15px rgba(76,175,80,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}>
                      {submitting ? (
                        <>⏳ در حال ثبت سفارش...</>
                      ) : (
                        <>✅ ثبت سفارش</>
                      )}
                    </motion.button>

                    <p style={{ color: '#999', fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                      پس از ثبت سفارش، کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div style={{
                    background: '#FFFFFF', borderRadius: 16, padding: 20,
                    border: '1px solid #E8E4DC',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>💳</span>
                      <span style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 600 }}>روش‌های پرداخت</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { icon: '💵', label: 'پرداخت در محل' },
                        { icon: '🏦', label: 'کارت به کارت' },
                        { icon: '🌐', label: 'پرداخت آنلاین' },
                      ].map((pm, i) => (
                        <div key={i} style={{
                          flex: 1, textAlign: 'center', padding: '10px 6px',
                          background: '#FAFAF7', borderRadius: 8, border: '1px solid #F0ECE4',
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{pm.icon}</div>
                          <div style={{ color: '#999', fontSize: 9 }}>{pm.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
