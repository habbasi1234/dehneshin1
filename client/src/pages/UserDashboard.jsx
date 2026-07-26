import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUserAuth } from '../context/UserAuthContext'
import useSEO from '../hooks/useSEO'
import AuthModal from '../components/AuthModal'
import axios from 'axios'

export default function UserDashboard() {
  useSEO({ title: 'حساب کاربری | ده نشین', description: 'پنل کاربری ده نشین' })
  const { user, loading: authLoading, logout } = useUserAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [authOpen, setAuthOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '', email: user.email || '' })
      axios.get('/api/orders', { params: { userId: user.id } })
        .then(({ data }) => setOrders(data))
        .catch(() => {})
    }
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await axios.put(`/api/auth/profile`, profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      })
    } catch {}
    setSaving(false)
    setEditMode(false)
  }

  if (authLoading) return (
    <div className="page-bg" style={{ minHeight: '100vh', paddingTop: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%' }} />
    </div>
  )

  if (!user) {
    return (
      <div className="page-bg" style={{ minHeight: '100vh', paddingTop: 70 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
            <h2 style={{ color: '#D4AF37', fontSize: 20, marginBottom: 8 }}>حساب کاربری</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>برای مشاهده سفارش‌ها و اطلاعات خود وارد شوید</p>
            <button onClick={() => setAuthOpen(true)}
              style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #D4AF37, #8B6914)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              ورود / عضویت
            </button>
          </div>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    )
  }

  const changePassword = async () => {
    setPassMsg('')
    try {
      await axios.put('/api/auth/change-password', passForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      })
      setPassMsg('success')
      setPassForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPassMsg(err.response?.data?.error || 'خطا رخ داد')
    }
  }

  const tabs = [
    { key: 'orders', label: 'سفارش‌ها', icon: '📦', count: orders.length },
    { key: 'info', label: 'اطلاعات من', icon: '👤' },
    { key: 'password', label: 'تغییر رمز', icon: '🔒' },
  ]

  return (
    <div className="page-bg" style={{ minHeight: '100vh', paddingTop: 70 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(212,175,55,0.1)',
              padding: 16, position: 'sticky', top: 90, overflow: 'hidden',
            }}>
              <div style={{ textAlign: 'center', padding: '12px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px',
                  background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#000', fontWeight: 700,
                }}>
                  {(user.name || user.username || 'U').charAt(0)}
                </div>
                <div style={{ color: '#F5E6C8', fontSize: 14, fontWeight: 600 }}>{user.name || user.username}</div>
                <div style={{ color: '#666', fontSize: 11 }}>{user.email || user.phone || ''}</div>
              </div>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 14px', marginBottom: 2,
                  background: activeTab === tab.key ? 'rgba(212,175,55,0.1)' : 'transparent',
                  border: activeTab === tab.key ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                  borderRadius: 8, cursor: 'pointer', color: activeTab === tab.key ? '#D4AF37' : '#888',
                  textAlign: 'right', fontSize: 13, transition: 'all 0.2s',
                }}>
                  <span>{tab.icon}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{ fontSize: 10, color: activeTab === tab.key ? '#D4AF37' : '#666' }}>({tab.count})</span>
                  )}
                </button>
              ))}
              <button onClick={logout} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 14px', marginTop: 8,
                background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.15)',
                borderRadius: 8, cursor: 'pointer', color: '#EF5350',
                textAlign: 'right', fontSize: 13, transition: 'all 0.2s',
              }}>
                <span>🚪</span> خروج از حساب
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ color: '#D4AF37', fontSize: 16, margin: '0 0 16px' }}>📦 سفارش‌های من</h3>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <p style={{ color: '#888', fontSize: 13 }}>هیچ سفارشی ثبت نشده است</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#F5E6C8' }}>کد: {order.code || '—'}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{(order.items || []).length} محصول</div>
                          <div style={{ fontSize: 10, color: '#666' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : ''}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                            background: (() => {
                              const c = { pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC', production: '#FF7043', delivery: '#26A69A', completed: '#66BB6A', cancelled: '#EF5350' }[order.status] || '#888'
                              return c + '22'
                            })(),
                            color: { pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC', production: '#FF7043', delivery: '#26A69A', completed: '#66BB6A', cancelled: '#EF5350' }[order.status] || '#888',
                            border: `1px solid ${({ pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC', production: '#FF7043', delivery: '#26A69A', completed: '#66BB6A', cancelled: '#EF5350' }[order.status] || '#888') + '44'}`,
                          }}>
                            {({ pending: 'در انتظار', processing: 'در حال پردازش', design: 'طراحی', production: 'تولید', delivery: 'تحویل', completed: 'تکمیل', cancelled: 'لغو' })[order.status] || order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h3 style={{ color: '#D4AF37', fontSize: 16, margin: '0 0 16px' }}>🔒 تغییر رمز عبور</h3>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>رمز عبور فعلی</label>
                      <input type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>رمز عبور جدید</label>
                      <input type="password" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    {passMsg && (
                      <div style={{ fontSize: 12, color: passMsg === 'success' ? '#66BB6A' : '#EF5350', textAlign: 'center' }}>
                        {passMsg === 'success' ? 'رمز عبور با موفقیت تغییر یافت' : passMsg}
                      </div>
                    )}
                    <div>
                      <button onClick={changePassword} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #D4AF37, #8B6914)', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>تغییر رمز</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div>
                <h3 style={{ color: '#D4AF37', fontSize: 16, margin: '0 0 16px' }}>👤 اطلاعات حساب</h3>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 20 }}>
                  {editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>نام</label>
                        <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>موبایل</label>
                        <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box', direction: 'ltr' }} />
                      </div>
                      <div>
                        <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>ایمیل</label>
                        <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box', direction: 'ltr' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={saveProfile} disabled={saving} style={{ padding: '8px 20px', background: saving ? '#555' : 'linear-gradient(135deg, #D4AF37, #8B6914)', color: '#000', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>{saving ? '...' : 'ذخیره'}</button>
                        <button onClick={() => setEditMode(false)} style={{ padding: '8px 20px', background: '#333', color: '#ccc', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>انصراف</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                        <span style={{ color: '#888', fontSize: 12 }}>نام کاربری:</span>
                        <span style={{ color: '#F5E6C8', fontSize: 12 }}>{user.username}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>نام:</span>
                        <span style={{ color: '#F5E6C8', fontSize: 12 }}>{user.name || '—'}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>موبایل:</span>
                        <span style={{ color: '#F5E6C8', fontSize: 12 }}>{user.phone || '—'}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>ایمیل:</span>
                        <span style={{ color: '#F5E6C8', fontSize: 12 }}>{user.email || '—'}</span>
                      </div>
                      <button onClick={() => setEditMode(true)} style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>✎ ویرایش اطلاعات</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
