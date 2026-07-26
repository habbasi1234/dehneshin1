import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import HeroSection from '../components/HeroSection'
import Testimonials from '../components/Testimonials'
import ContactSection from '../components/ContactSection'
import EcoMapSection from '../components/EcoMapSection'
import useSEO from '../hooks/useSEO'
import { useLanguage } from '../context/LanguageContext'
import { parsePrice } from '../utils/price'

const categories = [
  { slug: 'fruits', icon: '🍎', name: 'میوه‌های ارگانیک', color: '#E53935', count: 14 },
  { slug: 'vegetables', icon: '🥬', name: 'سبزیجات ارگانیک', color: '#43A047', count: 11 },
  { slug: 'dairy', icon: '🥛', name: 'لبنیات سنتی', color: '#F9A825', count: 6 },
  { slug: 'grains', icon: '🌾', name: 'غلات و حبوبات', color: '#FF8F00', count: 7 },
  { slug: 'nuts', icon: '🥜', name: 'خشکبار و آجیل', color: '#8D6E63', count: 9 },
  { slug: 'honey', icon: '🍯', name: 'عسل طبیعی', color: '#FF6F00', count: 5 },
  { slug: 'beverages', icon: '🧃', name: 'نوشیدنی‌های سالم', color: '#00ACC1', count: 8 },
  { slug: 'spices', icon: '🧂', name: 'ادویه جات طبیعی', color: '#FF7043', count: 11 },
  { slug: 'pickles', icon: '🫙', name: 'ترشی، شور و مربا', color: '#EC407A', count: 8 },
  { slug: 'cosmetics', icon: '🧴', name: 'بهداشتی و آرایشی', color: '#AB47BC', count: 5 },
]

const emojis = ['🍎', '🍊', '🍋', '🥬', '🥕', '🥛', '🌾', '🥜', '🍯', '🧃', '🧂', '🫙', '🧴', '🍇']
const catLabels = {
  fruits: 'میوه', vegetables: 'سبزیجات', dairy: 'لبنیات', grains: 'غلات',
  nuts: 'خشکبار', honey: 'عسل', beverages: 'نوشیدنی', spices: 'ادویه',
  pickles: 'ترشی', cosmetics: 'بهداشتی',
}

const containerStyle = { maxWidth: 1400, margin: '0 auto', padding: '0 40px' }

function SectionHeader({ title, subtitle, link, linkText, icon, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ color: color || '#2D2D2D', fontSize: 21, fontWeight: 800, margin: 0 }}>
          {icon && <span style={{ marginLeft: 8 }}>{icon}</span>}{title}
        </h2>
        {subtitle && <p style={{ color: '#6B6B6B', fontSize: 12, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} style={{
          padding: '7px 18px', borderRadius: 8, background: '#4CAF50', color: '#fff',
          fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: '0.2s',
          whiteSpace: 'nowrap',
        }}>{linkText || 'مشاهده همه'} ←</Link>
      )}
    </motion.div>
  )
}

function ProductCard({ p, i, sale }) {
  const { getText } = useLanguage()
  let imgs = p.images
  if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
  const img = Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
  const saleP = parsePrice(p?.salePrice)
  const origP = parsePrice(p?.price)
  const hasSale = saleP > 0 && sale !== false

  const addToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(c => c.productId === (p.id || p._id))
    const finalPrice = hasSale ? p.salePrice : (p.price || '')
    if (existing) existing.quantity = (existing.quantity || 1) + 1
    else cart.push({ productId: p.id || p._id, name: p.name, price: finalPrice, quantity: 1, image: img, originalPrice: hasSale ? p.price : '' })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-update'))
    alert('به سبد خرید اضافه شد ✓')
  }

  return (
    <Link key={p._id || i} to={`/product/${p.id || p._id}`} style={{ textDecoration: 'none' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: (i || 0) * 0.04 }}
        whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
        style={{
          background: '#fff', borderRadius: 16, border: '1px solid #F0ECE4', overflow: 'hidden',
          transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
        <div style={{
          height: 175, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #F5F0E8, #E8E0D8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {img ? (
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s' }} />
          ) : (
            <span style={{ fontSize: 56 }}>{emojis[(i || 0) % emojis.length]}</span>
          )}
          {hasSale && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'linear-gradient(135deg, #E53935, #C62828)', color: '#fff',
              padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
            }}>
              {origP > 0 ? `٪${Math.round((1 - saleP / origP) * 100)}` : 'تخفیف ویژه'}
            </span>
          )}
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ color: '#6B6B6B', fontSize: 10, marginBottom: 4 }}>{catLabels[p.category] || p.category || ''}</div>
          <div style={{
            color: '#2D2D2D', fontSize: 13, fontWeight: 600, marginBottom: 8,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{p.name || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ color: hasSale ? '#E53935' : '#4CAF50', fontSize: 14, fontWeight: 700 }}>
              {(hasSale ? saleP : origP || 0).toLocaleString()} <span style={{ fontWeight: 400, fontSize: 10, color: '#999' }}>تومان</span>
            </span>
            {hasSale && origP > 0 && (
              <span style={{ color: '#999', fontSize: 11, textDecoration: 'line-through' }}>{origP.toLocaleString()}</span>
            )}
          </div>
          <button onClick={addToCart}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff',
              fontWeight: 600, fontSize: 11, cursor: 'pointer', transition: '0.2s',
            }}>
            افزودن به سبد خرید
          </button>
        </div>
      </motion.div>
    </Link>
  )
}

function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 })
  useEffect(() => {
    if (!targetDate) return
    const tick = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return setTime({ h: 0, m: 0, s: 0 })
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  if (!targetDate) return null
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', direction: 'ltr' }}>
      {[{ v: time.h, l: 'ساعت' }, { v: time.m, l: 'دقیقه' }, { v: time.s, l: 'ثانیه' }].map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ background: '#2D2D2D', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'center' }}>{String(t.v).padStart(2, '0')}</span>
          <span style={{ color: '#6B6B6B', fontSize: 10 }}>{t.l}</span>
          {i < 2 && <span style={{ color: '#999', margin: '0 2px' }}>:</span>}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  useSEO({ title: 'ده نشین | محصولات ارگانیک و طبیعی', description: 'فروشگاه آنلاین محصولات ارگانیک و طبیعی ده نشین. تازه‌ترین میوه‌ها، سبزیجات، لبنیات، غلات و محصولات سالم از مزرعه تا سفره.' })
  const [products, setProducts] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [settings, setSettings] = useState(null)
  const scrollRef = useRef(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
    axios.get('/api/products', { params: { limit: 20 } }).then(({ data }) => {
      const items = data.items || data || []
      setProducts(items)
      setDiscounts(items.filter(p => {
        const saleP = parsePrice(p?.salePrice)
        return saleP > 0 || p.discountPercent
      }))
    }).catch(() => {})
  }, [])

  const featured = products.slice(0, 12)
  const sampleProducts = [
    { name: 'سیب قرمز ارگانیک', price: '85,000', category: 'fruits', salePrice: '68,000' },
    { name: 'پرتقال تازه شمال', price: '65,000', category: 'fruits', salePrice: '' },
    { name: 'گوجه فرنگی گلخانه‌ای', price: '45,000', category: 'vegetables', salePrice: '' },
    { name: 'خیار سبز ارگانیک', price: '35,000', category: 'vegetables', salePrice: '28,000' },
    { name: 'شیر محلی تازه', price: '55,000', category: 'dairy', salePrice: '' },
    { name: 'برنج طارم اعلا', price: '180,000', category: 'grains', salePrice: '' },
    { name: 'پسته اکبری رفسنجان', price: '580,000', category: 'nuts', salePrice: '490,000' },
    { name: 'عسل طبیعی کوهستان', price: '450,000', category: 'honey', salePrice: '' },
  ]
  const displayProducts = featured.length ? featured : sampleProducts

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  const promoEnd = new Date(Date.now() + 3 * 86400000).toISOString()
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  return (
    <div>
      <HeroSection />

      {/* Trust Badges Bar */}
      <section style={{ background: '#fff', borderBottom: '1px solid #F0ECE4', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ ...containerStyle, padding: '10px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { icon: '🚚', text: 'ارسال سریع', sub: '۲۴ تا ۴۸ ساعته' },
              { icon: '✅', text: 'ضمانت کیفیت', sub: '۷ روز بازگشت کالا' },
              { icon: '🌱', text: '۱۰۰٪ ارگانیک', sub: 'بدون سم و کود' },
              { icon: '💳', text: 'پرداخت امن', sub: 'در محل یا آنلاین' },
              { icon: '📞', text: 'پشتیبانی', sub: '۷ روز هفته' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(76,175,80,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{item.icon}</div>
                <div>
                  <div style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 700 }}>{item.text}</div>
                  <div style={{ color: '#6B6B6B', fontSize: 9 }}>{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid - Digikala style */}
      <section className="section-padding" style={{ background: '#F5F0E8', paddingTop: 28, paddingBottom: 16 }}>
        <div style={containerStyle}>
          <SectionHeader title="دسته‌بندی محصولات" subtitle="از مزرعه تا سفره، تازه و سالم" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {categories.map((cat, i) => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }} whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  style={{
                    background: '#fff', borderRadius: 14, padding: '16px 10px', textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, margin: '0 auto 8px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    background: `${cat.color}12`,
                  }}>{cat.icon}</div>
                  <div style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{cat.name}</div>
                  <div style={{ color: '#999', fontSize: 9 }}>{cat.count} محصول</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Amazing Offers Section - Digikala style */}
      {discounts.length > 0 && (
        <section className="section-padding" style={{ background: '#fff', paddingTop: 28, paddingBottom: 28 }}>
          <div style={containerStyle}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
              background: 'linear-gradient(135deg, #E53935, #C62828)', padding: '14px 20px', borderRadius: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🔥</span>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>شگفت‌انگیزها</h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: '2px 0 0' }}>تخفیف‌های ویژه امروز</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <CountdownTimer targetDate={todayEnd} />
                <Link to="/products?discount=true" style={{
                  color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px', borderRadius: 8,
                }}>مشاهده همه</Link>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => scroll(-1)}
                style={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 36, height: 36, borderRadius: '50%', border: '1px solid #E0DCD4', background: '#fff', color: '#333', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: discounts.length > 4 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={() => scroll(1)}
                style={{ position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 36, height: 36, borderRadius: '50%', border: '1px solid #E0DCD4', background: '#fff', color: '#333', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: discounts.length > 4 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>›</button>
              <div ref={scrollRef} style={{
                display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory',
                padding: '4px 0', scrollBehavior: 'smooth',
              }}>
                {discounts.slice(0, 10).map((p, i) => {
                  const saleP = parsePrice(p?.salePrice)
                  const origP = parsePrice(p?.price)
                  let imgs = p.images
                  if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
                  const img = Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
                  const pct = origP > 0 ? Math.round((1 - saleP / origP) * 100) : 0
                  return (
                    <Link key={p._id || i} to={`/product/${p.id || p._id}`} style={{ textDecoration: 'none', scrollSnapAlign: 'start', flexShrink: 0, width: 185 }}>
                      <motion.div whileHover={{ y: -4 }}
                        style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0ECE4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ height: 150, position: 'relative', background: 'linear-gradient(135deg, #FFF5F5, #FFE8E8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 48 }}>{emojis[i % emojis.length]}</span>}
                          <span style={{ position: 'absolute', top: 8, right: 8, background: '#E53935', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800 }}>٪{pct}-</span>
                        </div>
                        <div style={{ padding: 10 }}>
                          <div style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || ''}</div>
                          <div style={{ color: '#E53935', fontSize: 13, fontWeight: 700 }}>{saleP.toLocaleString()} <span style={{ fontWeight: 400, fontSize: 9, color: '#999' }}>تومان</span></div>
                          <div style={{ color: '#999', fontSize: 10, textDecoration: 'line-through', marginTop: 2 }}>{origP.toLocaleString()} تومان</div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section-padding" style={{ background: '#F5F0E8', paddingTop: 28, paddingBottom: 32 }}>
        <div style={containerStyle}>
          <SectionHeader title="🏷️ جدیدترین محصولات" subtitle="تازه‌ترین محصولات ارگانیک از مزارع معتبر" link="/products" linkText="مشاهده همه" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 }}>
            {displayProducts.slice(0, 8).map((p, i) => (
              <ProductCard key={p._id || i} p={p} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner Between Sections */}
      <section style={{ background: '#fff', padding: '16px 0' }}>
        <div style={containerStyle}>
          <Link to="/products?category=fruits">
            <motion.div whileHover={{ scale: 1.01 }}
              style={{
                background: 'linear-gradient(135deg, #2E7D32, #1B5E20, #0D3B0D)',
                borderRadius: 18, padding: '36px 48px', position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
              }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 4 }}>پیشنهاد ویژه</div>
                <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>🍏 محصولات تازه بهاره</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>تا ۲۰٪ تخفیف ویژه بر روی میوه‌ها و سبزیجات تازه</p>
              </div>
              <span style={{
                position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                color: '#fff', padding: '10px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.2)',
              }}>خرید کنید ←</span>
              <div style={{ position: 'absolute', right: -40, top: -40, fontSize: 160, opacity: 0.06, userSelect: 'none' }}>🍃</div>
              <div style={{ position: 'absolute', left: -30, bottom: -30, fontSize: 120, opacity: 0.06, userSelect: 'none' }}>🌾</div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="section-padding" style={{ background: '#fff', paddingTop: 28, paddingBottom: 32 }}>
        <div style={containerStyle}>
          <SectionHeader title="⭐ پرفروش‌ترین محصولات" subtitle="محصولات محبوب مشتریان ده نشین" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 }}>
            {displayProducts.slice(4, 12).map((p, i) => (
              <ProductCard key={p._id || i} p={p} i={i + 4} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Deh Neshin */}
      <section className="section-padding" style={{ background: '#F5F0E8', paddingTop: 36, paddingBottom: 36 }}>
        <div style={containerStyle}>
          <SectionHeader title="🌿 چرا ده نشین؟" subtitle="چهار دلیل برای انتخاب ما" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: '🌱', title: 'محصولات کاملاً ارگانیک', desc: 'بدون هرگونه سم، کود شیمیایی و مواد افزودنی. تمام محصولات ما دارای گواهی ارگانیک هستند.', color: '#4CAF50' },
              { icon: '🚜', title: 'مستقیم از مزرعه', desc: 'بدون واسطه، تازه و سالم از کشاورز به مصرف‌کننده. با بیش از ۱۵۰ کشاورز معتمد همکاری می‌کنیم.', color: '#66BB6A' },
              { icon: '📦', title: 'ارسال سریع و مطمئن', desc: 'تحویل در سریع‌ترین زمان با بسته‌بندی بهداشتی و زنجیره سرد.', color: '#43A047' },
              { icon: '✅', title: 'ضمانت بازگشت کالا', desc: 'در صورت عدم رضایت، تا ۴۸ ساعت امکان بازگشت وجه وجود دارد.', color: '#388E3C' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid #F0ECE4', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14,
                }}>{item.icon}</div>
                <h4 style={{ color: '#2D2D2D', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{item.title}</h4>
                <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications / Trust */}
      <section style={{ background: '#fff', padding: '24px 0', borderTop: '1px solid #F0ECE4', borderBottom: '1px solid #F0ECE4' }}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap', opacity: 0.5 }}>
            {['گواهی ارگانیک', 'استاندارد ملی', 'پروانه بهداشت', 'نماد اعتماد', 'کشاورزی پایدار', 'تجارت منصفانه'].map((cert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <span style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 600 }}>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20, #0D3B0D)', padding: '48px 0' }}>
        <div style={containerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
            {[
              { icon: '👨‍🌾', value: '۱۵۰+', label: 'کشاورز ارگانیک' },
              { icon: '🌿', value: '۱۰۰۰+', label: 'محصول طبیعی' },
              { icon: '🏠', value: '۵۰۰۰+', label: 'خانواده راضی' },
              { icon: '🏆', value: '۸', label: 'سال تجربه' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding" style={{ background: '#F5F0E8', paddingTop: 32, paddingBottom: 32 }}>
        <div style={containerStyle}>
          <SectionHeader title="از مزرعه تا سفره" subtitle="مسیر تازه‌ترین محصولات از دل طبیعت تا منزل شما" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
            {[
              { icon: '🌱', title: 'کشت طبیعی', desc: 'بدون سم و کود شیمیایی در مزارع ارگانیک', color: '#4CAF50' },
              { icon: '🌾', title: 'برداشت تازه', desc: 'در زمان رسیدن کامل برای حداکثر کیفیت و طعم', color: '#66BB6A' },
              { icon: '📦', title: 'بسته‌بندی بهداشتی', desc: 'استاندارد با حفظ تازگی و ارزش غذایی', color: '#43A047' },
              { icon: '🚚', title: 'ارسال سریع', desc: 'زنجیره سرد از مزرعه تا درب منزل شما', color: '#388E3C' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ textAlign: 'center', padding: '24px 16px', background: '#fff', borderRadius: 16, border: '1px solid #F0ECE4', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: `${step.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  margin: '0 auto 14px',
                }}>{step.icon}</div>
                <h4 style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>{step.title}</h4>
                <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: '#fff', padding: '48px 0', borderTop: '1px solid #F0ECE4' }}>
        <div style={{ ...containerStyle, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            style={{ maxWidth: 500, margin: '0 auto' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📬</span>
            <h2 style={{ color: '#2D2D2D', fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>عضویت در خبرنامه</h2>
            <p style={{ color: '#6B6B6B', fontSize: 12, margin: '0 0 20px' }}>اولین نفری باشید که از تخفیف‌ها و محصولات جدید باخبر می‌شوید + ۱۰٪ تخفیف ویژه!</p>
            <form onSubmit={e => { e.preventDefault(); alert('عضویت شما با موفقیت ثبت شد. کد تخفیف: DEHNESHIN10') }}
              style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
              <input type="email" placeholder="ایمیل خود را وارد کنید" required
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #E0DCD4',
                  fontSize: 13, background: '#FAFAF7', outline: 'none',
                }} />
              <button type="submit"
                style={{
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>عضویت</button>
            </form>
          </motion.div>
        </div>
      </section>

      <Testimonials />
      <EcoMapSection />
      <ContactSection />

      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #F5F0E8; }
        ::-webkit-scrollbar-thumb { background: #CCC; border-radius: 4px; }
        @keyframes goldShine { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>
    </div>
  )
}
