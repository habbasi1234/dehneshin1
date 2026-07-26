import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const defaultSettings = {
  siteName: 'ده نشین',
  logoImage_fa: '',
  logoImage_en: '',
  logoImage_ar: '',
  phone: '',
  email: '',
  address: '',
}

export default function ProformaInvoice({ order, onClose }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const { lang, getText } = useLanguage()
  const printRef = useRef(null)

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = (order?.items || []).reduce((s, item) => s + (item.price || 0) * (item.quantity || 1), 0)
  const logo = settings['logoImage_' + lang] || settings.logoImage_fa || ''
  const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : ''
  const invoiceNum = String(order?.id || '').padStart(5, '0')

  const [printing, setPrinting] = useState(false)

  const handlePrint = () => {
    setPrinting(true)
    const w = window.open('', '', 'width=800,height=900')
    w.document.write(`
      <html dir="rtl"><head><title>پیش‌فاکتور ${invoiceNum}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Tahoma, sans-serif; background: #fff; color: #222; margin: 0; padding: 20px; direction: rtl; }
        .invoice { max-width: 210mm; margin: 0 auto; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 15px; }
        .logo-img { max-height: 60px; }
        .company-info { text-align: left; font-size: 11px; color: #666; }
        .company-name { font-size: 18px; font-weight: bold; color: #D4AF37; margin-bottom: 4px; }
        .title { text-align: center; font-size: 16px; font-weight: bold; color: #222; margin: 10px 0; }
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .info-box { font-size: 11px; color: #444; }
        .info-box strong { color: #222; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
        th { background: #D4AF37; color: #111; padding: 8px 10px; text-align: right; }
        td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
        .total-row { font-weight: bold; background: #f5f0e8; }
        .total-row td { border-bottom: 2px solid #D4AF37; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
        .process { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 15px 0; }
        .step { text-align: center; padding: 8px 12px; border-radius: 8px; background: #f5f0e8; font-size: 10px; }
        .step.active { background: #D4AF37; color: #111; font-weight: bold; }
      </style></head><body>
      <div class="invoice">
        <div class="header">
          <div>${logo ? '<img src="' + logo + '" class="logo-img" />' : '<div class="company-name">' + (getText(settings.siteName) || 'ده نشین') + '</div>'}</div>
          <div class="company-info">
            <div>${settings.phone || ''}</div>
            <div>${settings.email || ''}</div>
            <div>${getText(settings.address) || ''}</div>
          </div>
        </div>
        <div class="title">پیش‌فاکتور</div>
        <div class="info-grid">
          <div class="info-box">
            <strong>شماره:</strong> ${invoiceNum}<br/>
            <strong>تاریخ:</strong> ${date}<br/>
            <strong>مشتری:</strong> ${order?.customerName || ''}<br/>
            <strong>موبایل:</strong> ${order?.customerPhone || ''}
          </div>
          <div class="info-box">
            <strong>وضعیت:</strong> ${order?.status || ''}<br/>
            <strong>آدرس:</strong> ${order?.customerAddress || ''}
          </div>
        </div>
        <table>
          <tr><th>#</th><th>محصول</th><th>قیمت واحد</th><th>تعداد</th><th>مجموع</th></tr>
          ${(order?.items || []).map((item, i) => '<tr><td>' + (i+1) + '</td><td>' + (item.name || '') + '</td><td>' + (item.price?.toLocaleString() || '0') + ' تومان</td><td>' + (item.quantity || 1) + '</td><td>' + ((item.price * (item.quantity || 1))?.toLocaleString() || '0') + ' تومان</td></tr>').join('')}
          <tr class="total-row"><td colspan="4" style="text-align:left">جمع کل</td><td>${total.toLocaleString()} تومان</td></tr>
        </table>
        ${order?.process ? '<div class="process">' + order.process.map(s => '<div class="step' + (s.done ? ' active' : '') + '">' + s.label + '</div>').join('') + '</div>' : ''}
        <div class="footer">این پیش‌فاکتور توسط ده نشین صادر شده است</div>
      </div>
      <script>window.print();setTimeout(()=>window.close(),500);</script></body></html>
    `)
    w.document.close()
    setTimeout(() => setPrinting(false), 1000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, width: 700, maxHeight: '90vh', overflow: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <div style={{ fontSize: 12 }}>در حال بارگذاری...</div>
          </div>
        ) : (<>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#D4AF37', margin: 0, fontSize: 16 }}>پیش‌فاکتور #{invoiceNum}</h3>
          <button onClick={onClose} style={{ padding: '4px 10px', background: '#444', color: '#ccc', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>

        <div ref={printRef} style={{ background: '#fff', color: '#222', borderRadius: 8, padding: 20, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '2px solid #D4AF37', paddingBottom: 12, marginBottom: 12 }}>
            {logo ? <img src={logo} alt="" style={{ maxHeight: 50 }} /> : <div style={{ fontSize: 16, fontWeight: 'bold', color: '#D4AF37' }}>{getText(settings.siteName)}</div>}
            <div style={{ textAlign: 'left', fontSize: 10, color: '#666' }}>
              <div>{settings.phone}</div>
              <div>{settings.email}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', margin: '8px 0' }}>پیش‌فاکتور</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11 }}>
            <div><strong>شماره:</strong> {invoiceNum}<br/><strong>تاریخ:</strong> {date}<br/><strong>مشتری:</strong> {order?.customerName || ''}</div>
            <div><strong>وضعیت:</strong> {order?.status || ''}<br/><strong>موبایل:</strong> {order?.customerPhone || ''}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#D4AF37', color: '#111' }}>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>#</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>محصول</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>قیمت واحد</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>تعداد</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>مجموع</th>
              </tr>
            </thead>
            <tbody>
              {(order?.items || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{item.name}</td>
                  <td style={{ padding: '6px 8px' }}>{(item.price || 0).toLocaleString()} تومان</td>
                  <td style={{ padding: '6px 8px' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '6px 8px' }}>{((item.price || 0) * (item.quantity || 1)).toLocaleString()} تومان</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#f5f0e8', borderBottom: '2px solid #D4AF37' }}>
                <td colSpan={4} style={{ textAlign: 'left', padding: '6px 8px' }}>جمع کل</td>
                <td style={{ padding: '6px 8px' }}>{total.toLocaleString()} تومان</td>
              </tr>
            </tbody>
          </table>

          {order?.process && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              {order.process.map((s, i) => (
                <div key={i} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 10,
                  background: s.done ? '#D4AF37' : '#f0f0f0',
                  color: s.done ? '#111' : '#888',
                  fontWeight: s.done ? 'bold' : 'normal',
                }}>{s.label}</div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handlePrint} disabled={printing} style={{
          marginTop: 16, width: '100%', padding: '12px', border: 'none', borderRadius: 8,
          background: printing ? '#666' : 'linear-gradient(135deg, #D4AF37, #8B6914)', color: '#fff',
          fontSize: 14, fontWeight: 'bold', cursor: printing ? 'not-allowed' : 'pointer',
        }}>{printing ? 'در حال چاپ...' : '🖨 چاپ / PDF پیش‌فاکتور'}</button>
        </>)}
      </div>
    </div>
  )
}
