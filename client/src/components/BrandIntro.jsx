import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const defaultStats = [
  { value: '۱۵۰', suffix: '+', label: 'کشاورز همکار', icon: '👨‍🌾' },
  { value: '۲۰۰', suffix: '+', label: 'محصول ارگانیک', icon: '🌱' },
  { value: '۱۵', suffix: '', label: 'استان فعال', icon: '🗺' },
  { value: '۱۰۰', suffix: '%', label: 'تضمین کیفیت و سلامت', icon: '✅' },
]

function AnimatedStat({ value, suffix, label: labelProp, icon, delay }) {
  const { getText } = useLanguage()
  const label = getText(labelProp)
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        style={{
          textAlign: 'center', padding: '36px 24px',
          background: 'linear-gradient(145deg, rgba(212,175,55,0.06), rgba(44,24,16,0.3))',
          borderRadius: '20px',
          border: '1px solid rgba(212,175,55,0.12)',
          transition: 'all 0.4s ease',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
        <div style={{
          fontSize: '3.5rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #D4AF37, #E8C84A, #F5E6C8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Playfair Display', serif",
          lineHeight: 1.1,
        }}>
          {value}{suffix}
        </div>
        <div style={{ color: '#C0B090', fontSize: '0.9rem', marginTop: '8px', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: '30%', right: '30%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
        }} />
      </motion.div>
    </ScrollReveal>
  )
}

export default function BrandIntro() {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const stats = settings?.stats || defaultStats
  const title = getText(settings?.brandIntroTitle) || 'از مزرعه تا سفره'
  const text = getText(settings?.brandIntroText) || 'ده نشین با همکاری مستقیم با کشاورزان ارگانیک در سراسر ایران، تازه‌ترین و سالم‌ترین محصولات را به سفره شما می‌آورد. هر محصول، نشان‌دهنده عشق به طبیعت و احترام به سلامتی شماست.'

  return (
    <section className="section-padding" style={{ background: 'linear-gradient(180deg, #050505 0%, #111111 100%)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: 28, color: 'rgba(212,175,55,0.15)' }}>♛</div>

      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="section-title">
            {title}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="section-subtitle">
            {text}
          </p>
        </ScrollReveal>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px', marginTop: '20px',
        }}>
          {stats.map((stat, i) => (
            <AnimatedStat key={i} {...stat} delay={0.1 * i} />
          ))}
        </div>
      </div>
    </section>
  )
}