import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../../components/admin/Toast'
import ImageUpload from '../../components/admin/ImageUpload'
import CustomerCard from '../../components/CustomerCard'

const tiers = [
  { id: 'bronze', label: 'برنزی', color: '#CD7F32', bg: 'linear-gradient(135deg, #CD7F32, #A0522D, #CD7F32)' },
  { id: 'silver', label: 'نقره‌ای', color: '#C0C0C0', bg: 'linear-gradient(135deg, #C0C0C0, #E8E8E8, #C0C0C0)' },
  { id: 'gold', label: 'طلایی', color: '#4CAF50', bg: 'linear-gradient(135deg, #D4AF37, #F0D060, #D4AF37)' },
]

export default function AdminCustomers() {
  const addToast = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(null)
  const [cardCustomer, setCardCustomer] = useState(null)

  const load = () => {
    setLoading(true)
    axios.get('/api/content/customers').then(({ data }) => setCustomers(data))
      .catch(() => addToast('خطا در بارگذاری مشتریان', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const save = async (data) => {
    try {
      if (data.id) {
        await axios.put(`/api/content/customers/${data.id}`, data)
        addToast('مشتری بروزرسانی شد', 'success')
      } else {
        await axios.post('/api/content/customers', data)
        addToast('مشتری اضافه شد', 'success')
      }
      setEdit(null)
      load()
    } catch { addToast('خطا در ذخیره', 'error') }
  }

  const remove = async (id) => {
    if (!confirm('حذف شود؟')) return
    try {
      await axios.delete(`/api/content/customers/${id}`)
      addToast('مشتری حذف شد', 'success')
      load()
    } catch { addToast('خطا در حذف', 'error') }
  }

  return (
    <div style={{ padding: 20, color: '#2D2D2D' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#4CAF50', margin: 0, fontSize: 20 }}>باشگاه مشتریان</h2>
        <button onClick={() => setEdit({ name: '', name_fa: '', name_en: '', phone: '', email: '', nationalCode: '', address: '', tier: 'bronze', points: 0, totalPurchase: 0, avatar: '' })}
          style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>+ مشتری جدید</button>
        &nbsp;
        <button onClick={async () => {
          try {
            const { data } = await axios.get('/api/content/customers')
            const csv = '\uFEFF' + ['نام فارسی,نام انگلیسی,موبایل,ایمیل,کد مشتری,کد ملی,سطح,امتیاز,خرید کل,آدرس'].join(',') + '\n' +
              data.map(c => [c.name_fa || c.name, c.name_en || '', c.phone, c.email, c.customerCode, c.nationalCode, c.tier, c.points, c.totalPurchase, (c.address || '').replace(/,/g, ';')].join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = 'customers.csv'
            link.click()
          } catch {}
        }} style={{ padding: '8px 16px', background: '#F0F0EA', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>📥 خروجی CSV</button>
      </div>

      {edit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEdit(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 500, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#4CAF50', margin: '0 0 16px', fontSize: 16 }}>{edit.id ? 'ویرایش مشتری' : 'مشتری جدید'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 70, height: 70, flexShrink: 0 }}>
                  <ImageUpload value={edit.avatar} onChange={url => setEdit(prev => ({ ...prev, avatar: url }))} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={edit.name_fa ?? edit.name} onChange={e => setEdit(prev => ({ ...prev, name_fa: e.target.value }))} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13 }} placeholder="نام فارسی" />
                  <input value={edit.name_en || ''} onChange={e => setEdit(prev => ({ ...prev, name_en: e.target.value }))} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, direction: 'ltr' }} placeholder="نام انگلیسی" />
                  <input value={edit.phone} onChange={e => setEdit(prev => ({ ...prev, phone: e.target.value }))} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, direction: 'ltr' }} placeholder="موبایل" />
                </div>
              </div>
              <input value={edit.email || ''} onChange={e => setEdit(prev => ({ ...prev, email: e.target.value }))} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, direction: 'ltr' }} placeholder="ایمیل" />
              <input value={edit.nationalCode || ''} onChange={e => setEdit(prev => ({ ...prev, nationalCode: e.target.value }))} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, direction: 'ltr' }} placeholder="کد ملی" />
              <textarea value={edit.address || ''} onChange={e => setEdit(prev => ({ ...prev, address: e.target.value }))} rows={2} style={{ padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, resize: 'vertical' }} placeholder="آدرس" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>سطح</label>
                  <select value={edit.tier} onChange={e => setEdit(prev => ({ ...prev, tier: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13 }}>
                    {tiers.map(t => <option key={t.id} value={t.id}>{t.label} ({t.id})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>امتیاز</label>
                  <input type="number" value={edit.points || 0} onChange={e => setEdit(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>خرید کل (تومان)</label>
                  <input type="number" value={edit.totalPurchase || 0} onChange={e => setEdit(prev => ({ ...prev, totalPurchase: parseInt(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 10px', background: '#FAFAF7', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => save(edit)} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>ذخیره</button>
                <button onClick={() => setEdit(null)} style={{ padding: '10px 20px', background: '#E8E4DC', color: '#6B6B6B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B6B6B' }}>در حال بارگذاری...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B6B6B' }}>هیچ مشتری‌ای ثبت نشده است</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.map(c => {
            const tier = tiers.find(t => t.id === c.tier) || tiers[0]
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid #D4D0C8' }}>
                {c.avatar ? (
                  <img src={c.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#2D2D2D' }}>{c.name_fa || c.name}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>🇬🇧 {c.name_en || '-'}</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>{c.phone} {c.email ? `| ${c.email}` : ''}</div>
                  <div style={{ fontSize: 10, color: '#4CAF50' }}>کد: {c.customerCode || '-'} {c.username ? `| کاربر: ${c.username}` : ''}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}44` }}>{tier.label}</span>
                <span style={{ color: '#6B6B6B', fontSize: 12 }}>{c.points || 0} امتیاز</span>
                <button onClick={() => setEdit(c)} style={{ padding: '4px 12px', background: 'rgba(212,175,55,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>ویرایش</button>
                <button onClick={() => setCardCustomer(c)} style={{ padding: '4px 8px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>🪪</button>
                <button onClick={() => remove(c.id)} style={{ padding: '4px 8px', background: 'rgba(239,83,80,0.15)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {cardCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCardCustomer(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <CustomerCard customer={cardCustomer} showPrint />
          </div>
        </div>
      )}
    </div>
  )
}
