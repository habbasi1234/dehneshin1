import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

const empty = { name: '', name_en: '', name_ar: '', slug: '', icon: '', parentId: null }

export default function AdminCategories() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [expandedParents, setExpandedParents] = useState({})
  const [langTab, setLangTab] = useState('name')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/categories')
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({ name: item.name || '', name_en: item.name_en || '', name_ar: item.name_ar || '', slug: item.slug || '', icon: item.icon || '', parentId: item.parentId || null })
  }

  const handleNew = () => { setEditing('new'); setForm(empty) }
  const handleCancel = () => { setEditing(null); setForm(empty) }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing === 'new') {
        await axios.post('/api/admin/categories', form)
        addToast('با موفقیت ایجاد شد', 'success')
      } else {
        await axios.put(`/api/admin/categories/${editing}`, form)
        addToast('با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch { addToast('خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/categories/${deleteTarget.id}`)
      addToast('با موفقیت حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const isImageUrl = (val) => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(val)
  const getTopLevel = () => items.filter(c => !c.parentId)
  const getChildren = (parentId) => items.filter(c => c.parentId === parentId)

  const toggleExpand = (id) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const renderTreeItem = (item, depth = 0) => {
    const children = getChildren(item.id)
    const isExpanded = expandedParents[item.id]
    const hasChildren = children.length > 0
    return (
      <div key={item.id}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginRight: depth * 28,
          borderRadius: 6,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} style={{
              background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer',
              fontSize: 10, padding: '2px 4px', transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}>
              ▶
            </button>
          ) : <span style={{ width: 18 }} />}
          <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>
            {item.icon ? (isImageUrl(item.icon) ? <img src={item.icon} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} /> : item.icon) : '📁'}
          </div>
          <span style={{ color: '#2D2D2D', fontSize: 13, flex: 1 }}>{item.name}</span>
          <span style={{ color: '#6B6B6B', fontSize: 10, direction: 'ltr' }}>{item.slug}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => handleEdit(item)} style={{
              padding: '4px 10px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
              border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11,
            }}>ویرایش</button>
            <button onClick={() => setDeleteTarget(item)} style={{
              padding: '4px 10px', background: 'rgba(239,83,80,0.15)', color: '#EF5350',
              border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11,
            }}>حذف</button>
          </div>
        </div>
        {hasChildren && isExpanded && children.map(child => renderTreeItem(child, depth + 1))}
      </div>
    )
  }

  const columns = [
    {
      key: 'icon', label: 'تصویر',
      render: (v) => {
        if (!v) return <span style={{ color: '#555' }}>—</span>
        return isImageUrl(v)
          ? <img src={v} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
          : <span style={{ fontSize: 20 }}>{v}</span>
      },
    },
    { key: 'name', label: 'نام' },
    { key: 'slug', label: 'اسلاگ', render: (v) => <span style={{ color: '#999' }}>{v || '—'}</span> },
    {
      key: 'parentId', label: 'والد',
      render: (v) => {
        if (!v) return <span style={{ color: '#555', fontSize: 11 }}>اصلی</span>
        const parent = items.find(c => c.id === v)
        return <span style={{ color: '#4CAF50', fontSize: 12 }}>{parent?.name || '—'}</span>
      },
    },
    {
      key: 'id', label: 'زیردسته‌ها',
      render: (v) => {
        const count = items.filter(c => c.parentId === v).length
        return count > 0
          ? <span style={{ color: '#66BB6A', fontSize: 12 }}>{count} زیردسته</span>
          : <span style={{ color: '#555', fontSize: 11 }}>—</span>
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت دسته‌بندی‌ها</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setViewMode('list')} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: viewMode === 'list' ? '#D4AF37' : '#888', fontSize: 12,
            }}>📋 لیست</button>
            <button onClick={() => setViewMode('tree')} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === 'tree' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: viewMode === 'tree' ? '#D4AF37' : '#888', fontSize: 12,
            }}>🌳 درختی</button>
          </div>
          <button onClick={handleNew} style={{
            padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
          }}>
            + دسته‌بندی جدید
          </button>
        </div>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24, boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام</label>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {['name', 'name_en', 'name_ar'].map(k => (
                  <button key={k} onClick={() => setLangTab(k)}
                    style={{
                      flex: 1, padding: '3px 0', fontSize: 10, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: langTab === k ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                      color: langTab === k ? '#111' : '#888',
                      fontWeight: langTab === k ? 700 : 400,
                    }}>{k === 'name' ? 'FA' : k === 'name_en' ? 'EN' : 'AR'}</button>
                ))}
              </div>
              <input value={form[langTab]} onChange={e => hc(langTab, e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>اسلاگ</label>
              <input value={form.slug} onChange={e => hc('slug', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>دسته‌بندی والد</label>
              <select value={form.parentId || ''} onChange={e => hc('parentId', e.target.value ? parseInt(e.target.value) : null)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">بدون والد (دسته اصلی)</option>
                {getTopLevel().filter(c => editing !== 'new' ? c.id !== editing : true).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تصویر / آیکون</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    const fd = new FormData()
                    fd.append('image', file)
                    const { data } = await axios.post('/api/upload/single', fd)
                    hc('icon', data.url)
                  } catch { }
                  setUploading(false)
                  e.target.value = ''
                }} disabled={uploading} style={{ color: '#2D2D2D', fontSize: 13 }} />
                {uploading && <span style={{ color: '#4CAF50', fontSize: 12 }}>در حال آپلود...</span>}
                {form.icon && isImageUrl(form.icon) ? (
                  <img src={form.icon} alt="پیش‌نمایش" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #D4D0C8' }} />
                ) : form.icon ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>{form.icon}</span>
                    <input value={form.icon} onChange={e => hc('icon', e.target.value)} placeholder="اموجی (مثلاً 🏺)" style={{
                      flex: 1, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                      borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                    }} />
                  </div>
                ) : (
                  <input value={form.icon} onChange={e => hc('icon', e.target.value)} placeholder="اموجی (مثلاً 🏺)" style={{
                    width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                    borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
                  }} />
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 24px', background: saving ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
              color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14,
            }}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
            <button onClick={handleCancel} style={{
              padding: '10px 24px', background: '#F0F0EA', color: '#2D2D2D',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}>انصراف</button>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <AdminTable columns={columns} data={items} onEdit={handleEdit} onDelete={setDeleteTarget}
          searchKeys={['name', 'slug']} loading={loading} emptyMessage="دسته‌بندی‌ای یافت نشد" />
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 16,
          border: '1px solid rgba(212,175,55,0.08)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#6B6B6B' }}>در حال بارگذاری...</div>
          ) : getTopLevel().length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#555' }}>دسته‌بندی‌ای یافت نشد</div>
          ) : (
            getTopLevel().map(item => renderTreeItem(item))
          )}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="حذف دسته‌بندی" message={`آیا از حذف "${deleteTarget?.name || ''}" اطمینان دارید؟`}
        confirmText="حذف" cancelText="انصراف" danger />
    </div>
  )
}
