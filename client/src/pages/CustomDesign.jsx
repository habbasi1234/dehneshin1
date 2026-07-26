import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import axios from 'axios'
import useSEO from '../hooks/useSEO'

const originCities = {
  fruits: ['دماوند', 'شمال', 'گیلان', 'ساوه', 'ملایر', 'بم'],
  vegetables: ['جیرفت', 'اصفهان', 'ورامین', 'دزفول', 'شوشتر', 'محلات'],
  dairy: ['مزرعه ده نشین'],
  grains: ['گیلان', 'خمین', 'کرمانشاه', 'لرستان', 'کردستان', 'همدان'],
  nuts: ['تویسرکان', 'آستانه', 'رفسنجان', 'ملایر', 'حاجی‌آباد'],
  honey: ['سبلان', 'کردستان', 'مزرعه ده نشین'],
  beverages: ['لاهیجان', 'مزرعه ده نشین', 'یزد', 'رودبار'],
}

export default function CustomDesign() {
  useSEO({ title: 'سفارش اختصاصی محصول | ده نشین', description: 'سفارش اختصاصی محصول خاص از شهر مورد نظر شما با بهترین کیفیت' })
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', category: '', product: '', city: '', quantity: '', description: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/products').then(({ data }) => setProducts(data.items || data)).catch(() => {})
  }, [])

  const filteredProducts = form.category ? products.filter(p => p.category === form.category) : []
  const availableCities = form.product
    ? products.find(p => p._id === form.product || p.slug === form.product)?.origin
      ? [products.find(p => p._id === form.product || p.slug === form.product).origin]
      : (originCities[form.category] || [])
    : (originCities[form.category] || [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const selectedProduct = products.find(p => p._id === form.product || p.slug === form.product)
      await axios.post('/api/contact', {
        ...form,
        productType: 'custom-order',
        description: `محصول: ${selectedProduct?.name || form.product}\nشهر: ${form.city}\nمقدار: ${form.quantity}\n${form.description}`,
      })
      setStatus({ type: 'success', message: 'سفارش اختصاصی شما ثبت شد. کارشناسان ما برای هماهنگی تماس می‌گیرند.' })
      setForm({ name: '', phone: '', category: '', product: '', city: '', quantity: '', description: '' })
    } catch {
      setStatus({ type: 'error', message: 'خطا در ثبت سفارش' })
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '12px', color: '#F5E6C8',
    fontSize: '0.95rem', outline: 'none',
    fontFamily: "'Vazirmatn', sans-serif",
    boxSizing: 'border-box',
  }

  const selectStyle = (hasValue) => ({
    ...inputStyle,
    color: hasValue ? '#F5E6C8' : '#666',
  })

  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: 'var(--theme-bg, #111)', minHeight: '100vh' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">سفارش اختصاصی محصول</h1>
            <p className="section-subtitle">محصول خاص خود را از شهر مورد نظر سفارش دهید</p>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <ScrollReveal>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  height: 500, borderRadius: '24px',
                  background: 'linear-gradient(135deg, #388E3C, #4CAF50, #C85A17)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '6rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 20, left: 20, right: 20, bottom: 20,
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
                }} />
                🧺
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.3rem', marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>
                  فرم سفارش اختصاصی
                </h3>

                <input
                  placeholder="نام و نام خانوادگی *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="شماره تماس *"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                  style={inputStyle}
                />
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value, product: '', city: '' })}
                  style={selectStyle(!!form.category)}
                >
                  <option value="">دسته‌بندی محصول</option>
                  <option value="fruits" style={{ background: '#222' }}>🍎 میوه‌های ارگانیک</option>
                  <option value="vegetables" style={{ background: '#222' }}>🥬 سبزیجات ارگانیک</option>
                  <option value="dairy" style={{ background: '#222' }}>🥛 لبنیات سنتی</option>
                  <option value="grains" style={{ background: '#222' }}>🌾 غلات و حبوبات</option>
                  <option value="nuts" style={{ background: '#222' }}>🥜 خشکبار و آجیل</option>
                  <option value="honey" style={{ background: '#222' }}>🍯 عسل و محصولات طبیعی</option>
                  <option value="beverages" style={{ background: '#222' }}>🧃 نوشیدنی‌های سالم</option>
                </select>

                {form.category && (
                  <select
                    value={form.product}
                    onChange={e => setForm({ ...form, product: e.target.value })}
                    style={selectStyle(!!form.product)}
                  >
                    <option value="">انتخاب محصول</option>
                    {filteredProducts.map(p => (
                      <option key={p._id} value={p._id} style={{ background: '#222' }}>{p.name}</option>
                    ))}
                  </select>
                )}

                {availableCities.length > 0 && (
                  <select
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    style={selectStyle(!!form.city)}
                  >
                    <option value="">شهر مبدأ (محل تولید)</option>
                    {availableCities.map(c => (
                      <option key={c} value={c} style={{ background: '#222' }}>{c}</option>
                    ))}
                  </select>
                )}

                <input
                  placeholder="مقدار مورد نیاز (مثلاً: ۵ کیلوگرم)"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  style={inputStyle}
                />
                <textarea
                  placeholder="توضیحات اضافی (نحوه بسته‌بندی، زمان تحویل و ...)"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                    color: '#fff', fontSize: '1rem', fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                    border: 'none',
                  }}
                >
                  {loading ? 'در حال ثبت...' : 'ثبت سفارش اختصاصی'}
                </motion.button>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 20px', borderRadius: '12px',
                      background: status.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,0,0,0.1)',
                      border: `1px solid ${status.type === 'success' ? '#4CAF50' : 'red'}`,
                      color: status.type === 'success' ? '#4CAF50' : '#ff6666',
                    }}
                  >
                    {status.message}
                  </motion.div>
                )}
              </form>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div style={{
              marginTop: 60, padding: '30px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
            }}>
              <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', marginBottom: 16 }}>
                🌍 محصولات بر اساس شهرهای تولید
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {Object.entries(originCities).map(([cat, cities]) => (
                  <div key={cat} style={{
                    padding: '14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.1)',
                  }}>
                    <div style={{ color: '#D4AF37', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      {cat === 'fruits' ? '🍎 میوه' : cat === 'vegetables' ? '🥬 سبزی' : cat === 'dairy' ? '🥛 لبنیات' : cat === 'grains' ? '🌾 غلات' : cat === 'nuts' ? '🥜 خشکبار' : cat === 'honey' ? '🍯 عسل' : '🧃 نوشیدنی'}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{cities.join(' · ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
