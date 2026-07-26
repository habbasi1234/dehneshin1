import { useState, useEffect } from 'react'
import axios from 'axios'
import CustomerCard from '../components/CustomerCard'
import useSEO from '../hooks/useSEO'

export default function CustomerClub() {
  useSEO({ title: 'باشگاه مشتریان | ده نشین', description: 'باشگاه مشتریان ده نشین - ورود و مشاهده کارت عضویت و امتیازات' })
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('phone')
  const [otp, setOtp] = useState('')
  const [captcha, setCaptcha] = useState({ id: '', question: '' })
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  const fetchCaptcha = async () => {
    try {
      const { data } = await axios.get('/api/auth/captcha')
      setCaptcha(data)
      setCaptchaAnswer('')
    } catch {}
  }

  useEffect(() => { fetchCaptcha() }, [])

  const sendOtp = async () => {
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/auth/send-otp', { phone: phone.trim(), captchaId: captcha.id, captchaAnswer })
      setStep('otp')
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'خطا در ارسال کد')
      fetchCaptcha()
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    if (!otp.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { phone: phone.trim(), otp: otp.trim() })
      setCustomer(data.customer)
    } catch (err) {
      setError(err.response?.data?.error || 'خطا در تایید کد')
    }
    setLoading(false)
  }

  const reset = () => {
    setCustomer(null)
    setStep('phone')
    setOtp('')
    setPhone('')
    fetchCaptcha()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--theme-bg, #0a0a0f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
        {!customer ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
            <h1 style={{ color: '#D4AF37', fontSize: 24, marginBottom: 8 }}>باشگاه مشتریان ده نشین</h1>

            {step === 'phone' ? (
              <>
                <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>شماره موبایل خود را وارد کنید</p>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\s/g, ''))} onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  placeholder="۰۹۱۲۱۱۱۲۰۰۰" dir="ltr" maxLength={11}
                  style={{ width: '100%', padding: '14px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#F5E6C8', fontSize: 16, textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
                  <p style={{ color: '#D4AF37', fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>{captcha.question || 'بارگذاری...'}</p>
                  <input value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)}
                    placeholder="پاسخ کد امنیتی" dir="ltr"
                    style={{ width: '100%', padding: '10px 12px', background: '#222', border: '1px solid #444', borderRadius: 6, color: '#F5E6C8', fontSize: 14, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={fetchCaptcha} style={{ background: 'none', border: 'none', color: '#888', fontSize: 11, cursor: 'pointer', marginTop: 6 }}>🔄 کد جدید</button>
                </div>
                <button onClick={sendOtp} disabled={loading} style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                  background: loading ? '#666' : 'linear-gradient(135deg, #D4AF37, #8B6914)',
                  color: '#fff', fontSize: 15, fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                }}>{loading ? 'در حال ارسال...' : 'ارسال کد تایید'}</button>
              </>
            ) : (
              <>
                <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>کد تایید به شماره {phone} ارسال شد</p>
                <input value={otp} onChange={e => setOtp(e.target.value)} onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                  placeholder="کد تایید" dir="ltr" maxLength={5}
                  style={{ width: '100%', padding: '14px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#F5E6C8', fontSize: 20, textAlign: 'center', outline: 'none', boxSizing: 'border-box', letterSpacing: 8, marginBottom: 12 }} />
                <button onClick={verifyOtp} disabled={loading} style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                  background: loading ? '#666' : 'linear-gradient(135deg, #D4AF37, #8B6914)',
                  color: '#fff', fontSize: 15, fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8,
                }}>{loading ? 'در حال تایید...' : 'تایید و مشاهده کارت'}</button>
                <button onClick={() => { setStep('phone'); setOtp(''); fetchCaptcha() }}
                  style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' }}>
                  تغییر شماره
                </button>
              </>
            )}
            {error && <div style={{ color: '#EF5350', fontSize: 13, marginTop: 12 }}>{error}</div>}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={reset} style={{ alignSelf: 'flex-start', padding: '6px 14px', background: '#333', color: '#ccc', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginBottom: 16 }}>← بازگشت</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {customer.avatar ? (
                <img src={customer.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,175,55,0.3)' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
              )}
              <div style={{ textAlign: 'start' }}>
                <div style={{ color: '#F5E6C8', fontSize: 18, fontWeight: 'bold' }}>{customer.name}</div>
                <div style={{ color: '#888', fontSize: 12 }}>{customer.phone}</div>
              </div>
            </div>
            <CustomerCard customer={customer} showPrint />
          </div>
        )}
      </div>
    </div>
  )
}
