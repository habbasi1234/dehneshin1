import { motion } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import useSEO from '../hooks/useSEO'

const catalogItems = [
  { name: 'کاتالوگ کامل ۱۴۰۴ - ویژه بهار', pages: 64, size: '۱۸ مگابایت', format: 'PDF', desc: 'مجموعه کامل ۳۰+ کالکشن شامل کلاسیک، نئوکلاسیک، مدرن و چستر' },
  { name: 'کاتالوگ کلاسیک و طلاکوب', pages: 52, size: '۱۴ مگابایت', format: 'PDF', desc: 'آثار هنری با ورق طلای ایتالیایی، سبک باروک، فرانسوی و ملکه آن' },
  { name: 'کاتالوگ مدرن و مینیمال', pages: 40, size: '۱۰ مگابایت', format: 'PDF', desc: 'مجموعه مبلمان معاصر با طراحی مینیمال و چوب‌های طبیعی' },
  { name: 'بروشور پروژه‌های اجرایی', pages: 32, size: '۲۲ مگابایت', format: 'PDF', desc: 'نمونه پروژه‌های VIP فرودگاه، هتل‌های ۵ ستاره، کاخ و ویلاهای سلطنتی' },
  { name: 'کاتالوگ منبت و کنده‌کاری', pages: 36, size: '۹ مگابایت', format: 'PDF', desc: 'نمایش آثار منبت کاری دستی استادکاران برجسته ایران' },
  { name: 'کاتالوگ نئوکلاسیک و ترک', pages: 44, size: '۱۲ مگابایت', format: 'PDF', desc: 'مجموعه لوئیزیانا، آرمانت، ویا‌سینا و سبک‌های ترکی و ایتالیایی' },
]

export default function Catalog() {
  useSEO({ title: 'کاتالوگ | ده نشین', description: 'دانلود کاتالوگ محصولات و خدمات ده نشین شامل مجموعه کامل کالکشن‌های کلاسیک، مدرن، نئوکلاسیک و منبت' })
  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: 'var(--theme-bg, #111)', minHeight: '100vh' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">دانلود کاتالوگ</h1>
            <p className="section-subtitle">کاتالوگ محصولات و خدمات ده نشین</p>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
            {catalogItems.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="glass-card"
                  style={{
                    textAlign: 'center', padding: '50px 30px',
                    cursor: 'pointer',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                    style={{
                      width: 120, height: 160,
                      background: 'linear-gradient(135deg, #2C1810, #5C3A1E, #D4AF37)',
                      borderRadius: '8px', margin: '0 auto 25px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
                      border: '1px solid rgba(212,175,55,0.3)', borderRadius: '4px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '5px',
                    }}>
                      <div style={{ fontSize: '0.5rem', color: '#D4AF37', letterSpacing: '1px' }}>CATALOG</div>
                      <div style={{ width: '50%', height: '1px', background: '#D4AF37', opacity: 0.4 }} />
                      <div style={{ fontSize: '0.45rem', color: '#F5E6C8' }}>Deh Neshin</div>
                    </div>
                  </motion.div>

                  <h3 style={{ color: '#D4AF37', fontSize: '1.15rem', marginBottom: '15px' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#C0B090', fontSize: '0.85rem', marginBottom: '15px', lineHeight: 1.7 }}>
                    {item.desc}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <span style={{ color: '#C0B090', fontSize: '0.85rem' }}>📄 {item.pages} صفحه</span>
                    <span style={{ color: '#C0B090', fontSize: '0.85rem' }}>💾 {item.size}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    style={{ padding: '12px 36px', fontSize: '0.9rem' }}
                  >
                    📥 دانلود کاتالوگ
                  </motion.button>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
