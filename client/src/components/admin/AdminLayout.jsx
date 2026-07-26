import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import AdminStyles from './AdminStyles'

const menuGroups = [
  {
    label: 'مدیریت',
    items: [
      { path: '/admin', label: 'داشبورد', icon: '📊' },
      { path: '/admin/orders', label: 'سفارشات', icon: '📦', badge: null },
      { path: '/admin/products', label: 'محصولات', icon: '🪑' },
      { path: '/admin/3d', label: 'مدیریت سه‌بعدی', icon: '🔄' },
      { path: '/admin/categories', label: 'دسته‌بندی‌ها', icon: '📂' },
      { path: '/admin/reviews', label: 'نظرات محصولات', icon: '💬' },
    ],
  },
  {
    label: 'ارتباطات',
    items: [
      { path: '/admin/messages', label: 'پیام‌ها', icon: '✉️' },
      { path: '/admin/users', label: 'کاربران', icon: '👥' },
      { path: '/admin/notifications', label: 'اطلاع‌رسانی', icon: '🔔' },
    ],
  },
  {
    label: 'محتوا',
    items: [
      { path: '/admin/blog', label: 'مقالات', icon: '📰' },
      { path: '/admin/seo', label: 'مدیریت SEO', icon: '🔍' },
      { path: '/admin/testimonials', label: 'نظرات', icon: '⭐' },
      { path: '/admin/customers', label: 'مشتریان', icon: '👤' },
    ],
  },
  {
    label: 'گزارش و تنظیمات',
    items: [
      { path: '/admin/reports', label: 'گزارش‌گیری', icon: '📈' },
      { path: '/admin/settings', label: 'تنظیمات سایت', icon: '⚙️' },
    ],
  },
]

const breadcrumbMap = {
  '/admin': 'داشبورد',
  '/admin/orders': 'مدیریت سفارشات',
  '/admin/products': 'مدیریت محصولات',
  '/admin/categories': 'مدیریت دسته‌بندی‌ها',
  '/admin/users': 'مدیریت کاربران',
  '/admin/messages': 'پیام‌ها',
  '/admin/reports': 'گزارش‌گیری',
  '/admin/notifications': 'مدیریت اطلاع‌رسانی',
  '/admin/reviews': 'مدیریت نظرات محصولات',
  '/admin/testimonials': 'مدیریت نظرات',
  '/admin/blog': 'مدیریت مقالات',
  '/admin/seo': 'مدیریت SEO',
  '/admin/settings': 'تنظیمات سایت',
  '/admin/customers': 'مدیریت مشتریان',
  '/admin/3d': 'مدیریت سه‌بعدی',
}

const themes = [
  { id: 'green', name: 'سبز', color: '#4CAF50' },
  { id: 'orange', name: 'نارنجی', color: '#FF9800' },
  { id: 'red', name: 'قرمز', color: '#F44336' },
  { id: 'blue', name: 'آبی', color: '#2196F3' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('adminTheme') || 'green')
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      if (data.themes?.active && themes.find(t => t.id === data.themes.active)) {
        setActiveTheme(data.themes.active)
        localStorage.setItem('adminTheme', data.themes.active)
      }
    }).catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleThemeChange = async (themeId) => {
    setActiveTheme(themeId)
    localStorage.setItem('adminTheme', themeId)
    setThemeMenuOpen(false)
    try {
      const { data } = await axios.get('/api/admin/settings')
      data.themes = data.themes || { active: themeId, available: [] }
      data.themes.active = themeId
      await axios.put('/api/admin/settings', data)
    } catch {}
  }

  const themeColor = themes.find(t => t.id === activeTheme)?.color || '#4CAF50'
  const sidebarWidth = collapsed ? 72 : 260
  const currentBreadcrumb = breadcrumbMap[location.pathname] || ''

  const isActive = (path) => location.pathname === path

  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }} data-theme={activeTheme}>
      <AdminStyles />
      <div className="admin-bg" />

      <aside style={{
        width: sidebarWidth,
        background: 'var(--admin-surface)',
        color: 'var(--admin-text)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        overflow: 'hidden',
        borderLeft: '1px solid var(--admin-border)',
        boxShadow: '2px 0 20px var(--admin-shadow)',
      }}>
        <div style={{
          padding: collapsed ? '14px 0' : '20px 18px',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: collapsed ? 8 : 12,
          transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40%', left: '-30%',
            width: '160%', height: '160%',
            background: `radial-gradient(ellipse at center, rgba(var(--admin-primary-rgb), 0.06), transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{
            width: collapsed ? 38 : 56,
            height: collapsed ? 38 : 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? 18 : 26,
            fontWeight: 900,
            color: '#FFF',
            flexShrink: 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 15px rgba(var(--admin-primary-rgb), 0.3)`,
            fontFamily: "'Playfair Display', serif",
            position: 'relative',
            zIndex: 1,
          }}>
            ده
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative', zIndex: 1 }}
              >
                <span style={{
                  fontSize: 16, fontWeight: 900,
                  background: `linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))`,
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  fontFamily: "'Vazirmatn', sans-serif", letterSpacing: '1px',
                }}>
                  ده نشین
                </span>
                <span style={{ fontSize: 10, color: 'var(--admin-text-secondary)', marginTop: 2, letterSpacing: '2px', fontWeight: 300 }}>
                  پنل مدیریت
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(var(--admin-primary-rgb), 0.03)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-primary)', cursor: 'pointer', fontSize: 12,
              padding: '4px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', position: 'relative', zIndex: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.1)`; e.currentTarget.style.borderColor = `rgba(var(--admin-primary-rgb), 0.3)` }}
            onMouseLeave={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.03)`; e.currentTarget.style.borderColor = 'var(--admin-border)' }}
          >
            <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ display: 'inline-block' }}>
              ◀
            </motion.span>
          </button>
        </div>

        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }} className="admin-scroll">
          {menuGroups.map((group, gi) => (
            <div key={group.label}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: '16px 20px 6px', fontSize: 10, color: 'var(--admin-text-secondary)',
                      opacity: 0.5,
                      letterSpacing: '2px', fontWeight: 700, fontFamily: "'Vazirmatn', sans-serif",
                      textTransform: 'uppercase',
                    }}
                  >
                    {group.label}
                  </motion.div>
                )}
              </AnimatePresence>
              {group.items.map((item, idx) => {
                const active = isActive(item.path)
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (gi * 4 + idx) * 0.03 }}
                    style={{ padding: '1px 0' }}
                  >
                    <Link
                      to={item.path}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: collapsed ? '12px 0' : '9px 16px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: active ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                        textDecoration: 'none', fontSize: 13,
                        position: 'relative', transition: 'all 0.3s ease',
                        background: active
                          ? `linear-gradient(90deg, rgba(var(--admin-primary-rgb), 0.1) 0%, rgba(var(--admin-primary-rgb), 0.02) 50%, transparent 100%)`
                          : 'transparent',
                        borderRight: active ? '3px solid var(--admin-primary)' : '3px solid transparent',
                        fontWeight: active ? 700 : 400,
                        marginBottom: 1,
                        borderRadius: '0 4px 4px 0',
                      }}
                      onMouseEnter={e => {
                        if (!active) { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.04)`; e.currentTarget.style.color = 'var(--admin-text)' }
                      }}
                      onMouseLeave={e => {
                        if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-secondary)' }
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeGlow"
                          style={{
                            position: 'absolute', right: -1, top: 2, bottom: 2,
                            width: 3, background: `linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))`,
                            borderRadius: '0 4px 4px 0',
                            boxShadow: `0 0 12px var(--admin-primary), 0 0 24px rgba(var(--admin-primary-rgb), 0.3)`,
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}
                      <span style={{ fontSize: 16, flexShrink: 0, filter: active ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.3s' }}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {active && !collapsed && (
                        <span style={{ marginRight: 'auto', fontSize: 8, color: 'var(--admin-primary)', opacity: 0.5 }}>●</span>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{
          padding: collapsed ? '10px 0' : '12px 16px',
          borderTop: '1px solid var(--admin-border)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            position: 'relative',
          }}>
            <div style={{
              width: collapsed ? 0 : 34, height: collapsed ? 0 : 34,
              borderRadius: 10, minWidth: collapsed ? 0 : 34,
              background: `linear-gradient(135deg, rgba(var(--admin-primary-rgb), 0.15), rgba(var(--admin-primary-rgb), 0.05))`,
              border: '1px solid var(--admin-border)',
              display: collapsed ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--admin-primary)', overflow: 'hidden',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', bottom: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: 'var(--admin-primary)', boxShadow: `0 0 6px rgba(var(--admin-primary-rgb), 0.6)` }} />
              <span>👤</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}
                >
                  <div style={{ fontSize: 12, color: 'var(--admin-text)', fontWeight: 500 }}>مدیر سیستم</div>
                  <div style={{ fontSize: 10, color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--admin-primary)', display: 'inline-block' }} />
                    آنلاین
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              style={{
                marginRight: collapsed ? 0 : 'auto',
                background: 'rgba(var(--admin-primary-rgb), 0.03)',
                border: '1px solid var(--admin-border)',
                color: 'var(--admin-text-secondary)', cursor: 'pointer',
                padding: collapsed ? '6px 8px' : '4px 8px',
                borderRadius: 6, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.08)`; e.currentTarget.style.color = 'var(--admin-primary)'; e.currentTarget.style.borderColor = `rgba(var(--admin-primary-rgb), 0.3)` }}
              onMouseLeave={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.03)`; e.currentTarget.style.color = 'var(--admin-text-secondary)'; e.currentTarget.style.borderColor = 'var(--admin-border)' }}
            >
              <span style={{ fontSize: 14 }}>🚪</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
                    خروج
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {!collapsed && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 6,
                  background: `rgba(var(--admin-primary-rgb), 0.02)`, border: '1px solid var(--admin-border)',
                  color: 'var(--admin-text-secondary)', cursor: 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.05)` }}
                onMouseLeave={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.02)` }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%', display: 'inline-block',
                  background: themeColor,
                  boxShadow: `0 0 6px rgba(0,0,0,0.15)`, flexShrink: 0,
                }} />
                <span style={{ flex: 1, textAlign: 'right' }}>
                  {themes.find(t => t.id === activeTheme)?.name || 'تم'}
                </span>
                <span style={{ fontSize: 8, opacity: 0.5 }}>▼</span>
              </button>

              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    style={{
                      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4,
                      background: 'var(--admin-surface)', borderRadius: 8,
                      border: '1px solid var(--admin-border)',
                      overflow: 'hidden', zIndex: 100,
                      boxShadow: '0 4px 20px var(--admin-shadow)',
                    }}
                  >
                    {themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        style={{
                          width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                          background: t.id === activeTheme ? `rgba(var(--admin-primary-rgb), 0.08)` : 'transparent',
                          border: 'none', color: t.id === activeTheme ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                          cursor: 'pointer', fontSize: 12, textAlign: 'right',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `rgba(var(--admin-primary-rgb), 0.04)` }}
                        onMouseLeave={e => { e.currentTarget.style.background = t.id === activeTheme ? `rgba(var(--admin-primary-rgb), 0.08)` : 'transparent' }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: '50%', display: 'inline-block',
                          background: t.color, boxShadow: '0 0 6px rgba(0,0,0,0.1)',
                        }} />
                        <span style={{ flex: 1 }}>{t.name}</span>
                        {t.id === activeTheme && <span style={{ fontSize: 10, color: 'var(--admin-primary)' }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>

      <main style={{
        flex: 1, marginRight: sidebarWidth, minHeight: '100vh',
        transition: 'margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        <div style={{
          padding: '12px 28px',
          background: 'var(--admin-surface)',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--admin-text-secondary)',
        }}>
          <span style={{ color: 'var(--admin-primary)', fontSize: 13 }}>🏠</span>
          <span style={{ color: 'var(--admin-border)' }}>/</span>
          {currentBreadcrumb.split(' / ').map((part, i, arr) => (
            <span key={i}>
              <span style={{ color: i === arr.length - 1 ? 'var(--admin-text)' : 'var(--admin-text-secondary)' }}>{part}</span>
              {i < arr.length - 1 && <span style={{ color: 'var(--admin-border)', margin: '0 5px' }}>/</span>}
            </span>
          ))}
        </div>

        <div style={{ padding: '0 28px', marginTop: 24, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
            <div style={{
              width: 4, height: 26, borderRadius: 2,
              background: `linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))`,
              boxShadow: `0 0 8px rgba(var(--admin-primary-rgb), 0.3)`,
            }} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--admin-text)', margin: 0, letterSpacing: '0.5px' }}>
              {currentBreadcrumb}
            </h1>
          </div>
          <div className="admin-divider" style={{ margin: '10px 0 0' }}>
            <div className="diamond" />
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px 28px 28px' }}>
          <div className="admin-page-enter admin-page-active">
            {children}
          </div>
        </div>

        <footer style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--admin-border)',
          textAlign: 'center', fontSize: 11,
          color: 'var(--admin-text-secondary)',
          opacity: 0.4,
          background: 'var(--admin-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ color: 'var(--admin-primary)', opacity: 0.3 }}>◆</span>
          &copy; {new Date().getFullYear()} ده نشین
          <span style={{ color: 'var(--admin-primary)', opacity: 0.3 }}>◆</span>
        </footer>
      </main>
    </div>
  )
}
