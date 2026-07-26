import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

const typeLabels = {
  contact: 'تماس با ما',
  comment: 'نظرات و پیشنهادات',
  consultation: 'مشاوره تخصصی',
}
const typeColors = {
  contact: '#42A5F5',
  comment: '#AB47BC',
  consultation: '#66BB6A',
}

export default function AdminMessages() {
  const toast = useToast()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/messages')
      setMessages(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    await axios.put(`/api/admin/messages/${id}/read`)
    await load()
    toast('پیام به عنوان خوانده شد علامت‌گذاری شد')
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/admin/messages/${id}`)
    setSelected(null)
    setDeleteTarget(null)
    await load()
    toast('پیام با موفقیت حذف شد', 'error')
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const columns = [
    { key: 'type', label: 'نوع درخواست', render: (v) => {
      const color = typeColors[v] || '#888'
      return (
        <span style={{ color, fontWeight: 600, fontSize: 12, padding: '3px 10px', borderRadius: 50, background: color + '22', border: '1px solid ' + color + '44' }}>
          {typeLabels[v] || v || 'تماس با ما'}
        </span>
      )
    }},
    { key: 'name', label: 'نام' },
    { key: 'phone', label: 'شماره تماس' },
    { key: 'productType', label: 'نوع محصول', render: (v) => v || 'عمومی' },
    { key: 'createdAt', label: 'تاریخ', render: (v) => formatDate(v) },
    { key: 'read', label: 'وضعیت', render: (v) => v ? 'خوانده شده' : 'جدید' },
  ]

  const handleRowClick = (item) => {
    setSelected(item)
    if (!item.read) handleMarkRead(item.id)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>پیام‌های دریافتی</h2>
      </div>

      <AdminTable
        columns={columns}
        data={messages}
        searchKeys={['name', 'phone', 'productType']}
        loading={loading}
        emptyMessage="هیچ پیامی دریافت نشده است."
        onDelete={(item) => setDeleteTarget(item)}
        onRowClick={handleRowClick}
      />

      {selected && (
        <div style={{
          marginTop: 24, background: '#FAFAF7', borderRadius: 14, padding: 24,
          border: '1px solid #D4D0C8',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 18 }}>{selected.name}</h3>
              <div style={{ marginBottom: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 50, background: (typeColors[selected.type] || '#888') + '22', border: '1px solid ' + (typeColors[selected.type] || '#888') + '44', color: typeColors[selected.type] || '#888', fontWeight: 600, fontSize: 12 }}>
                  {typeLabels[selected.type] || selected.type || 'تماس با ما'}
                </span>
              </div>
              <div style={{ color: '#2D2D2D', fontSize: 13, marginBottom: 4 }}>
                <strong style={{ color: '#4CAF50' }}>شماره تماس: </strong>
                <span dir="ltr">{selected.phone}</span>
              </div>
              {selected.productType && (
                <div style={{ color: '#2D2D2D', fontSize: 13, marginBottom: 4 }}>
                  <strong style={{ color: '#4CAF50' }}>نوع محصول: </strong>{selected.productType}
                </div>
              )}
              <div style={{ color: '#6B6B6B', fontSize: 12 }}>{formatDate(selected.createdAt)}</div>
            </div>
            <button onClick={() => setDeleteTarget(selected)} style={{
              padding: '6px 14px',
              background: '#3d1a1a',
              color: '#ff6b6b',
              border: '1px solid #ff6b6b',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}>حذف</button>
          </div>
          {selected.description && (
            <div style={{
              marginTop: 20, padding: 16, background: '#FFFFFF',
              borderRadius: 8, color: '#2D2D2D', lineHeight: 1.7, fontSize: 14,
            }}>
              {selected.description}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="حذف پیام"
        message={`آیا از حذف پیام ${deleteTarget?.name || ''} اطمینان دارید؟`}
        confirmText="حذف"
        cancelText="انصراف"
        danger
      />
    </div>
  )
}
