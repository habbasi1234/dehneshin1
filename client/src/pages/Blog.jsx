import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ScrollReveal from '../components/ScrollReveal'
import { usePageTracking } from '../hooks/useTracking'
import useSEO from '../hooks/useSEO'

const colorPalette = ['#2C1810', '#D4AF37', '#5C3A1E', '#333', '#8B4513', '#1A1A1A']

const getYoutubeId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Blog() {
  useSEO({ title: 'مقالات | ده نشین', description: 'جدیدترین مطالب در زمینه دکوراسیون داخلی، مبلمان کلاسیک و مدرن، و نکات خرید از ده نشین' })
  usePageTracking()
  const [articles, setArticles] = useState([])
  const [rssItems, setRssItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [activeTab, setActiveTab] = useState('articles')
  const [activeCat, setActiveCat] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      setSettings(data)
      const feeds = data.rssFeeds || []
      const promises = feeds.filter(f => f.enabled !== false && f.url).map(f =>
        axios.get('/api/rss/fetch', {
          params: { url: f.url, count: data.rssCount || 10, categories: f.category || '' }
        }).then(({ data: rss }) => ({
          label: f.label || f.category || 'RSS',
          items: (rss.items || []).map(item => ({
            title: item.title,
            cat: f.category || item.category || 'RSS',
            desc: item.description,
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('fa-IR') : '',
            link: item.link,
            isRss: true,
            source: f.label || '',
          }))
        })).catch(() => null)
      )
      Promise.all(promises).then(results => {
        const allItems = results.filter(Boolean).flatMap(r => r.items)
        setRssItems(allItems)
      })
    }).catch(() => {})

    axios.get('/api/content/blog').then(({ data }) => {
      setArticles(data.map(a => ({
        ...a, cat: a.cat || a.category || '',
      })))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const allCategories = useMemo(() => {
    const cats = new Set()
    articles.forEach(a => { if (a.cat) cats.add(a.cat) })
    return ['all', ...Array.from(cats)]
  }, [articles])

  const allRssCategories = useMemo(() => {
    const cats = new Set()
    rssItems.forEach(a => { if (a.cat) cats.add(a.cat) })
    return ['all', ...Array.from(cats)]
  }, [rssItems])

  const filtered = useMemo(() => {
    let items
    if (activeTab === 'rss') {
      items = rssItems
    } else {
      items = articles
    }
    if (activeCat !== 'all') items = items.filter(a => a.cat === activeCat || a.category === activeCat)
    return items
  }, [activeTab, activeCat, articles, rssItems])

  const openArticle = (a) => setSelectedArticle(a)
  const closeArticle = () => setSelectedArticle(null)

  const renderMedia = (article) => {
    const ytId = getYoutubeId(article.video)
    return (
      <>
        {article.image && (
          <div style={{ width: '100%', height: 200, overflow: 'hidden', flexShrink: 0 }}>
            <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {article.image2 && (
          <div style={{ width: '100%', height: 160, overflow: 'hidden', flexShrink: 0 }}>
            <img src={article.image2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {ytId && (
          <div style={{ width: '100%', aspectRatio: '16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${ytId}`} title="video" allowFullScreen style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
          </div>
        )}
        {!ytId && article.video && !article.audio && (
          <video controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}>
            <source src={article.video} />
          </video>
        )}
        {article.audio && (
          <audio controls style={{ width: '100%', marginTop: 8 }}>
            <source src={article.audio} />
          </audio>
        )}
      </>
    )
  }

  const renderCard = (article, i) => {
    const isRss = article.isRss
    const hasImage = article.image || article.image2
    return (
      <ScrollReveal key={article._id || i} delay={i * 0.05}>
        <motion.div whileHover={{ y: -8, scale: 1.015 }}
          onClick={() => isRss ? article.link && window.open(article.link, '_blank') : openArticle(article)}
          style={{ borderRadius: '20px', overflow: 'hidden', background: isRss ? 'linear-gradient(135deg, rgba(155,89,182,0.05), rgba(44,24,16,0.2))' : 'linear-gradient(135deg, rgba(212,175,55,0.03), rgba(44,24,16,0.3))', border: `1px solid ${isRss ? 'rgba(155,89,182,0.2)' : 'rgba(212,175,55,0.1)'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          {hasImage ? (
            <div style={{ width: '100%', height: 200, overflow: 'hidden', flexShrink: 0 }}>
              <img src={article.image || article.image2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {isRss && <span style={{ position: 'absolute', top: 10, left: 10, background: '#9B59B6', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>RSS</span>}
            </div>
          ) : (
            <div style={{ height: 160, background: `linear-gradient(135deg, ${isRss ? '#9B59B6' : colorPalette[i % 6]}, #111)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.5 }}>
              {isRss ? '📡' : '📰'}
            </div>
          )}
          <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', padding: '3px 10px', background: isRss ? 'rgba(155,89,182,0.2)' : 'rgba(212,175,55,0.15)', borderRadius: '50px', color: isRss ? '#BB86FC' : '#D4AF37', fontSize: '0.7rem' }}>
                {article.cat || 'عمومی'}
              </span>
              {article.subcategory && <span style={{ fontSize: 11, color: '#666' }}>/ {article.subcategory}</span>}
              {article.video && <span style={{ fontSize: 14 }}>🎬</span>}
              {article.audio && <span style={{ fontSize: 14 }}>🎵</span>}
              {isRss && <span style={{ fontSize: 10, color: '#9B59B6' }}>RSS</span>}
            </div>
            <h3 style={{ color: '#F5E6C8', fontSize: '1.05rem', marginBottom: 8, lineHeight: 1.5 }}>{article.title}</h3>
            <p style={{ color: '#C0B090', fontSize: '0.82rem', lineHeight: 1.7, flex: 1 }}>{article.description || article.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>{article.date}</span>
              <span style={{ color: isRss ? '#BB86FC' : '#D4AF37', fontSize: '0.8rem' }}>{isRss ? '🔗 منبع' : 'ادامه ←'}</span>
            </div>
          </div>
        </motion.div>
      </ScrollReveal>
    )
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <section className="section-padding" style={{ background: 'var(--theme-bg, #111)', minHeight: '100vh' }}>
        <div className="container">
          <ScrollReveal>
            <h1 className="section-title">مقالات دکوراسیون</h1>
            <p className="section-subtitle">جدیدترین مطالب در زمینه دکوراسیون و مبلمان</p>
          </ScrollReveal>

          {/* Tabs: Articles / RSS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 30 }}>
          {[
            { key: 'articles', label: `مقالات (${articles.length})`, icon: '📰' },
            { key: 'rss', label: `خبرهای RSS (${rssItems.length})`, icon: '📡' },
          ].filter(t => t.key !== 'rss' || rssItems.length > 0).map(tab => (
              <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setActiveTab(tab.key); setActiveCat('all'); setSelectedArticle(null) }}
                style={{
                  padding: '10px 24px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #D4AF37, #8B6914)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === tab.key ? '#111' : '#F5E6C8', fontWeight: 'bold', fontSize: 14,
                  transition: 'all 0.3s',
                }}
              >{tab.icon} {tab.label}</motion.button>
            ))}
          </div>

          {activeTab === 'articles' && allCategories.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {allCategories.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  style={{
                    padding: '6px 16px', borderRadius: 50, border: activeCat === c ? '1px solid #D4AF37' : '1px solid #333',
                    background: activeCat === c ? 'rgba(212,175,55,0.12)' : 'transparent',
                    color: activeCat === c ? '#D4AF37' : '#999', cursor: 'pointer', fontSize: 13, transition: 'all 0.3s',
                  }}
                >{c === 'all' ? 'همه' : c}</button>
              ))}
            </div>
          )}
          {activeTab === 'rss' && allRssCategories.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {allRssCategories.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  style={{
                    padding: '6px 16px', borderRadius: 50, border: activeCat === c ? '1px solid #BB86FC' : '1px solid #333',
                    background: activeCat === c ? 'rgba(155,89,182,0.12)' : 'transparent',
                    color: activeCat === c ? '#BB86FC' : '#999', cursor: 'pointer', fontSize: 13, transition: 'all 0.3s',
                  }}
                >{c === 'all' ? 'همه' : c}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: 48, height: 48, border: '3px solid rgba(212,175,55,0.15)', borderTop: '3px solid #D4AF37', borderRadius: '50%' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
              {filtered.map((article, i) => renderCard(article, i))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
              <p>مطلبی یافت نشد</p>
            </div>
          )}

          {activeTab === 'rss' && rssItems.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: '#666' }}>
              {(() => {
                const sources = [...new Set(rssItems.filter(i => i.source).map(i => i.source))]
                return sources.length > 0 ? `منابع: ${sources.join('، ')}` : ''
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Modal - Portal to body */}
      {selectedArticle && createPortal(
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeArticle}
          style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#1a1a1a', borderRadius: 20, maxWidth: 800, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(212,175,55,0.2)' }}>
            {selectedArticle.image && (
              <img src={selectedArticle.image} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
            )}
            <div style={{ padding: 30 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', background: 'rgba(212,175,55,0.15)', borderRadius: 50, color: '#D4AF37', fontSize: 12 }}>
                  {selectedArticle.cat || selectedArticle.category || 'عمومی'}
                </span>
                {selectedArticle.subcategory && <span style={{ color: '#888', fontSize: 12 }}>/ {selectedArticle.subcategory}</span>}
                <span style={{ color: '#666', fontSize: 12, marginRight: 'auto' }}>{selectedArticle.date}</span>
              </div>
              <h2 style={{ color: '#F5E6C8', fontSize: 22, marginBottom: 16 }}>{selectedArticle.title}</h2>

              {selectedArticle.image2 && (
                <img src={selectedArticle.image2} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
              )}
              {selectedArticle.image3 && (
                <img src={selectedArticle.image3} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
              )}

              {(() => {
                const ytId = getYoutubeId(selectedArticle.video)
                if (ytId) return <div style={{ width: '100%', aspectRatio: '16/9', marginBottom: 16 }}><iframe src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }} /></div>
                if (selectedArticle.video && !selectedArticle.audio) return <video controls style={{ width: '100%', maxHeight: 400, borderRadius: 12, marginBottom: 16 }}><source src={selectedArticle.video} /></video>
                return null
              })()}

              {selectedArticle.audio && (
                <div style={{ marginBottom: 16, background: '#222', borderRadius: 12, padding: 16 }}>
                  <div style={{ color: '#D4AF37', fontSize: 13, marginBottom: 8 }}>🎵 فایل صوتی</div>
                  <audio controls style={{ width: '100%' }}><source src={selectedArticle.audio} /></audio>
                </div>
              )}

              <div className="blog-content" style={{ color: '#C0B090', fontSize: 14, lineHeight: 2, whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.description }} />
              <button onClick={closeArticle} style={{
                marginTop: 20, padding: '10px 30px', background: '#333', color: '#F5E6C8',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              }}>بستن</button>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  )
}