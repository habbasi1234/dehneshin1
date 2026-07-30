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
  { id: 13, type: 'product', url: '/products/13', title: 'کیوی ارگانیک', description: 'کیوی سبز و ترش از باغ‌های گیلان', category: 'fruits', tags: ['کیوی', 'میوه', 'گیلان', 'kiwi'] },
  { id: 14, type: 'product', url: '/products/14', title: 'انگور ارگانیک', description: 'انگور شیرین و آبدار ملایر', category: 'fruits', tags: ['انگور', 'میوه', 'ملایر', 'grape'] },
  { id: 15, type: 'product', url: '/products/15', title: 'خرما مضافتی', description: 'خرما مضافتی بم، شیرین و مقوی', category: 'fruits', tags: ['خرما', 'مضافتی', 'بم', 'date'] },
  { id: 16, type: 'product', url: '/products/16', title: 'اسفناج ارگانیک', description: 'اسفناج تازه و سبز از مزارع دزفول', category: 'vegetables', tags: ['اسفناج', 'سبزی', 'دزفول', 'spinach'] },
  { id: 17, type: 'product', url: '/products/17', title: 'کلم بروکلی ارگانیک', description: 'کلم بروکلی سبز و خوشمزه شوشتر', category: 'vegetables', tags: ['کلم', 'بروکلی', 'شوشتر', 'broccoli'] },
  { id: 18, type: 'product', url: '/products/18', title: 'هویج ارگانیک', description: 'هویج شیرین و نارنجی محلات', category: 'vegetables', tags: ['هویج', 'سبزی', 'محلات', 'carrot'] },
  { id: 19, type: 'product', url: '/products/19', title: 'پنیر گوسفندی', description: 'پنیر گوسفندی سنتی و خوشمزه', category: 'dairy', tags: ['پنیر', 'گوسفندی', 'لبنیات', 'cheese'] },
  { id: 20, type: 'product', url: '/products/20', title: 'کره محلی', description: 'کره محلی از شیر تازه گاو', category: 'dairy', tags: ['کره', 'محلی', 'لبنیات', 'butter'] },
  { id: 21, type: 'product', url: '/products/21', title: 'دوغ سنتی', description: 'دوغ سنتی گازدار و خوشمزه', category: 'dairy', tags: ['دوغ', 'سنتی', 'لبنیات', 'doogh'] },
  { id: 22, type: 'product', url: '/products/22', title: 'لوبیا قرمز ارگانیک', description: 'لوبیا قرمز ارگانیک خمین', category: 'grains', tags: ['لوبیا', 'قرمز', 'خمین', 'beans'] },
  { id: 23, type: 'product', url: '/products/23', title: 'نخود ارگانیک', description: 'نخود ارگانیک کرمانشاه', category: 'grains', tags: ['نخود', 'کرمانشاه', 'chickpea'] },
  { id: 24, type: 'product', url: '/products/24', title: 'عدس ارگانیک', description: 'عدس ارگانیک لرستان', category: 'grains', tags: ['عدس', 'لرستان', 'lentil'] },
  { id: 25, type: 'product', url: '/products/25', title: 'گندم کامل ارگانیک', description: 'گندم کامل ارگانیک کردستان', category: 'grains', tags: ['گندم', 'کامل', 'کردستان', 'wheat'] },
  { id: 26, type: 'product', url: '/products/26', title: 'جو پوست کنده', description: 'جو پوست کنده ارگانیک همدان', category: 'grains', tags: ['جو', 'همدان', 'barley'] },
  { id: 27, type: 'product', url: '/products/27', title: 'گردوی تازه', description: 'گردوی تازه تویسرکان', category: 'nuts', tags: ['گردو', 'تازه', 'تویسرکان', 'walnut'] },
  { id: 28, type: 'product', url: '/products/28', title: 'بادام زمینی', description: 'بادام زمینی ارگانیک آستانه', category: 'nuts', tags: ['بادام', 'زمینی', 'آستانه', 'peanut'] },
  { id: 29, type: 'product', url: '/products/29', title: 'کشمش پلویی', description: 'کشمش پلویی شیرین ملایر', category: 'nuts', tags: ['کشمش', 'پلویی', 'ملایر', 'raisin'] },
  { id: 30, type: 'product', url: '/products/30', title: 'خرما پیارم', description: 'خرما پیارم حاجی‌آباد', category: 'nuts', tags: ['خرما', 'پیارم', 'date'] },
  { id: 31, type: 'product', url: '/products/31', title: 'عسل گون', description: 'عسل گون کوهستان کردستان', category: 'honey', tags: ['عسل', 'گون', 'کردستان', 'honey'] },
  { id: 32, type: 'product', url: '/products/32', title: 'بره موم (پروپولیس)', description: 'بره موم طبیعی مزرعه ده نشین', category: 'honey', tags: ['بره موم', 'پروپولیس', 'عسل', 'propolis'] },
  { id: 33, type: 'product', url: '/products/33', title: 'ژل رویال', description: 'ژل رویال طبیعی مزرعه ده نشین', category: 'honey', tags: ['ژل رویال', 'عسل', 'royal jelly'] },
  { id: 34, type: 'product', url: '/products/34', title: 'سرکه سیب طبیعی', description: 'سرکه سیب طبیعی مزرعه ده نشین', category: 'honey', tags: ['سرکه', 'سیب', 'vinegar'] },
  { id: 35, type: 'product', url: '/products/35', title: 'چای سبز ارگانیک', description: 'چای سبز ارگانیک لاهیجان', category: 'beverages', tags: ['چای', 'سبز', 'لاهیجان', 'tea'] },
  { id: 36, type: 'product', url: '/products/36', title: 'دمنوش نعناع', description: 'دمنوش نعناع مزرعه ده نشین', category: 'beverages', tags: ['دمنوش', 'نعناع', 'mint'] },
  { id: 37, type: 'product', url: '/products/37', title: 'دم کرده آویشن', description: 'دم کرده آویشن یزد', category: 'beverages', tags: ['آویشن', 'دمنوش', 'thyme'] },
  { id: 38, type: 'product', url: '/products/38', title: 'دم کرده بابونه', description: 'دم کرده بابونه مزرعه ده نشین', category: 'beverages', tags: ['بابونه', 'دمنوش', 'chamomile'] },
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
      <style>{`
        @media (max-width: 768px) {
          .search-header { padding: 100px 20px 40px !important; }
          .search-header h1 { font-size: 1.6rem !important; }
          .search-results-wrap { padding: 24px 16px !important; }
        }
        @media (max-width: 480px) {
          .search-header { padding: 90px 16px 30px !important; }
          .search-header h1 { font-size: 1.3rem !important; }
          .search-header form { flex-direction: column !important; }
        }
      `}</style>
      <div className="search-header" style={{
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

      <div className="search-results-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
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
