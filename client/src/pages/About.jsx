import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import ScrollReveal from '../components/ScrollReveal'
import { usePageTracking } from '../hooks/useTracking'
import { useLanguage } from '../context/LanguageContext'
import useSEO from '../hooks/useSEO'

const defaultSettings = {
  aboutTitle: 'درباره ده نشین',
  aboutStoryTitle: 'داستان ما',
  aboutIntro: 'ده نشین از دغدغه‌ای ساده اما مهم متولد شد: رساندن محصولات ارگانیک و طبیعی از مزرعه به سفره شما. ما با همکاری مستقیم با کشاورزان معتمد در سراسر ایران، زنجیره‌ای از تازگی و سلامت را ایجاد کرده‌ایم.',
  aboutFullText: 'امروز با بیش از ۱۵۰ کشاورز همکار در ۱۵ استان ایران، بیش از ۲۰۰ محصول ارگانیک و طبیعی را به صورت مستقیم به دست شما می‌رسانیم. تمام محصولات ما دارای گواهی ارگانیک بوده و بدون استفاده از سموم شیمیایی، کودهای مصنوعی و محصولات تراریخته تولید می‌شوند. کیفیت و سلامت، مهمترین اولویت ماست.',
  aboutImage: '',
  team: [
    { name: 'مهندس رضایی', role: 'مدیر عامل', desc: 'بنیان‌گذار ده نشین از ۱۳۹۵', icon: '🌱' },
    { name: 'دکتر احمدی', role: 'مدیر کیفیت', desc: 'متخصص کشاورزی ارگانیک و کنترل کیفیت', icon: '✅' },
    { name: 'مهندس کریمی', role: 'مدیر منابع', desc: 'مدیر ارتباط با کشاورزان معتمد', icon: '🤝' },
    { name: 'دکتر موسوی', role: 'کارشناس تغذیه', desc: 'متخصص تغذیه و سلامت غذایی', icon: '🥗' },
  ],
  milestones: [
    { year: '۱۳۹۵', title: 'تأسیس ده نشین', desc: 'آغاز فعالیت با ۵ کشاورز همکار در تهران' },
    { year: '۱۳۹۷', title: 'گواهی ارگانیک', desc: 'دریافت مجوز رسمی ارگانیک از سازمان غذا و دارو' },
    { year: '۱۳۹۹', title: 'توسعه به ۱۰ استان', desc: 'افزایش همکاری با کشاورزان در سراسر ایران' },
    { year: '۱۴۰۱', title: '۲۰۰ محصول', desc: 'تنوع بیش از ۲۰۰ محصول ارگانیک و طبیعی' },
    { year: '۱۴۰۴', title: 'پیشرو در فروش آنلاین', desc: 'بزرگترین فروشگاه آنلاین محصولات ارگانیک ایران' },
  ],
}

export default function About() {
  useSEO({ title: 'درباره ما | ده نشین', description: 'ده نشین، فروشگاه آنلاین محصولات ارگانیک با بیش از ۱۵۰ کشاورز همکار و ۲۰۰ محصول ارگانیک در سراسر ایران' })
  usePageTracking()
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const s = settings || defaultSettings
  const team = s.team || defaultSettings.team
  const milestones = s.milestones || defaultSettings.milestones

  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: 'var(--theme-bg, #111)' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">{getText(s.aboutTitle) || defaultSettings.aboutTitle}</h1>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center', marginTop: '30px' }}>
            <ScrollReveal>
              <motion.div whileHover={{ scale: 1.02 }} style={{
                height: 450, borderRadius: '24px',
                background: s.aboutImage ? `url(${s.aboutImage}) center/cover no-repeat` : 'linear-gradient(135deg, #2C1810, #D4AF37)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '6rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                {!s.aboutImage && <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🌿</span>}
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h2 style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
                  {getText(s.aboutStoryTitle) || defaultSettings.aboutStoryTitle}
                </h2>
                <p style={{ color: '#C0B090', lineHeight: 2, fontSize: '1rem', marginBottom: '20px' }}>
                  {getText(s.aboutIntro) || defaultSettings.aboutIntro}
                </p>
                <p style={{ color: '#C0B090', lineHeight: 2, fontSize: '1rem' }}>
                  {getText(s.aboutFullText) || defaultSettings.aboutFullText}
                </p>
              </div>
            </ScrollReveal>
          </div>

          {milestones.length > 0 && (
            <div style={{ marginTop: '100px' }}>
              <ScrollReveal>
                <h2 className="section-title">مسیر موفقیت</h2>
              </ScrollReveal>
              <div style={{ position: 'relative', marginTop: '50px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', opacity: 0.3, transform: 'translateY(-50%)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  {milestones.map((m, i) => (
                    <ScrollReveal key={i} delay={i * 0.1}>
                      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <motion.div whileHover={{ scale: 1.1 }} style={{
                          width: m.image ? 90 : 70, height: m.image ? 90 : 70, borderRadius: m.image ? 16 : '50%',
                          background: m.image ? `url(${m.image}) center/cover no-repeat` : 'linear-gradient(135deg, #D4AF37, #2C1810)',
                          margin: '0 auto 15px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          border: '2px solid rgba(212,175,55,0.3)',
                          boxShadow: '0 0 20px rgba(212,175,55,0.2)',
                        }}>
                          {!m.image && <span style={{ color: '#F5E6C8', fontSize: '0.85rem', fontWeight: 700 }}>{m.year}</span>}
                        </motion.div>
                        {m.image && <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 5 }}>{m.year}</span>}
                        <h3 style={{ color: '#D4AF37', fontSize: '1rem', marginBottom: '5px' }}>{getText(m.title)}</h3>
                        <p style={{ color: '#C0B090', fontSize: '0.8rem' }}>{getText(m.desc)}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          )}

          {team.length > 0 && (
            <div style={{ marginTop: '100px' }}>
              <ScrollReveal>
                <h2 className="section-title">تیم ما</h2>
                <p className="section-subtitle">متخصصانی که سلامت را به سفره شما می‌آورند</p>
              </ScrollReveal>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                {team.map((member, i) => (
                  <ScrollReveal key={i} delay={i * 0.1}>
                    <motion.div whileHover={{ y: -10 }} className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <motion.div whileHover={{ scale: 1.1 }} style={{
                        width: 100, height: 100, borderRadius: '50%',
                        background: member.image ? `url(${member.image}) center/cover no-repeat` : 'linear-gradient(135deg, #D4AF37, #2C1810)',
                        margin: '0 auto 20px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', border: member.image ? '3px solid rgba(212,175,55,0.3)' : 'none',
                      }}>
                        {!member.image && (member.icon || '👤')}
                      </motion.div>
                      <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', marginBottom: '5px' }}>{getText(member.name)}</h3>
                      <p style={{ color: '#D4AF37', fontSize: '0.85rem', opacity: 0.8, marginBottom: '8px' }}>{getText(member.role)}</p>
                      <p style={{ color: '#C0B090', fontSize: '0.8rem' }}>{getText(member.desc)}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}