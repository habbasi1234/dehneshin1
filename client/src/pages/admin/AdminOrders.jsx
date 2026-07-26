import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import ProformaInvoice from '../../components/ProformaInvoice'
import { useToast } from '../../components/admin/Toast'

const statusFlow = ['pending', 'processing', 'design', 'production', 'delivery', 'completed']
const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusColors = {
  pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC',
  production: '#FF7043', delivery: '#26A69A',   completed: '#66BB6A', cancelled: '#EF5350',
}

export default function AdminOrders() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', customerTelegram: '', customerWhatsapp: '', address: '', notes: '', items: [], status: 'pending' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusAction, setStatusAction] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showInvoice, setShowInvoice] = useState(null) // { order, type: 'advance'|'back'|'complete'|'cancel'|'goto', target? }

  const load = async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const { data } = await axios.get('/api/orders', { params })
      setItems(data)
    } catch { addToast('خطا در بارگذاری', 'error') }
    setLoading(false)
  }

  const loadProducts = async () => {
    try { const { data } = await axios.get('/api/products'); setProducts(data) } catch { }
  }

  useEffect(() => { load(); loadProducts() }, [])
  useEffect(() => { load() }, [statusFilter])

  const handleView = (item) => setViewing(item)

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({
      customerName: item.customerName || '',
      customerPhone: item.customerPhone || '',
      customerEmail: item.customerEmail || '',
      customerTelegram: item.customerTelegram || '',
      customerWhatsapp: item.customerWhatsapp || '',
      address: item.address || '',
      notes: item.notes || '',
      status: item.status || 'pending',
      items: item.items || [],
    })
  }

  const handleNew = () => {
    setEditing('new')
    setForm({ customerName: '', customerPhone: '', customerEmail: '', customerTelegram: '', customerWhatsapp: '', address: '', notes: '', status: 'pending', items: [] })
  }

  const handleCancel = () => { setEditing(null); setForm({ customerName: '', customerPhone: '', customerEmail: '', customerTelegram: '', customerWhatsapp: '', address: '', notes: '', status: 'pending', items: [] }) }

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const addProductItem = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (!product) return
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: product.id, name: product.name, quantity: 1, price: product.price || '0' }],
    }))
  }

  const removeItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  const updateItemQty = (idx, qty) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, quantity: Math.max(1, qty) } : item),
    }))
  }

  const handleSave = async () => {
    if (form.items.length === 0) { addToast('حداقل یک محصول باید انتخاب شود', 'error'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await axios.post('/api/orders', form)
        addToast('سفارش با موفقیت ثبت شد', 'success')
      } else {
        await axios.put(`/api/orders/${editing}`, form)
        addToast('سفارش با موفقیت ویرایش شد', 'success')
      }
      handleCancel(); await load()
    } catch { addToast('خطا در ذخیره', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/orders/${deleteTarget.id}`)
      addToast('سفارش حذف شد', 'success')
      await load()
    } catch { addToast('خطا در حذف', 'error') }
    setDeleteTarget(null)
  }

  const changeStatus = async () => {
    if (!statusAction || statusLoading) return
    setStatusLoading(true)
    const { order, type, target } = statusAction
    let newStatus
    if (type === 'advance') {
      const idx = statusFlow.indexOf(order.status)
      if (idx >= statusFlow.length - 1) { setStatusAction(null); return }
      newStatus = statusFlow[idx + 1]
    } else if (type === 'back') {
      const idx = statusFlow.indexOf(order.status)
      if (idx <= 0) { setStatusAction(null); return }
      newStatus = statusFlow[idx - 1]
    } else if (type === 'complete') {
      newStatus = 'completed'
    } else if (type === 'cancel') {
      newStatus = 'cancelled'
    } else if (type === 'goto') {
      newStatus = target
    }
    try {
      await axios.put(`/api/orders/${order.id}`, { status: newStatus })
      addToast(`وضعیت به "${statusLabels[newStatus]}" تغییر یافت`, 'success')
      if (viewing?.id === order.id) {
        const updated = items.map(i => i.id === order.id ? { ...i, status: newStatus } : i)
        setItems(updated)
        setViewing({ ...viewing, status: newStatus })
      }
      await load()
    } catch { addToast('خطا در تغییر وضعیت', 'error') }
    setStatusAction(null)
    setStatusLoading(false)
  }

  const columns = [
    {
      key: 'code', label: 'کد سفارش',
      render: (v) => <span style={{ color: '#4CAF50', fontWeight: 700, fontSize: 13, direction: 'ltr', display: 'inline-block' }}>{v || '—'}</span>,
    },
    { key: 'customerName', label: 'مشتری', render: (v) => v || '—' },
    {
      key: 'items', label: 'محصولات',
      render: (_, item) => <span style={{ color: '#999', fontSize: 12 }}>{(item.items || []).length} عدد</span>,
    },
    {
      key: 'status', label: 'وضعیت',
      render: (v) => {
        const color = statusColors[v] || '#aaa'
        return (
          <span style={{
            color, fontWeight: 600, fontSize: 12,
            padding: '3px 10px', borderRadius: 50,
            background: color + '22', border: '1px solid ' + color + '44',
          }}>
            {statusLabels[v] || v}
          </span>
        )
      },
    },
    {
      key: 'createdAt', label: 'تاریخ',
      render: (v) => <span style={{ color: '#6B6B6B', fontSize: 11 }}>{v ? new Date(v).toLocaleDateString('fa-IR') : '—'}</span>,
    },
    {
      key: 'actions', label: 'عملیات',
      render: (_, item) => {
        const idx = statusFlow.indexOf(item.status)
        const canAdvance = idx >= 0 && idx < statusFlow.length - 1
        const canGoBack = idx > 0
        const isActive = item.status !== 'cancelled' && item.status !== 'completed'
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            {canGoBack && (
              <button onClick={(e) => { e.stopPropagation(); setStatusAction({ order: item, type: 'back' }) }} title="مرحله قبل"
                style={{ padding: '4px 7px', background: 'rgba(255,167,38,0.2)', color: '#4CAF50', border: '1px solid rgba(255,167,38,0.3)', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
                ◀
              </button>
            )}
            {canAdvance && (
              <button onClick={(e) => { e.stopPropagation(); setStatusAction({ order: item, type: 'advance' }) }} title="مرحله بعد"
                  style={{ padding: '4px 7px', background: 'rgba(76,175,80,0.2)', color: '#66BB6A', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
                ▶
              </button>
            )}
            {isActive && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setStatusAction({ order: item, type: 'complete' }) }} title="تکمیل"
                  style={{ padding: '4px 7px', background: 'rgba(102,187,106,0.2)', color: '#66BB6A', border: '1px solid rgba(102,187,106,0.3)', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
                  ✓
                </button>
                <button onClick={(e) => { e.stopPropagation(); setStatusAction({ order: item, type: 'cancel' }) }} title="لغو"
                  style={{ padding: '4px 7px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
                  ✕
                </button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  const calcStageDuration = (history, status) => {
    const idx = history.findIndex(h => h.status === status)
    const nextIdx = history.findIndex((h, i) => i > idx && ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled'].includes(h.status))
    if (idx === -1) return null
    const start = new Date(history[idx].date)
    const end = nextIdx !== -1 ? new Date(history[nextIdx].date) : new Date()
    return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
  }

  const getProductImage = (productId) => {
    const p = products.find(p => p.id === parseInt(productId))
    if (!p) return ''
    let imgs = p.images
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    return Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
  }

  const renderOrderDetail = (order) => {
    const totalDays = order.createdAt
      ? Math.max(0, Math.floor((new Date(order.updatedAt || Date.now()) - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)))
      : 0
    return (
    <div style={{ color: '#2D2D2D', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div>
          <h4 style={{ color: '#4CAF50', margin: '0 0 4px', fontSize: 14 }}>کد سفارش: {order.code}</h4>
          <p style={{ margin: '2px 0', fontSize: 11, color: '#6B6B6B' }}>تاریخ ثبت: {new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
          {order.estimatedDelivery && (
            <p style={{ margin: '2px 0', fontSize: 11, color: '#66BB6A' }}>
              پیش‌بینی تحویل: {new Date(order.estimatedDelivery).toLocaleDateString('fa-IR')}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ padding: '4px 10px', borderRadius: 50, background: (statusColors[order.status] || '#aaa') + '22', border: '1px solid ' + (statusColors[order.status] || '#aaa') + '44', color: statusColors[order.status] || '#aaa', fontWeight: 600, fontSize: 11 }}>
            {statusLabels[order.status] || order.status}
          </span>
          <span style={{ fontSize: 11, color: '#6B6B6B', paddingTop: 4 }}>{totalDays} روز</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, marginBottom: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
          <h5 style={{ color: '#4CAF50', margin: '0 0 6px', fontSize: 12 }}>اطلاعات مشتری</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 11 }}>
            <span style={{ color: '#6B6B6B' }}>نام:</span><span>{order.customerName || '—'}</span>
            <span style={{ color: '#6B6B6B' }}>موبایل:</span><span>{order.customerPhone || '—'}</span>
            <span style={{ color: '#6B6B6B' }}>ایمیل:</span><span>{order.customerEmail || '—'}</span>
            {order.customerTelegram && <><span style={{ color: '#6B6B6B' }}>تلگرام:</span><span>{order.customerTelegram}</span></>}
            {order.customerWhatsapp && <><span style={{ color: '#6B6B6B' }}>واتساپ:</span><span>{order.customerWhatsapp}</span></>}
            <span style={{ color: '#6B6B6B' }}>آدرس:</span><span style={{ wordBreak: 'break-word' }}>{order.address || '—'}</span>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
          <h5 style={{ color: '#4CAF50', margin: '0 0 6px', fontSize: 12 }}>محصولات ({order.items?.length || 0})</h5>
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {(order.items || []).map((item, i) => {
            const img = getProductImage(item.productId)
            return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              {img ? (
                <img src={img} alt="" onError={e => { e.target.style.display = 'none' }}
                  style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
              ) : <div style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🛋</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                {(item.selectedWoodColor || item.selectedFabric) && (
                  <div style={{ fontSize: 9, color: '#6B6B6B' }}>
                    {item.selectedWoodColor && <span>چوب: {item.selectedWoodColor} </span>}
                    {item.selectedFabric && <span>پارچه: {item.selectedFabric}</span>}
                  </div>
                )}
              </div>
              <span style={{ color: '#4CAF50', fontSize: 11, whiteSpace: 'nowrap' }}>{item.quantity} عدد</span>
            </div>
          )})}
          </div>
        </div>
      </div>

      {order.notes && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <h5 style={{ color: '#4CAF50', margin: '0 0 6px', fontSize: 12 }}>توضیحات</h5>
          <p style={{ margin: 0, fontSize: 11, color: '#6B6B6B' }}>{order.notes}</p>
        </div>
      )}

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
          <h5 style={{ color: '#4CAF50', margin: '0 0 6px', fontSize: 12 }}>تاریخچه وضعیت</h5>
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {order.statusHistory.map((h, i) => {
            const duration = calcStageDuration(order.statusHistory, h.status)
            return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', borderBottom: i < order.statusHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: 11 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[h.status] || '#aaa', flexShrink: 0 }} />
              <span style={{ color: statusLabels[h.status] ? '#F5E6C8' : '#A89880', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{statusLabels[h.status] || h.status}</span>
              <span style={{ color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(h.date).toLocaleString('fa-IR')}</span>
              {duration !== null && <span style={{ color: '#6B6B6B', whiteSpace: 'nowrap', flexShrink: 0 }}>({duration} روز)</span>}
            </div>
          )})}
          </div>
        </div>
      )}
    </div>
  )}

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 24, margin: 0 }}>مدیریت سفارشات</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
            padding: '8px 12px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
          }}>
            <option value="all">همه وضعیت‌ها</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button onClick={handleNew} style={{
            padding: '10px 22px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 'bold',
          }}>+ سفارش جدید</button>
        </div>
      </div>

      {/* Process Flow Diagram */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '20px 24px',
        border: '1px solid rgba(212,175,55,0.1)', marginBottom: 24, overflow: 'auto',
      }}>
        <h4 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📋</span> گردش کار سفارشات
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 700, justifyContent: 'center' }}>
          {statusFlow.map((s, i) => {
            const isEnd = i === statusFlow.length - 1
            const color = statusColors[s] || '#666'
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 2px',
                  cursor: 'pointer', opacity: statusFilter !== 'all' && statusFilter !== s ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }} onClick={() => setStatusFilter(s)}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: statusFilter === s ? color : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${statusFilter === s ? color : color + '44'}`,
                    fontSize: 18, color: statusFilter === s ? '#000' : '#888',
                    transition: 'all 0.3s',
                  }}>
                    {['🕐', '⚙️', '🎨', '🔨', '🚚', '✅'][i]}
                  </div>
                  <span style={{
                    color: statusFilter === s ? color : '#C0B090', fontSize: 10,
                    textAlign: 'center', whiteSpace: 'nowrap', fontWeight: statusFilter === s ? 700 : 500,
                  }}>
                    {statusLabels[s]}
                  </span>
                </div>
                {!isEnd && (
                  <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))', margin: '0 4px', marginBottom: 22, borderRadius: 1 }} />
                )}
              </div>
            )
          })}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 2px', cursor: 'pointer', opacity: statusFilter !== 'all' ? 0.4 : 1 }} onClick={() => setStatusFilter('all')}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: statusFilter === 'all' ? '#D4AF37' : 'rgba(255,255,255,0.03)', border: `2px solid ${statusFilter === 'all' ? '#D4AF37' : '#D4AF3744'}`, fontSize: 18, color: statusFilter === 'all' ? '#000' : '#888', transition: 'all 0.3s' }}>📋</div>
            <span style={{ color: statusFilter === 'all' ? '#D4AF37' : '#C0B090', fontSize: 10, textAlign: 'center', whiteSpace: 'nowrap', fontWeight: statusFilter === 'all' ? 700 : 500 }}>همه</span>
          </div>
        </div>
      </div>

      {editing && (
        <div style={{
          background: '#FAFAF7', borderRadius: 14, padding: 24, border: '1px solid #4CAF50',
          marginBottom: 24,
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 18 }}>
            {editing === 'new' ? 'سفارش جدید' : 'ویرایش سفارش'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>نام مشتری</label>
              <input value={form.customerName} onChange={e => hc('customerName', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>موبایل</label>
              <input value={form.customerPhone} onChange={e => hc('customerPhone', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>ایمیل</label>
              <input value={form.customerEmail} onChange={e => hc('customerEmail', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>تلگرام</label>
              <input value={form.customerTelegram} onChange={e => hc('customerTelegram', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>واتساپ</label>
              <input value={form.customerWhatsapp} onChange={e => hc('customerWhatsapp', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>آدرس</label>
              <input value={form.address} onChange={e => hc('address', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>محصولات</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select id="productSelect" style={{ flex: 1, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }}>
                  <option value="">انتخاب محصول</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button onClick={() => { const sel = document.getElementById('productSelect'); addProductItem(sel.value); sel.value = '' }}
                  style={{ padding: '8px 14px', background: '#F0F0EA', color: '#4CAF50', border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer' }}>
                  + افزودن
                </button>
              </div>
              {(form.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 13, color: '#2D2D2D' }}>{item.name}</span>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItemQty(i, parseInt(e.target.value) || 1)}
                    style={{ width: 60, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12, textAlign: 'center', outline: 'none' }} />
                  <button onClick={() => removeItem(i)} style={{ padding: '4px 8px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 8 }}>فرآیند جاری</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                {statusFlow.map((s, i) => {
                  const isCurrent = form.status === s
                  const color = statusColors[s] || '#666'
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <button type="button" onClick={() => hc('status', s)} style={{
                        padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: isCurrent ? color : 'rgba(255,255,255,0.04)',
                        color: isCurrent ? '#000' : '#A89880',
                        boxShadow: isCurrent ? `0 0 12px ${color}44` : 'none',
                        transition: 'all 0.2s',
                      }}>
                        {['🕐', '⚙️', '🎨', '🔨', '🚚', '✅'][i]} {statusLabels[s]}
                      </button>
                      {i < statusFlow.length - 1 && (
                        <span style={{ color: '#444', fontSize: 10, margin: '0 2px' }}>◀</span>
                      )}
                    </div>
                  )
                })}
                {form.status === 'cancelled' && (
                  <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#EF5350', color: '#fff' }}>✕ {statusLabels.cancelled}</span>
                )}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 4 }}>توضیحات</label>
              <textarea value={form.notes} onChange={e => hc('notes', e.target.value)} rows={2} style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', resize: 'vertical' }} />
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

      {viewing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setViewing(null)}>
          <div style={{ maxWidth: 'min(95vw, 800px)', width: '100%', background: '#FFFFFF', borderRadius: 12, padding: 16, border: '1px solid rgba(76,175,80,0.2)', maxHeight: 'calc(100vh - 40px)', overflow: 'auto', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: '#4CAF50', margin: 0, fontSize: 16 }}>جزئیات سفارش</h3>
              <button onClick={() => setViewing(null)} style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {renderOrderDetail(viewing)}
            <button onClick={() => setShowInvoice(viewing)} style={{
              marginTop: 10, width: '100%', padding: '10px', border: 'none', borderRadius: 6,
              background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff',
              fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
            }}>📄 نمایش پیش‌فاکتور</button>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(212,175,55,0.15)' }}>
              <label style={{ color: '#2D2D2D', fontSize: 11, display: 'block', marginBottom: 4 }}>انتقال به وضعیت:</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select id="gotoStatus" style={{ flex: 1, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 5, color: '#2D2D2D', fontSize: 12, outline: 'none' }}>
                  {statusFlow.filter(s => s !== viewing.status).map(s => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                  {viewing.status !== 'cancelled' && <option value="cancelled">{statusLabels.cancelled}</option>}
                </select>
                <button onClick={() => {
                  const target = document.getElementById('gotoStatus').value
                  if (target) setStatusAction({ order: viewing, type: 'goto', target })
                }} style={{
                  padding: '8px 18px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                  color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 13,
                }}>برو</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoice && <ProformaInvoice order={showInvoice} onClose={() => setShowInvoice(null)} />}

      <AdminTable columns={columns} data={items} onEdit={handleEdit} onDelete={setDeleteTarget}
        searchKeys={['code', 'customerName', 'customerPhone']} loading={loading} emptyMessage="سفارشی یافت نشد"
        onRowClick={handleView} />

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="حذف سفارش" message={`آیا از حذف سفارش "${deleteTarget?.code || ''}" اطمینان دارید؟`}
        confirmText="حذف" cancelText="انصراف" danger />

      {/* Status change confirm modal */}
      <ConfirmModal isOpen={!!statusAction} onClose={() => setStatusAction(null)} onConfirm={changeStatus}
        title="تغییر وضعیت سفارش"
        message={
          statusAction
            ? (() => {
                const t = statusAction
                const current = statusLabels[t.order.status] || t.order.status
                let next = ''
                if (t.type === 'advance') next = statusLabels[statusFlow[statusFlow.indexOf(t.order.status) + 1]] || ''
                else if (t.type === 'back') next = statusLabels[statusFlow[statusFlow.indexOf(t.order.status) - 1]] || ''
                else if (t.type === 'complete') next = statusLabels.completed
                else if (t.type === 'cancel') next = statusLabels.cancelled
                return `آیا از تغییر وضعیت سفارش ${t.order.code} از "${current}" به "${next}" اطمینان دارید؟`
              })()
            : ''
        }
        confirmText={statusLoading ? 'در حال تغییر...' : 'تأیید تغییر'}
        cancelText="انصراف"
        danger={statusAction?.type === 'cancel'} />
    </div>
  )
}
