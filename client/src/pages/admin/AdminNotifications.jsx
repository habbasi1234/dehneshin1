import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useToast } from '../../components/admin/Toast'

const typeColors = { email: '#42A5F5', sms: '#66BB6A', telegram: '#29A9E1', whatsapp: '#25D366' }

export default function AdminNotifications() {
  const addToast = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [config, setConfig] = useState({ smsProvider: '', smsApiKey: '', emailProvider: '', emailApiKey: '', telegramBotToken: '', whatsappApiKey: '' })
  const [savingConfig, setSavingConfig] = useState(false)

  const loadNotifs = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/orders/stats/notifications')
      setNotifs(data.last10 || [])
    } catch { }
    setLoading(false)
  }

  const loadConfig = async () => {
    try {
      const { data } = await axios.get('/api/admin/notifications/config')
      setConfig(data)
    } catch { }
  }

  useEffect(() => { loadNotifs(); loadConfig() }, [])

  const saveConfig = async () => {
    setSavingConfig(true)
    try {
      await axios.put('/api/admin/notifications/config', config)
      addToast('تنظیمات ذخیره شد', 'success')
    } catch { addToast('خطا در ذخیره', 'error') }
    setSavingConfig(false)
  }

  const sendTest = async (type) => {
    try {
      await axios.post('/api/admin/notifications/test', { type, to: 'مشتری آزمایشی', message: 'این یک پیام آزمایشی است' })
      addToast(`پیام آزمایشی ${type} ارسال شد`, 'success')
    } catch { addToast('خطا در ارسال', 'error') }
  }

  return (
    <div>
      <h2 style={{ color: '#4CAF50', fontSize: 24, margin: '0 0 24px' }}>🔔 مدیریت اطلاع‌رسانی</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: 24, border: '1px solid rgba(212,175,55,0.1)' }}>
          <h3 style={{ color: '#4CAF50', fontSize: 16, margin: '0 0 16px' }}>📧 تنظیمات پنل پیامک و ایمیل</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>ارائه‌دهنده پیامک</label>
              <select value={config.smsProvider} onChange={e => setConfig(p => ({ ...p, smsProvider: e.target.value }))} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">انتخاب کنید</option>
                <option value="kavenegar">کاوه نگار</option>
                <option value="farazsms">فراز اس ام اس</option>
                <option value="smsir">SMS.ir</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>API Key پیامک</label>
              <input value={config.smsApiKey} onChange={e => setConfig(p => ({ ...p, smsApiKey: e.target.value }))} placeholder="کلید API" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>ارائه‌دهنده ایمیل</label>
              <select value={config.emailProvider} onChange={e => setConfig(p => ({ ...p, emailProvider: e.target.value }))} style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none',
              }}>
                <option value="">انتخاب کنید</option>
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>API Key ایمیل</label>
              <input value={config.emailApiKey} onChange={e => setConfig(p => ({ ...p, emailApiKey: e.target.value }))} placeholder="کلید API" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>توکن ربات تلگرام</label>
              <input value={config.telegramBotToken} onChange={e => setConfig(p => ({ ...p, telegramBotToken: e.target.value }))} placeholder="Bot Token" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
              }} />
            </div>
            <div>
              <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 4 }}>API Key واتساپ</label>
              <input value={config.whatsappApiKey} onChange={e => setConfig(p => ({ ...p, whatsappApiKey: e.target.value }))} placeholder="API Key" style={{
                width: '100%', padding: '8px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none', direction: 'ltr',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={saveConfig} disabled={savingConfig} style={{
              padding: '10px 24px', background: savingConfig ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
              color: '#fff', border: 'none', borderRadius: 8, cursor: savingConfig ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14,
            }}>{savingConfig ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</button>
            <button onClick={() => sendTest('sms')} style={{ padding: '10px 18px', background: '#F0F0EA', color: '#66BB6A', border: '1px solid #66BB6A', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>📱 تست پیامک</button>
            <button onClick={() => sendTest('email')} style={{ padding: '10px 18px', background: '#F0F0EA', color: '#42A5F5', border: '1px solid #42A5F5', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>📧 تست ایمیل</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: 24, border: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#4CAF50', fontSize: 16, margin: 0 }}>🕐 آخرین پیام‌ها</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{
              padding: '4px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, outline: 'none',
            }}>
              <option value="all">همه</option>
              <option value="email">ایمیل</option>
              <option value="sms">پیامک</option>
              <option value="telegram">تلگرام</option>
              <option value="whatsapp">واتساپ</option>
            </select>
          </div>
          {loading ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>در حال بارگذاری...</div>
          ) : notifs.length === 0 ? (
            <div style={{ color: '#555', textAlign: 'center', padding: 20 }}>هنوز پیامی ارسال نشده</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {notifs.filter(n => filter === 'all' || n.type === filter).map((n, i) => (
                <div key={n.id || i} style={{
                  padding: '10px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: (typeColors[n.type] || '#888') + '22',
                      color: typeColors[n.type] || '#888',
                      border: '1px solid ' + (typeColors[n.type] || '#888') + '44',
                    }}>
                      {n.type === 'email' ? 'ایمیل' : n.type === 'sms' ? 'پیامک' : n.type === 'telegram' ? 'تلگرام' : n.type === 'whatsapp' ? 'واتساپ' : n.type}
                    </span>
                    <span style={{ color: '#555', fontSize: 10 }}>{n.sentAt ? new Date(n.sentAt).toLocaleString('fa-IR') : ''}</span>
                  </div>
                  <div style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 2 }}>به: {n.to}</div>
                  <div style={{ color: '#2D2D2D', fontSize: 11, fontWeight: 600 }}>{n.subject || ''}</div>
                  <div style={{ color: '#777', fontSize: 11, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: 24, border: '1px solid rgba(212,175,55,0.1)' }}>
        <h3 style={{ color: '#4CAF50', fontSize: 16, margin: '0 0 12px' }}>ℹ️ راهنمای اتصال</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#66BB6A', fontSize: 14, margin: '0 0 6px' }}>📱 کاوه نگار (Kavenegar)</h4>
            <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
              ۱. در سایت kavenegar.com ثبت‌نام کنید<br />
              ۲. از پنل کاربری API Key خود را دریافت کنید<br />
              ۳. API Key را در فیلد بالا وارد کنید
            </p>
          </div>
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#42A5F5', fontSize: 14, margin: '0 0 6px' }}>📧 SMTP ایمیل</h4>
            <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
              ۱. از ارائه‌دهنده ایمیل خود تنظیمات SMTP را دریافت کنید<br />
              ۲. هاست، پورت، نام کاربری و رمز را تنظیم کنید<br />
              ۳. برای ارسال ایمیل‌های تراکنشی از SendGrid استفاده کنید
            </p>
          </div>
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#29A9E1', fontSize: 14, margin: '0 0 6px' }}>🤖 ربات تلگرام</h4>
            <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
              ۱. در تلگرام به @BotFather پیام دهید<br />
              ۲. دستور /newbot را ارسال کنید<br />
              ۳. توکن دریافتی را در فیلد بالا وارد کنید
            </p>
          </div>
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#25D366', fontSize: 14, margin: '0 0 6px' }}>💬 API واتساپ</h4>
            <p style={{ color: '#6B6B6B', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
              ۱. از سرویس‌هایی مثل Twilio یا WATI استفاده کنید<br />
              ۲. API Key و شماره فرستنده را دریافت کنید<br />
              ۳. اطلاعات را در فیلد بالا وارد کنید
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
