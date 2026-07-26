import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import useSEO from '../hooks/useSEO'
import { parsePrice } from '../utils/price'

const fallbackCategories = [
  { id: 0, name: 'همه', slug: 'all' },
  { id: 1, name: 'میوه', slug: 'fruits' },
  { id: 2, name: 'سبزیجات', slug: 'vegetables' },
  { id: 3, name: 'لبنیات', slug: 'dairy' },
  { id: 4, name: 'غلات و حبوبات', slug: 'grains' },
  { id: 5, name: 'خشکبار و آجیل', slug: 'nuts' },
  { id: 6, name: 'عسل و طبیعی', slug: 'honey' },
  { id: 7, name: 'نوشیدنی', slug: 'beverages' },
  { id: 8, name: 'ادویه جات', slug: 'spices' },
  { id: 9, name: 'ترشی و مربا', slug: 'pickles' },
  { id: 10, name: 'بهداشتی', slug: 'cosmetics' },
]

const fallbackProducts = [
  { id: 1, name: 'سیب قرمز ارگانیک', category: 'fruits', description: 'سیب قرمز درختی از باغ‌های دماوند، بدون سم و کود شیمیایی', price: '85,000', salePrice: '68,000', colors: ['#E53935', '#FDD835', '#C85A17'] },
  { id: 2, name: 'پرتقال ارگانیک', category: 'fruits', description: 'پرتقال تازه شمال، سرشار از ویتامین C', price: '65,000',  colors: ['#FF9800', '#FDD835', '#C85A17'] },
  { id: 3, name: 'گوجه فرنگی ارگانیک', category: 'vegetables', description: 'گوجه فرنگی گلخانه‌ای بدون سم، طعم واقعی', price: '45,000',  colors: ['#E53935', '#FDD835', '#C85A17'] },
  { id: 4, name: 'خیار ارگانیک', category: 'vegetables', description: 'خیار سبز ترد و خوش‌طعم از مزارع اصفهان', price: '35,000', salePrice: '28,000', colors: ['#C85A17', '#A0522D', '#FDD835'] },
  { id: 5, name: 'شیر محلی ارگانیک', category: 'dairy', description: 'شیر تازه گاو، بدون آنتی‌بیوتیک و هورمون', price: '55,000',  colors: ['#FFFDE7', '#F5F5F5', '#E0E0E0'] },
  { id: 6, name: 'ماست سنتی', category: 'dairy', description: 'ماست محلی از شیر تازه، پروبیوتیک طبیعی', price: '65,000',  colors: ['#FFFDE7', '#F5F5F5', '#E0E0E0'] },
  { id: 7, name: 'برنج طارم ارگانیک', category: 'grains', description: 'برنج طارم اعلا، عطر و طعم بی‌نظیر', price: '180,000',  colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE'] },
  { id: 8, name: 'پسته اکبری', category: 'nuts', description: 'پسته اکبری رفسنجان، درشت و خوش‌طعم', price: '580,000', salePrice: '490,000', colors: ['#8BC34A', '#FF9800', '#C85A17'] },
  { id: 9, name: 'عسل طبیعی کوهستان', category: 'honey', description: 'عسل کوهستان سبلان، خالص و طبیعی', price: '450,000',  colors: ['#FF8F00', '#FFB300', '#E65100'] },
  { id: 10, name: 'روغن زیتون فرابکر', category: 'beverages', description: 'روغن زیتون فرابکر رودبار، درجه یک', price: '350,000',  colors: ['#C85A17', '#8BC34A', '#FDD835'] },
  { id: 11, name: 'انار ارگانیک', category: 'fruits', description: 'انار ترش و شیرین ساوه، پرآب و خوشمزه', price: '90,000',  colors: ['#D32F2F', '#E53935', '#C85A17'] },
  { id: 12, name: 'کاهو ارگانیک', category: 'vegetables', description: 'کاهو سبز تازه و ترد از مزارع ورامین', price: '30,000',  colors: ['#C85A17', '#A0522D', '#8BC34A'] },
]

export default function Products() {
  useSEO({ title: 'محصولات | ده نشین', description: 'مجموعه‌ای از بهترین محصولات ارگانیک و طبیعی، میوه، سبزیجات، لبنیات، غلات و محصولات سالم' })
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState(searchParams.get('category') || 'all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState({ open: false, images: [], idx: 0 })
  const [popular, setPopular] = useState([])
  const { lang, t } = useLanguage()

  const productName = (p) => p[`name_${lang}`] || p.name || ''
  const productDesc = (p) => p[`desc_${lang}`] || p.description || ''
  const catName = (c) => c[`name_${lang}`] || c.name || ''

  useEffect(() => {
    axios.get('/api/admin/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories(fallbackCategories))
  }, [])

  useEffect(() => {
    axios.get('/api/products/stats/popular').then(({ data }) => setPopular(data.slice(0, 4))).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = filter !== 'all' ? { category: filter } : {}
        const res = await axios.get('/api/products', { params })
        setProducts(res.data)
      } catch {
        const filtered = filter === 'all'
          ? fallbackProducts
          : fallbackProducts.filter(p => p.category === filter)
        setProducts(filtered)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [filter])

  const getProductImages = (product) => {
    if (Array.isArray(product.images)) return product.images
    if (typeof product.images === 'string') {
      try { return JSON.parse(product.images) } catch { return [] }
    }
    if (product.image) return [product.image]
    return []
  }

  const parseColorItems = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [] } catch {}
      return val.split(',').map(c => c.trim()).filter(Boolean)
    }
    return []
  }

  const getColors = (product) => {
    const items = parseColorItems(product.colors)
    return items.map(item => typeof item === 'string' ? item : (item.hex || item.name))
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: '#F5F0E8', minHeight: '100vh' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">محصولات ما</h1>
            <p className="section-subtitle">مجموعه‌ای از بهترین محصولات ارگانیک و طبیعی</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
              <div style={{
                position: 'relative', width: '100%', maxWidth: '500px',
              }}>
                <input
                  type="text"
                  placeholder="جستجوی محصول..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 45px 12px 20px',
                    borderRadius: '50px', border: '1px solid rgba(76,175,80,0.2)',
                    background: '#fff', color: '#2D2D2D',
                    fontSize: '0.95rem', outline: 'none',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(76,175,80,0.2)'}
                />
                <span style={{
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  color: '#4CAF50', fontSize: '1.1rem',
                }}>🔍</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => { setFilter(cat.slug); setSearchParams(cat.slug === 'all' ? {} : { category: cat.slug }) }}
                  style={{
                    padding: '6px 18px', borderRadius: '50px',
                    border: 'none',
                    background: filter === cat.slug ? '#4CAF50' : '#fff',
                    color: filter === cat.slug ? '#fff' : '#6B6B6B',
                    fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {catName(cat)}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#4CAF50', padding: '60px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ width: 40, height: 40, border: '3px solid rgba(76,175,80,0.2)', borderTopColor: '#4CAF50', borderRadius: '50%', margin: '0 auto 20px' }}
              />
              در حال بارگذاری...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              <AnimatePresence mode="popLayout">
                {products.filter(p => {
                  if (!search.trim()) return true
                  const q = search.trim().toLowerCase()
                  const name = productName(p).toLowerCase()
                  const desc = productDesc(p).toLowerCase()
                  const cat = catName(categories.find(c => c.slug === p.category))?.toLowerCase() || ''
                  return name.includes(q) || desc.includes(q) || cat.includes(q)
                }).map((product, i) => {
                  const images = getProductImages(product)
                  const catLabel = categories.find(c => c.slug === product.category)
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                          <div
                          style={{
                            borderRadius: '14px', overflow: 'hidden',
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div style={{
                            height: 200, position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(135deg, #f5f0e8, #e8e0d8)',
                          }}>
                            {catLabel && (
                              <span style={{
                                position: 'absolute', top: 8, left: 8,
                                padding: '3px 10px',
                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                borderRadius: '50px', color: '#fff', fontSize: '0.65rem', fontWeight: 600,
                              }}>
                                {catName(catLabel)}
                              </span>
                            )}
                            <span style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 48,
                            }}>
                              {product.category === 'fruits' ? '🍎' : product.category === 'vegetables' ? '🥬' : product.category === 'dairy' ? '🥛' : product.category === 'grains' ? '🌾' : product.category === 'nuts' ? '🥜' : product.category === 'honey' ? '🍯' : product.category === 'spices' ? '🧂' : product.category === 'pickles' ? '🫙' : product.category === 'cosmetics' ? '🧴' : '🧃'}
                            </span>
                            {product.price && (
                              <div style={{
                                position: 'absolute', bottom: 8, right: 8, left: 8,
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                {(() => {
                                  const saleP = parsePrice(product.salePrice)
                                  const origP = parsePrice(product.price)
                                  if (!saleP) return null
                                  const pct = origP > 0 ? Math.round((1 - saleP / origP) * 100) : 0
                                  return (
                                    <span style={{ padding: '2px 8px', background: '#e53935', color: '#fff', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
                                      {pct > 0 ? `٪${pct}` : ''} تخفیف
                                    </span>
                                  )
                                })()}
                                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                  <span style={{
                                    color: '#4CAF50', fontWeight: 700, fontSize: '0.85rem',
                                  }}>
                                    {product.salePrice || product.price} تومان
                                  </span>
                                  {product.salePrice && (
                                    <span style={{
                                      color: '#888', textDecoration: 'line-through', fontSize: '0.7rem',
                                    }}>
                                      {product.price} تومان
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '12px' }}>
                            <h3 style={{
                              color: '#2D2D2D', fontSize: '0.85rem', marginBottom: '4px',
                              fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {productName(product)}
                            </h3>
                            <p style={{
                              color: '#6B6B6B', fontSize: '0.7rem', marginBottom: '10px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {productDesc(product)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.preventDefault(); e.stopPropagation()
                                const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                                const existing = cart.find(c => c.productId === product.id)
                                const saleP = parsePrice(product.salePrice)
                                const hasSale = saleP > 0
                                const finalPrice = hasSale ? product.salePrice : (product.price || '')
                                if (existing) existing.quantity = (existing.quantity || 1) + 1
                                else cart.push({ productId: product.id, name: product.name, price: finalPrice, quantity: 1, originalPrice: hasSale ? product.price : '' })
                                localStorage.setItem('cart', JSON.stringify(cart))
                                window.dispatchEvent(new Event('cart-update'))
                                alert('به سبد خرید اضافه شد ✓')
                              }}
                              style={{
                                width: '100%', padding: '8px', borderRadius: 6,
                                background: '#4CAF50', border: 'none',
                                color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                              }}>
                              افزودن به سبد خرید
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightbox.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox({ ...lightbox, open: false })}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <button onClick={() => setLightbox({ ...lightbox, open: false })} style={{
              position: 'absolute', top: 20, left: 20, width: 44, height: 44,
              borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 22, cursor: 'pointer', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '85vw', maxHeight: '85vh', borderRadius: 12, overflow: 'hidden',
                background: '#111',
                boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <motion.img
                key={lightbox.idx}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={lightbox.images[lightbox.idx]}
                alt=""
                style={{
                  maxWidth: '85vw', maxHeight: '85vh',
                  objectFit: 'contain',
                  padding: 12,
                }}
              />
            </div>
            {lightbox.images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, idx: lightbox.idx === 0 ? lightbox.images.length - 1 : lightbox.idx - 1 }) }} style={{
                  position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                  width: 50, height: 50, borderRadius: '50%', border: 'none',
                  background: 'rgba(212,175,55,0.2)', color: '#D4AF37',
                  fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, idx: lightbox.idx === lightbox.images.length - 1 ? 0 : lightbox.idx + 1 }) }} style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  width: 50, height: 50, borderRadius: '50%', border: 'none',
                  background: 'rgba(212,175,55,0.2)', color: '#D4AF37',
                  fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>›</button>
                <div style={{
                  position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 8,
                }}>
                  {lightbox.images.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, idx: i }) }} style={{
                      width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: i === lightbox.idx ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.3s',
                    }} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
