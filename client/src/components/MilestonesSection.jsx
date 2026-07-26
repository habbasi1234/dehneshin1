import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function MilestonesSection() {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const milestones = settings?.milestones || []

  if (!milestones.length) return null

  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(180deg, #0A0A0A 0%, #0d0d0d 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
          <h2 className="section-title">نقاط عطف</h2>
          <p className="section-subtitle">مسیر افتخارات ده نشین</p>
        </ScrollReveal>

        <div style={{ position: 'relative', marginTop: 60 }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: '50%',
            width: 2, background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.3), rgba(212,175,55,0.6), rgba(212,175,55,0.3), transparent)',
            transform: 'translateX(-50%)',
          }} />

          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: isLeft ? 'flex-start' : 'flex-end',
                  marginBottom: 40, position: 'relative',
                }}>
                  <div style={{
                    width: '45%',
                    order: isLeft ? 1 : 2,
                  }}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      style={{
                        padding: '24px',
                        background: 'linear-gradient(145deg, rgba(212,175,55,0.05), rgba(44,24,16,0.2))',
                        borderRadius: 16,
                        border: '1px solid rgba(212,175,55,0.12)',
                        textAlign: isLeft ? 'left' : 'right',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 16,
                        [isLeft ? 'right' : 'left']: -8,
                        width: 16, height: 16,
                        background: '#D4AF37',
                        borderRadius: '50%',
                        border: '3px solid #1a1a1a',
                        boxShadow: '0 0 15px rgba(212,175,55,0.4)',
                        zIndex: 2,
                      }} />
                      <span style={{
                        color: '#D4AF37', fontSize: '1.5rem', fontWeight: 700,
                        fontFamily: "'Playfair Display', serif",
                        display: 'block', marginBottom: 4,
                      }}>
                        {m.year}
                      </span>
                      <h3 style={{ color: '#F5E6C8', fontSize: '1rem', marginBottom: 6 }}>
                        {getText(m.title)}
                      </h3>
                      <p style={{ color: '#8A7A60', fontSize: '0.85rem' }}>
                        {getText(m.desc)}
                      </p>
                    </motion.div>
                  </div>

                  <div style={{ width: '10%', textAlign: 'center', order: 2 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #E8C84A, #D4AF37)',
                      margin: '0 auto',
                      boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                    }} />
                  </div>

                  <div style={{ width: '45%', order: isLeft ? 3 : 1 }} />
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
