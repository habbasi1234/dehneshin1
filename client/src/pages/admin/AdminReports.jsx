import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusColors = {
  pending: '#FFA726', processing: '#42A5F5', design: '#AB47BC',
  production: '#FF7043', delivery: '#26A69A',   completed: '#66BB6A', cancelled: '#EF5350',
}

function StatCard({ label, value, color, icon, linkTo }) {
  const content = (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '20px 24px',
        border: '1px solid rgba(212,175,55,0.1)', minWidth: 140, flex: 1,
        cursor: linkTo ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => { if (linkTo) { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
      onMouseLeave={e => { if (linkTo) { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ color: '#6B6B6B', fontSize: 12 }}>{label}</span>
      </div>
      <span style={{ color: color || '#D4AF37', fontSize: 28, fontWeight: 900 }}>{value}</span>
    </motion.div>
  )
  if (linkTo) return <Link to={linkTo} style={{ textDecoration: 'none', flex: 1, minWidth: 140 }}>{content}</Link>
  return content
}

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSuper, setIsSuper] = useState(false)
  const [activities, setActivities] = useState([])
  const [activityFilter, setActivityFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || token.split('-')[0]))
        setIsSuper(payload.role === 'superadmin')
      } catch { setIsSuper(false) }
    }

    axios.get('/api/orders/stats/report')
      .then(({ data }) => setReport(data))
      .catch(() => {})
      .finally(() => setLoading(false))

    axios.get('/api/admin/activity/')
      .then(({ data }) => setActivities(data.items || []))
      .catch(() => {})
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#4CAF50' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopcolor: '#4CAF50', borderRadius: '50%', margin: '0 auto 20px' }} />
      در حال بارگذاری گزارش...
    </div>
  )

  if (!report) return <div style={{ color: '#EF5350', textAlign: 'center', padding: 40 }}>خطا در بارگذاری گزارش</div>

  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter(a => a.action === activityFilter)

  return (
    <div>
      <h2 style={{ color: '#4CAF50', fontSize: 24, margin: '0 0 24px' }}>📊 گزارش‌گیری</h2>

      {isSuper && (
        <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(212,175,55,0.1)' }}>
          <h3 style={{ color: '#4CAF50', fontSize: 15, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👑</span> گزارش فعالیت مدیران
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['all', 'login', 'logout', 'create', 'update', 'delete'].map(f => (
              <button key={f} onClick={() => setActivityFilter(f)} style={{
                padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: activityFilter === f ? '#D4AF37' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(76,175,80,0.2)', color: activityFilter === f ? '#000' : '#A89880',
              }}>{f === 'all' ? 'همه' : { login: 'ورود', logout: 'خروج', create: 'ایجاد', update: 'ویرایش', delete: 'حذف' }[f]}</button>
            ))}
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filteredActivities.length === 0 ? (
              <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>هیچ فعالیتی ثبت نشده</div>
            ) : filteredActivities.slice(0, 50).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 11 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.action === 'login' ? '#66BB6A' : a.action === 'logout' ? '#EF5350' : '#D4AF37', flexShrink: 0 }} />
                <span style={{ color: '#4CAF50', fontWeight: 600, width: 60, flexShrink: 0 }}>{ { login: 'ورود', logout: 'خروج', create: 'ایجاد', update: 'ویرایش', delete: 'حذف' }[a.action] || a.action }</span>
                <span style={{ color: '#6B6B6B', flex: 1 }}>{a.admin || '—'}</span>
                <span style={{ color: '#666', whiteSpace: 'nowrap' }}>{a.date ? new Date(a.date).toLocaleString('fa-IR') : ''}</span>
                {a.detail && <span style={{ color: '#6B6B6B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: '0 0 12px' }}>📊 وضعیت سفارشات</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="کل سفارشات" value={report.orders.total} color="#D4AF37" icon="📦" linkTo="/admin/orders" />
        {Object.entries(report.orders).filter(([k]) => k !== 'total').map(([key, val]) => (
          <StatCard key={key} label={statusLabels[key] || key} value={val} color={statusColors[key] || '#888'} icon="●" linkTo="/admin/orders" />
        ))}
      </div>

      {!isSuper && (
        <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(212,175,55,0.1)' }}>
          <h3 style={{ color: '#4CAF50', fontSize: 15, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👤</span> گزارش مشتریان
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatCard label="کل مشتریان" value={report.users?.customers || 0} color="#D4AF37" icon="👥" />
            <StatCard label="کاربران فعال" value={report.users?.total || 0} color="#66BB6A" icon="✅" />
          </div>
        </div>
      )}

      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: '0 0 12px' }}>👥 کاربران</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="کل کاربران" value={report.users.total} color="#D4AF37" icon="👥" linkTo="/admin/users" />
        <StatCard label="مدیران" value={report.users.admins} color="#D4AF37" icon="👑" linkTo="/admin/users" />
        <StatCard label="کارمندان" value={report.users.employees} color="#4CAF50" icon="👔" linkTo="/admin/users" />
        <StatCard label="مشتریان" value={report.users.customers} color="#2196F3" icon="👤" linkTo="/admin/users" />
      </div>

      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: '0 0 12px' }}>📧 اطلاع‌رسانی</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="کل نوتیفیکیشن‌ها" value={report.notifications.total} color="#D4AF37" icon="🔔" linkTo="/admin/notifications" />
        <StatCard label="ایمیل‌ها" value={report.notifications.email} color="#42A5F5" icon="📧" linkTo="/admin/notifications" />
        <StatCard label="پیامک‌ها" value={report.notifications.sms} color="#66BB6A" icon="📱" linkTo="/admin/notifications" />
      </div>

      <h3 style={{ color: '#2D2D2D', fontSize: 16, margin: '0 0 12px' }}>📦 محصولات</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="کل محصولات" value={report.products.total} color="#D4AF37" icon="🪑" linkTo="/admin/products" />
      </div>
    </div>
  )
}
