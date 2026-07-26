import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useUserAuth } from '../context/UserAuthContext'

export default function AuthModal({ open, onClose }) {
  const { login, register } = useUserAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', email: '' })
  const [resetForm, setResetForm] = useState({ phone: '', otp: '', newPassword: '' })
  const [resetStep, setResetStep] = useState('request')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hc = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const rhc = (key, value) => setResetForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
        onClose()
      } else if (mode === 'register') {
        await register(form)
        setMode('login')
        setError('ثبت‌نام با موفقیت انجام شد. اکنون وارد شوید.')
      } else if (mode === 'forgot') {
        if (resetStep === 'request') {
          await axios.post('/api/auth/forgot-password', { phone: resetForm.phone })
          setResetStep('verify')
          setError('کد بازیابی به شماره شما ارسال شد')
        } else {
          const { data } = await axios.post('/api/auth/reset-password', resetForm)
          setMode('login')
          setResetStep('request')
          setResetForm({ phone: '', otp: '', newPassword: '' })
          setError('رمز عبور با موفقیت تغییر یافت. اکنون وارد شوید.')
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'خطا رخ داد')
    }
    setLoading(false)
  }

  const resetAndClose = () => {
    setForm({ username: '', password: '', name: '', phone: '', email: '' })
    setResetForm({ phone: '', otp: '', newPassword: '' })
    setResetStep('request')
    setError('')
    setMode('login')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 16, padding: 32, width: 400, maxWidth: '90vw',
              border: '1px solid rgba(212,175,55,0.2)', position: 'relative',
            }}
          >
            <button onClick={resetAndClose} style={{
              position: 'absolute', top: 12, left: 12, background: 'none', border: 'none',
              color: '#888', cursor: 'pointer', fontSize: 20,
            }}>✕</button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{mode === 'forgot' ? '🔑' : '👤'}</div>
              <h2 style={{ color: '#D4AF37', fontSize: 18, margin: 0 }}>
                {mode === 'login' ? 'ورود به حساب' : mode === 'register' ? 'عضویت' : 'بازیابی رمز عبور'}
              </h2>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: error.includes('موفقیت') || error.includes('ارسال شد') ? 'rgba(76,175,80,0.1)' : 'rgba(239,83,80,0.1)',
                color: error.includes('موفقیت') || error.includes('ارسال شد') ? '#4CAF50' : '#EF5350',
                textAlign: 'center',
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'forgot' ? (
                <>
                  {resetStep === 'request' ? (
                    <input value={resetForm.phone} onChange={e => rhc('phone', e.target.value)}
                      placeholder="شماره موبایل" dir="ltr" required
                      style={inputStyle} />
                  ) : (
                    <>
                      <input value={resetForm.otp} onChange={e => rhc('otp', e.target.value)}
                        placeholder="کد تایید" dir="ltr" required
                        style={inputStyle} />
                      <input value={resetForm.newPassword} onChange={e => rhc('newPassword', e.target.value)}
                        placeholder="رمز عبور جدید" type="password" required minLength={6}
                        style={inputStyle} />
                    </>
                  )}
                  <button type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '12px', border: 'none', borderRadius: 8,
                      background: loading ? '#555' : 'linear-gradient(135deg, #D4AF37, #8B6914)',
                      color: loading ? '#aaa' : '#000', fontWeight: 700, fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
                    }}>
                    {loading ? '...' : resetStep === 'request' ? 'ارسال کد' : 'تغییر رمز'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: 12 }}>
                    <button type="button" onClick={() => { setMode('login'); setResetStep('request'); setError('') }}
                      style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: 13 }}>
                      بازگشت به ورود
                    </button>
                  </p>
                </>
              ) : (
                <>
                  {mode === 'register' && (
                    <>
                      <input value={form.name} onChange={e => hc('name', e.target.value)}
                        placeholder="نام و نام خانوادگی" required
                        style={inputStyle} />
                      <input value={form.phone} onChange={e => hc('phone', e.target.value)}
                        placeholder="شماره موبایل" dir="ltr"
                        style={inputStyle} />
                      <input value={form.email} onChange={e => hc('email', e.target.value)}
                        placeholder="ایمیل" type="email" dir="ltr"
                        style={inputStyle} />
                    </>
                  )}
                  <input value={form.username} onChange={e => hc('username', e.target.value)}
                    placeholder="نام کاربری" required
                    style={inputStyle} />
                  <input value={form.password} onChange={e => hc('password', e.target.value)}
                    placeholder="رمز عبور" type="password" required minLength={6}
                    style={inputStyle} />

                  <button type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '12px', border: 'none', borderRadius: 8,
                      background: loading ? '#555' : 'linear-gradient(135deg, #D4AF37, #8B6914)',
                      color: loading ? '#aaa' : '#000', fontWeight: 700, fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
                    }}>
                    {loading ? '...' : mode === 'login' ? 'ورود' : 'عضویت'}
                  </button>

                  {mode === 'login' && (
                    <p style={{ textAlign: 'center', marginTop: 10 }}>
                      <button type="button" onClick={() => { setMode('forgot'); setError('') }}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                        فراموشی رمز عبور
                      </button>
                    </p>
                  )}
                </>
              )}
            </form>

            {mode !== 'forgot' && (
              <p style={{ textAlign: 'center', marginTop: 16, color: '#888', fontSize: 13 }}>
                {mode === 'login' ? 'حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
                <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                  style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: 13, marginRight: 4 }}>
                  {mode === 'login' ? 'عضویت' : 'ورود'}
                </button>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', marginBottom: 10,
  background: '#0d0d0d', border: '1px solid #333', borderRadius: 8,
  color: '#F5E6C8', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
