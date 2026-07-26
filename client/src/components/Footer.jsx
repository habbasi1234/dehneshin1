import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const defaultSettings = {
  siteName: 'ده نشین',
  siteDescription: 'محصولات ارگانیک و طبیعی',
  logoText: 'ده',
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  mobile: '۰۹۱۲-۱۲۳-۴۵۶۷',
  email: 'info@dehneshin.com',
  address: 'تهران، خیابان انقلاب',
  address2: 'بازار ارگانیک، طبقه همکف',
  workingHours: 'شنبه تا پنجشنبه: ۸ صبح تا ۸ شب',
  workingHoursFriday: 'جمعه: ۹ صبح تا ۵ عصر',
  footerCopyright: 'تمامی حقوق مادی و معنوی این وب‌سایت متعلق به ده نشین می‌باشد',
  footerLabels: { quickLinks: 'لینک‌های سریع', products: 'محصولات', connect: 'ارتباط با ما', workingHours: 'ساعت کاری' },
  socialLinks: [
    { key: 'instagram', icon: '📷', url: 'https://instagram.com/dehneshin', label: 'اینستاگرام' },
    { key: 'telegram', icon: '✈', url: 'https://t.me/dehneshin', label: 'تلگرام' },
    { key: 'whatsapp', icon: '💬', url: 'https://wa.me/989121234567', label: 'واتساپ' },
  ],
}

export default function Footer() {
  const [settings, setSettings] = useState(defaultSettings)
  const { getText, t, lang } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const fl = settings.footerLabels || defaultSettings.footerLabels
  const socialLinks = settings.socialLinks || defaultSettings.socialLinks

  return (
    <footer style={{
      background: 'linear-gradient(180deg, var(--black-matte) 0%, var(--theme-bg) 100%)',
      borderTop: '1px solid var(--theme-border)',
      padding: '80px 40px 30px',
      position: 'relative',
    }} className="footer">
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #D4AF37, #E8C84A, #D4AF37, transparent)',
      }} />

      <div className="container" style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '50px', marginBottom: '60px',
        }}>
          <div>
            <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative', width: 70, height: 70, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.3)' }} />
              <div style={{
                width: 56, height: 56,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                ...(settings['logoImage_' + lang] ? {} : {
                  background: 'radial-gradient(circle at 35% 35%, #E8C84A, #D4AF37, #B8960F)',
                  boxShadow: '0 0 30px rgba(212,175,55,0.3)',
                }),
              }}>
                {settings['logoImage_' + lang] ? (
                  <img src={settings['logoImage_' + lang]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111' }}>{getText(settings.logoText)}</span>
                )}
              </div>
              <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', fontSize: 14, color: '#4CAF50' }}>🌿</div>
            </motion.div>
            <h3 style={{ color: '#D4AF37', fontSize: '1.3rem', marginBottom: '8px', fontFamily: "'Playfair Display', serif" }}>
              {getText(settings.siteName)}
            </h3>
            <p style={{ color: '#8A7A60', lineHeight: 1.8, fontSize: '0.85rem', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px' }}>
              {getText(settings.siteDescription)}
            </p>
          </div>

          <div>
            <h4 style={{ color: '#D4AF37', marginBottom: '20px', fontSize: '1rem', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>
              {getText(fl.quickLinks)}
            </h4>
            {[
              { label: t('home'), path: '/' },
              { label: t('products'), path: '/products' },
              { label: t('about'), path: '/about' },
              { label: t('blog'), path: '/blog' },
              { label: t('contact'), path: '/contact' },
              { label: t('farmMap'), path: '/farm-map' },
              { label: t('track'), path: '/track' },
              { label: t('cart'), path: '/cart' },
            ].map((item, i) => (
              <Link key={i} to={item.path} style={{ display: 'block', color: '#8A7A60', marginBottom: '10px', fontSize: '0.85rem', transition: 'color 0.3s, paddingRight 0.3s' }}
                onMouseEnter={e => { e.target.style.color = '#D4AF37'; e.target.style.paddingRight = '5px' }}
                onMouseLeave={e => { e.target.style.color = '#8A7A60'; e.target.style.paddingRight = '0' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#D4AF37', marginBottom: '20px', fontSize: '1rem', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>
              {getText(fl.products)}
            </h4>
            {['میوه‌های ارگانیک', 'سبزیجات ارگانیک', 'لبنیات سنتی', 'غلات و حبوبات', 'خشکبار و آجیل', 'عسل و محصولات طبیعی', 'نوشیدنی‌های سالم'].map((item, i) => (
              <Link key={i} to="/products" style={{ display: 'block', color: '#8A7A60', marginBottom: '10px', fontSize: '0.85rem', transition: 'color 0.3s, paddingRight 0.3s' }}
                onMouseEnter={e => { e.target.style.color = '#D4AF37'; e.target.style.paddingRight = '5px' }}
                onMouseLeave={e => { e.target.style.color = '#8A7A60'; e.target.style.paddingRight = '0' }}
              >
                {item}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#D4AF37', marginBottom: '20px', fontSize: '1rem', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>
              {getText(fl.connect)}
            </h4>
            <div style={{ color: '#8A7A60', fontSize: '0.85rem', lineHeight: 2.2 }}>
              <p>📞 {settings.phone}</p>
              <p>📱 {settings.mobile}</p>
              <p>📧 {settings.email}</p>
              <p>📍 {getText(settings.address)}</p>
              {settings.address2 && <p>🏬 {getText(settings.address2)}</p>}
            </div>
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                {socialLinks.filter(s => s.url).map(social => (
                  <motion.a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -3, borderColor: '#D4AF37' }}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      border: '1px solid rgba(212,175,55,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#D4AF37', fontSize: '0.9rem', transition: 'all 0.3s',
                      background: 'rgba(212,175,55,0.05)',
                      overflow: 'hidden',
                    }}
                  >
                    {social.icon && social.icon.startsWith('http') ? (
                      <img src={social.icon} alt={getText(social.label) || social.key} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    ) : (
                      <span>{social.icon}</span>
                    )}
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)', marginBottom: '30px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ color: '#555', fontSize: '0.8rem', fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>
            {getText(settings.footerCopyright)}
          </p>
          <p style={{ color: '#555', fontSize: '0.8rem', fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>
            © {new Date().getFullYear()} {getText(settings.siteName)}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer { padding: 40px 16px 20px !important; }
          .footer .container > div:first-child { gap: 30px !important; }
          .footer .container > div:last-child { flex-direction: column !important; text-align: center !important; }
        }
        @media (max-width: 480px) {
          .footer { padding: 30px 12px 16px !important; }
          .footer .container > div:first-child { gap: 24px !important; }
        }
      `}</style>
    </footer>
  )
}