import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useToast } from '../../components/admin/Toast'

export default function Admin3DProducts() {
  const addToast = useToast()
  const [products, setProducts] = useState([])
  const [models, setModels] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ productId: '', title: '', images: [] })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [prodsRes, modelsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/admin/3d-models'),
      ])
      setProducts(prodsRes.data)
      setModels(modelsRes.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleUpload = async (files) => {
    setUploading(true)
    try {
      const formData = new FormData()
      for (let f of files) formData.append('images', f)
      const { data } = await axios.post('/api/upload/multiple', formData)
      const urls = data.urls.map(u => u.url)
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
    } catch { addToast('خطا در آپلود', 'error') }
    setUploading(false)
  }

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const saveModel = async () => {
    try {
      const payload = { ...form, images: JSON.stringify(form.images) }
      if (editing) {
        await axios.put(`/api/admin/3d-models/${editing}`, payload)
        addToast('مدل سه‌بعدی ویرایش شد', 'success')
      } else {
        await axios.post('/api/admin/3d-models', payload)
        addToast('مدل سه‌بعدی ایجاد شد', 'success')
      }
      setEditing(null); setForm({ productId: '', title: '', images: [] })
      load()
    } catch { addToast('خطا در ذخیره', 'error') }
  }

  const deleteModel = async (id) => {
    try {
      await axios.delete(`/api/admin/3d-models/${id}`)
      addToast('حذف شد', 'success'); load()
    } catch { addToast('خطا', 'error') }
  }

  const selectedProduct = products.find(p => String(p.id) === String(form.productId))
  const angleImages = form.images || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت مدل‌های سه‌بعدی</h2>
        <button onClick={() => { setEditing(null); setForm({ productId: '', title: '', images: [] }) }}
          style={{
            padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
          }}>+ مدل جدید</button>
      </div>

      {editing !== undefined && (
        <div style={{ background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50', marginBottom: 24 }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing ? 'ویرایش مدل سه‌بعدی' : 'مدل سه‌بعدی جدید'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>محصول</label>
              <select value={form.productId} onChange={e => hc('productId', e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                  borderRadius: 8, color: '#2D2D2D', fontSize: 13,
                }}>
                <option value="">انتخاب محصول...</option>
                {products.filter(p => p.status !== 'finished').map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category || 'بدون دسته'})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>عنوان مدل</label>
              <input value={form.title} onChange={e => hc('title', e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                  borderRadius: 8, color: '#2D2D2D', fontSize: 13,
                }} placeholder="مثلاً: نمایش ۳۶۰ درجه مبل سلطنتی" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>
              تصاویر از زوایای مختلف ({angleImages.length} تصویر)
            </label>
            <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 8 }}>
              از محصول از زوایای مختلف (جلو، عقب، راست، چپ، بالا، پایین) عکس بگیرید و آپلود کنید تا نمایش ۳۶۰ درجه ایجاد شود.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {angleImages.map((url, i) => (
                <div key={i} style={{
                  position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                  border: previewIndex === i ? '2px solid #D4AF37' : '1px solid #333',
                  cursor: 'pointer',
                }} onClick={() => setPreviewIndex(i)}>
                  <img src={url.startsWith('http') ? url : url} alt=""
                    onError={e => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                    style={{
                      position: 'absolute', top: 2, right: 2, width: 18, height: 18,
                      background: 'rgba(255,0,0,0.8)', border: 'none', borderRadius: '50%',
                      color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>
              ))}
              <label style={{
                width: 80, height: 80, borderRadius: 8, border: '2px dashed #555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B6B6B', fontSize: 24,
              }}>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.length) handleUpload([...e.target.files]) }} />
                {uploading ? '...' : '+'}
              </label>
            </div>
          </div>

          {angleImages.length > 1 && (
            <div style={{
              background: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, textAlign: 'center',
            }}>
              <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 8 }}>پیش‌نمایش ۳۶۰ درجه (اسلایدر)</p>
              <div style={{
                width: 280, height: 280, margin: '0 auto', borderRadius: 12,
                background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(212,175,55,0.1)', overflow: 'hidden', position: 'relative',
              }}>
                <img
                  key={previewIndex}
                  src={angleImages[previewIndex]}
                  alt=""
                  onError={e => { e.currentTarget.style.display = 'none' }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.2s' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                {angleImages.map((_, i) => (
                  <button key={i} onClick={() => setPreviewIndex(i)}
                    style={{
                      width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: i === previewIndex ? '#D4AF37' : 'rgba(212,175,55,0.2)',
                    }} />
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => {
                  setPreviewIndex(prev => (prev - 1 + angleImages.length) % angleImages.length)
                }} style={{
                  padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid #D4D0C8',
                  borderRadius: 6, color: '#2D2D2D', cursor: 'pointer', fontSize: 12,
                }}>◀ قبلی</button>
                <button onClick={() => {
                  setPreviewIndex(prev => (prev + 1) % angleImages.length)
                }} style={{
                  padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid #D4D0C8',
                  borderRadius: 6, color: '#2D2D2D', cursor: 'pointer', fontSize: 12,
                }}>بعدی ▶</button>
                <button onClick={() => {
                  const interval = setInterval(() => {
                    setPreviewIndex(prev => (prev + 1) % angleImages.length)
                  }, 150)
                  setTimeout(() => clearInterval(interval), angleImages.length * 200)
                }} style={{
                  padding: '6px 14px', background: 'rgba(212,175,55,0.12)', border: '1px solid #4CAF50',
                  borderRadius: 6, color: '#4CAF50', cursor: 'pointer', fontSize: 12,
                }}>▶ پخش خودکار</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(undefined)}
              style={{ padding: '8px 20px', background: '#F0F0EA', border: '1px solid #D4D0C8', borderRadius: 6, color: '#6B6B6B', cursor: 'pointer' }}>
              انصراف
            </button>
            <button onClick={saveModel}
              style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)', border: 'none', borderRadius: 6, color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}>
              ذخیره مدل سه‌بعدی
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: '#FFFFFF', borderRadius: 12, border: '1px solid #D4D0C8', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              {['محصول', 'تعداد تصاویر', 'عملیات'].map(h => (
                <th key={h} style={{ padding: '10px 14px', color: '#6B6B6B', fontSize: 11, textAlign: 'right', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#555' }}>هنوز مدلی ثبت نشده است</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
