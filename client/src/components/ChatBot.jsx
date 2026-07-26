import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const faqs = [
  { q: 'چگونه سفارش بدم؟', a: 'محصول مورد نظر را از صفحه محصولات انتخاب کنید و به سبد خرید اضافه کنید. سپس از طریق سبد خرید مراحل ثبت سفارش را طی کنید.', keywords: ['سفارش', 'خرید', 'ثبت', 'order', 'buy'] },
  { q: 'آیا محصولات ارگانیک هستند؟', a: 'بله، تمام محصولات ده نشین دارای گواهی ارگانیک بوده و از مزارع معتبر سراسر ایران تهیه می‌شوند.', keywords: ['ارگانیک', 'organic', 'طبیعی', 'سالم'] },
  { q: 'مدت زمان تحویل چقدره؟', a: 'سفارشات تهران ۲۴ تا ۴۸ ساعت و سایر شهرها ۳ تا ۵ روز کاری تحویل داده می‌شود.', keywords: ['تحویل', 'زمان', 'مدت', 'دلایل'] },
  { q: 'هزینه ارسال چقدره؟', a: 'برای سفارشات بالای ۲۰۰ هزار تومان، ارسال رایگان است. در غیر اینصورت هزینه ارسال ۳۰ هزار تومان می‌باشد.', keywords: ['ارسال', 'هزینه', 'حمل', 'پست'] },
  { q: 'چگونه می‌توانم پیگیری کنم؟', a: 'می‌توانید از صفحه پیگیری سفارش با وارد کردن کد پیگیری، وضعیت سفارش خود را مشاهده کنید.', keywords: ['پیگیری', 'track', 'وضعیت'] },
  { q: 'روش‌های پرداخت چیست؟', a: 'پرداخت آنلاین از طریق درگاه بانکی، کارت به کارت و پرداخت در محل (فقط تهران) امکان‌پذیر است.', keywords: ['پرداخت', 'کارت', 'pay', 'آنلاین'] },
]

const initialCategories = [
  { icon: '🛒', label: 'راهنمای خرید', keywords: ['سفارش', 'خرید', 'buy'] },
  { icon: '🌱', label: 'محصولات ارگانیک', keywords: ['ارگانیک', 'محصول', 'organic'] },
  { icon: '🚚', label: 'ارسال و تحویل', keywords: ['ارسال', 'تحویل', 'delivery'] },
  { icon: '💳', label: 'روش‌های پرداخت', keywords: ['پرداخت', 'pay'] },
  { icon: '📞', label: 'مشاوره تخصصی', keywords: ['مشاوره', 'consult'] },
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [step, setStep] = useState('greeting')
  const [form, setForm] = useState({ name: '', phone: '', description: '' })
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100) }, [open])

  useEffect(() => {
    const handler = (e) => { setOpen(true); if (e.detail?.action === 'consult') setTimeout(startConsultation, 500) }
    window.addEventListener('open-chat', handler)
    return () => window.removeEventListener('open-chat', handler)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        addMessage('سلام! به ده‌نشین خوش آمدید 🌿')
        setTimeout(() => {
          addMessage('چطور می‌توانم به شما کمک کنم؟ گزینه مورد نظر را انتخاب کنید یا سوال خود را بپرسید.')
          setStep('menu')
        }, 500)
      }, 300)
    }
  }, [open])

  const addMessage = (text, from = 'bot') => setMessages(prev => [...prev, { from, text }])

  const findAnswer = (text) => {
    const t = text.replace(/[؟?]\s*$/, '').trim()
    for (const faq of faqs) {
      if (faq.keywords.some(k => t.includes(k))) return faq
    }
    return null
  }

  const handleCategoryClick = (cat) => {
    addMessage(cat.label, 'user')
    const matched = faqs.find(f => f.keywords.some(k => cat.keywords.includes(k)))
    if (cat.label === 'مشاوره تخصصی') {
      setTimeout(startConsultation, 400)
    } else if (matched) {
      setTimeout(() => {
        addMessage(matched.a)
        setTimeout(() => {
          addMessage('آیا سوال دیگری دارید؟')
          setStep('menu')
        }, 600)
      }, 400)
    }
  }

  const startConsultation = () => {
    setStep('consulting')
    setForm({ name: '', phone: '', description: '' })
    setTimeout(() => addMessage('لطفاً نام خود را وارد کنید:'), 300)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    addMessage(text, 'user')
    setInput('')

    if (step === 'consulting' && !form.name) {
      setForm(prev => ({ ...prev, name: text }))
      setTimeout(() => addMessage('شماره تماس خود را وارد کنید:'), 300)
    } else if (step === 'consulting' && !form.phone) {
      setForm(prev => ({ ...prev, phone: text }))
      setTimeout(() => addMessage('توضیحات (یا بنویسید "ندارم"):'), 300)
    } else if (step === 'consulting') {
      const data = { ...form, description: text }
      setLoading(true)
      try {
        await axios.post('/api/contact', { name: data.name, phone: data.phone, productType: 'chat-consultation', description: data.description || 'درخواست مشاوره از چت' })
        addMessage('✅ سوال شما برای کارشناسان ارسال شد. کارشناسان ما تا ۲۴ ساعت آینده جواب را به شما اطلاع می‌دهند.')
      } catch {
        const requests = JSON.parse(localStorage.getItem('consultRequests') || '[]')
        requests.push({ ...data, description: data.description || 'درخواست مشاوره از چت', date: new Date().toISOString() })
        localStorage.setItem('consultRequests', JSON.stringify(requests))
        addMessage('✅ درخواست شما ذخیره شد. کارشناسان ما به زودی با شما تماس می‌گیرند.')
      }
      setLoading(false)
      setForm({ name: '', phone: '', description: '' })
    } else {
      const matched = findAnswer(text)
      if (matched) {
        setTimeout(() => {
          addMessage(matched.a)
          setTimeout(() => { addMessage('آیا سوال دیگری دارید؟'); setStep('menu') }, 600)
        }, 400)
      } else {
        setTimeout(() => {
          addMessage('متأسفم پاسخ این سوال را نمی‌دانم. از کارشناس بپرسید تا جواب بدهد.')
          setTimeout(() => setStep('noanswer'), 300)
        }, 400)
      }
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(76,175,80,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          transition: 'all 0.3s',
        }}
      >
        {open ? '✕' : '💬'}
        {!open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: '#E53935', border: '2px solid #0D2B1A',
          }} />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 0, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            style={{
              position: 'fixed', bottom: 92, left: 24, zIndex: 9999,
              width: 380, maxHeight: 560, direction: 'rtl',
              background: '#fff', borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, #0D2B1A, #1A4A2E)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(76,175,80,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🌿</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>ده نشین</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>آنلاین</div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
                width: 28, height: 28, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{
              flex: 1, overflow: 'auto', padding: 14,
              display: 'flex', flexDirection: 'column', gap: 8,
              background: '#F8F9FA',
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%', padding: '10px 14px',
                  borderRadius: msg.from === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  background: msg.from === 'user' ? '#4CAF50' : '#fff',
                  color: msg.from === 'user' ? '#fff' : '#2D2D2D',
                  fontSize: 13, lineHeight: 1.7,
                  boxShadow: msg.from === 'user' ? '0 2px 8px rgba(76,175,80,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                  whiteSpace: 'pre-wrap',
                }}>{msg.text}</div>
              ))}

              {step === 'noanswer' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <motion.button
                    onClick={startConsultation}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 18px', borderRadius: 20,
                      background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                      border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer',
                      fontWeight: 600, boxShadow: '0 2px 8px rgba(76,175,80,0.2)',
                    }}
                  >
                    📤 ارسال سوال به کارشناس
                  </motion.button>
                </div>
              )}
              {step === 'menu' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {initialCategories.map((cat, i) => (
                    <motion.button
                      key={i} onClick={() => handleCategoryClick(cat)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 14px', borderRadius: 20,
                        background: '#fff', border: '1px solid rgba(76,175,80,0.15)',
                        color: '#2D2D2D', fontSize: 11, cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(0,0,0,0.04)',
              display: 'flex', gap: 8,
              background: '#fff',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="سوال خود را بپرسید..."
                style={{
                  flex: 1, padding: '10px 14px', background: '#F5F0E8',
                  border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12,
                  color: '#2D2D2D', fontSize: 13, outline: 'none',
                  fontFamily: "'Vazirmatn', sans-serif",
                }}
              />
              <button onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '10px 16px', borderRadius: 12,
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
                  border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                {loading ? '...' : 'ارسال'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
