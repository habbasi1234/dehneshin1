import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('login')
  const [otp, setOtp] = useState('')
  const [captcha, setCaptcha] = useState({ id: '', question: '' })
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [otpEnabled, setOtpEnabled] = useState(false)
  const [logo, setLogo] = useState('')

  const fetchCaptcha = async () => {
    try {
      const { data } = await axios.get('/api/auth/captcha')
      setCaptcha(data)
      setCaptchaAnswer('')
    } catch {}
  }

  useEffect(() => {
    fetchCaptcha()
    axios.get('/api/admin/settings').then(({ data }) => {
      setOtpEnabled(data.otpEnabled !== false)
      setLogo(data.logoImage_fa || data.logoImage_en || '')
    }).catch(() => {})
  }, [])

  const handleFirstStep = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/admin/send-otp', {
        username: form.username, password: form.password, phone: form.phone,
        captchaId: captcha.id, captchaAnswer,
      })
      if (data.direct) {
        localStorage.setItem('adminToken', data.token)
        navigate('/admin')
      } else {
        setStep('otp')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'خطا در ورود')
      fetchCaptcha()
    }
    setLoading(false)
  }

  const handleOtpVerify = async () => {
    if (!otp.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/admin/login', { username: form.username, otp: otp.trim() })
      localStorage.setItem('adminToken', data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || 'کد تایید اشتباه است')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F5F0E8 0%, #E8F5E9 50%, #F5F0E8 100%)',
      direction: 'rtl',
      fontFamily: 'Tahoma, Arial, sans-serif',
    }}>
      <div style={{
        background: '#FFFFFF',
        padding: '48px 40px',
        borderRadius: 20,
        border: '1px solid rgba(76, 175, 80, 0.15)',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src={logo || '/favicon.png'} alt="دهنشین" style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            margin: '0 auto 20px',
            display: 'block',
            border: '3px solid rgba(76, 175, 80, 0.2)',
            boxShadow: '0 8px 30px rgba(76, 175, 80, 0.15)',
          }} />
          <h1 style={{
            color: '#4CAF50',
            fontSize: 24,
            margin: '0 0 8px 0',
            fontWeight: '600',
          }}>پنل مدیریت دهنشین</h1>
          <div style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #4CAF50, transparent)',
            margin: '0 auto',
          }}></div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.15)',
            color: '#ff6b6b',
            padding: '12px 18px',
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 13,
            border: '1px solid rgba(220, 53, 69, 0.3)',
          }}>{error}</div>
        )}

        {step === 'login' ? (
          <form onSubmit={handleFirstStep}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#6B6B6B', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: '500' }}>نام کاربری</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #D4D0C8',
                  borderRadius: 10,
                  color: '#2D2D2D',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }} required />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#6B6B6B', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: '500' }}>رمز عبور</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #D4D0C8',
                  borderRadius: 10,
                  color: '#2D2D2D',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }} required />
            </div>
            {otpEnabled && <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#6B6B6B', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: '500' }}>شماره موبایل (دریافت کد)</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9+\-]/g, '') })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #D4D0C8',
                  borderRadius: 10,
                  color: '#2D2D2D',
                  fontSize: 14,
                  outline: 'none',
                  direction: 'ltr',
                  boxSizing: 'border-box',
                }} placeholder="۰۹۱۲۱۱۱۸۸۸۸" required />
            </div>}
            <div style={{
              marginBottom: 28,
              background: '#FAFAF7',
              border: '1px solid #D4D0C8',
              borderRadius: 12,
              padding: '16px 18px'
            }}>
              <p style={{ color: '#4CAF50', fontSize: 14, marginBottom: 10, fontWeight: 'bold', textAlign: 'center' }}>{captcha.question || 'بارگذاری...'}</p>
              <input value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)}
                placeholder="پاسخ کد امنیتی" dir="ltr"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#F0F0EA',
                  border: '1px solid #D4D0C8',
                  borderRadius: 8,
                  color: '#2D2D2D',
                  fontSize: 14,
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                }} />
              <button type="button" onClick={fetchCaptcha} style={{
                background: 'none',
                border: 'none',
                color: '#6B6B6B',
                fontSize: 11,
                cursor: 'pointer',
                marginTop: 8,
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                transition: 'color 0.2s',
              }}>🔄 کد جدید</button>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 50%, #388E3C 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              letterSpacing: 0.5,
            }}>
              {loading ? 'در حال بررسی...' : 'ادامه'}
            </button>
          </form>
        ) : (
          <>
            <p style={{ color: '#6B6B6B', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
              کد تایید به {form.phone || 'شماره ثبت‌شده'} ارسال شد
            </p>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={e => e.key === 'Enter' && handleOtpVerify()}
              placeholder="کد تایید" dir="ltr" maxLength={5}
              style={{
                width: '100%',
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: 12,
                color: '#2D2D2D',
                fontSize: 22,
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: 12,
                marginBottom: 20,
              }} />
            <button onClick={handleOtpVerify} disabled={loading} style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 50%, #388E3C 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: 12,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
            }}>
              {loading ? 'در حال تایید...' : 'ورود به پنل'}
            </button>
            <button onClick={() => { setStep('login'); setOtp(''); fetchCaptcha() }}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B6B6B',
                fontSize: 13,
                cursor: 'pointer',
                display: 'block',
                margin: '0 auto',
                transition: 'color 0.2s',
              }}>
              بازگشت
            </button>
          </>
        )}
      </div>
    </div>
  )
}
