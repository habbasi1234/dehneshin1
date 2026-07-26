import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function Testimonials() {
  const { getText } = useLanguage()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      setTestimonials(data.testimonials || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <section className="section-padding" style={{
      background: '#FFFFFF',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 40, right: 40, color: 'rgba(76,175,80,0.08)', fontSize: 40, fontFamily: 'serif' }}>❖</div>
      <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'rgba(76,175,80,0.08)', fontSize: 40, fontFamily: 'serif' }}>❖</div>

      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
          <h2 className="section-title">سخن مشتریان</h2>
          <p className="section-subtitle">آنچه مشتریان ما می‌گویند</p>
        </ScrollReveal>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: 48, height: 48,
                border: '3px solid rgba(212,175,55,0.15)',
                borderTop: '3px solid #D4AF37',
                borderRadius: '50%',
              }}
            />
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
          }}>
            {testimonials.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -5 }}
                  style={{
                    padding: '36px 28px',
                    background: 'linear-gradient(145deg, rgba(212,175,55,0.04), rgba(44,24,16,0.25))',
                    borderRadius: '16px',
                    border: '1px solid rgba(212,175,55,0.1)',
                    position: 'relative',
                    transition: 'all 0.4s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 200,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 16, left: 24,
                    fontSize: '5rem', color: 'rgba(212,175,55,0.08)',
                    fontFamily: 'serif', lineHeight: 1,
                  }}>
                    "
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {item.image && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                        <img src={item.image} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,175,55,0.2)' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', justifyContent: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: '#D4AF37', fontSize: '0.9rem' }}>★</span>
                      ))}
                    </div>
                    <p style={{ color: '#E8D5B0', lineHeight: 1.8, fontSize: '0.9rem', position: 'relative', zIndex: 1, fontStyle: 'italic', textAlign: 'center' }}>
                      "{getText(item.text)}"
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(212,175,55,0.08)', textAlign: 'center' }}>
                    <p style={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.95rem', fontFamily: "'Playfair Display', serif" }}>
                      {getText(item.name)}
                    </p>
                    <p style={{ color: '#8A7A60', fontSize: '0.8rem' }}>
                      {getText(item.role)}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
