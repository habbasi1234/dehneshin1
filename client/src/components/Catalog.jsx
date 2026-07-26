import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function Catalog() {
  const [settings, setSettings] = useState(null)
  const [activeCat, setActiveCat] = useState('all')
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const catalogs = (settings?.catalogs || []).filter(c => c.active !== false)
  const categories = [...new Set(catalogs.map(c => c.category).filter(Boolean))]
  const filtered = activeCat === 'all' ? catalogs : catalogs.filter(c => c.category === activeCat)

  return (
    <section className="section-padding" style={{
      background: 'var(--theme-bg, #111111)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(44,24,16,0.2))',
            borderRadius: '30px', padding: '80px 40px',
            border: '1px solid rgba(212,175,55,0.1)',
          }}>
            <h2 className="section-title">{getText(settings?.catalogTitle)}</h2>
            <p className="section-subtitle" style={{ marginBottom: '30px' }}>
              {getText(settings?.catalogSubtitle)}
            </p>

            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
                <button onClick={() => setActiveCat('all')} style={{
                  padding: '8px 20px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)',
                  background: activeCat === 'all' ? 'linear-gradient(135deg, #D4AF37, #8B6914)' : 'transparent',
                  color: activeCat === 'all' ? '#111' : '#D4AF37', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.3s',
                }}>همه</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCat(cat)} style={{
                    padding: '8px 20px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)',
                    background: activeCat === cat ? 'linear-gradient(135deg, #D4AF37, #8B6914)' : 'transparent',
                    color: activeCat === cat ? '#111' : '#D4AF37', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.3s',
                  }}>{cat}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {filtered.map((cat, i) => (
                <motion.a
                  key={i}
                  href={cat.file || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(44,24,16,0.3))',
                    borderRadius: 12,
                    border: '1px solid rgba(212,175,55,0.2)',
                    textDecoration: 'none',
                    color: '#F5E6C8',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div style={{ textAlign: 'start' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#D4AF37' }}>{getText(cat.title)}</div>
                    {cat.category && <div style={{ fontSize: 11, color: '#888' }}>{cat.category}</div>}
                  </div>
                  <span style={{ fontSize: 18, color: '#D4AF37' }}>⬇</span>
                </motion.a>
              ))}
            </div>

            {filtered.length === 0 && (
              <p style={{ color: '#888', fontSize: 13 }}>کاتالوگی یافت نشد</p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
