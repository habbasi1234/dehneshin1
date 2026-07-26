import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function ProcessTimeline({ processId }) {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const processes = settings?.processes || []
  const activeProc = processId ? processes.find(p => p.id === processId) : processes[0]
  const steps = activeProc?.steps || settings?.processSteps || []
  const title = getText(activeProc?.title) || getText(settings?.processTitle)
  const subtitle = getText(activeProc?.subtitle) || getText(settings?.processSubtitle)

  return (
    <section className="section-padding" style={{
      background: 'var(--theme-surface, #0d0d0d)', position: 'relative', overflow: 'hidden',
    }}>
      <div className="container">
        <ScrollReveal>
          <div className="crown-decor">
            <span>✦</span><span>✦</span><span>✦</span>
          </div>
          <h2 className="section-title">{title || 'آفرینش یک اثر'}</h2>
          <p className="section-subtitle">{subtitle || 'از گزینش چوب تا خلق اثری ماندگار'}</p>
        </ScrollReveal>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '10%', right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)',
            transform: 'translateY(-50%)',
          }} />

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '30px',
          }}>
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -10 }}
                  style={{
                    textAlign: 'center', position: 'relative', zIndex: 1,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #D4AF37, #2C1810)',
                      margin: '0 auto 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem',
                      boxShadow: '0 0 30px rgba(212,175,55,0.2)',
                      border: '2px solid rgba(212,175,55,0.2)',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #E8C84A, #D4AF37)',
                      color: '#111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                      boxShadow: '0 0 10px rgba(212,175,55,0.4)',
                    }}>
                      {step.number}
                    </span>
                    {step.icon}
                  </motion.div>
                  <h3 style={{ color: '#D4AF37', fontSize: '1.05rem', marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
                    {getText(step.title)}
                  </h3>
                  <p style={{ color: '#8A7A60', fontSize: '0.8rem' }}>
                    {getText(step.desc)}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
