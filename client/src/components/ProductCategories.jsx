import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ScrollReveal from './ScrollReveal'

const fallbackCategories = [
  { name: 'میوه‌های ارگانیک', desc: 'تازه از باغ‌های ایران', icon: '🍎', color: '#E53935' },
  { name: 'سبزیجات ارگانیک', desc: 'سبز و سالم از مزرعه', icon: '🥬', color: '#4CAF50' },
  { name: 'لبنیات سنتی', desc: 'تازه و طبیعی از دامداری', icon: '🥛', color: '#FDD835' },
  { name: 'غلات و حبوبات', desc: 'انرژی پاک و طبیعی', icon: '🌾', color: '#8D6E63' },
  { name: 'خشکبار و آجیل', desc: 'مغذی و خوشمزه', icon: '🥜', color: '#A1887F' },
  { name: 'عسل و محصولات طبیعی', desc: 'طعم ناب طبیعت', icon: '🍯', color: '#FF8F00' },
  { name: 'نوشیدنی‌های سالم', desc: 'طراوت و سلامتی', icon: '🧃', color: '#00ACC1' },
]

export default function ProductCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/categories').then(({ data }) => {
      setCategories(data.map(c => ({
        name: c.name,
        desc: c.slug,
        icon: c.icon || '✦',
        color: '#D4AF37'
      })))
    }).catch(() => {
      setCategories(fallbackCategories)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <section className="section-padding" style={{ background: 'var(--theme-bg, #0d0d0d)', position: 'relative' }}>
      {/* Ornamental top border */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)',
      }} />

      <div className="container">
        <ScrollReveal>
          <div className="crown-decor">
            <span>✦</span><span>✦</span><span>✦</span>
          </div>
          <h2 className="section-title">دسته‌بندی محصولات</h2>
          <p className="section-subtitle">محصولات ارگانیک و طبیعی از مزرعه تا سفره شما</p>
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
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
          }}>
            {categories.map((cat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Link to={`/search?q=${encodeURIComponent(cat.name)}`}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.02 }}
                    style={{
                      background: 'linear-gradient(145deg, rgba(212,175,55,0.04), rgba(44,24,16,0.3))',
                      borderRadius: '20px',
                      padding: '40px 24px',
                      border: '1px solid rgba(212,175,55,0.1)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      minHeight: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Top gold line on hover */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }} className="card-top-line" />

                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${cat.color}, #D4AF37)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', marginBottom: '25px',
                      boxShadow: '0 0 30px rgba(212,175,55,0.15)',
                      position: 'relative',
                    }}>
                      {cat.icon}
                    </div>
                    <h3 style={{
                      color: '#D4AF37', fontSize: '1.2rem', marginBottom: '10px',
                      fontFamily: "'Playfair Display', serif",
                    }}>
                      {cat.name}
                    </h3>
                    <p style={{ color: '#8A7A60', fontSize: '0.85rem' }}>
                      {cat.desc}
                    </p>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      <style>{`
        a:hover .card-top-line { opacity: 1; }
      `}</style>
    </section>
  )
}
