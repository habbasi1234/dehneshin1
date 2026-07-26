import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const gold = '#D4AF37'
const textPrimary = '#F5E6C8'
const textSecondary = '#A89880'
const borderGlass = 'rgba(212, 175, 55, 0.12)'
const bgCard = 'rgba(255,255,255,0.02)'

const pages = [
  { path: '/', label: 'صفحه اصلی', langKey: 'home' },
  { path: '/products', label: 'محصولات', langKey: 'products' },
  { path: '/about', label: 'درباره ما', langKey: 'about' },
  { path: '/blog', label: 'مقالات', langKey: 'blog' },
  { path: '/contact', label: 'تماس با ما', langKey: 'contact' },
  { path: '/catalog', label: 'کاتالوگ', langKey: 'catalog' },
  { path: '/wholesale', label: 'خرید عمده', langKey: 'wholesale' },
  { path: '/farm-map', label: 'نقشه مزارع', langKey: 'farmMap' },
  { path: '/cart', label: 'سبد خرید', langKey: 'cart' },
  { path: '/track', label: 'پیگیری سفارش', langKey: 'track' },
]

function Section({ title, desc, children }) {
  return (
    <div style={{ background: bgCard, border: `1px solid ${borderGlass}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: desc ? 4 : 16 }}>
        <div style={{ width: 3, height: 20, background: `linear-gradient(180deg, ${gold}, #A0872B)`, borderRadius: 2 }} />
        <h2 style={{ color: textPrimary, fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      {desc && <p style={{ color: textSecondary, fontSize: 12, margin: '0 0 16px 13px' }}>{desc}</p>}
      {children}
    </div>
  )
}

function Field({ label, value, onChange, multiline, placeholder, dir, maxLength }) {
  const id = 'f-' + Math.random().toString(36).slice(2, 6)
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{ display: 'block', color: textSecondary, fontSize: 11, marginBottom: 4, fontWeight: 500 }}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value || ''} onChange={onChange} placeholder={placeholder}
          rows={3} maxLength={maxLength}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${borderGlass}`, background: 'rgba(0,0,0,0.08)', color: textPrimary, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', direction: dir || 'rtl' }}
        />
      ) : (
        <input id={id} value={value || ''} onChange={onChange} placeholder={placeholder}
          maxLength={maxLength}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${borderGlass}`, background: 'rgba(0,0,0,0.08)', color: textPrimary, fontSize: 13, fontFamily: 'inherit', direction: dir || 'rtl' }}
        />
      )}
      {maxLength && <span style={{ fontSize: 10, color: textSecondary, marginTop: 2, display: 'block', textAlign: 'left' }}>حداکثر {maxLength} کاراکتر</span>}
    </div>
  )
}

export default function AdminSEO() {
  const [tab, setTab] = useState('pages')
  const [seoPages, setSeoPages] = useState([])
  const [report, setReport] = useState(null)
  const [editing, setEditing] = useState(null)
  const [sitemap, setSitemap] = useState('')
  const [schema, setSchema] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [extractUrl, setExtractUrl] = useState('')
  const [extractResult, setExtractResult] = useState(null)
  const [extractLoading, setExtractLoading] = useState(false)
  const [crawlUrl, setCrawlUrl] = useState('')
  const [crawlResult, setCrawlResult] = useState(null)
  const [crawlLoading, setCrawlLoading] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState('')
  const [crawlLabel, setCrawlLabel] = useState('')
  const [crawlIsCompetitor, setCrawlIsCompetitor] = useState(false)
  const [crawlImages, setCrawlImages] = useState(false)
  const [crawlSelectedImgs, setCrawlSelectedImgs] = useState({})
  const [crawlImgDownloading, setCrawlImgDownloading] = useState(false)
  const [savedCrawls, setSavedCrawls] = useState([])
  const [crawlTab, setCrawlTab] = useState('new')
  const [comparison, setComparison] = useState(null)
  const [crawlPollProgress, setCrawlPollProgress] = useState(null)
  const crawlJobRef = useRef(null)
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [sitemapLabel, setSitemapLabel] = useState('')
  const [sitemapIsCompetitor, setSitemapIsCompetitor] = useState(false)
  const [sitemapLoading, setSitemapLoading] = useState(false)
  const [sitemapResult, setSitemapResult] = useState(null)
  const [sitemapProgress, setSitemapProgress] = useState('')
  const [sitemapPollProgress, setSitemapPollProgress] = useState(null)
  const [sitemapTreeView, setSitemapTreeView] = useState(true)
  const [expandedDirs, setExpandedDirs] = useState({})
  const sitemapJobRef = useRef(null)

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${borderGlass}`, background: 'rgba(0,0,0,0.08)', color: textPrimary, fontSize: 13, fontFamily: 'inherit', direction: 'rtl' }

  const btnStyle = { padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: `linear-gradient(135deg, ${gold}, #A0872B)`, color: '#2D2D2D' }

  const fetchPages = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/seo/pages')
      setSeoPages(data.pages || [])
    } catch {}
  }, [])

  const fetchReport = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/seo/report')
      setReport(data)
    } catch {}
  }, [])

  useEffect(() => { fetchPages(); fetchReport() }, [fetchPages, fetchReport])

  const savePages = async () => {
    setLoading(true)
    try {
      await axios.put('/api/seo/pages', { pages: seoPages })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {}
    setLoading(false)
  }

  const updatePage = (idx, field, value) => {
    const copy = [...seoPages]
    if (!copy[idx]) return
    copy[idx] = { ...copy[idx], [field]: value }
    setSeoPages(copy)
  }

  const [sitemapStats, setSitemapStats] = useState(null)
  const [sitemapTabLoading, setSitemapTabLoading] = useState(false)

  const fetchSitemap = async () => {
    setSitemapTabLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        axios.get('/api/seo/sitemap'),
        fetch('/sitemap.xml').then(r => r.text()),
      ])
      setSitemap(r2)
      setSitemapStats(r1.data)
    } catch { setSitemap('خطا در دریافت sitemap') }
    setSitemapTabLoading(false)
  }

  const generateSitemap = async () => {
    setSitemapTabLoading(true)
    try {
      const { data } = await axios.post('/api/seo/generate-sitemap')
      setSitemap(data.xml)
      setSitemapStats(data)
    } catch { setSitemap('خطا در تولید sitemap') }
    setSitemapTabLoading(false)
  }

  const fetchSchema = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings')
      setSchema(JSON.stringify(data.schemaOrg || {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ده نشین',
        url: 'https://dehneshin.com',
        logo: 'https://dehneshin.com/logo.png',
      }, null, 2))
    } catch { setSchema('{}') }
  }

  const saveSchema = async () => {
    setLoading(true)
    try {
      let parsed = JSON.parse(schema)
      const { data: settings } = await axios.get('/api/admin/settings')
      settings.schemaOrg = parsed
      await axios.put('/api/admin/settings', settings)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e) { alert('JSON نامعتبر: ' + e.message) }
    setLoading(false)
  }

  const extractKeywords = async () => {
    if (!extractUrl) return
    setExtractLoading(true)
    try {
      const { data } = await axios.post('/api/seo/extract-keywords', { url: extractUrl })
      setExtractResult(data)
    } catch { setExtractResult({ error: 'خطا در دریافت اطلاعات' }) }
    setExtractLoading(false)
  }

  const crawlSite = async () => {
    if (!crawlUrl) return
    setCrawlLoading(true)
    setCrawlProgress('در حال شروع خزش...')
    setCrawlResult(null)
    setCrawlPollProgress(null)
    try {
      const { data } = await axios.post('/api/seo/crawl-keywords', {
        url: crawlUrl, label: crawlLabel || undefined,
        isCompetitor: crawlIsCompetitor, maxPages: 50, maxDepth: 3, crawlImages,
      })
      crawlJobRef.current = data.jobId
      const poll = setInterval(async () => {
        try {
          const { data: status } = await axios.get(`/api/seo/crawl-status/${crawlJobRef.current}`)
          if (status.status === 'done') {
            clearInterval(poll)
            crawlJobRef.current = null
            setCrawlResult(status)
            setCrawlProgress(`خزش کامل شد: ${status.stats.totalCrawled} صفحه`)
            setCrawlLoading(false)
            fetchSavedCrawls()
          } else if (status.status === 'error') {
            clearInterval(poll)
            crawlJobRef.current = null
            setCrawlResult({ error: status.error || 'خطا در خزش' })
            setCrawlProgress('خطا در خزش')
            setCrawlLoading(false)
          } else if (status.progress) {
            setCrawlPollProgress(status.progress)
            setCrawlProgress(`خزش در حال انجام... ${status.progress.pages} صفحه یافت شد`)
          }
        } catch {
          clearInterval(poll)
          crawlJobRef.current = null
          setCrawlResult({ error: 'خطا در دریافت وضعیت خزش' })
          setCrawlProgress('خطا در خزش')
          setCrawlLoading(false)
        }
      }, 2000)
    } catch (e) {
      setCrawlResult({ error: e.response?.data?.error || 'خطا در شروع خزش' })
      setCrawlProgress('خطا در خزش')
      setCrawlLoading(false)
    }
  }

  const processSitemap = async () => {
    if (!sitemapUrl) return
    setSitemapLoading(true)
    setSitemapProgress('در حال دریافت sitemap...')
    setSitemapResult(null)
    setSitemapPollProgress(null)
    try {
      const { data } = await axios.post('/api/seo/process-sitemap', {
        url: sitemapUrl, label: sitemapLabel || undefined,
        isCompetitor: sitemapIsCompetitor, maxPages: 100,
      })
      sitemapJobRef.current = data.jobId
      const poll = setInterval(async () => {
        try {
          const { data: status } = await axios.get(`/api/seo/sitemap-status/${sitemapJobRef.current}`)
          if (status.status === 'done') {
            clearInterval(poll)
            sitemapJobRef.current = null
            setSitemapResult(status)
            setSitemapProgress(`پردازش sitemap کامل شد: ${status.stats.totalCrawled} صفحه از ${status.sitemapUrlCount} URL`)
            setSitemapLoading(false)
            fetchSavedCrawls()
          } else if (status.status === 'error') {
            clearInterval(poll)
            sitemapJobRef.current = null
            setSitemapResult({ error: status.error || 'خطا در پردازش sitemap' })
            setSitemapProgress('خطا در پردازش')
            setSitemapLoading(false)
          } else if (status.progress) {
            setSitemapPollProgress(status.progress)
            setSitemapProgress(`در حال پردازش... ${status.progress.pages}/${status.progress.total} صفحه`)
          }
        } catch {
          clearInterval(poll)
          sitemapJobRef.current = null
          setSitemapResult({ error: 'خطا در دریافت وضعیت' })
          setSitemapLoading(false)
        }
      }, 2000)
    } catch (e) {
      setSitemapResult({ error: e.response?.data?.error || 'خطا در شروع پردازش' })
      setSitemapLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (crawlJobRef.current) crawlJobRef.current = null
      if (sitemapJobRef.current) sitemapJobRef.current = null
    }
  }, [])

  const fetchSavedCrawls = async () => {
    try {
      const { data } = await axios.get('/api/seo/crawl-results')
      setSavedCrawls(data.results || [])
    } catch {}
  }

  const fetchComparison = async () => {
    try {
      const { data } = await axios.get('/api/seo/competitor-compare')
      setComparison(data)
    } catch {}
  }

  const deleteCrawl = async (id) => {
    try {
      await axios.delete(`/api/seo/crawl-results/${id}`)
      fetchSavedCrawls()
    } catch {}
  }

  const toggleCompetitor = async (id, val) => {
    try {
      await axios.put(`/api/seo/crawl-results/${id}`, { isCompetitor: val })
      fetchSavedCrawls()
    } catch {}
  }

  const tabs = [
    { key: 'pages', label: '📄 صفحات' },
    { key: 'report', label: '📊 گزارش' },
    { key: 'schema', label: '🔧 Schema' },
    { key: 'sitemap', label: '🗺 نقشه سایت' },
    { key: 'extract', label: '🔍 استخراج کلمات' },
    { key: 'crawl', label: '🕷 خزش و رقبا' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${tab === t.key ? gold : borderGlass}`, background: tab === t.key ? 'rgba(212,175,55,0.1)' : 'transparent', color: tab === t.key ? gold : textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: tab === t.key ? 700 : 400, transition: 'all 0.2s' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pages' && (
        <Section title="مدیریت SEO صفحات" desc="عنوان، توضیحات و کلمات کلیدی هر صفحه را به صورت مجزا مدیریت کنید">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {seoPages.map((page, idx) => (
              <div key={page.path} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: gold, fontSize: 12, fontWeight: 700 }}>{page.label}</span>
                  <span style={{ color: textSecondary, fontSize: 10, fontFamily: 'monospace' }}>{page.path}</span>
                </div>
                <Field label="عنوان (Title)" value={page.title} onChange={e => updatePage(idx, 'title', e.target.value)} maxLength={70} />
                <Field label="توضیحات (Description)" value={page.description} onChange={e => updatePage(idx, 'description', e.target.value)} multiline maxLength={160} />
                <Field label="کلمات کلیدی (Keywords)" value={page.keywords} onChange={e => updatePage(idx, 'keywords', e.target.value)} placeholder="محصولات ارگانیک, میوه ارگانیک" />
                <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, fontSize: 10, color: textSecondary, direction: 'ltr', wordBreak: 'break-all' }}>
                  <div style={{ color: '#6B6B6B', marginBottom: 2 }}>پیش‌نمایش:</div>
                  <div style={{ color: '#4CAF50' }}>{page.title || 'بدون عنوان'} | ده نشین</div>
                  <div style={{ color: '#999', marginTop: 2 }}>{page.description?.slice(0, 120) || 'بدون توضیحات'}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={savePages} disabled={loading} style={btnStyle}>
              {loading ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : '💾 ذخیره SEO'}
            </button>
          </div>
        </Section>
      )}

      {tab === 'report' && (
        <Section title="گزارش SEO" desc="بررسی وضعیت بهینه‌سازی محتوای سایت">
          {report ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 20, textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: gold }}>{report.optimized || 0}</div>
                <div style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}>بهینه شده</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>از {report.totalContent} محتوا</div>
              </div>
              {[
                { label: 'بدون عنوان', value: report.issues?.missingTitle || 0, color: '#FF6B6B' },
                { label: 'بدون توضیحات', value: report.issues?.missingDesc || 0, color: '#FFA94D' },
                { label: 'بدون کلمات کلیدی', value: report.issues?.missingKeywords || 0, color: '#FFD43B' },
                { label: 'بدون slug', value: report.issues?.missingSlug || 0, color: '#69DB7C' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 20, textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 20, border: `1px solid ${borderGlass}`, gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { label: 'محصولات', value: report.products || 0 },
                    { label: 'مقالات', value: report.blogs || 0 },
                    { label: 'دسته‌بندی‌ها', value: report.categories || 0 },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: textSecondary }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <p style={{ color: textSecondary }}>در حال بارگذاری...</p>}
          <button onClick={fetchReport} style={{ ...btnStyle, marginTop: 16 }}>🔄 بروزرسانی گزارش</button>
        </Section>
      )}

      {tab === 'schema' && (
        <Section title="تنظیمات Schema.org" desc="داده‌های ساختیافته JSON-LD برای موتورهای جستجو">
          <Field label="JSON-LD Schema" value={schema} onChange={e => setSchema(e.target.value)} multiline dir="ltr" placeholder='{"@context": "https://schema.org", ...}' />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={saveSchema} disabled={loading} style={btnStyle}>{loading ? 'در حال ذخیره...' : '💾 ذخیره Schema'}</button>
            <button onClick={fetchSchema} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${borderGlass}`, color: textSecondary }}>🔄 بارگذاری</button>
          </div>
        </Section>
      )}

      {tab === 'sitemap' && (() => {
        function buildTree(xml) {
          const urls = []
          const locRe = /<loc>(.*?)<\/loc>/gi
          let m; while ((m = locRe.exec(xml)) !== null) urls.push(m[1].trim())
          const tree = { name: '/', children: {}, urls: [] }
          urls.forEach(u => {
            try {
              const parsed = new URL(u)
              const path = parsed.pathname.replace(/\/$/, '') || '/'
              const parts = path.split('/').filter(Boolean)
              if (parts.length === 0) { tree.urls.push({ url: u, name: parsed.hostname + '/' }); return }
              let node = tree
              parts.forEach((part, i) => {
                if (i === parts.length - 1) { node.urls.push({ url: u, name: part }) }
                else {
                  if (!node.children[part]) node.children[part] = { name: part, children: {}, urls: [] }
                  node = node.children[part]
                }
              })
            } catch {}
          })
          return tree
        }

        const treeData = sitemap ? buildTree(sitemap) : null

        function renderTree(node, depth = 0, path = '') {
          const isExpanded = expandedDirs[path] !== false
          const hasChildren = Object.keys(node.children).length > 0 || node.urls.length > 0
          const allKeys = [...Object.keys(node.children).sort(), ...node.urls.map(u => u.name)]
          if (allKeys.length === 0) return null
          return (
            <div key={path || '/'} style={{ marginLeft: depth > 0 ? 16 : 0 }}>
              {depth > 0 && (
                <div
                  onClick={() => setExpandedDirs(p => ({ ...p, [path]: !isExpanded }))}
                  style={{ padding: '3px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textSecondary, userSelect: 'none' }}
                >
                  <span style={{ fontSize: 10, color: '#6B6B6B' }}>{isExpanded ? '▼' : '▶'}</span>
                  <span style={{ color: gold, fontWeight: 600 }}>📁 {node.name}</span>
                  <span style={{ fontSize: 10, color: '#666' }}>{allKeys.length}</span>
                </div>
              )}
              {isExpanded && (
                <div>
                  {Object.keys(node.children).sort().map(k => renderTree(node.children[k], depth + 1, path + '/' + k))}
                  {node.urls.map((u, i) => (
                    <div key={u.url} style={{ padding: '2px 0 2px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: textSecondary }}>
                      <span style={{ fontSize: 10, color: '#555' }}>📄</span>
                      <span style={{ direction: 'ltr', fontFamily: 'monospace', color: '#4CAF50', wordBreak: 'break-all' }}>{u.url}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <Section title="نقشه سایت" desc="مدیریت و تولید نقشه سایت XML">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={generateSitemap} disabled={sitemapTabLoading} style={btnStyle}>
                {sitemapTabLoading ? '⏳ در حال تولید...' : '🔄 تولید نقشه سایت'}
              </button>
              <button onClick={fetchSitemap} disabled={sitemapTabLoading} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${borderGlass}`, color: textSecondary }}>
                📂 دریافت آخرین نسخه
              </button>
              <button onClick={() => setSitemapTreeView(t => !t)} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${borderGlass}`, color: textSecondary }}>
                {sitemapTreeView ? '📄 نمای XML' : '🌳 نمای درختی'}
              </button>
            </div>
            {sitemapStats?.stats && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 16px', textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: gold }}>{sitemapStats.totalUrls}</div>
                  <div style={{ fontSize: 10, color: textSecondary }}>مجموع URLها</div>
                </div>
                {Object.entries(sitemapStats.stats).map(([type, count]) => (
                  <div key={type} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 16px', textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#4CAF50' }}>{count}</div>
                    <div style={{ fontSize: 10, color: textSecondary }}>{type === 'static' ? 'صفحات ثابت' : type === 'product' ? 'محصولات' : type === 'blog' ? 'مقالات' : type === 'category' ? 'دسته‌بندی' : type}</div>
                  </div>
                ))}
                {sitemapStats.generatedAt && (
                  <div style={{ fontSize: 10, color: textSecondary, alignSelf: 'center' }}>آخرین تولید: {new Date(sitemapStats.generatedAt).toLocaleDateString('fa-IR')}</div>
                )}
              </div>
            )}
            {sitemap && sitemap.startsWith('خطا') && (
              <div style={{ background: 'rgba(255,0,0,0.05)', borderRadius: 8, padding: 12, marginTop: 8, textAlign: 'center', border: `1px solid rgba(255,100,100,0.2)` }}>
                <span style={{ color: '#FF6B6B', fontSize: 13 }}>{sitemap}</span>
              </div>
            )}
            {sitemapTreeView && treeData && !sitemap?.startsWith('خطا') && (
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 16, border: `1px solid ${borderGlass}`, maxHeight: 500, overflow: 'auto', fontSize: 12 }}>
                {Object.keys(treeData.children).sort().map(k => renderTree(treeData.children[k], 1, '/' + k))}
                {treeData.urls.map((u, i) => (
                  <div key={u.url} style={{ padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: textSecondary }}>
                    <span style={{ fontSize: 10, color: '#555' }}>📄</span>
                    <span style={{ direction: 'ltr', fontFamily: 'monospace', color: '#4CAF50', wordBreak: 'break-all' }}>{u.url}</span>
                  </div>
                ))}
              </div>
            )}
            {!sitemapTreeView && sitemap && !sitemap.startsWith('خطا') && (
              <pre style={{ marginTop: 12, padding: 16, background: 'rgba(0,0,0,0.08)', borderRadius: 8, color: '#4CAF50', fontSize: 11, maxHeight: 400, overflow: 'auto', direction: 'ltr', fontFamily: 'monospace', border: `1px solid ${borderGlass}` }}>
                {sitemap}
              </pre>
            )}
          </Section>
        )
      })()}

      {tab === 'extract' && (
        <Section title="استخراج کلمات کلیدی" desc="از رقبا و سایت‌های مرجع کلمات کلیدی استخراج کنید">
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={extractUrl} onChange={e => setExtractUrl(e.target.value)} placeholder="https://example.com" style={{ ...inputStyle, flex: 1, direction: 'ltr', fontSize: 12 }} />
            <button onClick={extractKeywords} disabled={extractLoading || !extractUrl} style={btnStyle}>
              {extractLoading ? '...' : '🔍 استخراج'}
            </button>
          </div>
          {extractResult && extractResult.error && (
            <div style={{ marginTop: 16, background: 'rgba(255,0,0,0.05)', borderRadius: 8, padding: 12, border: `1px solid rgba(255,100,100,0.2)`, textAlign: 'center' }}>
              <span style={{ color: '#FF6B6B', fontSize: 13 }}>{extractResult.error}</span>
            </div>
          )}
          {extractResult && !extractResult.error && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {extractResult.title && (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, border: `1px solid ${borderGlass}` }}>
                  <div style={{ fontSize: 10, color: textSecondary, marginBottom: 4 }}>عنوان</div>
                  <div style={{ color: textPrimary, fontSize: 13 }}>{extractResult.title}</div>
                </div>
              )}
              {extractResult.metaDescription && (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, border: `1px solid ${borderGlass}` }}>
                  <div style={{ fontSize: 10, color: textSecondary, marginBottom: 4 }}>توضیحات</div>
                  <div style={{ color: textPrimary, fontSize: 13 }}>{extractResult.metaDescription}</div>
                </div>
              )}
              {extractResult.metaKeywords && (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, border: `1px solid ${borderGlass}` }}>
                  <div style={{ fontSize: 10, color: textSecondary, marginBottom: 4 }}>کلمات کلیدی</div>
                  <div style={{ color: textPrimary, fontSize: 13 }}>{extractResult.metaKeywords}</div>
                </div>
              )}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, border: `1px solid ${borderGlass}`, gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, color: textSecondary, marginBottom: 8 }}>کلمات پیشنهادی (بر اساس فراوانی)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(extractResult.keywords || []).slice(0, 20).map((kw, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(212,175,55,0.1)', border: `1px solid ${gold}33`, color: gold, fontSize: 11 }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {tab === 'crawl' && (() => {
        const subTabs = [
          { key: 'new', label: '🕷 خزش جدید' },
          { key: 'sitemap', label: '📋 از روی Sitemap' },
          { key: 'saved', label: '📁 نتایج ذخیره شده' },
          { key: 'compare', label: '⚔️ مقایسه رقبا' },
        ]
        const subBtn = (k) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${crawlTab === k ? gold : borderGlass}`, background: crawlTab === k ? 'rgba(212,175,55,0.1)' : 'transparent', color: crawlTab === k ? gold : textSecondary, cursor: 'pointer', fontSize: 11, fontWeight: crawlTab === k ? 700 : 400 })
        return (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {subTabs.map(t => <button key={t.key} onClick={() => setCrawlTab(t.key)} style={subBtn(t.key)}>{t.label}</button>)}
            </div>
            {crawlTab === 'new' && (
              <Section title="خزش جدید" desc="خزش کامل یک سایت و استخراج کلمات کلیدی">
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input value={crawlUrl} onChange={e => setCrawlUrl(e.target.value)} placeholder="https://example.com" style={{ ...inputStyle, flex: 2, direction: 'ltr', fontSize: 12 }} />
                  <input value={crawlLabel} onChange={e => setCrawlLabel(e.target.value)} placeholder="برچسب (مثلاً: سایت رقیب)" style={{ ...inputStyle, flex: 1, direction: 'rtl', fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: textSecondary, fontSize: 11, cursor: 'pointer' }}>
                    <input type="checkbox" checked={crawlIsCompetitor} onChange={e => setCrawlIsCompetitor(e.target.checked)} />
                    این سایت رقیب است
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: textSecondary, fontSize: 11, cursor: 'pointer' }}>
                    <input type="checkbox" checked={crawlImages} onChange={e => setCrawlImages(e.target.checked)} />
                    🖼 خزش تصاویر
                  </label>
                  <button onClick={crawlSite} disabled={crawlLoading || !crawlUrl} style={btnStyle}>
                    {crawlLoading ? '⏳ در حال خزش...' : '🕷 شروع خزش'}
                  </button>
                </div>
                {crawlProgress && !crawlLoading && <div style={{ fontSize: 11, color: textSecondary, marginBottom: 12, textAlign: 'center' }}>{crawlProgress}</div>}
                {crawlLoading && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: 11, color: textSecondary, marginBottom: 8 }}>در حال خزش صفحات در پس‌زمینه...</div>
                    {crawlPollProgress && (
                      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 10, color: '#6B6B6B' }}>
                        <span>📄 {crawlPollProgress.pages} صفحه</span>
                        <span>🔄 {crawlPollProgress.visited} بررسی شده</span>
                        {crawlPollProgress.errors > 0 && <span style={{ color: '#FF6B6B' }}>⚠ {crawlPollProgress.errors} خطا</span>}
                      </div>
                    )}
                  </div>
                )}
                {crawlResult && crawlResult.error && (
                  <div style={{ background: 'rgba(255,0,0,0.05)', borderRadius: 8, padding: 12, marginTop: 8, textAlign: 'center', border: `1px solid rgba(255,100,100,0.2)` }}>
                    <span style={{ color: '#FF6B6B', fontSize: 13 }}>{crawlResult.error}</span>
                  </div>
                )}
                {crawlResult && !crawlResult.error && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                      {[
                        { label: 'صفحات خزش شده', value: crawlResult.stats.totalCrawled },
                        { label: 'خطاها', value: crawlResult.stats.totalErrors, color: crawlResult.stats.totalErrors > 0 ? '#FF6B6B' : '#4CAF50' },
                        { label: 'میانگین کلمات', value: crawlResult.stats.avgWordsPerPage },
                        { label: 'بدون عنوان', value: crawlResult.stats.pagesWithoutTitle, color: crawlResult.stats.pagesWithoutTitle > 0 ? '#FFA94D' : '#4CAF50' },
                        { label: 'بدون توضیحات', value: crawlResult.stats.pagesWithoutDesc, color: crawlResult.stats.pagesWithoutDesc > 0 ? '#FFA94D' : '#4CAF50' },
                        { label: 'بدون کلمات کلیدی', value: crawlResult.stats.pagesWithoutKeywords, color: crawlResult.stats.pagesWithoutKeywords > 0 ? '#FFA94D' : '#4CAF50' },
                      ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 14, textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: s.color || gold }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: textSecondary, marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: gold, fontWeight: 700, marginBottom: 8 }}>🏆 ابر کلمات سایت</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {crawlResult.globalTopWords.slice(0, 40).map((kw, i) => (
                          <span key={i} style={{ padding: '4px 12px', borderRadius: 14, background: 'rgba(212,175,55,0.1)', border: `1px solid ${gold}44`, color: gold, fontSize: 11 }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                    {crawlResult.images && crawlResult.images.length > 0 && (() => {
                      const selectImg = (src) => setCrawlSelectedImgs(p => ({ ...p, [src]: !p[src] }))
                      const downloadSelected = async () => {
                        const sel = Object.entries(crawlSelectedImgs).filter(([_, v]) => v).map(([k]) => k)
                        if (sel.length === 0) return
                        setCrawlImgDownloading(true)
                        try {
                          const { data } = await axios.post('/api/seo/download-images', { urls: sel })
                          data.results.forEach(r => {
                            if (r.data) {
                              const a = document.createElement('a')
                              a.href = 'data:' + r.contentType + ';base64,' + r.data
                              a.download = r.name
                              a.click()
                            }
                          })
                        } catch {}
                        setCrawlImgDownloading(false)
                      }
                      const selCount = Object.values(crawlSelectedImgs).filter(Boolean).length
                      return (
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 12, color: gold, fontWeight: 700 }}>🖼 تصاویر ({crawlResult.images.length})</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={downloadSelected} disabled={crawlImgDownloading || selCount === 0} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: `linear-gradient(135deg, ${gold}, #A0872B)`, color: '#2D2D2D', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                                {crawlImgDownloading ? '...' : `💾 دانلود (${selCount})`}
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, maxHeight: 400, overflow: 'auto' }}>
                            {crawlResult.images.map((img, i) => (
                              <div key={img.src} onClick={() => selectImg(img.src)} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: crawlSelectedImgs[img.src] ? `2px solid ${gold}` : `1px solid ${borderGlass}`, opacity: crawlSelectedImgs[img.src] ? 1 : 0.7, transition: 'all 0.15s' }}>
                                <img src={img.src} alt={img.alt} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                                <div style={{ padding: '4px 6px', fontSize: 9, color: textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>{img.alt || img.src.split('/').pop()?.slice(0, 30)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}` }}>
                      <div style={{ fontSize: 12, color: gold, fontWeight: 700, marginBottom: 8 }}>📄 صفحات خزش شده ({crawlResult.pages.length})</div>
                      <div style={{ maxHeight: 300, overflow: 'auto' }}>
                        {crawlResult.pages.map((p, i) => (
                          <div key={p.url} style={{ padding: '8px 0', borderBottom: i < crawlResult.pages.length - 1 ? `1px solid ${borderGlass}` : 'none' }}>
                            <div style={{ fontSize: 11, color: textSecondary, direction: 'ltr', fontFamily: 'monospace', marginBottom: 2 }}>{p.url}</div>
                            <div style={{ fontSize: 11, color: textPrimary }}>{p.title || 'بدون عنوان'}</div>
                            {p.metaKeywords && <div style={{ fontSize: 10, color: '#6B6B6B' }}>🔑 {p.metaKeywords}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Section>
            )}
            {crawlTab === 'sitemap' && (
              <Section title="پردازش از روی Sitemap" desc="دریافت sitemap.xml سایت و استخراج کلمات کلیدی از تمام صفحات">
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="https://example.com" style={{ ...inputStyle, flex: 2, direction: 'ltr', fontSize: 12 }} />
                  <input value={sitemapLabel} onChange={e => setSitemapLabel(e.target.value)} placeholder="برچسب" style={{ ...inputStyle, flex: 1, direction: 'rtl', fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: textSecondary, fontSize: 11, cursor: 'pointer' }}>
                    <input type="checkbox" checked={sitemapIsCompetitor} onChange={e => setSitemapIsCompetitor(e.target.checked)} />
                    این سایت رقیب است
                  </label>
                  <button onClick={processSitemap} disabled={sitemapLoading || !sitemapUrl} style={btnStyle}>
                    {sitemapLoading ? '⏳ در حال پردازش...' : '📋 پردازش Sitemap'}
                  </button>
                </div>
                {sitemapProgress && !sitemapLoading && <div style={{ fontSize: 11, color: textSecondary, marginBottom: 12, textAlign: 'center' }}>{sitemapProgress}</div>}
                {sitemapLoading && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: 11, color: textSecondary, marginBottom: 8 }}>در حال پردازش sitemap...</div>
                    {sitemapPollProgress && (
                      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 10, color: '#6B6B6B' }}>
                        <span>📄 {sitemapPollProgress.pages}/{sitemapPollProgress.total} صفحه</span>
                        {sitemapPollProgress.errors > 0 && <span style={{ color: '#FF6B6B' }}>⚠ {sitemapPollProgress.errors} خطا</span>}
                      </div>
                    )}
                  </div>
                )}
                {sitemapResult && sitemapResult.error && (
                  <div style={{ background: 'rgba(255,0,0,0.05)', borderRadius: 8, padding: 12, marginTop: 8, textAlign: 'center', border: `1px solid rgba(255,100,100,0.2)` }}>
                    <span style={{ color: '#FF6B6B', fontSize: 13 }}>{sitemapResult.error}</span>
                  </div>
                )}
                {sitemapResult && !sitemapResult.error && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                      {[
                        { label: 'URL در sitemap', value: sitemapResult.sitemapUrlCount },
                        { label: 'صفحات پردازش شده', value: sitemapResult.stats.totalCrawled },
                        { label: 'خطاها', value: sitemapResult.stats.totalErrors, color: sitemapResult.stats.totalErrors > 0 ? '#FF6B6B' : '#4CAF50' },
                        { label: 'میانگین کلمات', value: sitemapResult.stats.avgWordsPerPage },
                      ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 14, textAlign: 'center', border: `1px solid ${borderGlass}` }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: s.color || gold }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: textSecondary, marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: gold, fontWeight: 700, marginBottom: 8 }}>🏆 ابر کلمات</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {sitemapResult.globalTopWords.slice(0, 40).map((kw, i) => (
                          <span key={i} style={{ padding: '4px 12px', borderRadius: 14, background: 'rgba(212,175,55,0.1)', border: `1px solid ${gold}44`, color: gold, fontSize: 11 }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}` }}>
                      <div style={{ fontSize: 12, color: gold, fontWeight: 700, marginBottom: 8 }}>📄 صفحات ({sitemapResult.pages.length})</div>
                      <div style={{ maxHeight: 300, overflow: 'auto' }}>
                        {sitemapResult.pages.map((p, i) => (
                          <div key={p.url} style={{ padding: '8px 0', borderBottom: i < sitemapResult.pages.length - 1 ? `1px solid ${borderGlass}` : 'none' }}>
                            <div style={{ fontSize: 11, color: textSecondary, direction: 'ltr', fontFamily: 'monospace', marginBottom: 2 }}>{p.url}</div>
                            <div style={{ fontSize: 11, color: textPrimary }}>{p.title || 'بدون عنوان'}</div>
                            {p.metaKeywords && <div style={{ fontSize: 10, color: '#6B6B6B' }}>🔑 {p.metaKeywords}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Section>
            )}
            {crawlTab === 'saved' && (
              <Section title="نتایج ذخیره شده">
                <button onClick={fetchSavedCrawls} style={{ ...btnStyle, marginBottom: 16, background: 'transparent', border: `1px solid ${borderGlass}`, color: textSecondary }}>🔄 بروزرسانی لیست</button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {savedCrawls.map(c => (
                    <div key={c._id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ color: c.isCompetitor ? '#FFA94D' : gold, fontSize: 13, fontWeight: 700 }}>{c.isCompetitor ? '🏁 ' : '👑 '}{c.label}</span>
                        <span style={{ fontSize: 10, color: textSecondary, fontFamily: 'monospace' }}>{c.domain}</span>
                      </div>
                      <div style={{ fontSize: 10, color: textSecondary, marginBottom: 8 }}>آخرین خزش: {new Date(c.lastCrawled).toLocaleDateString('fa-IR')} | {c.stats.totalCrawled} صفحه</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                        {c.globalTopWords.slice(0, 10).map((w, i) => (
                          <span key={i} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(212,175,55,0.08)', color: textSecondary, fontSize: 10 }}>{w}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => toggleCompetitor(c._id, !c.isCompetitor)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${borderGlass}`, background: 'transparent', color: textSecondary, cursor: 'pointer', fontSize: 10 }}>
                          {c.isCompetitor ? '👑 علامت به عنوان اصلی' : '🏁 علامت به عنوان رقیب'}
                        </button>
                        <button onClick={() => deleteCrawl(c._id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#FF6B6B', cursor: 'pointer', fontSize: 10 }}>🗑 حذف</button>
                      </div>
                    </div>
                  ))}
                  {savedCrawls.length === 0 && <p style={{ color: textSecondary, fontSize: 12 }}>هنوز خزشی انجام نشده</p>}
                </div>
              </Section>
            )}
            {crawlTab === 'compare' && (
              <Section title="مقایسه رقبا" desc="کلمات مشترک و اختصاصی بین سایت شما و رقبا">
                <button onClick={() => { fetchComparison(); fetchSavedCrawls() }} style={{ ...btnStyle, marginBottom: 16 }}>🔄 بارگذاری مقایسه</button>
                {comparison ? (
                  <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ background: 'rgba(212,175,55,0.1)', borderRadius: 10, padding: 16, border: `1px solid ${gold}44`, flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 11, color: gold, marginBottom: 4 }}>👑 سایت شما</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>{comparison.main?.label || '—'}</div>
                        <div style={{ fontSize: 10, color: textSecondary, fontFamily: 'monospace' }}>{comparison.main?.domain || ''}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 11, color: '#4CAF50', marginBottom: 4 }}>🔗 کلمات مشترک</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#4CAF50' }}>{comparison.comparison?.totalCommon || 0}</div>
                        <div style={{ fontSize: 10, color: textSecondary }}>بین همه سایت‌ها</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}`, flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 11, color: '#FFD43B', marginBottom: 4 }}>✨ کلمات اختصاصی شما</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#FFD43B' }}>{comparison.comparison?.totalUniqueToMain || 0}</div>
                        <div style={{ fontSize: 10, color: textSecondary }}>فقط در سایت شما</div>
                      </div>
                    </div>
                    {comparison.comparison?.commonWords?.length > 0 && (
                      <div style={{ background: 'rgba(76,175,80,0.05)', borderRadius: 10, padding: 16, border: `1px solid rgba(76,175,80,0.2)`, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#4CAF50', fontWeight: 700, marginBottom: 8 }}>🔗 کلمات مشترک بین همه</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {comparison.comparison.commonWords.map((w, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 14, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', color: '#4CAF50', fontSize: 11 }}>{w}</span>)}
                        </div>
                      </div>
                    )}
                    {comparison.comparison?.uniqueToMain?.length > 0 && (
                      <div style={{ background: 'rgba(255,212,59,0.05)', borderRadius: 10, padding: 16, border: `1px solid rgba(255,212,59,0.2)`, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#FFD43B', fontWeight: 700, marginBottom: 8 }}>✨ کلمات اختصاصی شما</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {comparison.comparison.uniqueToMain.map((w, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 14, background: 'rgba(255,212,59,0.08)', border: '1px solid rgba(255,212,59,0.2)', color: '#FFD43B', fontSize: 11 }}>{w}</span>)}
                        </div>
                      </div>
                    )}
                    {Object.entries(comparison.comparison?.competitorSpecific || {}).filter(([_, v]) => v.uniqueWords.length > 0).map(([domain, data]) => (
                      <div key={domain} style={{ background: 'rgba(255,169,77,0.05)', borderRadius: 10, padding: 16, border: `1px solid rgba(255,169,77,0.2)`, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#FFA94D', fontWeight: 700, marginBottom: 8 }}>🏁 کلمات اختصاصی {data.label}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {data.uniqueWords.map((w, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 14, background: 'rgba(255,169,77,0.08)', border: '1px solid rgba(255,169,77,0.2)', color: '#FFA94D', fontSize: 11 }}>{w}</span>)}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {[comparison.main, ...(comparison.competitors || [])].filter(Boolean).map(site => (
                        <div key={site.domain} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, border: `1px solid ${borderGlass}` }}>
                          <div style={{ fontSize: 11, color: site.domain === comparison.main?.domain ? gold : '#FFA94D', fontWeight: 700, marginBottom: 6 }}>
                            {site.domain === comparison.main?.domain ? '👑 ' : '🏁 '}{site.label}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {site.topWords.slice(0, 20).map((w, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(212,175,55,0.06)', color: textSecondary, fontSize: 10 }}>{w}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p style={{ color: textSecondary, fontSize: 12 }}>ابتدا دکمه بارگذاری مقایسه را بزنید. حداقل باید یک سایت اصلی و یک رقیب ذخیره شده باشد.</p>}
              </Section>
            )}
          </div>
        )
      })()}
    </div>
  )
}
