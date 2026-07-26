import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import axios from 'axios'

const gold = '#D4AF37'
const goldDark = '#A0872B'
const textPrimary = '#2D2D2D'
const textSecondary = '#6B6B6B'
const borderGlass = 'rgba(76, 175, 80, 0.12)'
const colors = ['#D4AF37', '#E8C84A', '#C49A2A', '#F5E6C8', '#A89880', '#8B6914', '#5C4A1E', '#F0D060']

const adminLinks = [
  { path: '/admin', label: 'داشبورد', icon: '🏛' },
  { path: '/admin/orders', label: 'سفارشات', icon: '📦' },
  { path: '/admin/products', label: 'محصولات', icon: '🥦' },
  { path: '/admin/categories', label: 'دسته‌بندی‌ها', icon: '📂' },
  { path: '/admin/users', label: 'کاربران', icon: '👥' },
  { path: '/admin/messages', label: 'پیام‌ها', icon: '✉️' },
  { path: '/admin/reports', label: 'گزارش‌گیری', icon: '📈' },
  { path: '/admin/geo', label: 'نقشه بازدیدکنندگان', icon: '🗺️' },
  { path: '/admin/notifications', label: 'اطلاع‌رسانی', icon: '🔔' },
  { path: '/admin/reviews', label: 'نظرات محصولات', icon: '💬' },
  { path: '/admin/testimonials', label: 'نظرات', icon: '⭐' },
  { path: '/admin/blog', label: 'مقالات', icon: '📰' },
  { path: '/admin/settings', label: 'تنظیمات سایت', icon: '⚙️' },
  { path: '/admin/seo', label: 'SEO', icon: '🔍' },
]

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const from = 0
    const to = value
    let raf
    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * ease))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span>{display.toLocaleString('fa-IR')}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#F5F0E8', border: '1px solid ' + borderGlass, borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
      <div style={{ color: textSecondary, fontSize: 11, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: textPrimary, fontSize: 12 }}>{p.name}: <strong style={{ color: gold }}>{p.value.toLocaleString('fa-IR')}</strong></span>
        </div>
      ))}
    </div>
  )
}

function SectionCard({ icon, title, children, delay = 0, style: extraStyle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div style={{
        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid ' + borderGlass, borderRadius: 16, padding: 26, height: '100%', ...extraStyle,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,175,55,0.1)', border: '1px solid ' + borderGlass, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
          <h3 style={{ color: textPrimary, margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

const actionLabels = { create: 'ایجاد', update: 'ویرایش', delete: 'حذف', login: 'ورود', logout: 'خروج' }
const actionColors = { create: '#4CAF50', update: '#D4AF37', delete: '#f44336', login: '#2196F3', logout: '#FF9800' }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [messages, setMessages] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [activity, setActivity] = useState([])
  const [activityStats, setActivityStats] = useState(null)
  const [interactions, setInteractions] = useState(null)
  const [freqLinks, setFreqLinks] = useState([])
  const [topRated, setTopRated] = useState([])
  const [productNames, setProductNames] = useState({})
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get('/api/admin/stats').then(({ data }) => setStats(data))
    axios.get('/api/admin/messages').then(({ data }) => {
      setMessages(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5))
    })
    axios.get('/api/analytics/admin/summary').then(({ data }) => setAnalytics(data))
    axios.get('/api/admin/activity').then(({ data }) => setActivity(data.items || []))
    axios.get('/api/admin/activity/stats').then(({ data }) => setActivityStats(data))
    axios.get('/api/analytics/admin/interactions').then(({ data }) => setInteractions(data))
    axios.get('/api/products').then(({ data }) => {
      setProducts(data)
      const map = {}
      data.forEach(p => { map[p.id] = p.name_fa || p.name || '' })
      setProductNames(map)
    }).catch(() => {})
    axios.get('/api/reviews/stats/popular').then(({ data }) => setTopRated(data)).catch(() => {})

    const visits = JSON.parse(localStorage.getItem('adminLinkVisits') || '{}')
    const sorted = Object.entries(visits).sort((a, b) => b[1] - a[1]).slice(0, 6)
    setFreqLinks(sorted)
  }, [])

  const recordVisit = (path) => {
    const visits = JSON.parse(localStorage.getItem('adminLinkVisits') || '{}')
    visits[path] = (visits[path] || 0) + 1
    localStorage.setItem('adminLinkVisits', JSON.stringify(visits))
  }

  useEffect(() => {
    const handler = () => {
      const path = window.location.pathname
      if (path.startsWith('/admin')) recordVisit(path)
    }
    handler()
  }, [])

  const dailyChartData = analytics?.dailyLabels?.map((label, i) => ({
    date: label?.slice(5) || '',
    بازدید: analytics.dailyData[i] || 0,
  })) || []

  const hourlyChartData = Array(24).fill(0).map((_, i) => ({
    hour: `${i}:00`,
    بازدید: analytics?.hourlyActivity?.[i] || 0,
  }))

  const pageChartData = analytics?.topPages?.filter(([p]) => p !== '/api/analytics/track')?.slice(0, 8)?.map(([path, count]) => ({
    name: path === '/' ? 'خانه' : path?.split('/')[1] || path,
    value: count,
    fullPath: path,
  })) || []

  const productChartData = analytics?.topProducts?.slice(0, 8)?.map(([id, count]) => ({
    name: productNames[id] || `محصول ${id}`,
    بازدید: count,
  })) || []

  const activityActionData = activityStats?.byAction?.map(a => ({
    name: actionLabels[a._id] || a._id,
    value: a.count,
    color: actionColors[a._id] || '#6B6B6B',
  })) || []

  const colorData = interactions?.colorPicks?.map(c => ({ name: c._id, value: c.count })) || []
  const fabricData = interactions?.fabricPicks?.map(f => ({ name: f._id, value: f.count })) || []

  const cards = [
    { icon: '📦', value: stats?.totalOrders || 0, label: 'سفارشات', path: '/admin/orders', color: '#4CAF50' },
    { icon: '⏳', value: stats?.pendingOrders || 0, label: 'در انتظار', path: '/admin/orders', color: '#4CAF50', pulse: true },
    { icon: '🪑', value: stats?.totalProducts || 0, label: 'محصولات', path: '/admin/products', color: '#4CAF50' },
    { icon: '👥', value: stats?.totalCustomers || 0, label: 'مشتریان', path: '/admin/customers', color: '#42A5F5' },
    { icon: '✉️', value: stats?.unreadMessages || 0, label: 'پیام جدید', path: '/admin/messages', color: '#4CAF50', pulse: true },
    { icon: '📁', value: stats?.totalCategories || 0, label: 'دسته‌بندی‌ها', path: '/admin/categories', color: '#AB47BC' },
    { icon: '👁', value: analytics?.todayViews || 0, label: 'بازدید امروز', path: '/admin/geo', color: '#66BB6A' },
    { icon: '⭐', value: stats?.totalReviews || 0, label: 'نظرات', path: '/admin/reviews', color: '#FF7043' },
  ]

  const quickActions = [
    { label: 'سفارش جدید', icon: '📋', path: '/admin/orders', desc: 'مدیریت سفارشات' },
    { label: 'محصول جدید', icon: '🪑', path: '/admin/products', desc: 'افزودن محصول' },
    { label: 'گزارش‌گیری', icon: '📊', path: '/admin/reports', desc: 'مشاهده آمار' },
    { label: 'SEO سایت', icon: '🔍', path: '/admin/seo', desc: 'بهبود SEO' },
    { label: 'تنظیمات', icon: '⚙️', path: '/admin/settings', desc: 'تنظیمات سایت' },
    { label: 'مقالات', icon: '📰', path: '/admin/blog', desc: 'مدیریت مقالات' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: textSecondary, fontSize: 13, margin: 0, fontWeight: 300, letterSpacing: '1px' }}>
          پنل مدیریت ده نشین
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 36 }}>
        {!stats ? (
          <div style={{ color: textSecondary, fontSize: 13 }}>در حال بارگذاری...</div>
        ) : cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}>
            <Link to={card.path} style={{ textDecoration: 'none' }} onClick={() => recordVisit(card.path)}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid ' + borderGlass, borderRadius: 14, padding: '18px 20px',
                cursor: 'pointer', transition: 'all 0.4s ease', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = card.color + '44'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(212, 175, 55, 0.08)` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = borderGlass; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${card.color}15, transparent)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900, background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 6 }}>
                      <AnimatedNumber value={card.value} />
                    </div>
                    <div style={{ color: textSecondary, fontSize: 11, fontWeight: 400 }}>{card.label}</div>
                  </div>
                  <div style={{ fontSize: 24, opacity: 0.5 }}>{card.icon}</div>
                </div>
                {card.pulse && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: card.color, display: 'inline-block' }} />
                    <span style={{ color: card.color, fontSize: 10 }}>نیاز به پیگیری</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        <SectionCard icon="📈" title="بازدید روزانه (۱۴ روز اخیر)" delay={0.15}>
          {dailyChartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>در حال بارگذاری...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                <XAxis dataKey="date" tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="بازدید" stroke={gold} strokeWidth={2} fill="url(#dailyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon="🕐" title="فعالیت ساعتی (۲۴ ساعت)" delay={0.2}>
          {hourlyChartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>در حال بارگذاری...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                <XAxis dataKey="hour" tick={{ fill: textSecondary, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="بازدید" fill={gold} radius={[4, 4, 0, 0]} maxBarSize={12}>
                  {hourlyChartData.map((_, i) => (
                    <Cell key={i} fill={i >= 6 && i <= 10 || i >= 16 && i <= 20 ? gold : '#5C4A1E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        <SectionCard icon="📄" title="صفحات پربازدید" delay={0.25}>
          {pageChartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>هنوز داده‌ای ثبت نشده</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pageChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pageChartData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: textSecondary, fontSize: 11 }}>{value}</span>}
                  layout="vertical" verticalAlign="middle" align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon="🔥" title="محصولات پربازدید" delay={0.3}>
          {productChartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>هنوز داده‌ای ثبت نشده</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {productChartData.slice(0, 6).map((item, i) => {
                const maxVal = productChartData[0]?.بازدید || 1
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: textSecondary, fontSize: 11, minWidth: 18, fontWeight: i < 3 ? 700 : 400 }}>{i + 1}.</span>
                    <span style={{ flex: 1, color: textPrimary, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(item.بازدید / maxVal) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${gold})`, borderRadius: 3 }}
                      />
                    </div>
                    <span style={{ color: textSecondary, fontSize: 11, minWidth: 30, textAlign: 'left', direction: 'ltr' }}>{item.بازدید}</span>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard icon="🎨" title="انتخاب رنگ توسط کاربران" delay={0.35}>
          {colorData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>هنوز رنگی انتخاب نشده</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={colorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                <XAxis type="number" tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: textPrimary, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={gold} radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon="🧵" title="انتخاب پارچه توسط کاربران" delay={0.4}>
          {fabricData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>هنوز پارچه‌ای انتخاب نشده</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fabricData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                <XAxis type="number" tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: textPrimary, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#AB47BC" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        <SectionCard icon="⚡" title="اقدامات سریع" delay={0.45}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to={action.path} style={{ textDecoration: 'none' }} onClick={() => recordVisit(action.path)}>
                  <div style={{ padding: '16px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid ' + borderGlass, cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; e.currentTarget.style.borderColor = gold + '33' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = borderGlass }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22, filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.15))' }}>{action.icon}</span>
                      <div>
                        <div style={{ color: textPrimary, fontSize: 13, fontWeight: 500 }}>{action.label}</div>
                        <div style={{ color: 'rgba(168,152,128,0.6)', fontSize: 10, marginTop: 2 }}>{action.desc}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon="⭐" title="محصولات محبوب (بالاترین امتیاز)" delay={0.5}>
          {topRated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: textSecondary, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>⭐</div>
              هنوز نظری ثبت نشده
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topRated.slice(0, 5).map((item, i) => {
                const maxRating = topRated[0]?.avgRating || 5
                return (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: textSecondary, fontSize: 11, minWidth: 18 }}>{i + 1}.</span>
                    <span style={{ flex: 1, color: textPrimary, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productNames[item._id] || `محصول ${item._id}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(item.avgRating / maxRating) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ height: '100%', background: 'linear-gradient(90deg, #D4AF37, #F0D060)', borderRadius: 3 }}
                        />
                      </div>
                      <span style={{ color: '#4CAF50', fontSize: 11, fontWeight: 700, minWidth: 30, textAlign: 'left', direction: 'ltr' }}>{item.avgRating.toFixed(1)}</span>
                    </div>
                    <span style={{ color: textSecondary, fontSize: 10, minWidth: 20 }}>({item.count})</span>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        <SectionCard icon="🔐" title="فعالیت مدیران (اخیر)" delay={0.55}>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: textSecondary, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📋</div>
              فعالیتی ثبت نشده
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto' }}>
              {activity.slice(0, 15).map((log, i) => (
                <div key={log._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: (actionColors[log.action] || '#6B6B6B') + '22', border: '1px solid ' + (actionColors[log.action] || '#6B6B6B') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, color: actionColors[log.action] || '#6B6B6B' }}>
                    {log.action === 'create' ? '＋' : log.action === 'update' ? '✎' : log.action === 'delete' ? '✕' : '●'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: textPrimary, fontSize: 12, fontWeight: 500 }}>{log.username || 'ادمین'}</span>
                      <span style={{ color: textSecondary, fontSize: 10, background: 'rgba(255,255,255,0.03)', padding: '1px 8px', borderRadius: 4 }}>
                        {actionLabels[log.action] || log.action}
                      </span>
                      <span style={{ color: 'rgba(168,152,128,0.6)', fontSize: 10 }}>{log.resource?.split('/').filter(Boolean).slice(-1)[0] || ''}</span>
                    </div>
                    <div style={{ color: 'rgba(168,152,128,0.4)', fontSize: 10, marginTop: 2 }}>
                      {new Date(log.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {log.resourceId && <span style={{ color: 'rgba(168,152,128,0.3)', fontSize: 10, direction: 'ltr' }}>#{log.resourceId}</span>}
                </div>
              ))}
            </div>
          )}
          {activity.length > 0 && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Link to="/admin/activity-logs" style={{ color: gold, fontSize: 12, textDecoration: 'none', padding: '6px 16px', borderRadius: 8, border: '1px solid ' + borderGlass, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.borderColor = gold + '44' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = borderGlass }}
              >
                مشاهده همه <span>←</span>
              </Link>
            </div>
          )}
        </SectionCard>

        <SectionCard icon="📊" title="فعالیت مدیران (تفکیک عملیات)" delay={0.6}>
          {activityActionData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: textSecondary, fontSize: 13 }}>داده‌ای موجود نیست</div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={activityActionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {activityActionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {activityActionData.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} />
                    <span style={{ color: textSecondary, fontSize: 11 }}>{a.name}: <strong style={{ color: textPrimary }}>{a.value}</strong></span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 14 }}>
                {[
                  { label: 'فعالیت امروز', value: activityStats?.today || 0 },
                  { label: 'این هفته', value: activityStats?.week || 0 },
                  { label: 'این ماه', value: activityStats?.month || 0 },
                  { label: 'کل', value: activityStats?.total || 0 },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid ' + borderGlass }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: gold }}>{item.value.toLocaleString('fa-IR')}</div>
                    <div style={{ fontSize: 10, color: textSecondary }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard icon="🔥" title="پرکاربردترین لینک‌های ادمین" delay={0.65}>
          {freqLinks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: textSecondary, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>👆</div>
              با کلیک روی بخش‌های مختلف، لینک‌های پرکاربرد شما ثبت می‌شود
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {freqLinks.map(([path, count], i) => {
                const link = adminLinks.find(l => l.path === path)
                if (!link) return null
                const maxCount = freqLinks[0]?.[1] || 1
                return (
                  <Link key={path} to={path} style={{ textDecoration: 'none' }} onClick={() => recordVisit(path)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.01)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                    >
                      <div style={{ width: 20, textAlign: 'center', color: textSecondary, fontSize: 11, fontWeight: i < 3 ? 700 : 400 }}>{i + 1}</div>
                      <span style={{ fontSize: 16 }}>{link.icon}</span>
                      <span style={{ flex: 1, color: textPrimary, fontSize: 12, fontWeight: i === 0 ? 700 : 400 }}>{link.label}</span>
                      <span style={{ color: textSecondary, fontSize: 11, direction: 'ltr' }}>{count}</span>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, height: 2, width: `${(count / maxCount) * 100}%`, background: gold, borderRadius: '0 2px 0 0', opacity: 0.4 }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 28 }}>
        <SectionCard icon="✉️" title="آخرین پیام‌ها" delay={0.7}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: textSecondary, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📭</div>
              پیامی وجود ندارد
            </div>
          ) : messages.map((msg, i) => (
            <motion.div key={msg.id || msg._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ padding: '10px 0', borderBottom: i < messages.length - 1 ? '1px solid ' + borderGlass : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,175,55,0.08)', border: '1px solid ' + borderGlass, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👤</div>
                  <div>
                    <div style={{ color: textPrimary, fontSize: 13, fontWeight: msg.read ? 400 : 700 }}>{msg.name}</div>
                    <div style={{ color: 'rgba(168,152,128,0.5)', fontSize: 11, marginTop: 2 }}>{new Date(msg.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!msg.read && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 8, height: 8, background: gold, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${gold}` }} />}
                </div>
              </div>
            </motion.div>
          ))}
          {messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 16, textAlign: 'center' }}>
              <Link to="/admin/messages" style={{ color: gold, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, border: '1px solid ' + borderGlass, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.borderColor = gold + '44' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = borderGlass }}
              >
                مشاهده همه پیام‌ها <span>←</span>
              </Link>
            </motion.div>
          )}
        </SectionCard>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="admin-divider">
          <div className="diamond" />
        </div>
      </div>
    </div>
  )
}
