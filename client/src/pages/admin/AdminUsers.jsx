import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

const empty = { username: '', password: '', name: '', phone: '', email: '', role: 'employee' }

const roleLabels = { admin: 'مدیر', employee: 'کارمند', support: 'پشتیبانی', editor: 'ویرایشگر' }
const roleColors = { admin: '#D4AF37', employee: '#4CAF50', support: '#2196F3', editor: '#9B59B6' }

export default function AdminUsers() {
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
      const { data } = await axios.get('/api/auth/users')
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({ username: item.username || '', password: '', name: item.name || '', phone: item.phone || '', email: item.email || '', role: item.role || 'customer' })
  }

  const handleNew = () => { setEditing('new'); setForm(empty) }
  const handleCancel = () => { setEditing(null); setForm(empty) }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.username) { addToast('نام کاربری الزامی است', 'error'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        if (!form.password) { addToast('رمز عبور الزامی است', 'error'); setSaving(false); return }
        await axios.post('/api/auth/register', form)
        addToast('کاربر با موفقیت ایجاد شد', 'success')
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await axios.put(`/api/auth/users/${editing}`, payload)
        addToast('کاربر با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch (e) { addToast(e.response?.data?.error || 'خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/auth/users/${deleteTarget.id}`)
      addToast('کاربر حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'username', label: 'نام کاربری' },
    { key: 'name', label: 'نام', render: (v) => v || '—' },
    { key: 'phone', label: 'موبایل', render: (v) => <span style={{ color: '#999', direction: 'ltr', display: 'inline-block' }}>{v || '—'}</span> },
    { key: 'email', label: 'ایمیل', render: (v) => <span style={{ color: '#999', fontSize: 12 }}>{v || '—'}</span> },
    {
      key: 'role', label: 'نقش',
      render: (v) => <span style={{ color: roleColors[v] || '#aaa', fontWeight: 600, fontSize: 12 }}>{roleLabels[v] || v}</span>,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت کاربران</h2>
        <button onClick={handleNew} style={{
          padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
        }}>+ کاربر جدید</button>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24, boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'کاربر جدید' : 'ویرایش کاربر'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام کاربری *</label>
              <input value={form.username} onChange={e => hc('username', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>{editing === 'new' ? 'رمز عبور *' : 'رمز عبور (خالی = عدم تغییر)'}</label>
              <input type="password" value={form.password} onChange={e => hc('password', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام</label>
              <input value={form.name} onChange={e => hc('name', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>موبایل</label>
              <input value={form.phone} onChange={e => hc('phone', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>ایمیل</label>
              <input value={form.email} onChange={e => hc('email', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نقش</label>
              <select value={form.role} onChange={e => hc('role', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }}>
                <option value="employee">کارمند</option>
                <option value="admin">مدیر</option>
                <option value="support">پشتیبانی</option>
                <option value="editor">ویرایشگر</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 24px', background: saving ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
              color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14,
            }}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
            <button onClick={handleCancel} style={{ padding: '10px 24px', background: '#F0F0EA', color: '#2D2D2D', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>انصراف</button>
          </div>
        </div>
      )}

      <AdminTable columns={columns} data={items} onEdit={handleEdit} onDelete={setDeleteTarget} searchKeys={['username', 'name', 'phone', 'email']} loading={loading} emptyMessage="کاربری یافت نشد" />

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="حذف کاربر" message={`آیا از حذف "${deleteTarget?.name || deleteTarget?.username}" اطمینان دارید؟`}
        confirmText="حذف" cancelText="انصراف" danger />
    </div>
  )
}
