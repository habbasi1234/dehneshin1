import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { useToast } from '../../components/admin/Toast'

export default function AdminReviews() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = filter === 'pending' ? { approved: 'false' } : filter === 'approved' ? { approved: 'true' } : {}
      const { data } = await axios.get('/api/reviews', { params })
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const toggleApprove = async (item) => {
    try {
      await axios.put(`/api/reviews/${item.id}`, { approved: !item.approved })
      addToast(`نظر ${item.approved ? 'رد' : 'تأیید'} شد`, 'success')
      await load()
    } catch { addToast('خطا', 'error') }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/reviews/${deleteTarget.id}`)
      addToast('نظر حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'name', label: 'نام', render: (v) => v || '—' },
    {
      key: 'rating', label: 'امتیاز',
      render: (v) => <span style={{ color: '#4CAF50', fontSize: 13 }}>{'★'.repeat(v || 0)}{'☆'.repeat(5 - (v || 0))}</span>,
    },
    { key: 'comment', label: 'نظر', render: (v) => <span style={{ color: '#6B6B6B', fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span> },
    {
      key: 'approved', label: 'وضعیت',
      render: (v) => (
        <span style={{
          padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600,
          background: v ? 'rgba(102,187,106,0.2)' : 'rgba(255,167,38,0.2)',
          color: v ? '#66BB6A' : '#FFA726',
          border: `1px solid ${v ? 'rgba(210,125,86,0.3)' : 'rgba(255,167,38,0.3)'}`,
        }}>
          {v ? 'تأیید شده' : 'در انتظار'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'تاریخ',
      render: (v) => <span style={{ color: '#6B6B6B', fontSize: 11 }}>{v ? new Date(v).toLocaleDateString('fa-IR') : '—'}</span>,
    },
    {
      key: 'actions', label: 'عملیات',
      render: (_, item) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); toggleApprove(item) }} title={item.approved ? 'رد نظر' : 'تأیید نظر'}
            style={{
              padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11,
              background: item.approved ? 'rgba(255,167,38,0.2)' : 'rgba(102,187,106,0.2)',
              color: item.approved ? '#FFA726' : '#66BB6A',
            }}>
            {item.approved ? 'رد' : '✓ تأیید'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت نظرات محصولات</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{
          padding: '8px 12px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
        }}>
          <option value="all">همه نظرات</option>
          <option value="pending">در انتظار تأیید</option>
          <option value="approved">تأیید شده</option>
        </select>
      </div>

      <AdminTable columns={columns} data={items} onDelete={setDeleteTarget}
        searchKeys={['name', 'comment']} loading={loading} emptyMessage="نظری یافت نشد" />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="حذف نظر" message={`آیا از حذف نظر "${deleteTarget?.name || ''}" اطمینان دارید؟`}
        confirmText="حذف" cancelText="انصراف" danger />
    </div>
  )
}
