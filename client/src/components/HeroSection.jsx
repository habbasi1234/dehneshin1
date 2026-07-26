import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeScene from './ThreeScene'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import { parsePrice } from '../utils/price'

const defaultSlides = [
  {
    type: 'banner', image: '', title: 'به بازار ارگانیک ده نشین خوش آمدید', subtitle: 'از مزرعه تا سفره · طبیعت پاک · زندگی سالم',
    description: 'با بیش از ۱۵۰ کشاورز معتمد، تازه‌ترین محصولات ارگانیک و طبیعی را مستقیماً از مزرعه به درب منزل شما می‌آوریم. کیفیت، تازگی و سلامت، سه اصل اساسی ماست.',
    buttonText: 'درباره ما', buttonLink: '/about',
  },
  {
    type: 'banner', image: '', title: '🍏 میوه‌ها و سبزیجات تازه فصل', subtitle: 'طعم واقعی طبیعت را تجربه کنید',
    description: 'تازه‌ترین محصولات کشاورزی ارگانیک را مستقیماً از مزارع معتبر تهیه کنید. بدون سم و کود شیمیایی، با بالاترین کیفیت.',
    buttonText: 'مشاهده محصولات', buttonLink: '/products?category=fruits',
  },
  {
    type: 'banner', image: '', title: '🍯 عسل طبیعی و خشکبار', subtitle: 'سالم · مقوی · کاملاً طبیعی',
    description: 'عسل کوهستان، آجیل و خشکبار درجه یک، روغن زیتون فوق‌العاده و صدها محصول طبیعی دیگر با ضمانت اصالت و کیفیت.',
    buttonText: 'محصولات طبیعی', buttonLink: '/products?category=honey',
  },
  {
    type: 'banner', image: '', title: '🥛 لبنیات سنتی و محلی', subtitle: 'طعم خاطره‌انگیز لبنیات روستایی',
    description: 'ماست، پنیر، کره و دوغ محلی از دامداری‌های ارگانیک. بدون مواد نگهدارنده، با طعم اصیل و بافت سنتی.',
    buttonText: 'مشاهده لبنیات', buttonLink: '/products?category=dairy',
  },
  {
    type: 'promo', image: '', title: '🔥 جشنواره پاییزی ده نشین', promoTitle: '🎊 تخفیف‌های ویژه فصل', promoDescription: 'تا ۳۰٪ تخفیف روی محصولات منتخب · ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان',
    buttonText: 'مشاهده تخفیف‌ها', buttonLink: '/products?discount=true',
  },
  {
    type: 'products', image: '', title: 'جدیدترین محصولات ارگانیک', productsTitle: 'تازه واردها',
    buttonText: 'مشاهده همه', buttonLink: '/products',
  },
  {
    type: 'banner', image: '', title: '🌿 ۱۰۰٪ ارگانیک و طبیعی', subtitle: 'گواهی شده · تضمین کیفیت · بدون مواد افزودنی',
    description: 'همه محصولات ده نشین دارای گواهی ارگانیک هستند. از مزرعه تا سفره، سلامت شما برای ما اولویت است.',
    buttonText: 'چرا ده نشین؟', buttonLink: '/about',
  },
  {
    type: 'banner', image: '', title: '📦 ارسال سریع به سراسر کشور', subtitle: 'سفارش دهید، درب منزل تحویل بگیرید',
    description: 'ارسال ۲۴ تا ۴۸ ساعته با بسته‌بندی بهداشتی و زنجیره سرد. ضمانت بازگشت کالا تا ۴۸ ساعت پس از تحویل.',
    buttonText: 'سفارش دهید', buttonLink: '/products',
  },
]

export default function HeroSection() {
  const sectionRef = useRef(null)
  const [settings, setSettings] = useState(null)
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const intervalRef = useRef(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      setSettings(data)
      if (data.heroShowProducts || data.heroSlides?.some(s => s.type === 'products')) {
        axios.get('/api/products', { params: { limit: 8, sort: '-createdAt' } })
          .then(({ data: d }) => setProducts(d.items || d || []))
          .catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const slides = settings?.heroSlides?.filter(s => s.active !== false) || defaultSlides
  const totalSlides = slides.length

  const goTo = useCallback((idx) => {
    setDirection(idx > currentSlide ? 1 : -1)
    setCurrentSlide(idx)
  }, [currentSlide])

  const next = useCallback(() => {
    setDirection(1)
    setCurrentSlide(prev => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (totalSlides <= 1) return
    intervalRef.current = setInterval(next, 5000)
    return () => clearInterval(intervalRef.current)
  }, [totalSlides, next])

  const slide = slides[currentSlide] || slides[0]
  const isBanner = slide?.type === 'banner' || !slide?.type
  const isProducts = slide?.type === 'products'
  const isPromo = slide?.type === 'promo'

  const bgImage = slide?.image || settings?.heroImage
  const brandName = getText(settings?.heroBrandName) || 'DEH NESHIN'
  const heroTitle = getText(settings?.heroTitle) || 'ده نشین'
  const heroSubtitle = getText(settings?.heroSubtitle) || 'طبیعت پاک · محصولات سالم · از مزرعه تا سفره'

  const slideTitle = getText(slide?.title)
  const slideSubtitle = getText(slide?.subtitle)
  const slideDesc = getText(slide?.description)
  const slideBtn = getText(slide?.buttonText) || 'مشاهده محصولات'
  const slideLink = slide?.buttonLink || '/products'
  const showButtons = settings?.showHeroButtons !== false

  const showDefaultHeader = isBanner && !slideTitle && !slideSubtitle && !slideDesc

  const productList = products.slice(0, 6)

  const slideTypeLabels = { banner: 'معرفی', products: 'محصولات', promo: 'تخفیف' }
  const slideIcons = { banner: '🌿', products: '📦', promo: '🔥' }

  const variantMap = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.97 }),
  }

  const textVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.12, duration: 0.5 } }),
  }

  const logoUrl = settings?.logoImage_fa || settings?.logoImage_en || null

  return (
    <section ref={sectionRef} style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: bgImage ? `url(${bgImage}) center/cover no-repeat fixed` : 'radial-gradient(ellipse at 50% 30%, #1A2E1A 0%, #0A1A0A 50%, #050D05 100%)',
    }}>
      {!bgImage && <ThreeScene logoUrl={logoUrl} />}

      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)',
        zIndex: 1,
      }} />

      {/* Slide Progress Bar */}
      {totalSlides > 1 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, height: 3, zIndex: 15,
          background: 'linear-gradient(90deg, #4CAF50, #66BB6A)',
          width: `${((currentSlide + 1) / totalSlides) * 100}%`,
          transition: 'width 5s linear',
        }} />
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variantMap}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: '950px', width: '100%' }}
        >
          {showDefaultHeader ? (
            <>
              <motion.div custom={0} variants={textVariant} initial="hidden" animate="visible"
                style={{ marginBottom: 10, fontSize: 32, color: '#4CAF50', filter: 'drop-shadow(0 0 10px rgba(76,175,80,0.5))' }}>
                🍃
              </motion.div>
              <motion.p custom={1} variants={textVariant} initial="hidden" animate="visible"
                style={{ color: '#D4AF37', fontSize: '0.85rem', letterSpacing: '6px', marginBottom: '16px', fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
                {brandName}
              </motion.p>
              <motion.h1 custom={2} variants={textVariant} initial="hidden" animate="visible"
                style={{
                  fontSize: 'clamp(2.8rem, 9vw, 6rem)', fontWeight: 900,
                  background: 'linear-gradient(135deg, #B8960F, #D4AF37, #E8C84A, #F5E6C8, #D4AF37, #B8960F)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1.15, marginBottom: '8px', fontFamily: "'Playfair Display', serif",
                  animation: 'goldShine 4s ease infinite', letterSpacing: '1px',
                }}>
                {heroTitle}
              </motion.h1>
              <motion.div custom={3} variants={textVariant} initial="hidden" animate="visible"
                style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, #D4AF37, #E8C84A, #D4AF37, transparent)', margin: '16px auto' }} />
              <motion.h2 custom={4} variants={textVariant} initial="hidden" animate="visible"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: '#E8D5B0', fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px', letterSpacing: '3px' }}>
                {heroSubtitle}
              </motion.h2>
              <motion.p custom={5} variants={textVariant} initial="hidden" animate="visible"
                style={{ color: '#8A7A60', fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)', lineHeight: 1.8, maxWidth: '550px', margin: '0 auto 36px', fontFamily: "'Cormorant Garamond', serif" }}>
                {settings?.heroDescription || 'محصولات ارگانیک و طبیعی را مستقیماً از کشاورزان معتمد تهیه کنید.'}
              </motion.p>
              {showButtons && (
                <motion.div custom={6} variants={textVariant} initial="hidden" animate="visible"
                  style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to={slideLink}>
                    <motion.button whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(212,175,55,0.5)' }} whileTap={{ scale: 0.95 }}
                      style={{ background: 'linear-gradient(135deg, #B8960F, #D4AF37, #E8C84A)', color: '#111', padding: '14px 40px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
                      {slideBtn}
                    </motion.button>
                  </Link>
                  <Link to="/contact">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ background: 'transparent', color: '#D4AF37', padding: '14px 40px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #D4AF37', cursor: 'pointer' }}>
                      تماس با ما
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {slideTitle && (
                <motion.h1 custom={0} variants={textVariant} initial="hidden" animate="visible"
                  style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, color: '#FFF', lineHeight: 1.15, marginBottom: '12px', fontFamily: "'Playfair Display', serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                  {slideTitle}
                </motion.h1>
              )}
              {slideSubtitle && (
                <motion.h2 custom={1} variants={textVariant} initial="hidden" animate="visible"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', color: '#D4AF37', fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>
                  {slideSubtitle}
                </motion.h2>
              )}
              {slideDesc && (
                <motion.p custom={2} variants={textVariant} initial="hidden" animate="visible"
                  style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.85rem, 1.2vw, 1rem)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 32px' }}>
                  {slideDesc}
                </motion.p>
              )}
              <motion.div custom={3} variants={textVariant} initial="hidden" animate="visible"
                style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={slideLink}>
                  <motion.button whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(76,175,80,0.5)' }} whileTap={{ scale: 0.95 }}
                    style={{ background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#FFF', padding: '15px 44px', borderRadius: '50px', fontSize: '0.95rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 6px 25px rgba(76,175,80,0.3)' }}>
                    {slideBtn}
                  </motion.button>
                </Link>
              </motion.div>
            </>
          )}

          {/* Products Slide */}
          {isProducts && productList.length > 0 && (
            <motion.div custom={3} variants={textVariant} initial="hidden" animate="visible"
              style={{ marginTop: 40 }}>
              <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 400, letterSpacing: '3px', marginBottom: 20 }}>
                {getText(slide?.productsTitle) || 'جدیدترین محصولات'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, maxWidth: 800, margin: '0 auto' }}>
                {productList.map((p, i) => {
                  const saleP = parsePrice(p?.salePrice)
                  const origP = parsePrice(p?.price)
                  let imgs = p.images
                  if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
                  const img = Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
                  return (
                    <motion.div key={p._id} whileHover={{ y: -4, borderColor: '#4CAF50' }}
                      style={{
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                        borderRadius: 12, padding: 12, textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s',
                      }}>
                      {img ? (
                        <img src={img} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      ) : (
                        <div style={{ height: 70, borderRadius: 8, background: 'rgba(76,175,80,0.2)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🥬</div>
                      )}
                      <div style={{ color: '#E8D5B0', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        {p.name}
                      </div>
                      <div style={{ color: saleP > 0 ? '#EF5350' : '#4CAF50', fontSize: 12, fontWeight: 700 }}>
                        {(saleP > 0 ? saleP : origP).toLocaleString()} تومان
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Promo Slide */}
          {isPromo && (
            <motion.div custom={2} variants={textVariant} initial="hidden" animate="visible"
              style={{ marginTop: 32 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 20,
                background: 'linear-gradient(135deg, rgba(229,57,53,0.25), rgba(229,57,53,0.08))',
                border: '1px solid rgba(229,57,53,0.35)', borderRadius: 24,
                padding: '20px 40px', backdropFilter: 'blur(12px)',
              }}>
                <span style={{ fontSize: 52 }}>🔥</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FF6B6B', fontSize: 20, fontWeight: 700 }}>
                    {getText(slide?.promoTitle) || 'تخفیف ویژه'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
                    {getText(slide?.promoDescription) || 'تا ۳۰٪ تخفیف روی محصولات منتخب'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Slide Type Badge */}
      <div style={{
        position: 'absolute', top: 40, right: 40, zIndex: 15,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
        borderRadius: 20, padding: '6px 16px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>{slideIcons[slide?.type] || '🌿'}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>
          {slideTypeLabels[slide?.type] || 'معرفی'}
        </span>
      </div>

      {/* Slide Counter */}
      <div style={{
        position: 'absolute', top: 40, left: 40, zIndex: 15,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
        borderRadius: 20, padding: '6px 16px',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </span>
      </div>

      {/* Slider Navigation */}
      {totalSlides > 1 && (
        <>
          <motion.button onClick={prev} whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.3)', color: '#FFF', fontSize: 20, cursor: 'pointer',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: '0.3s',
            }}>
            ‹
          </motion.button>
          <motion.button onClick={next} whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.3)', color: '#FFF', fontSize: 20, cursor: 'pointer',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: '0.3s',
            }}>
            ›
          </motion.button>
          <div style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  width: i === currentSlide ? 32 : 10, height: 10, borderRadius: 5,
                  border: 'none', cursor: 'pointer', transition: 'all 0.4s ease',
                  background: i === currentSlide ? '#4CAF50' : 'rgba(255,255,255,0.25)',
                  boxShadow: i === currentSlide ? '0 0 12px rgba(76,175,80,0.5)' : 'none',
                }} />
            ))}
          </div>
        </>
      )}

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, color: '#D4AF37', fontSize: '1rem', opacity: 0.4, fontFamily: "'Cormorant Garamond', serif", letterSpacing: '3px' }}>
        Scroll ↓
      </motion.div>

      <style>{`@keyframes goldShine { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>
    </section>
  )
}
