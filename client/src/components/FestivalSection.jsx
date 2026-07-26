import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'

export default function FestivalSection() {
  const [settings, setSettings] = useState(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      setSettings(data)
      const festivalProductIds = (data.festival?.productIds || []).map(Number)
      if (festivalProductIds.length > 0) {
        axios.get('/api/products').then(({ data }) => {
          setProducts((data.products || data || []).filter(p => festivalProductIds.includes(Number(p.id))).slice(0, 6))
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  if (!settings?.festival?.enabled) return null

  const f = settings.festival
  const discount = f.discountPercent || 0

  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #1a0500 70%, #0d0d0d 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-50%', left: '-10%', right: '-10%', height: '200%',
        background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(212,175,55,0.02) 40px, rgba(212,175,55,0.02) 80px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                display: 'inline-block', padding: '6px 24px',
                background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
                borderRadius: 50, color: '#000', fontWeight: 700, fontSize: 12,
                marginBottom: 12, letterSpacing: 2,
              }}
            >
              {f.badge || 'فروش ویژه'}
            </motion.span>
            <h2 className="section-title" style={{ color: '#D4AF37' }}>{f.title || 'جشنواره فروش'}</h2>
            <p className="section-subtitle">{f.subtitle || 'تخفیف‌های ویژه در محصولات منتخب'}</p>
            {discount > 0 && (
              <motion.div
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  display: 'inline-block', marginTop: 8,
                  padding: '8px 32px', border: '2px solid #D4AF37',
                  borderRadius: 8, fontSize: 28, fontWeight: 900, color: '#D4AF37',
                  letterSpacing: 3,
                }}
              >
                %{discount} تخفیف
              </motion.div>
            )}
          </div>
        </ScrollReveal>

        {products.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {products.map((product, i) => {
              const images = product.images ? product.images.split(',').filter(Boolean) : []
              const imgSrc = images[0] ? (images[0].startsWith('http') || images[0].startsWith('/') ? images[0] : `/uploads/${images[0]}`) : ''
              const origPrice = parseInt(product.price) || 0
              const salePrice = f.overridePrice?.[product.id] ? parseInt(f.overridePrice[product.id]) : Math.round(origPrice * (1 - discount / 100))

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(212,175,55,0.15)',
                  }}
                >
                  <div style={{
                    position: 'relative', aspectRatio: '1',
                    background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: 40, opacity: 0.2 }}>🪑</span>
                    )}
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: '#D4AF37', color: '#000', fontWeight: 700, fontSize: 11,
                      padding: '3px 10px', borderRadius: 50,
                    }}>
                      %{discount}
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ color: '#F5E6C8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{product.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: 14 }}>{salePrice.toLocaleString()} تومان</span>
                      {origPrice > salePrice && (
                        <span style={{ color: '#888', fontSize: 11, textDecoration: 'line-through' }}>{origPrice.toLocaleString()} تومان</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {f.buttonText && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <motion.a
              href={f.buttonLink || '/products'}
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'inline-block', padding: '14px 40px',
                background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
                color: '#000', fontWeight: 700, fontSize: 14,
                borderRadius: 8, textDecoration: 'none',
              }}
            >
              {f.buttonText}
            </motion.a>
          </div>
        )}
      </div>
    </section>
  )
}
