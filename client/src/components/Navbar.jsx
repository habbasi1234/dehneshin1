import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import { useUserAuth } from '../context/UserAuthContext'
import { useCart } from '../context/CartContext'
import AuthModal from './AuthModal'

const defaultSettings = {
  siteName: 'ده نشین', logoText: 'ده', siteDescription: 'DEH NESHIN',
}

const categories = [
  { slug: 'fruits', icon: '🍎', name: 'میوه' },
  { slug: 'vegetables', icon: '🥬', name: 'سبزی' },
  { slug: 'dairy', icon: '🥛', name: 'لبنیات' },
  { slug: 'grains', icon: '🌾', name: 'غلات' },
  { slug: 'nuts', icon: '🥜', name: 'خشکبار' },
  { slug: 'honey', icon: '🍯', name: 'عسل' },
  { slug: 'beverages', icon: '🧃', name: 'نوشیدنی' },
  { slug: 'spices', icon: '🧂', name: 'ادویه' },
  { slug: 'pickles', icon: '🫙', name: 'ترشی' },
  { slug: 'cosmetics', icon: '🧴', name: 'بهداشتی' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [searchVal, setSearchVal] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [catDropdown, setCatDropdown] = useState(false)
  const searchRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUserAuth()
  const { cartCount } = useCart()
  const { t, getText, lang, setLang } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setCatDropdown(false) }, [location])

  useEffect(() => {
    if (!catDropdown) return
    const handleClick = (e) => {
      if (!e.target.closest('[data-cat-dropdown]')) setCatDropdown(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [catDropdown])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(76,175,80,0.15)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          padding: scrolled ? '8px 24px' : '12px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #66BB6A, #4CAF50, #388E3C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 12px rgba(76,175,80,0.3)',
            }}>🌿</div>
            <span style={{
              fontSize: '1.1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Vazirmatn', sans-serif",
            }}>{getText(settings.siteName)}</span>
          </Link>

          <form onSubmit={handleSearch} style={{
            flex: 1, maxWidth: 500, position: 'relative', margin: '0 auto',
          }}>
            <input
              ref={searchRef}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={t('searchPlaceholder') || 'جستجوی محصولات...'}
              style={{
                width: '100%', padding: '10px 40px 10px 16px',
                background: '#F5F0E8',
                border: '1px solid rgba(76,175,80,0.25)',
                borderRadius: 10, color: '#2D2D2D', fontSize: 14,
                outline: 'none', fontFamily: "'Vazirmatn', sans-serif",
                transition: 'all 0.3s',
              }}
              onFocus={e => { e.target.style.borderColor = '#4CAF50'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(76,175,80,0.25)'; e.target.style.background = '#F5F0E8' }}
            />
            <button type="submit" style={{
              position: 'absolute', left: 4, top: 3, bottom: 3,
              background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
              border: 'none', borderRadius: 8, width: 32,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }} data-cat-dropdown>
              <button onClick={() => setCatDropdown(!catDropdown)} style={{
                background: catDropdown ? 'rgba(76,175,80,0.1)' : 'none', border: '1px solid rgba(76,175,80,0.2)',
                    color: '#6B6B6B', cursor: 'pointer', fontSize: 13,
                padding: '6px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                <span>دسته‌بندی</span>
              </button>
              <AnimatePresence>
                {catDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 8,
                      background: '#FFFFFF', borderRadius: 12,
                      border: '1px solid rgba(76,175,80,0.2)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                      padding: 8, minWidth: 200, zIndex: 100,
                    }}
                  >
                    {categories.map(cat => (
                      <Link key={cat.slug} to={`/search?q=${encodeURIComponent(cat.name)}`}
                        onClick={() => setCatDropdown(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 8,
                          color: '#2D2D2D', fontSize: 13, textDecoration: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(76,175,80,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/cart" style={{ position: 'relative', display: 'flex', textDecoration: 'none', color: '#6B6B6B' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="m1 1 4 0 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -10,
                  background: '#4CAF50', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  minWidth: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(76,175,80,0.5)',
                }}>{cartCount}</span>
              )}
            </Link>

            {user ? (
              <Link to="/account" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                textDecoration: 'none', color: '#2D2D2D', fontSize: 13, fontWeight: 600,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', fontWeight: 700,
                }}>{(user.name || user.username).charAt(0)}</span>
                <span className="user-name-desktop">{user.name || user.username}</span>
              </Link>
            ) : (
              <button onClick={() => setAuthOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                border: 'none', borderRadius: 8, padding: '7px 14px',
                color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(76,175,80,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="login-text-desktop">ورود</span>
              </button>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none', background: 'none', border: 'none',
                color: '#2D2D2D', fontSize: 22, cursor: 'pointer',
              }}
              className="mobile-toggle"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0,
              background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
              padding: 16, zIndex: 999,
              borderBottom: '1px solid rgba(76,175,80,0.15)',
            }}
          >
            {['/', '/products', '/about', '/blog', '/contact', '/farm-map', '/track', '/account', '/wholesale'].map(p => (
              <Link key={p} to={p}
                style={{
                  display: 'block', padding: '12px 16px',
                  color: location.pathname === p ? '#4CAF50' : '#6B6B6B',
                  fontSize: 14, textDecoration: 'none', fontWeight: location.pathname === p ? 700 : 400,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {p === '/' ? 'خانه' : p === '/products' ? 'محصولات' : p === '/about' ? 'درباره ما' : p === '/blog' ? 'وبلاگ' : p === '/contact' ? 'تماس' : p === '/farm-map' ? 'نقشه مزارع' : p === '/track' ? 'پیگیری سفارش' : p === '/account' ? 'حساب کاربری' : 'سفارش عمده'}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
          .user-name-desktop, .login-text-desktop { display: none; }
          nav form { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  )
}