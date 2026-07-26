import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const styles = {
  section: { padding: '60px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 20px' },
  title: { color: '#D4AF37', textAlign: 'center', fontSize: 28, marginBottom: 8 },
  subtitle: { color: '#F5E6C8', textAlign: 'center', fontSize: 14, marginBottom: 40, opacity: 0.7 },
  imgWrap: { overflow: 'hidden', borderRadius: 8, cursor: 'pointer', position: 'relative' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', display: 'block', imageRendering: 'auto' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: 12, textAlign: 'center' },
}

const gridCols = { grid: 3, masonry: 4, carousel: 1, slideshow: 1 }

export default function Gallery() {
  const [settings, setSettings] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const { getText, lang } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const gs = settings?.gallerySettings
  const type = gs?.type || 'grid'
  const images = gs?.images || []

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActiveIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (type !== 'slideshow') return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [type, next])

  if (!gs?.images?.length) return null

  const title = settings?.galleryTitle
  const subtitle = settings?.gallerySubtitle

  const isRtl = lang === 'fa' || lang === 'ar'

  if (type === 'carousel') {
    return (
      <div style={styles.section}>
        <div style={styles.container}>
          {title && <h2 style={styles.title}>{getText(title)}</h2>}
          {subtitle && <p style={styles.subtitle}>{getText(subtitle)}</p>}
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ overflow: 'hidden', borderRadius: 12, position: 'relative', height: 500 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.5s', opacity: i === activeIdx ? 1 : 0 }}>
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', imageRendering: 'auto', background: '#0a0a0a' }} />
                {img.title?.[lang] && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', textAlign: 'center', fontSize: 14 }}>{img.title[lang]}</div>}
              </div>
            ))}
          </div>
          <button onClick={prev} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer' }}>{isRtl ? '→' : '←'}</button>
          <button onClick={next} style={{ position: 'absolute', [isRtl ? 'left' : 'right']: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer' }}>{isRtl ? '←' : '→'}</button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: i === activeIdx ? '#D4AF37' : '#555', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'slideshow') {
    return (
      <div style={{ ...styles.section, background: '#111' }}>
        <div style={{ position: 'relative', height: '80vh', minHeight: 400, overflow: 'hidden' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, transition: 'opacity 1s', opacity: i === activeIdx ? 1 : 0 }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', imageRendering: 'auto', background: '#0a0a0a' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
              {img.title?.[lang] && <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 28, fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>{img.title[lang]}</div>}
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', background: i === activeIdx ? '#D4AF37' : 'transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isMasonry = type === 'masonry'
  const cols = gridCols[type] || 3

  return (
    <div style={styles.section}>
      <div style={styles.container}>
        {title && <h2 style={styles.title}>{getText(title)}</h2>}
        {subtitle && <p style={styles.subtitle}>{getText(subtitle)}</p>}
        <div style={{ columnCount: isMasonry ? cols : 1, columnGap: 12 }}>
          {isMasonry ? (
            images.map((img, i) => (
              <div key={i} style={{ ...styles.imgWrap, marginBottom: 12, breakInside: 'avoid', borderRadius: 8 }}>
                <img src={img.url} alt="" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, imageRendering: 'auto' }} />
                {img.title?.[lang] && <div style={styles.overlay}>{img.title[lang]}</div>}
              </div>
            ))
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ ...styles.imgWrap, aspectRatio: '16/10', maxHeight: 300 }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', imageRendering: 'auto', background: '#0a0a0a' }} />
                  {img.title?.[lang] && <div style={styles.overlay}>{img.title[lang]}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
