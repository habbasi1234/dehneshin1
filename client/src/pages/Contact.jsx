import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import axios from 'axios'
import { usePageTracking } from '../hooks/useTracking'
import { useLanguage } from '../context/LanguageContext'
import useSEO from '../hooks/useSEO'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Contact() {
  useSEO({ title: 'تماس با ما | ده نشین', description: 'برای مشاوره، سفارش و همکاری با ده نشین در ارتباط باشید' })
  usePageTracking()
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [mapError, setMapError] = useState(false)
  const typeLabels = {
    contact: 'تماس با ما',
    comment: 'نظرات و پیشنهادات',
    consultation: 'مشاوره تخصصی محصولات',
  }
  const [form, setForm] = useState({ name: '', phone: '', productType: '', description: '', type: 'contact' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapRef.current || !settings) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    try {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      const lat = parseFloat(settings?.mapLat) || 35.7745
      const lng = parseFloat(settings?.mapLng) || 51.4165
      const map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, zoomControl: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
      L.marker([lat, lng]).addTo(map)
        .bindPopup('<b>ده نشین</b><br>' + (getText(settings?.address) || 'تهران، خیابان انقلاب'))
      mapInstanceRef.current = map
    } catch (e) {
      console.error('Map error:', e)
      setMapError(true)
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/contact', form)
      setStatus({ type: 'success', message: res.data.message })
      setForm({ name: '', phone: '', productType: '', description: '', type: 'contact' })
    } catch {
      setStatus({ type: 'error', message: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.' })
    }
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: 'var(--theme-bg, #111)', minHeight: '100vh' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">{getText(settings?.contactTitle) || 'تماس با ما'}</h1>
            <p className="section-subtitle">{getText(settings?.contactSubtitle) || 'برای مشاوره، سفارش و همکاری با ما در ارتباط باشید'}</p>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', alignItems: 'start' }}>
            <ScrollReveal>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{
                      width: '100%', padding: '16px 20px',
                      background: '#F5F0E8',
                      border: '1px solid rgba(76,175,80,0.2)',
                      borderRadius: '12px', color: form.type ? '#2D2D2D' : '#666',
                      fontSize: '0.95rem', outline: 'none',
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    <option value="contact" style={{ background: '#fff' }}>تماس با ما</option>
                    <option value="consultation" style={{ background: '#fff' }}>مشاوره تخصصی</option>
                    <option value="comment" style={{ background: '#fff' }}>نظرات و پیشنهادات</option>
                  </select>
                </div>
                {['name', 'phone', 'productType', 'description'].map(field => (
                  <div key={field}>
                    {field === 'productType' ? (
                      <select
                        value={form.productType}
                        onChange={e => setForm({ ...form, productType: e.target.value })}
                        style={{
                          width: '100%', padding: '16px 20px',
                          background: '#F5F0E8',
                          border: '1px solid rgba(76,175,80,0.2)',
                          borderRadius: '12px', color: form.productType ? '#2D2D2D' : '#666',
                          fontSize: '0.95rem', outline: 'none',
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      >
                        <option value="" style={{ background: '#fff' }}>نوع محصول موردنظر</option>
                        <option value="fruits" style={{ background: '#fff' }}>میوه‌های ارگانیک</option>
                        <option value="vegetables" style={{ background: '#fff' }}>سبزیجات ارگانیک</option>
                        <option value="dairy" style={{ background: '#fff' }}>لبنیات سنتی</option>
                        <option value="grains" style={{ background: '#fff' }}>غلات و حبوبات</option>
                      </select>
                    ) : field === 'description' ? (
                      <textarea
                        placeholder="توضیحات"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        style={{
                          width: '100%', padding: '16px 20px', resize: 'vertical',
                          background: '#F5F0E8',
                          border: '1px solid rgba(76,175,80,0.2)',
                          borderRadius: '12px', color: '#2D2D2D',
                          fontSize: '0.95rem', outline: 'none',
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      />
                    ) : (
                      <input
                        placeholder={field === 'name' ? 'نام و نام خانوادگی *' : 'شماره تماس *'}
                        value={form[field]}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        required
                        style={{
                          width: '100%', padding: '16px 20px',
                          background: '#F5F0E8',
                          border: '1px solid rgba(76,175,80,0.2)',
                          borderRadius: '12px', color: '#2D2D2D',
                          fontSize: '0.95rem', outline: 'none',
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      />
                    )}
                  </div>
                ))}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                    color: '#111', fontSize: '1rem', fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                    border: 'none',
                  }}
                >
                  {loading ? 'در حال ارسال...' : 'ارسال پیام'}
                </motion.button>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 20px', borderRadius: '12px',
                      background: status.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,0,0,0.1)',
                      border: `1px solid ${status.type === 'success' ? '#D4AF37' : 'red'}`,
                      color: status.type === 'success' ? '#D4AF37' : '#ff6666',
                    }}
                  >
                    {status.message}
                  </motion.div>
                )}
              </form>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card" style={{ padding: '40px' }}>
                  <h3 style={{ color: '#2D2D2D', fontSize: '1.3rem', marginBottom: '30px', fontFamily: "'Playfair Display', serif" }}>
                  اطلاعات تماس
                </h3>
                {[
                  { icon: '📞', label: 'شماره تماس', value: settings?.phone || '۰۲۱-۸۸۷۶۵۴۳۲' },
                  { icon: '💬', label: 'واتساپ', value: settings?.mobile || '۰۹۱۲-۱۱۱-۸۸۸۸' },
                  { icon: '📷', label: 'اینستاگرام', value: settings?.instagram?.replace('https://instagram.com/', '@') || '@dehneshin' },
                  { icon: '📍', label: 'آدرس فروشگاه', value: getText(settings?.address) || 'تهران، خیابان انقلاب' },
                  { icon: '✉', label: 'ایمیل', value: settings?.email || 'info@dehneshin.com' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '15px',
                    padding: '15px 0',
                      borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <div>
                      <p style={{ color: '#6B6B6B', fontSize: '0.8rem' }}>{item.label}</p>
                      <p style={{ color: '#2D2D2D', fontSize: '1rem' }}>{item.value}</p>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '30px' }}>
                  <p style={{ color: '#6B6B6B', fontSize: '0.9rem', marginBottom: '15px' }}>ساعات کاری:</p>
                  <p style={{ color: '#2D2D2D', fontSize: '0.95rem' }}>{getText(settings?.workingHours) || 'شنبه تا پنجشنبه: ۹ صبح تا ۸ شب'}</p>
                  <p style={{ color: '#2D2D2D', fontSize: '0.95rem' }}>{getText(settings?.workingHoursFriday) || 'جمعه: ۱۰ صبح تا ۶ عصر'}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div style={{ marginTop: 60 }}>
              <div className="royal-divider"><div className="diamond" /></div>
              <h3 style={{ color: '#2D2D2D', textAlign: 'center', fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
                موقعیت مکانی
              </h3>
              <p style={{ color: '#6B6B6B', textAlign: 'center', fontSize: '0.9rem', marginBottom: 24 }}>
                {getText(settings?.address) || 'تهران، میدان مادر، خیابان مطهری'}
              </p>
              <div ref={mapRef} style={{
                width: '100%', height: 400, borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(76,175,80,0.15)',
              }}>
                {mapError && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.03)', color: '#6B6B6B', fontSize: 14 }}>
                    نقشه بارگذاری نشد
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
