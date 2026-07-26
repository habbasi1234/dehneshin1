import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import axios from 'axios'

export default function Gallery3D() {
  const [products, setProducts] = useState([])
  const [activeProduct, setActiveProduct] = useState(0)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const lastX = useRef(0)

  useEffect(() => {
    axios.get('/api/products?status=active').then(({ data }) => {
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 8)
      setProducts(shuffled)
    }).catch(() => {})
  }, [])

  const handleMouseDown = (e) => {
    isDragging.current = true
    lastX.current = e.clientX
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const delta = e.clientX - lastX.current
    setRotation(prev => prev + delta * 0.5)
    lastX.current = e.clientX
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const active = products[activeProduct]
  const images = active?.images
    ? (typeof active.images === 'string' ? JSON.parse(active.images) : active.images)
    : (active?.image ? [active.image] : [])
  const imgSrc = images[0] ? `/api/images/${images[0]}` : ''

  return (
    <section className="section-padding" style={{
      background: 'linear-gradient(180deg, #111111 0%, #0A0A0A 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="container">
        <ScrollReveal>
          <h2 className="section-title">گالری محصولات</h2>
          <p className="section-subtitle">
            مجموعه‌ای از آثار و محصولات ده نشین
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.05) 0%, transparent 70%)',
              borderRadius: '30px',
              padding: '60px 40px',
              border: '1px solid rgba(212,175,55,0.1)',
              cursor: 'grab',
              userSelect: 'none',
              position: 'relative',
              minHeight: '450px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {active ? (
              <motion.div
                animate={{ rotateY: rotation }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{
                  width: 280, height: 320,
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div style={{
                  width: '100%', height: '100%',
                  borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  position: 'relative',
                  transform: 'rotateY(15deg)',
                  background: '#0a0a0a', overflow: 'hidden',
                }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={active.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 60, opacity: 0.2 }}>🪑</span>
                  )}
                  <div style={{
                    position: 'absolute', top: 20, left: 20, right: 20, bottom: 20,
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '12px', pointerEvents: 'none',
                  }} />
                </div>
              </motion.div>
            ) : (
              <div style={{ color: '#888', fontSize: 14 }}>در حال بارگذاری محصولات...</div>
            )}

            <div style={{
              position: 'absolute', bottom: '50px',
              display: 'flex', gap: '10px',
            }}>
              {products.map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => { setActiveProduct(i); setRotation(0) }}
                  style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: i === activeProduct ? '#D4AF37' : 'rgba(212,175,55,0.3)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>

            <p style={{
              position: 'absolute', bottom: '20px',
              color: '#C0B090', fontSize: '0.8rem', opacity: 0.7,
            }}>
              برای چرخش، موس را بکشید
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
