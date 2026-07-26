import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function BuyingTips() {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const tips = settings?.buyingTips || []
  if (!tips.length) return null

  const title = settings?.buyingTipsTitle || 'نکات خرید محصولات ارگانیک'
  const subtitle = settings?.buyingTipsSubtitle || 'راهنمای جامع انتخاب و نگهداری محصولات سالم'

  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #0A0A0A 100%)',
      position: 'relative',
    }}>
      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
          <h2 className="section-title">{getText(title) || 'نکات خرید محصولات ارگانیک'}</h2>
          <p className="section-subtitle">{getText(subtitle) || 'راهنمای جامع انتخاب و نگهداری محصولات سالم'}</p>
        </ScrollReveal>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {tips.map((tip, i) => (
            <ScrollReveal key={tip.id || i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(212,175,55,0.04), rgba(44,24,16,0.15))',
                  border: '1px solid rgba(212,175,55,0.1)',
                  transition: 'all 0.4s ease',
                }}
              >
                {tip.image && (
                  <div style={{ width: '100%', height: 200, overflow: 'hidden', borderBottom: '1px solid rgba(212,175,55,0.1)', position: 'relative' }}>
                    <img src={tip.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', imageRendering: 'auto' }} />
                  </div>
                )}
                {!tip.image && (
                  <div style={{
                    width: '100%', height: 200,
                    background: 'linear-gradient(135deg, #2C1810, #D4AF37)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48,
                    borderBottom: '1px solid rgba(212,175,55,0.1)',
                  }}>
                    {['🥦','💡','📖','✨','🌿','🍎'][i % 6]}
                  </div>
                )}
                <div style={{ padding: 24 }}>
                  {tip.category && (
                    <span style={{
                      display: 'inline-block', padding: '4px 12px',
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: 'rgba(212,175,55,0.15)', color: '#D4AF37',
                      marginBottom: 10,
                    }}>
                      {getText(tip.category)}
                    </span>
                  )}
                  <h3 style={{ color: '#D4AF37', fontSize: 16, marginBottom: 8, lineHeight: 1.4 }}>
                    {getText(tip.title)}
                  </h3>
                  <p style={{ color: '#C0B090', fontSize: 13, lineHeight: 1.8 }}>
                    {getText(tip.summary)}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
