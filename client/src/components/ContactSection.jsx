import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', productType: '', description: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/contact', form)
      setStatus({ type: 'success', message: res.data.message })
      setForm({ name: '', phone: '', productType: '', description: '' })
    } catch {
      setStatus({ type: 'error', message: 'خطا در ارسال پیام' })
    }
    setLoading(false)
  }

  return (
    <section className="section-padding">
      <div className="container">
        <ScrollReveal>
          <h2 className="section-title">تماس با ما</h2>
          <p className="section-subtitle">برای سفارش و همکاری با ما در ارتباط باشید</p>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'start' }}>
          <ScrollReveal delay={0.1}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input placeholder="نام و نام خانوادگی *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                style={inputStyle} onFocus={e => e.target.style.borderColor = '#4CAF50'} onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.2)'} />
              <input placeholder="شماره تماس *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required
                style={inputStyle} onFocus={e => e.target.style.borderColor = '#4CAF50'} onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.2)'} />
              <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })} style={{ ...inputStyle, color: form.productType ? '#F5E6C8' : '#666' }}>
                <option value="" style={{ background: '#1A3D28' }}>نوع محصول</option>
                <option value="fruits" style={{ background: '#1A3D28' }}>🍎 میوه</option>
                <option value="vegetables" style={{ background: '#1A3D28' }}>🥬 سبزی</option>
                <option value="dairy" style={{ background: '#1A3D28' }}>🥛 لبنیات</option>
                <option value="grains" style={{ background: '#1A3D28' }}>🌾 غلات</option>
                <option value="nuts" style={{ background: '#1A3D28' }}>🥜 خشکبار</option>
                <option value="honey" style={{ background: '#1A3D28' }}>🍯 عسل</option>
                <option value="spices" style={{ background: '#1A3D28' }}>🧂 ادویه</option>
                <option value="pickles" style={{ background: '#1A3D28' }}>🫙 ترشی</option>
                <option value="cosmetics" style={{ background: '#1A3D28' }}>🧴 بهداشتی</option>
                <option value="other" style={{ background: '#1A3D28' }}>سایر</option>
              </select>
              <textarea placeholder="توضیحات" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#4CAF50'} onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.2)'} />
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'در حال ارسال...' : 'ارسال پیام'}
              </motion.button>
              {status && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '12px 20px', borderRadius: '12px', background: status.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,0,0,0.1)', border: `1px solid ${status.type === 'success' ? '#4CAF50' : 'red'}`, color: status.type === 'success' ? '#4CAF50' : '#ff6666', fontSize: '0.9rem' }}>
                  {status.message}
                </motion.div>
              )}
            </form>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="left">
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: '#4CAF50', fontSize: '1.3rem', marginBottom: '30px', fontFamily: "'Vazirmatn', sans-serif" }}>اطلاعات تماس</h3>
              {[
                { icon: '📞', label: 'شماره تماس', value: '۰۲۱-۱۲۳۴۵۶۷۸' },
                { icon: '💬', label: 'واتساپ', value: '۰۹۱۲-۳۴۵-۶۷۸۹' },
                { icon: '📷', label: 'اینستاگرام', value: '@deh_neshin' },
                { icon: '📍', label: 'آدرس', value: 'تهران، سعادت‌آباد' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: i < 3 ? '1px solid rgba(76,175,80,0.1)' : 'none' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <div>
                    <p style={{ color: '#C0B090', fontSize: '0.8rem' }}>{item.label}</p>
                    <p style={{ color: '#F5E6C8', fontSize: '1rem' }}>{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

const inputStyle = {
  width: '100%', padding: '16px 20px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(76,175,80,0.2)',
  borderRadius: '12px', color: '#F5E6C8', fontSize: '0.95rem', outline: 'none',
  transition: 'border-color 0.3s', fontFamily: "'Vazirmatn', sans-serif", boxSizing: 'border-box',
}
