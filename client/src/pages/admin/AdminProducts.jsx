import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'
import ColorPalettePicker from '../../components/admin/ColorPalettePicker'

const featurePlaceholders = ['وزن', 'گارانتی', 'جنس پارچه', 'جنس چوب', 'سبک', 'کشور سازنده']

const defaultLangTabs = [
  { key: 'fa', label: 'فارسی', flag: '🇮🇷', fields: { name: 'name', desc: 'description' } },
  { key: 'en', label: 'English', flag: '🇬🇧', fields: { name: 'name_en', desc: 'desc_en' } },
  { key: 'ar', label: 'العربية', flag: '🇸🇦', fields: { name: 'name_ar', desc: 'desc_ar' } },
]

const langFlags = { fa: '🇮🇷', en: '🇬🇧', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', tr: '🇹🇷', es: '🇪🇸', ru: '🇷🇺', zh: '🇨🇳' }

const buildEmptyForm = (langKeys) => {
  const base = { slug: '', category: '', price: '', salePrice: '', discountPercent: '', status: 'active', keywords: '', images: [], dimensions: '', material: '', colors: '', woodColors: '', fabrics: '', features: '' }
  base.name = ''
  base.description = ''
  langKeys.filter(k => k !== 'fa').forEach(k => { base[`name_${k}`] = ''; base[`desc_${k}`] = '' })
  return base
}

export default function AdminProducts() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(buildEmptyForm(['fa', 'en', 'ar']))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [productView, setProductView] = useState('card')
  const [langTabs, setLangTabs] = useState(defaultLangTabs)
  const [langKeys, setLangKeys] = useState(['fa', 'en', 'ar'])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/products')
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  const loadSettings = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings')
      const langs = (data.languages || []).filter(l => l.enabled !== false).map(l => l.key)
      if (langs.length > 0 && !langs.includes('fa')) langs.unshift('fa')
      const keys = langs.length > 0 ? [...new Set(langs)] : ['fa', 'en', 'ar']
      setLangKeys(keys)
      const tabs = keys.map(k => ({
        key: k,
        label: data.languages?.find(l => l.key === k)?.label || (k === 'fa' ? 'فارسی' : k === 'en' ? 'English' : k === 'ar' ? 'العربية' : k),
        flag: data.languages?.find(l => l.key === k)?.flag || langFlags[k] || '🌐',
        fields: {
          name: k === 'fa' ? 'name' : `name_${k}`,
          desc: k === 'fa' ? 'description' : `desc_${k}`,
        },
      }))
      setLangTabs(tabs)
    } catch {}
  }

  const loadCategories = async () => {
    try {
      const { data } = await axios.get('/api/admin/categories')
      setCategories(data)
    } catch { }
  }

  useEffect(() => { load(); loadCategories(); loadSettings() }, [])

  const [activeLang, setActiveLang] = useState('fa')
  const [translating, setTranslating] = useState(false)

  const translateField = async (text, targetLang, fieldFrom, fieldTo) => {
    if (!text || targetLang === 'fa') return
    setTranslating(true)
    try {
      const { data } = await axios.post('/api/translate', { text, to: targetLang })
      if (data?.translated) hc(fieldTo, data.translated)
    } catch {}
    setTranslating(false)
  }

  const handleLangChange = async (fromKey, toKey, text, fieldFrom, fieldTo) => {
    if (!text || fromKey === toKey) return
    setTranslating(true)
    try {
      const { data } = await axios.post('/api/translate', { text, to: toKey, from: fromKey === 'fa' ? 'auto' : fromKey })
      if (data?.translated) hc(fieldTo, data.translated)
    } catch {}
    setTranslating(false)
  }

  const handleEdit = (item) => {
    setEditing(item.id)
    const images = item.images
      ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images)
      : (item.image ? [item.image] : [])
    const parseFeatures = (f) => {
      if (!f) return []
      if (Array.isArray(f)) return f
      if (typeof f === 'string') {
        try { const p = JSON.parse(f); return Array.isArray(p) ? p : [] } catch { return [] }
      }
      return []
    }
    const formData = {
      name: item.name || '', slug: item.slug || '', category: item.category || '', price: item.price || '',
      salePrice: item.salePrice || '', discountPercent: item.discountPercent || '',
      status: item.status || 'active', keywords: item.keywords || '',
      images,
      dimensions: item.dimensions || '', material: item.material || '',
      colors: (() => { try { return JSON.parse(item.colors) } catch { return item.colors || '' } })(),
      woodColors: (() => { try { return JSON.parse(item.woodColors) } catch { return item.woodColors || '' } })(),
      fabrics: (() => { try { return JSON.parse(item.fabrics) } catch { return item.fabrics || '' } })(),
      description: item.description || '', features: parseFeatures(item.features),
    }
    langKeys.filter(k => k !== 'fa').forEach(k => {
      formData[`name_${k}`] = item[`name_${k}`] || ''
      formData[`desc_${k}`] = item[`desc_${k}`] || ''
    })
    setForm(formData)
  }

  const handleNew = () => { setEditing('new'); setForm(buildEmptyForm(langKeys)); setManualUrl(''); setActiveLang('fa') }
  const handleCancel = () => { setEditing(null); setForm(buildEmptyForm(langKeys)); setManualUrl(''); setActiveLang('fa') }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const f = form.features || []
      const features = f.filter(feat => feat.key?.trim())
      const toJson = (v) => Array.isArray(v) ? JSON.stringify(v) : v
      const payload = { ...form, features: toJson(features), images: toJson(form.images), colors: toJson(form.colors), woodColors: toJson(form.woodColors), fabrics: toJson(form.fabrics) }
      if (editing === 'new') {
        await axios.post('/api/products', payload)
        addToast('با موفقیت ایجاد شد', 'success')
      } else {
        await axios.put(`/api/products/${editing}`, payload)
        addToast('با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch (e) { addToast(e?.response?.data?.error || 'خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${deleteTarget.id}`)
      addToast('با موفقیت حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const uploadImages = async (files) => {
    const formData = new FormData()
    for (let f of files) formData.append('images', f)
    const { data } = await axios.post('/api/upload/multiple', formData)
    return data.urls.map(u => u.url)
  }

  const handleFileSelect = async (e) => {
    setUploading(true)
    try {
      const urls = await uploadImages([...e.target.files])
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
    } catch { }
    setUploading(false)
    e.target.value = ''
  }

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return
    setForm(prev => ({ ...prev, images: [...(prev.images || []), manualUrl.trim()] }))
    setManualUrl('')
  }

  const handleRemoveImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const getImages = (product) => {
    if (product.images) {
      return typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    }
    return product.image ? [product.image] : []
  }

  const columns = [
    {
      key: 'images', label: 'تصاویر',
      render: (_, item) => {
        const images = getImages(item)
        return images.length > 0 ? (
          <div style={{ display: 'flex', gap: 4 }}>
            {images.slice(0, 3).map((url, i) => (
              <div key={i} style={{ width: 40, height: 32, borderRadius: 4, overflow: 'hidden', background: 'repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 0px 0px / 10px 10px, #1a1a1a' }}>
                <img src={url} alt=""
                  onError={e => { e.target.src = '/favicon.png' }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
            {images.length > 3 && <span style={{ color: '#6B6B6B', fontSize: 11, alignSelf: 'center' }}>+{images.length - 3}</span>}
          </div>
        ) : <span style={{ color: '#555' }}>—</span>
      },
    },
    { key: 'name', label: 'نام' },
    { key: 'category', label: 'دسته', render: (v) => <span style={{ color: '#999' }}>{v || '—'}</span> },
    {
      key: 'price', label: 'قیمت',
      render: (v) => <span style={{ color: '#4CAF50' }}>{v || '—'}</span>,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت محصولات</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setProductView('card')} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: productView === 'card' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: productView === 'card' ? '#D4AF37' : '#888', fontSize: 12,
            }}>🃏 کارتی</button>
            <button onClick={() => setProductView('list')} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: productView === 'list' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: productView === 'list' ? '#D4AF37' : '#888', fontSize: 12,
            }}>📋 لیست</button>
          </div>
          <button onClick={handleNew} style={{
            padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            + محصول جدید
          </button>
        </div>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24, boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'محصول جدید' : 'ویرایش محصول'}
          </h3>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
              {langTabs.map(t => (
                <button key={t.key} onClick={() => setActiveLang(t.key)} style={{
                  padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeLang === t.key ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: activeLang === t.key ? '#D4AF37' : '#888', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.3s',
                }}>
                  <span>{t.flag}</span>
                  <span>{t.label}</span>
                </button>
              ))}
              {translating && <span style={{ color: '#4CAF50', fontSize: 11, alignSelf: 'center', marginRight: 8 }}>🔄 ترجمه...</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام محصول ({langTabs.find(t => t.key === activeLang)?.flag || '🇮🇷'})</label>
              {langTabs.map(t => {
                const f = t.fields.name
                return activeLang === t.key ? (
                  <input key={t.key} value={form[f] || ''} onChange={e => {
                    hc(f, e.target.value)
                    langTabs.filter(o => o.key !== t.key).forEach(o => {
                      if (e.target.value) handleLangChange(t.key, o.key, e.target.value, f, o.fields.name)
                    })
                  }} style={{
                    width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #4CAF50',
                    borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                  }} />
                ) : (
                  <div key={t.key} style={{ display: form[t.fields.name] ? 'block' : 'none' }}>
                    <input value={form[t.fields.name] || ''} onChange={e => hc(t.fields.name, e.target.value)} style={{
                      width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                      borderRadius: 6, color: '#666', fontSize: 13, outline: 'none', display: 'none',
                    }} />
                  </div>
                )
              })}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {langTabs.filter(t => t.key !== activeLang).map(t => (
                  form[t.fields.name] ? (
                    <span key={t.key} style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {t.flag}: {form[t.fields.name]}
                    </span>
                  ) : null
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>اسلاگ (لینک)</label>
              <input value={form.slug} onChange={e => hc('slug', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>دسته‌بندی</label>
              <select value={form.category} onChange={e => hc('category', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>قیمت</label>
              <input value={form.price} onChange={e => hc('price', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>وضعیت</label>
              <select value={form.status || 'active'} onChange={e => hc('status', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="active">فعال (قابل نمایش)</option>
                <option value="inactive">غیرفعال (عدم نمایش)</option>
                <option value="finished">اتمام محصول (تمام شده)</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>قیمت تخفیف‌خورده</label>
              <input value={form.salePrice || ''} onChange={e => hc('salePrice', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} placeholder="قیمت بعد از تخفیف" />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>درصد تخفیف</label>
              <input value={form.discountPercent || ''} onChange={e => hc('discountPercent', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} placeholder="مثلاً: ۲۰" />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>کلمات کلیدی (SEO)</label>
              <input value={form.keywords || ''} onChange={e => hc('keywords', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} placeholder="محصولات ارگانیک, میوه تازه, ..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تصاویر</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading} style={{
                  color: '#2D2D2D', fontSize: 13,
                }} />
                {uploading && <span style={{ color: '#4CAF50', fontSize: 13 }}>در حال آپلود...</span>}
              </div>
              {form.images && form.images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', background: 'repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 0px 0px / 12px 12px, #1a1a1a', border: '1px solid #D4D0C8' }}>
                      <img src={url} alt=""
                        onError={e => { e.target.style.display = 'none' }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <button type="button" onClick={() => handleRemoveImage(i)} style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                        background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%',
                        cursor: 'pointer', fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="آدرس تصویر (دستی)" style={{
                  flex: 1, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                  borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                }} />
                <button type="button" onClick={handleAddManualUrl} style={{
                  padding: '8px 14px', background: '#F0F0EA', color: '#4CAF50',
                  border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                }}>افزودن</button>
              </div>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>ابعاد</label>
              <input value={form.dimensions} onChange={e => hc('dimensions', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>جنس</label>
              <input value={form.material} onChange={e => hc('material', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>رنگ‌های اصلی</label>
              <ColorPalettePicker value={form.colors} onChange={v => hc('colors', v)} label="" presets={[]} />
            </div>
            <div>
              <ColorPalettePicker value={form.woodColors} onChange={v => hc('woodColors', v)} label="رنگ‌های چوب" presets="wood" />
            </div>
            <div>
              <ColorPalettePicker value={form.fabrics} onChange={v => hc('fabrics', v)} label="پارچه‌ها" presets="fabric" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>توضیحات ({langTabs.find(t => t.key === activeLang)?.flag || '🇮🇷'})</label>
            {langTabs.map(t => {
              const f = t.fields.desc
              return activeLang === t.key ? (
                <textarea key={t.key} value={form[f] || ''} onChange={e => {
                  hc(f, e.target.value)
                  langTabs.filter(o => o.key !== t.key).forEach(o => {
                    if (e.target.value) handleLangChange(t.key, o.key, e.target.value, f, o.fields.desc)
                  })
                }} rows={3} style={{
                  width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #4CAF50',
                  borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', resize: 'vertical',
                }} />
              ) : null
            })}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {langTabs.filter(t => t.key !== activeLang).map(t => (
                form[t.fields.desc] ? (
                  <span key={t.key} style={{ fontSize: 10, color: '#555', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {t.flag}: {form[t.fields.desc].slice(0, 60)}{form[t.fields.desc].length > 60 ? '...' : ''}
                  </span>
                ) : null
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 8 }}>ویژگی‌ها (داینامیک)</label>
            {(form.features || []).map((feat, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input value={feat.key || ''} onChange={e => {
                  const arr = [...form.features]
                  arr[i] = { ...arr[i], key: e.target.value }
                  hc('features', arr)
                }} placeholder="عنوان" list="featureKeys" style={{
                  flex: 1, padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                  borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                }} />
                <input value={feat.value || ''} onChange={e => {
                  const arr = [...form.features]
                  arr[i] = { ...arr[i], value: e.target.value }
                  hc('features', arr)
                }} placeholder="مقدار" style={{
                  flex: 1, padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                  borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                }} />
                <button type="button" onClick={() => hc('features', form.features.filter((_, idx) => idx !== i))} style={{
                  padding: '7px 12px', background: 'rgba(239,83,80,0.2)', color: '#EF5350',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
                }}>✕</button>
              </div>
            ))}
            <datalist id="featureKeys">
              {featurePlaceholders.map((p, i) => <option key={i} value={p} />)}
            </datalist>
            <button type="button" onClick={() => hc('features', [...(form.features || []), { key: '', value: '' }])} style={{
              marginTop: 6, padding: '7px 16px', background: '#F0F0EA', color: '#4CAF50',
              border: '1px dashed #D4AF37', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}>+ افزودن ویژگی</button>
          </div>
          {editing && (
            <div style={{ marginTop: 24, borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: 20 }}>
              <h4 style={{ color: '#4CAF50', fontSize: 14, margin: '0 0 12px' }}>پیش‌نمایش کارت محصول</h4>
              <div style={{
                maxWidth: 320, borderRadius: 16, overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.03), rgba(44,24,16,0.3))',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  height: 200, position: 'relative', overflow: 'hidden',
                  background: form.images?.[0]
                    ? `url(${form.images[0]}) center/cover no-repeat`
                    : '#F5F0E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {form.category && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '4px 12px', background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(4px)',
                      borderRadius: 50, color: '#4CAF50', fontSize: 11, fontWeight: 600, zIndex: 1,
                    }}>
                      {categories.find(c => c.slug === form.category)?.name || form.category}
                    </span>
                  )}
                  {!form.images?.[0] && (
                    <img src="/favicon.png" alt="" style={{ width: 64, height: 64, opacity: 0.6, objectFit: 'contain' }} />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 80, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  }} />
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <h3 style={{
                    color: '#2D2D2D', fontSize: 16, margin: '0 0 6px',
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  }}>
                    <span style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
                      <span>{form.name || 'نام محصول'}</span>
                      {form.name_en && <span style={{ color: '#666', fontSize: 10 }}>({form.name_en})</span>}
                      {form.name_ar && <span style={{ color: '#666', fontSize: 10 }}>| {form.name_ar}</span>}
                    </span>
                  </h3>
                  <p style={{ color: '#6B6B6B', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>
                    {form.description || form.desc_en || 'توضیحات محصول...'}
                  </p>
                  {form.price && (
                    <p style={{ color: '#4CAF50', fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
                      {form.price} تومان
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#D4AF37', '#8B4513', '#2C1810'].map((color, i) => (
                      <div key={i} style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: color, border: '2px solid rgba(255,255,255,0.1)',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 24px', background: saving ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
              color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14,
              transition: 'all 0.3s',
            }}>
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button onClick={handleCancel} style={{
              padding: '10px 24px', background: '#F0F0EA', color: '#2D2D2D',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}>
              انصراف
            </button>
          </div>
        </div>
      )}

      {productView === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {loading ? (
            <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#555', textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>محصولی یافت نشد</div>
          ) : items.map((item) => {
            const imgs = getImages(item)
            const col = (() => {
              const v = item.colors
              if (!v) return []
              if (Array.isArray(v)) return v.map(c => typeof c === 'string' ? c : (c.hex || c.name))
              if (typeof v === 'string') {
                try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(c => typeof c === 'string' ? c : (c.hex || c.name)) : [] } catch {}
                return v.split(',').map(c => c.trim()).filter(Boolean)
              }
              return []
            })()
            return (
              <div key={item.id} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.1)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ height: 150, background: imgs[0] ? `url(${imgs[0]}) center/cover no-repeat` : '#F5F0E8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!imgs[0] && <img src="/favicon.png" alt="" style={{ width: 48, height: 48, opacity: 0.6, objectFit: 'contain' }} />}
                  <span style={{
                    position: 'absolute', bottom: 8, right: 8, padding: '3px 10px',
                    background: 'rgba(0,0,0,0.08)', borderRadius: 50, color: '#4CAF50', fontSize: 10, fontWeight: 600,
                  }}>
                    {item.category || '—'}
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <h4 style={{ color: '#2D2D2D', margin: '0 0 4px', fontSize: 13, fontWeight: 700 }}>{item.name}</h4>
                  {item.price && <span style={{ color: '#4CAF50', fontSize: 12, fontWeight: 700 }}>{item.price} تومان</span>}
                  {col.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {col.map((c, i) => (
                        <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c.startsWith('#') ? c : '#5C3A1E', border: '2px solid rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button onClick={() => handleEdit(item)} style={{
                      flex: 1, padding: '6px 0', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
                      border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    }}>ویرایش</button>
                    <button onClick={() => setDeleteTarget(item)} style={{
                      padding: '6px 12px', background: 'rgba(239,83,80,0.15)', color: '#EF5350',
                      border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    }}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          data={items}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          searchKeys={['name', 'category', 'price']}
          loading={loading}
          emptyMessage="محصولی یافت نشد"
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف محصول"
        message={`آیا از حذف "${deleteTarget?.name || ''}" اطمینان دارید؟`}
        confirmText="حذف"
        cancelText="انصراف"
        danger
      />
    </div>
  )
}
