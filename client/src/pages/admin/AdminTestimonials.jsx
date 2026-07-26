import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

const empty = { name: '', role: '', text: '', rating: '' }

export default function AdminTestimonials() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/content/testimonials')
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({
      name: item.name || '', role: item.role || '', text: item.text || '', rating: item.rating || '',
    })
  }

  const handleNew = () => { setEditing('new'); setForm(empty) }
  const handleCancel = () => { setEditing(null); setForm(empty) }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing === 'new') {
        await axios.post('/api/content/testimonials', form)
        addToast('با موفقیت ایجاد شد', 'success')
      } else {
        await axios.put(`/api/content/testimonials/${editing}`, form)
        addToast('با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch { addToast('خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/content/testimonials/${deleteTarget.id}`)
      addToast('با موفقیت حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const renderStars = (rating) => {
    const n = parseInt(rating) || 0
    return '★'.repeat(n) + '☆'.repeat(5 - n)
  }

  const columns = [
    { key: 'name', label: 'نام' },
    { key: 'role', label: 'نقش', render: (v) => <span style={{ color: '#999' }}>{v || '—'}</span> },
    {
      key: 'text', label: 'متن',
      render: (v) => (
        <span style={{ color: '#6B6B6B', maxWidth: 250, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {v || '—'}
        </span>
      ),
    },
    {
      key: 'rating', label: 'امتیاز',
      render: (v) => <span style={{ color: '#4CAF50', letterSpacing: 2, fontSize: 14 }}>{renderStars(v)}</span>,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت نظرات</h2>
        <button onClick={handleNew} style={{
          padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          + نظر جدید
        </button>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24, boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'نظر جدید' : 'ویرایش نظر'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام</label>
              <input value={form.name} onChange={e => hc('name', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نقش</label>
              <input value={form.role} onChange={e => hc('role', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>امتیاز</label>
              <input type="number" min="1" max="5" value={form.rating} onChange={e => hc('rating', e.target.value)} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8',
                borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>متن نظر</label>
            <textarea value={form.text} onChange={e => hc('text', e.target.value)} rows={4} style={{
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
        searchKeys={['name', 'role']}
        loading={loading}
        emptyMessage="نظری یافت نشد"
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف نظر"
        message={`آیا از حذف نظر "${deleteTarget?.name || ''}" اطمینان دارید؟`}
        confirmText="حذف"
        cancelText="انصراف"
        danger
      />
    </div>
  )
}
