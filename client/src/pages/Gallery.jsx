import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useSEO from '../hooks/useSEO'
import { useLanguage } from '../context/LanguageContext'

export default function Gallery() {
  useSEO({ title: 'گالری تصاویر | ده نشین', description: 'مجموعه تصاویر محصولات و آثار ده نشین' })
  const [settings, setSettings] = useState(null)
  const [activeCat, setActiveCat] = useState('all')
  const [lightbox, setLightbox] = useState({ open: false, idx: 0 })
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const gs = settings?.gallerySettings
  const allImages = gs?.images || []
  const categories = [...new Set(allImages.map(i => i.category).filter(Boolean))]
  const images = activeCat === 'all' ? allImages : allImages.filter(i => i.category === activeCat)

  const closeLightbox = () => setLightbox({ open: false, idx: 0 })
  const prevImg = () => setLightbox(prev => ({ ...prev, idx: prev.idx === 0 ? images.length - 1 : prev.idx - 1 }))
  const nextImg = () => setLightbox(prev => ({ ...prev, idx: prev.idx === images.length - 1 ? 0 : prev.idx + 1 }))

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightbox.open) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') prevImg()
      if (e.key === 'ArrowLeft') nextImg()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox.open])

  return (
    <div className="page-bg" style={{ minHeight: '100vh', paddingTop: 70 }}>
      <section className="section-padding">
        <div className="container">
          <h1 className="section-title">{getText(settings?.galleryTitle) || 'گالری تصاویر'}</h1>
          <p className="section-subtitle">{getText(settings?.gallerySubtitle) || 'مجموعه تصاویر محصولات و آثار ده نشین'}</p>

          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveCat('all')}
                style={{
                  padding: '6px 18px', borderRadius: 50, border: activeCat === 'all' ? '2px solid #D4AF37' : '1px solid #444',
                  background: activeCat === 'all' ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: activeCat === 'all' ? '#D4AF37' : '#999', cursor: 'pointer', fontSize: 13, fontWeight: activeCat === 'all' ? 700 : 400,
                }}>همه</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  style={{
                    padding: '6px 18px', borderRadius: 50, border: activeCat === cat ? '2px solid #D4AF37' : '1px solid #444',
                    background: activeCat === cat ? 'rgba(212,175,55,0.12)' : 'transparent',
                    color: activeCat === cat ? '#D4AF37' : '#999', cursor: 'pointer', fontSize: 13, fontWeight: activeCat === cat ? 700 : 400,
                  }}>{cat}</button>
              ))}
            </div>
          )}

          {images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#666', background: '#1a1a1a', borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🖼</div>
              <p>تصویری برای نمایش وجود ندارد</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {images.map((img, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => setLightbox({ open: true, idx: i })}
                  style={{
                    borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(212,175,55,0.1)',
                    background: '#1a1a1a', position: 'relative', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '100%', aspectRatio: '16/10',
                    background: img.url ? `url(${img.url}) center/cover no-repeat #0a0a0a` : 'linear-gradient(135deg, #2C1810, #D4AF37)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!img.url && <span style={{ fontSize: 48, opacity: 0.3 }}>🪵</span>}
                  </div>
                  {img.category && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      padding: '3px 10px', borderRadius: 50,
                      background: 'rgba(0,0,0,0.5)', color: '#D4AF37',
                      fontSize: 10, border: '1px solid rgba(212,175,55,0.2)',
                    }}>{img.category}</span>
                  )}
                  {img.title?.['fa'] && (
                    <div style={{ padding: '12px 16px' }}>
                      <p style={{ color: '#D4AF37', fontSize: 13, margin: 0 }}>{img.title['fa']}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {lightbox.open && images[lightbox.idx] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
                style={{
                  position: 'fixed', inset: 0, zIndex: 3000,
                  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <motion.div
                  key={lightbox.idx}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={e => e.stopPropagation()}
                  style={{ maxWidth: '90vw', maxHeight: '85vh', position: 'relative' }}
                >
                  {images[lightbox.idx].url ? (
                    <img src={images[lightbox.idx].url} alt=""
                      style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: 400, height: 300, borderRadius: 12,
                      background: 'linear-gradient(135deg, #2C1810, #D4AF37)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64,
                    }}>🪵</div>
                  )}
                  {images[lightbox.idx].title?.['fa'] && (
                    <p style={{
                      textAlign: 'center', color: '#D4AF37', fontSize: 14, marginTop: 12,
                    }}>{images[lightbox.idx].title['fa']}</p>
                  )}
                </motion.div>

                <button onClick={prevImg}
                  style={{
                    position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#D4AF37', fontSize: 18, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>◀</button>
                <button onClick={nextImg}
                  style={{
                    position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#D4AF37', fontSize: 18, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>▶</button>

                <div style={{
                  position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 6,
                }}>
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setLightbox(prev => ({ ...prev, idx: i }))}
                      style={{
                        width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: i === lightbox.idx ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                      }} />
                  ))}
                </div>

                <button onClick={closeLightbox}
                  style={{
                    position: 'fixed', top: 20, left: 20,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: '#fff', fontSize: 16, cursor: 'pointer',
                  }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
