import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import axios from 'axios'
import useSEO from '../hooks/useSEO'

const statusFlow = ['pending', 'processing', 'design', 'production', 'delivery', 'completed']
const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusColors = {
  pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC',
  production: '#FF7043', delivery: '#26A69A',    completed: '#66BB6A', cancelled: '#EF5350',
}

export default function OrderTracking() {
  useSEO({ title: 'پیگیری سفارش | ده نشین', description: 'وضعیت سفارش خود را با کد پیگیری مشاهده کنید - ده نشین' })
  const [code, setCode] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get('/api/products').then(({ data }) => setProducts(data)).catch(() => {})
  }, [])

  const trackOrder = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const { data: orders } = await axios.get('/api/orders', { params: { search: code.trim() } })
      const found = orders.find(o => o.code?.toLowerCase() === code.trim().toLowerCase())
      if (found) setOrder(found)
      else setError('سفارشی با این کد یافت نشد')
    } catch {
      setError('خطا در ارتباط با سرور')
    }
    setLoading(false)
  }

  const currentStatusIdx = order ? statusFlow.indexOf(order.status) : -1
  const isCancelled = order?.status === 'cancelled'

  const getProductImage = (productId) => {
    const p = products.find(p => p.id === parseInt(productId))
    if (!p) return ''
    let imgs = p.images
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    return Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
  }

  const calcStageDuration = (history, status) => {
    const idx = history.findIndex(h => h.status === status)
    const nextIdx = history.findIndex((h, i) => i > idx && ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled'].includes(h.status))
    if (idx === -1) return null
    const start = new Date(history[idx].date)
    const end = nextIdx !== -1 ? new Date(history[nextIdx].date) : new Date()
    return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
  }

  const totalDays = order?.createdAt
    ? Math.max(0, Math.floor((new Date(order.updatedAt || Date.now()) - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="page-bg" style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--theme-bg, #111)' }}>
      <section className="section-padding">
        <div className="container" style={{ maxWidth: 700 }}>
          <ScrollReveal>
            <h1 className="section-title">پیگیری سفارش</h1>
            <p className="section-subtitle">وضعیت سفارش خود را با کد پیگیری مشاهده کنید</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
              <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && trackOrder()}
                placeholder="کد سفارش را وارد کنید (مثال: AZ-250605-001)"
                style={{
                  flex: 1, padding: '14px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(212,175,55,0.2)', color: '#F5E6C8', fontSize: 15, outline: 'none', direction: 'ltr',
                }} />
              <motion.button onClick={trackOrder} disabled={loading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 28px', borderRadius: 10, border: 'none',
                  background: loading ? '#555' : 'linear-gradient(135deg, #D4AF37, #A0872B)',
                  color: loading ? '#aaa' : '#0A0A0F', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                {loading ? '...' : 'پیگیری'}
              </motion.button>
            </div>
          </ScrollReveal>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: 20, color: '#EF5350', background: 'rgba(239,83,80,0.1)', borderRadius: 10, marginBottom: 24 }}>
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {order && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 32,
                  border: '1px solid rgba(212,175,55,0.1)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ color: '#D4AF37', margin: 0, fontSize: 20 }}>سفارش {order.code}</h2>
                      <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>تاریخ ثبت: {new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
                      <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>مدت زمان: {totalDays} روز</p>
                      {order.estimatedDelivery && (
                        <p style={{ color: '#66BB6A', fontSize: 12, margin: '4px 0 0' }}>
                          پیش‌بینی تحویل: {new Date(order.estimatedDelivery).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '8px 18px', borderRadius: 50, fontWeight: 700, fontSize: 14,
                      background: (statusColors[order.status] || '#aaa') + '22',
                      border: '1px solid ' + (statusColors[order.status] || '#aaa') + '44',
                      color: statusColors[order.status] || '#aaa',
                    }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  {!isCancelled && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, position: 'relative', padding: '8px 0' }}>
                      {statusFlow.map((s, i) => {
                        const isActive = i <= currentStatusIdx
                        const isCurrent = i === currentStatusIdx
                        return (
                          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flex: 1 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isActive ? (statusColors[s] || '#D4AF37') : 'rgba(255,255,255,0.05)',
                              border: `2px solid ${isActive ? (statusColors[s] || '#D4AF37') : 'rgba(255,255,255,0.1)'}`,
                              fontSize: 12, fontWeight: 700, color: isActive ? '#0A0A0F' : '#666',
                              boxShadow: isCurrent ? `0 0 20px ${(statusColors[s] || '#D4AF37')}44` : 'none',
                            }}>
                              {['🕐', '⚙️', '🎨', '🔨', '🚚', '✅'][i]}
                            </div>
                            <span style={{ fontSize: 9, color: isActive ? '#F5E6C8' : '#555', textAlign: 'center', whiteSpace: 'nowrap' }}>{statusLabels[s]}</span>
                          </div>
                        )
                      })}
                      <div style={{ position: 'absolute', top: 25, left: '5%', right: '5%', height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }}>
                        <div style={{
                          height: '100%', background: 'linear-gradient(90deg, #4CAF50, #C85A17)',
                          transition: 'width 0.6s ease',
                          width: currentStatusIdx >= 0 ? `${(currentStatusIdx / (statusFlow.length - 1)) * 100}%` : '0%',
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <h4 style={{ color: '#D4AF37', margin: '0 0 12px', fontSize: 14 }}>محصولات</h4>
                    {(order.items || []).map((item, i) => {
                      const img = getProductImage(item.productId)
                      return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        {img ? (
                          <img src={img} alt="" onError={e => { e.target.style.display = 'none' }}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        ) : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🛋</div>}
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#F5E6C8', fontSize: 13 }}>{item.name}</span>
                          {(item.selectedWoodColor || item.selectedFabric) && (
                            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                              {item.selectedWoodColor && <span>چوب: {item.selectedWoodColor} </span>}
                              {item.selectedFabric && <span>پارچه: {item.selectedFabric}</span>}
                            </div>
                          )}
                        </div>
                        <span style={{ color: '#D4AF37', fontSize: 13 }}>تعداد: {item.quantity}</span>
                      </div>
                    )})
                    }
                  </div>

                  {order.customerName && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                      <h4 style={{ color: '#D4AF37', margin: '0 0 8px', fontSize: 14 }}>اطلاعات مشتری</h4>
                      <p style={{ margin: '4px 0', fontSize: 13, color: '#A89880' }}>{order.customerName} | {order.customerPhone}</p>
                    </div>
                  )}

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
                      <h4 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: 14 }}>تاریخچه وضعیت</h4>
                      {order.statusHistory.map((h, i) => {
                        const duration = calcStageDuration(order.statusHistory, h.status)
                        return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < order.statusHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[h.status] || '#aaa', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: statusLabels[h.status] ? '#F5E6C8' : '#A89880', flex: 1 }}>{statusLabels[h.status] || h.status}</span>
                          <span style={{ fontSize: 11, color: '#666' }}>{new Date(h.date).toLocaleString('fa-IR')}</span>
                          {duration !== null && <span style={{ fontSize: 10, color: '#888' }}>({duration} روز)</span>}
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
