import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import ScrollReveal from '../components/ScrollReveal'
import useSEO from '../hooks/useSEO'
import { parsePrice } from '../utils/price'

const searchableProducts = [
  { id: 1, type: 'product', url: '/products/1', title: 'سیب قرمز ارگانیک', description: 'سیب قرمز درختی از باغ‌های دماوند، بدون سم و کود شیمیایی', category: 'fruits', tags: ['سیب', 'میوه', 'ارگانیک', 'apple', 'fruit'] },
  { id: 2, type: 'product', url: '/products/2', title: 'پرتقال ارگانیک', description: 'پرتقال تازه شمال، سرشار از ویتامین C', category: 'fruits', tags: ['پرتقال', 'میوه', 'ویتامین', 'orange', 'vitamin'] },
  { id: 3, type: 'product', url: '/products/3', title: 'گوجه فرنگی ارگانیک', description: 'گوجه فرنگی گلخانه‌ای بدون سم، طعم واقعی', category: 'vegetables', tags: ['گوجه', 'سبزی', 'tomato', 'vegetable'] },
  { id: 4, type: 'product', url: '/products/4', title: 'خیار ارگانیک', description: 'خیار سبز ترد و خوش‌طعم از مزارع اصفهان', category: 'vegetables', tags: ['خیار', 'سبزی', 'cucumber'] },
  { id: 5, type: 'product', url: '/products/5', title: 'شیر محلی ارگانیک', description: 'شیر تازه گاو، بدون آنتی‌بیوتیک و هورمون', category: 'dairy', tags: ['شیر', 'لبنیات', 'milk', 'dairy'] },
  { id: 6, type: 'product', url: '/products/6', title: 'ماست سنتی', description: 'ماست محلی از شیر تازه، پروبیوتیک طبیعی', category: 'dairy', tags: ['ماست', 'لبنیات', 'yogurt'] },
  { id: 7, type: 'product', url: '/products/7', title: 'برنج طارم ارگانیک', description: 'برنج طارم اعلا، عطر و طعم بی‌نظیر', category: 'grains', tags: ['برنج', 'غلات', 'rice', 'grain'] },
  { id: 8, type: 'product', url: '/products/8', title: 'پسته اکبری', description: 'پسته اکبری رفسنجان، درشت و خوش‌طعم', category: 'nuts', tags: ['پسته', 'آجیل', 'خشکبار', 'pistachio', 'nut'] },
  { id: 9, type: 'product', url: '/products/9', title: 'عسل طبیعی کوهستان', description: 'عسل کوهستان سبلان، خالص و طبیعی', category: 'honey', tags: ['عسل', 'طبیعی', 'honey', 'natural'] },
  { id: 10, type: 'product', url: '/products/10', title: 'روغن زیتون فرابکر', description: 'روغن زیتون فرابکر رودبار، درجه یک', category: 'beverages', tags: ['روغن', 'زیتون', 'olive', 'oil'] },
  { id: 11, type: 'product', url: '/products/11', title: 'انار ارگانیک', description: 'انار ترش و شیرین ساوه، پرآب و خوشمزه', category: 'fruits', tags: ['انار', 'میوه', 'pomegranate'] },
  { id: 12, type: 'product', url: '/products/12', title: 'کاهو ارگانیک', description: 'کاهو سبز تازه و ترد از مزارع ورامین', category: 'vegetables', tags: ['کاهو', 'سبزی', 'lettuce'] },
]

function fullTextSearch(query, items) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)
  return items.filter(item => {
    const searchText = [item.title, item.description, item.category, ...(item.tags || [])].join(' ').toLowerCase()
    return terms.some(term => searchText.includes(term))
  })
}

export default function SearchResults() {
  useSEO({ title: 'جستجو | ده نشین', description: 'جستجوی محصولات و مقالات در ده نشین' })
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [counts, setCounts] = useState({ products: 0, articles: 0 })
  const [loading, setLoading] = useState(false)
  const [inputVal, setInputVal] = useState(query)
  const { lang, t, getText } = useLanguage()

  useEffect(() => {
    if (!query) { setResults([]); setCounts({ products: 0, articles: 0 }); return }
    setLoading(true)
    axios.get('/api/search', { params: { q: query }, timeout: 3000 })
      .then(({ data }) => {
        setResults(data.results || [])
        setCounts(data.counts || { products: 0, articles: 0 })
      })
      .catch(() => {
        const matched = fullTextSearch(query, searchableProducts)
        setResults(matched)
        setCounts({ products: matched.filter(r => r.type === 'product').length, articles: matched.filter(r => r.type === 'article').length })
      })
      .finally(() => setLoading(false))
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() })
  }

  const typeLabel = (type) => {
    if (type === 'product') return t('products')
    if (type === 'article') return t('articles')
    return type
  }

  const typeColor = (type) => {
    if (type === 'product') return '#4CAF50'
    if (type === 'article') return '#388E3C'
    return '#888'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{
        padding: '120px 40px 50px', textAlign: 'center',
        background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2D2D2D', marginBottom: 8 }}
        >
          {t('search')}
        </motion.h1>
        <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: '24px auto 0', display: 'flex', gap: 8 }}>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)',
              background: '#F5F0E8', color: '#2D2D2D', fontSize: '1rem',
              outline: 'none', transition: 'border-color 0.3s',
            }}
            onFocus={e => e.target.style.borderColor = '#4CAF50'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
          />
          <button type="submit" style={{
            padding: '12px 28px', borderRadius: 8, border: 'none',
            background: '#4CAF50', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
          }}>{t('search')}</button>
        </form>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        {!query && (
          <div style={{ textAlign: 'center', padding: 80, color: '#6B6B6B' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: '1.1rem' }}>{t('searchPlaceholder')}</p>
          </div>
        )}

        {query && loading && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 40, height: 40, border: '3px solid rgba(76,175,80,0.2)', borderTopColor: '#4CAF50', borderRadius: '50%', margin: '0 auto 20px' }}
            />
            <div style={{ color: '#6B6B6B', fontSize: '1.2rem' }}>{t('loading')}</div>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#6B6B6B' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>{t('noResults')}</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>«{query}»</p>
          </div>
        )}

        {query && !loading && results.length > 0 && (
          <>
            <div style={{
              display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32,
              padding: '16px 20px', background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <span style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>
                {results.length} نتیجه برای «{query}»
              </span>
              {counts.products > 0 && (
                <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>
                  {counts.products} محصول |
                </span>
              )}
              {counts.articles > 0 && (
                <span style={{ color: '#388E3C', fontSize: '0.85rem' }}>
                  {counts.articles} مقاله
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map((item, i) => (
                <ScrollReveal key={`${item.type}-${item.id}`} delay={i * 0.03}>
                  <Link to={item.url} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ x: 4, borderColor: '#4CAF50' }}
                      style={{
                        display: 'flex', gap: 20, alignItems: 'center',
                        padding: 20, borderRadius: 12,
                        background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.3s',
                      }}
                    >
                      {item.image && (
                        <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 600, padding: '2px 10px',
                            borderRadius: 20, background: typeColor(item.type), color: '#fff',
                          }}>
                            {typeLabel(item.type)}
                          </span>
                          {item.category && (
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{item.category}</span>
                          )}
                        </div>
                        <h3 style={{
                          margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#2D2D2D',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.title}
                        </h3>
                        <p style={{
                          margin: '4px 0 0', fontSize: '0.85rem', color: '#6B6B6B',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ color: '#4CAF50', fontSize: '0.8rem', flexShrink: 0 }}>
                        ←
                      </div>
                    </motion.div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
