import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function TeamSection() {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const team = settings?.team || []

  if (!team.length) return null

  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #0A0A0A 100%)',
      position: 'relative',
    }}>
      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
          <h2 className="section-title">تیم ما</h2>
          <p className="section-subtitle">متخصصانی که رویاها را به واقعیت تبدیل می‌کنند</p>
        </ScrollReveal>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px',
        }}>
          {team.map((member, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -10 }}
                style={{
                  textAlign: 'center', padding: '40px 20px',
                  background: 'linear-gradient(145deg, rgba(212,175,55,0.04), rgba(44,24,16,0.15))',
                  borderRadius: 16,
                  border: '1px solid rgba(212,175,55,0.1)',
                  transition: 'all 0.4s ease',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: member.image
                      ? `url(${member.image}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #D4AF37, #2C1810)',
                    margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem',
                    border: member.image ? '3px solid rgba(212,175,55,0.3)' : 'none',
                  }}
                >
                  {!member.image && (member.icon || '👤')}
                </motion.div>
                <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', marginBottom: '5px' }}>
                  {getText(member.name)}
                </h3>
                <p style={{ color: '#D4AF37', fontSize: '0.85rem', opacity: 0.8, marginBottom: '8px' }}>
                  {getText(member.role)}
                </p>
                <p style={{ color: '#C0B090', fontSize: '0.8rem' }}>
                  {getText(member.desc)}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
