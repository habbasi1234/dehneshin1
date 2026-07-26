import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

const fallbackBanners = [
  {
    image: '',
    title: 'ده نشین',
    subtitle: 'هنر اصیل نجاری · طراحی نئوکلاسیک · تجمل بی‌نظیر',
    link: '/products',
    active: true,
  },
]

export default function BannerSlider({ banners }) {
  const { getText } = useLanguage()
  const [current, setCurrent] = useState(0)
  const activeBanners = (banners?.length ? banners : fallbackBanners).filter(b => b.active)
  const total = activeBanners.length
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const next = useCallback(() => setCurrent(prev => (prev + 1) % total), [total])
  const prev = useCallback(() => setCurrent(prev => (prev - 1 + total) % total), [total])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [total, next])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMouseX(x)
      setMouseY(y)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (total === 0) return null

  const banner = activeBanners[current]

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      perspective: '1200px',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, rotateY: 45, scale: 0.85, x: 200 }}
          animate={{
            opacity: 1, rotateY: 0, scale: 1, x: 0,
            transition: { type: 'spring', stiffness: 80, damping: 20 },
          }}
          exit={{
            opacity: 0, rotateY: -45, scale: 0.85, x: -200,
            transition: { duration: 0.5 },
          }}
          style={{
            position: 'absolute', inset: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${mouseY * -3}deg) rotateY(${mouseX * 3}deg)`,
            background: banner.image
              ? `url(${banner.image}) center/cover no-repeat`
              : 'radial-gradient(ellipse at 50% 30%, #1A1A1A 0%, #0A0A0A 50%, #000000 100%)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(13,43,26,0.1) 0%, rgba(13,43,26,0.4) 40%, rgba(13,43,26,0.85) 100%)',
          }} />
          <div style={{
            position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', height: '100%',
            padding: '0 20px', textAlign: 'center',
            transform: 'translateZ(60px)',
          }}>
            {banner.title && (
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                style={{
                  fontSize: 'clamp(2rem, 6vw, 4rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #D4AF37, #E8C84A, #F5E6C8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Playfair Display', serif",
                  margin: '0 0 12px',
                }}
              >
                {getText(banner.title)}
              </motion.h1>
            )}
            {banner.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  color: '#C0B090', fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
                  fontFamily: "'Cormorant Garamond', serif",
                  maxWidth: 600, margin: '0 0 24px',
                }}
              >
                {getText(banner.subtitle)}
              </motion.p>
            )}
            {banner.link && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link to={banner.link}>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(212,175,55,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'linear-gradient(135deg, #B8960F, #D4AF37, #E8C84A)',
                      color: '#111', padding: '12px 36px', borderRadius: '50px',
                      fontSize: '0.9rem', fontWeight: 700, border: 'none',
                      cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
                    }}
                  >
                    مشاهده
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {current > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{
            opacity: 0.15, x: 0, scale: 0.7,
            rotateY: -30,
            transition: { duration: 0.6 },
          }}
          style={{
            position: 'absolute', left: '-8%', top: '10%', width: '40%', height: '80%',
            transformStyle: 'preserve-3d',
            borderRadius: 16, overflow: 'hidden',
            background: activeBanners[(current - 1 + total) % total].image
              ? `url(${activeBanners[(current - 1 + total) % total].image}) center/cover no-repeat`
              : '#111',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        />
      )}

      {current < total - 1 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{
            opacity: 0.15, x: 0, scale: 0.7,
            rotateY: 30,
            transition: { duration: 0.6 },
          }}
          style={{
            position: 'absolute', right: '-8%', top: '10%', width: '40%', height: '80%',
            transformStyle: 'preserve-3d',
            borderRadius: 16, overflow: 'hidden',
            background: activeBanners[(current + 1) % total].image
              ? `url(${activeBanners[(current + 1) % total].image}) center/cover no-repeat`
              : '#111',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 4,
      }} />

      {total > 1 && (
        <>
          <button onClick={prev} style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 5, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.4)',
            color: '#D4AF37', width: 48, height: 48, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
          >◀</button>
          <button onClick={next} style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 5, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.4)',
            color: '#D4AF37', width: 48, height: 48, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
          >▶</button>
          <div style={{
            position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
            zIndex: 5, display: 'flex', gap: 8,
          }}>
            {activeBanners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 28 : 10, height: 10, borderRadius: 5,
                background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
