import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductViewer({ images = [], onImageEnter, onImageLeave }) {
  const [current, setCurrent] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%', aspectRatio: '1/1', maxHeight: 500,
        background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, position: 'relative', overflow: 'hidden',
      }}>
        🌿
      </div>
    )
  }

  return (
    <>
      <div style={{ position: 'relative', width: '100%', maxHeight: 500, borderRadius: 16, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={onImageEnter}
            onMouseLeave={onImageLeave}
            onClick={() => setFullscreen(true)}
            style={{ cursor: 'pointer', width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 16, background: '#F5F0E8' }}
          >
            <img src={images[current]} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.4)', color: '#FFF', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ‹
            </button>
            <button onClick={() => setCurrent(c => (c + 1) % images.length)}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.4)', color: '#FFF', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ›
            </button>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === current ? '#4CAF50' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {images.map((img, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{
                width: 64, height: 64, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: i === current ? '2px solid #4CAF50' : '2px solid transparent',
                opacity: i === current ? 1 : 0.6, transition: 'all 0.2s',
              }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {fullscreen && (
        <div onClick={() => setFullscreen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 20 }}>
          <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={images[current]} alt=""
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#FFF', fontSize: 20, cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}
    </>
  )
}
