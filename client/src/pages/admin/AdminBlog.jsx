import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

const empty = {
  title: '', slug: '', category: '', subcategory: '', description: '', content: '',
  image: '', image2: '', image3: '', video: '', audio: '', date: '', tags: '', keywords: '',
}

const blogCategories = [
  { label: 'دکوراسیون', sub: ['داخلی', 'خارجی', 'اداری', 'کلاسیک', 'مدرن'] },
  { label: 'متریال', sub: ['چوب گردو', 'چوب راش', 'چوب روسی', 'ام‌دی‌اف', 'فلز'] },
  { label: 'رنگ شناسی', sub: ['ترکیب رنگ', 'رنگ طلایی', 'رنگ کرم', 'رنگ مدرن'] },
  { label: 'طراحی', sub: ['نئوکلاسیک', 'مینیمال', 'باروک', 'اتریشی', 'فرانسوی'] },
  { label: 'مراقبت', sub: ['تمیزکاری', 'نگهداری چوب', 'تعمیرات', 'پارچه'] },
  { label: 'ترند', sub: ['۱۴۰۴', '۱۴۰۵', 'مدل‌های جدید'] },
  { label: 'عمومی', sub: [] },
]

export default function AdminBlog() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/content/blog')
      setItems(Array.isArray(data) ? data : [])
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleEdit = (item) => {
    setEditing(item.id)
    const parseArr = (v) => {
      if (!v) return ''
      try { return JSON.parse(v).join(', ') } catch { return v }
    }
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      description: item.description || '',
      content: item.content || '',
      image: item.image || '',
      image2: item.image2 || '',
      image3: item.image3 || '',
      video: item.video || '',
      audio: item.audio || '',
      date: item.date || '',
      tags: item.tags || '',
      keywords: item.keywords || '',
    })
  }

  const handleNew = () => { setEditing('new'); setForm(empty) }
  const handleCancel = () => { setEditing(null); setForm(empty) }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing === 'new') {
        await axios.post('/api/content/blog', payload)
        addToast('با موفقیت ایجاد شد', 'success')
      } else {
        await axios.put(`/api/content/blog/${editing}`, payload)
        addToast('با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch { addToast('خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/content/blog/${deleteTarget.id}`)
      addToast('با موفقیت حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const uploadImage = async (file) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await axios.post('/api/upload/single', fd)
      return data.url
    } catch { addToast('خطا در آپلود', 'error'); return '' }
    finally { setUploading(false) }
  }

  const mediaIcon = (url) => {
    if (!url) return null
    if (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo')) return '🎬'
    if (url.includes('mp4') || url.includes('video')) return '🎥'
    if (url.includes('mp3') || url.includes('audio') || url.includes('soundcloud')) return '🎵'
    return '📎'
  }

  const columns = [
    {
      key: 'image', label: 'تصویر',
      render: (v, item) => {
        const hasMedia = item.video || item.audio
        return (
          <div style={{ position: 'relative', width: 50, height: 40 }}>
            {v
              ? <img src={v} alt="" style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 4 }} />
              : <span style={{ color: '#555' }}>—</span>
            }
            {hasMedia && <span style={{ position: 'absolute', top: -6, left: -6, fontSize: 12 }}>{mediaIcon(item.video || item.audio)}</span>}
          </div>
        )
      },
    },
    { key: 'title', label: 'عنوان' },
    {
      key: 'category', label: 'دسته',
      render: (v, item) => (
        <span style={{ color: '#999', fontSize: 12 }}>
          {v || '—'}{item.subcategory ? ` / ${item.subcategory}` : ''}
        </span>
      ),
    },
    { key: 'date', label: 'تاریخ', render: (v) => <span style={{ color: '#999' }}>{v || '—'}</span> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت مقالات</h2>
        <button onClick={handleNew} style={{
          padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          + مقاله جدید
        </button>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24, boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'مقاله جدید' : 'ویرایش مقاله'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>عنوان</label>
              <input value={form.title} onChange={e => hc('title', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>اسلاگ (SEO)</label>
              <input value={form.slug} onChange={e => hc('slug', e.target.value)} placeholder="example-title" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>دسته</label>
              <select value={form.category} onChange={e => { hc('category', e.target.value); hc('subcategory', '') }} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">انتخاب دسته</option>
                {blogCategories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>زیردسته</label>
              <select value={form.subcategory} onChange={e => hc('subcategory', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">انتخاب زیردسته</option>
                {(blogCategories.find(c => c.label === form.category)?.sub || []).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>برچسب‌ها (کاما)</label>
              <input value={form.tags} onChange={e => hc('tags', e.target.value)} placeholder="دکوراسیون, کلاسیک, مدرن" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تاریخ</label>
              <input type="date" value={form.date} onChange={e => hc('date', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تصویر اصلی</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const url = await uploadImage(e.target.files[0])
                  if (url) hc('image', url)
                  e.target.value = ''
                }} disabled={uploading} style={{ color: '#2D2D2D', fontSize: 11, flex: 1 }} />
                {uploading && <span style={{ color: '#4CAF50', fontSize: 11 }}>⏳</span>}
              </div>
              {form.image && <img src={form.image} alt="" onError={e => { e.target.style.display = 'none' }} style={{ marginTop: 4, width: 100, height: 60, objectFit: 'cover', borderRadius: 6 }} />}
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تصویر ۲</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="text" value={form.image2} onChange={e => hc('image2', e.target.value)} placeholder="URL یا آپلود..." style={{ flex: 1, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, direction: 'ltr' }} />
                <input type="file" accept="image/*" style={{ display: 'none' }} id="img2" onChange={async (e) => {
                  const url = await uploadImage(e.target.files[0])
                  if (url) hc('image2', url)
                  e.target.value = ''
                }} />
                <button onClick={() => document.getElementById('img2').click()} style={{ padding: '4px 8px', background: '#F0F0EA', color: '#4CAF50', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>📁</button>
              </div>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تصویر ۳</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="text" value={form.image3} onChange={e => hc('image3', e.target.value)} placeholder="URL یا آپلود..." style={{ flex: 1, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, direction: 'ltr' }} />
                <input type="file" accept="image/*" style={{ display: 'none' }} id="img3" onChange={async (e) => {
                  const url = await uploadImage(e.target.files[0])
                  if (url) hc('image3', url)
                  e.target.value = ''
                }} />
                <button onClick={() => document.getElementById('img3').click()} style={{ padding: '4px 8px', background: '#F0F0EA', color: '#4CAF50', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>📁</button>
              </div>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>ویدئو (URL)</label>
              <input value={form.video} onChange={e => hc('video', e.target.value)} placeholder="https://youtube.com/... یا https://...mp4" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 12, outline: 'none', direction: 'ltr',
              }} />
              {form.video && <span style={{ fontSize: 11, color: '#4CAF50' }}>✅ {mediaIcon(form.video)} ویدئو اضافه شد</span>}
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>صوت (URL)</label>
              <input value={form.audio} onChange={e => hc('audio', e.target.value)} placeholder="https://...mp3 یا https://soundcloud.com/..." style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 12, outline: 'none', direction: 'ltr',
              }} />
              {form.audio && <span style={{ fontSize: 11, color: '#4CAF50' }}>✅ {mediaIcon(form.audio)} صوت اضافه شد</span>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>توضیحات کوتاه</label>
            <textarea value={form.description} onChange={e => hc('description', e.target.value)} rows={2} style={{
              width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
              borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', resize: 'vertical',
            }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>کلمات کلیدی (SEO, با کاما)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.keywords} onChange={e => hc('keywords', e.target.value)} placeholder="تغذیه سالم, محصولات ارگانیک, کشاورزی طبیعی" style={{
                flex: 1, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'rtl',
              }} />
              <button type="button" onClick={async () => {
                const url = prompt('لینک سایت رقیب را وارد کنید:')
                if (!url) return
                try {
                  const { data } = await axios.post('/api/seo/extract-keywords', { url })
                  if (data.keywords) {
                    const existing = form.keywords ? form.keywords.split('،').map(k => k.trim()).filter(Boolean) : []
                    const newKeys = data.keywords.filter(k => !existing.includes(k))
                    hc('keywords', [...existing, ...newKeys].join('، '))
                    addToast(`${newKeys.length} کلمه کلیدی جدید استخراج شد`, 'success')
                  }
                } catch { addToast('خطا در استخراج کلمات کلیدی', 'error') }
              }} style={{
                padding: '8px 14px', background: '#F0F0EA', color: '#4CAF50',
                border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
              }}>🔍 استخراج از رقیب</button>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>محتوا</label>
            <textarea value={form.content} onChange={e => hc('content', e.target.value)} rows={8} style={{
              width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
              borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', resize: 'vertical',
            }} />
          </div>
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

      <AdminTable
        columns={columns}
        data={items}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        searchKeys={['title', 'category', 'subcategory', 'tags']}
        loading={loading}
        emptyMessage="مقاله‌ای یافت نشد"
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف مقاله"
        message={`آیا از حذف "${deleteTarget?.title || ''}" اطمینان دارید؟`}
        confirmText="حذف"
        cancelText="انصراف"
        danger
      />
    </div>
  )
}