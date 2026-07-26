import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'

const reasons = [
  { title: 'کشاورزی ارگانیک', desc: 'بدون سموم شیمیایی، کودهای مصنوعی و محصولات تراریخته', icon: '🌱' },
  { title: 'تازه و فصلی', desc: 'محصولات بر اساس فصل، تازه چیده شده و مستقیم از مزرعه', icon: '🍃' },
  { title: 'گواهی ارگانیک', desc: 'دارای مجوزها و گواهی‌های معتبر ارگانیک از سازمان‌های نظارتی', icon: '📜' },
  { title: 'حمل و نقل مستقیم', desc: 'بدون واسطه، از مزرعه تا درب منزل شما', icon: '🚚' },
  { title: 'پشتیبانی از کشاورز', desc: 'حمایت از کشاورزان محلی و توسعه کشاورزی پایدار', icon: '🤝' },
  { title: 'بسته‌بندی سبز', desc: 'بسته‌بندی دوستدار محیط زیست با مواد قابل بازیافت', icon: '♻️' },
]

export default function WhyUs() {
  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(180deg, #0A0A0A 0%, #0d0d0d 100%)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
      }} />

      <div className="container">
        <ScrollReveal>
          <div className="royal-divider"><div className="diamond" /></div>
          <h2 className="section-title">چرا ده نشین</h2>
          <p className="section-subtitle">شش دلیل برای انتخاب محصولات ما</p>
        </ScrollReveal>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          {reasons.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  textAlign: 'center', padding: '36px 24px',
                  background: 'linear-gradient(145deg, rgba(212,175,55,0.04), rgba(44,24,16,0.2))',
                  borderRadius: '16px',
                  border: '1px solid rgba(212,175,55,0.1)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, rgba(212,175,55,0.2), rgba(44,24,16,0.4))',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', margin: '0 auto 16px',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p style={{ color: '#8A7A60', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
                <div style={{
                  position: 'absolute', bottom: 0, left: '25%', right: '25%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)',
                }} />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
