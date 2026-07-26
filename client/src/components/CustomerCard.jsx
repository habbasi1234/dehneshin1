import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import QRCode from './QRCode'

const tiers = {
  gold: {
    label: 'طلایی', labelEn: 'Gold',
    color: '#D4AF37',
    bgStops: ['#1a1a2e', '#2C1810', '#1a1a2e'],
    accent: ['#D4AF37', '#F0D060', '#D4AF37'],
    borderColor: '#D4AF37',
  },
  silver: {
    label: 'نقره‌ای', labelEn: 'Silver',
    color: '#C0C0C0',
    bgStops: ['#1a1a2e', '#2a2a3e', '#1a1a2e'],
    accent: ['#C0C0C0', '#E8E8E8', '#C0C0C0'],
    borderColor: '#C0C0C0',
  },
  bronze: {
    label: 'برنزی', labelEn: 'Bronze',
    color: '#CD7F32',
    bgStops: ['#1a1a2e', '#3A2A1A', '#1a1a2e'],
    accent: ['#CD7F32', '#A0522D', '#CD7F32'],
    borderColor: '#CD7F32',
  },
}

const CARD_W = 640, CARD_H = 400

const faDigits = '۰۱۲۳۴۵۶۷۸۹'
const enDigits = '0123456789'
function toFaDigits(s) { return String(s).replace(/[0-9]/g, d => faDigits[parseInt(d)]) }
function toEnDigits(s) { return String(s).replace(/[۰-۹]/g, d => enDigits[faDigits.indexOf(d)]) }
function ml(val, lang) {
  if (!val) return ''
  if (typeof val === 'string') return val
  return val[lang] || val.fa || ''
}

function drawCardFace(ctx, t, customer, qrDataUrl, logoUrl, lang, settings) {
  const isFa = lang === 'fa'
  const dig = isFa ? toFaDigits : toEnDigits
  const displayName = isFa ? (customer.name_fa || customer.name) : (customer.name_en || customer.name)
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  t.bgStops.forEach((s, i) => grad.addColorStop(i / (t.bgStops.length - 1), s))
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(0, 0, CARD_W, CARD_H, 18)
  ctx.fill()

  ctx.strokeStyle = t.borderColor
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(2, 2, CARD_W - 4, CARD_H - 4, 17)
  ctx.stroke()

  const shine = ctx.createRadialGradient(CARD_W * 0.7, -CARD_H * 0.3, 10, CARD_W * 0.6, -CARD_H * 0.2, CARD_W * 0.7)
  shine.addColorStop(0, 'rgba(255,255,255,0.07)')
  shine.addColorStop(1, 'transparent')
  ctx.fillStyle = shine
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  const accentGrad = ctx.createLinearGradient(0, 0, 200, 0)
  t.accent.forEach((s, i) => accentGrad.addColorStop(i / (t.accent.length - 1), s))

  if (logoUrl) {
    const img = new Image()
    img.src = logoUrl
    ctx.save()
    ctx.globalAlpha = 0.15
    ctx.drawImage(img, (CARD_W - 260) / 2, (CARD_H - 260) / 2, 260, 260)
    ctx.restore()
  }

  ctx.font = '20px Tahoma, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('🇮🇷', 16, 14)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = t.color
  ctx.font = 'bold 22px Tahoma, sans-serif'
  ctx.fillText('AZ CHOOB IRANIAN', CARD_W / 2, 50)

  const tierLabel = isFa ? t.label : t.labelEn
  const badgeW = ctx.measureText(tierLabel).width + 30
  const badgeX = CARD_W / 2 - badgeW / 2
  const badgeY = 72
  ctx.fillStyle = accentGrad
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, 22, 11)
  ctx.fill()
  ctx.fillStyle = '#111'
  ctx.font = 'bold 11px Tahoma, sans-serif'
  ctx.fillText(tierLabel, CARD_W / 2, badgeY + 11)

  const divGrad = ctx.createLinearGradient(100, 0, CARD_W - 100, 0)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.5, t.borderColor + '66')
  divGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = divGrad
  ctx.fillRect(100, 110, CARD_W - 200, 1)

  if (qrDataUrl) {
    const img = new Image()
    img.src = qrDataUrl
    ctx.drawImage(img, 40, 125, 110, 110)
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#F5E6C8'
  ctx.font = 'bold 22px Tahoma, sans-serif'
  ctx.fillText(displayName || '', 170, 158)

  ctx.fillStyle = '#aaa'
  ctx.font = '14px Tahoma, sans-serif'
  ctx.fillText(customer.phone || '', 170, 188)

  const codeLabel = isFa ? 'کد مشتری' : 'Customer Code'
  ctx.fillStyle = '#888'
  ctx.font = '11px Tahoma, sans-serif'
  ctx.fillText(codeLabel + ': ' + (customer.customerCode || '-'), 170, 215)

  ctx.fillStyle = divGrad
  ctx.fillRect(40, 270, CARD_W - 80, 1)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#666'
  ctx.font = '12px Tahoma, sans-serif'
  const addr = ml(settings?.address, lang)
  const addr2 = ml(settings?.address2, lang)
  const hours = ml(settings?.workingHours, lang)
  const phone = isFa ? settings?.phone || '' : dig(settings?.phone || '')
  const mobile = isFa ? settings?.mobile || '' : dig(settings?.mobile || '')
  const contactLine = [phone, mobile].filter(Boolean).join(' | ')
  let yOff = 295
  if (addr) { ctx.fillText(addr, 40, yOff); yOff += 18 }
  if (addr2) { ctx.fillText(addr2, 40, yOff); yOff += 18 }
  if (hours) { ctx.fillText(hours, 40, yOff); yOff += 18 }
  ctx.fillText(contactLine, 40, yOff)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#888'
  ctx.font = '11px Tahoma, sans-serif'
  ctx.fillText(customer.nationalCode || '', 40, 350)

  ctx.textAlign = 'right'
  ctx.fillStyle = t.color
  ctx.font = 'bold 14px Tahoma, sans-serif'
  const pointsText = isFa ? `${customer.points || 0} امتیاز` : `${customer.points || 0} Points`
  ctx.fillText(pointsText, CARD_W - 40, 350)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#555'
  ctx.font = '10px Tahoma, sans-serif'
  const footer = isFa ? 'ده نشین · باشگاه مشتریان' : 'Deh Neshin · Customer Club'
  ctx.fillText(footer, CARD_W / 2, 382)
}

export default function CustomerCard({ customer, showPrint }) {
  const [flipped, setFlipped] = useState(false)
  const [logoUrls, setLogoUrls] = useState([])
  const [settings, setSettings] = useState(null)
  const [currentLogoIdx, setCurrentLogoIdx] = useState(0)
  const cardRef = useRef(null)
  const t = tiers[customer?.tier] || tiers.gold
  const qrData = JSON.stringify({
    id: customer?.id,
    name: customer?.name,
    phone: customer?.phone,
    tier: customer?.tier,
    code: customer?.customerCode || customer?.nationalCode || customer?.phone,
  })

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      const urls = [data.logoImage_fa, data.logoImage_en, data.logoImage_ar].filter(Boolean)
      setLogoUrls(urls)
      setSettings(data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (logoUrls.length < 2) return
    const timer = setInterval(() => {
      setCurrentLogoIdx(prev => (prev + 1) % logoUrls.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [logoUrls])

  const currentLogo = logoUrls[currentLogoIdx]

  const FaceContent = ({ lang }) => {
    const isFa = lang === 'fa'
    const footerText = isFa ? 'ده نشین · باشگاه مشتریان' : 'Deh Neshin · Customer Club'
    const tierLabel = isFa ? t.label : t.labelEn
    const pointsText = isFa ? `${toFaDigits(customer?.points || 0)} امتیاز` : `${customer?.points || 0} Points`
    const codeLabel = isFa ? 'کد مشتری' : 'Customer Code'
    const displayName = isFa ? (customer?.name_fa || customer?.name) : (customer?.name_en || customer?.name)
    const addr = ml(settings?.address, lang)
    const addr2 = ml(settings?.address2, lang)
    const hours = ml(settings?.workingHours, lang)
    const phone = isFa ? settings?.phone || '' : toEnDigits(settings?.phone || '')
    const mobile = isFa ? settings?.mobile || '' : toEnDigits(settings?.mobile || '')
    const contactLine = [phone, mobile].filter(Boolean).join(' | ')
    return (
      <>
        <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: '80%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
        {currentLogo && (
          <img src={currentLogo} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: 'auto', opacity: 0.12, objectFit: 'contain', pointerEvents: 'none' }} />
        )}

        <div style={{ position: 'relative', zIndex: 1, width: '100%', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'absolute', [isFa ? 'right' : 'left']: 12, top: -2, fontSize: 16 }}>🇮🇷</span>
          <div style={{ color: t.color, fontSize: 13, fontWeight: 'bold', letterSpacing: isFa ? 0 : 1 }}>{isFa ? 'ده نشین' : 'DEH NESHIN'}</div>
        </div>

        <div style={{
          display: 'inline-block', padding: '2px 12px', borderRadius: 12, zIndex: 1,
          background: `linear-gradient(135deg, ${t.accent.join(', ')})`,
          color: '#111', fontSize: 10, fontWeight: 'bold',
        }}>{tierLabel}</div>

        <div style={{ height: 1, width: '82%', background: `linear-gradient(90deg, transparent, ${t.borderColor}44, transparent)` }} />

        <div style={{ display: 'flex', flexDirection: isFa ? 'row-reverse' : 'row', gap: 8, position: 'relative', zIndex: 1, alignItems: 'center', width: '100%', padding: '0 16px' }}>
          <div style={{ width: 48, height: 48, flexShrink: 0 }}>
            <QRCode data={qrData} size={48} />
          </div>
          <div style={{ flex: 1, textAlign: isFa ? 'right' : 'left' }}>
            <div style={{ color: '#F5E6C8', fontSize: 13, fontWeight: 'bold' }}>{displayName}</div>
            <div style={{ color: '#aaa', fontSize: 10, marginTop: 1 }}>{customer?.phone || ''}</div>
            <div style={{ color: '#888', fontSize: 8, marginTop: 1 }}>{codeLabel}: {customer?.customerCode || '-'}</div>
          </div>
        </div>

        <div style={{ height: 1, width: '82%', background: `linear-gradient(90deg, transparent, ${t.borderColor}44, transparent)` }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', zIndex: 1, width: '100%', padding: '0 16px' }}>
          {addr && <div style={{ color: '#777', fontSize: 8, lineHeight: 1.3, direction: isFa ? 'rtl' : 'ltr', textAlign: isFa ? 'right' : 'left' }}>{addr}</div>}
          {addr2 && <div style={{ color: '#777', fontSize: 8, lineHeight: 1.3, direction: isFa ? 'rtl' : 'ltr', textAlign: isFa ? 'right' : 'left' }}>{addr2}</div>}
          {hours && <div style={{ color: '#666', fontSize: 7, lineHeight: 1.3, direction: isFa ? 'rtl' : 'ltr', textAlign: isFa ? 'right' : 'left' }}>{hours}</div>}
          {contactLine && <div style={{ color: '#888', fontSize: 8, direction: 'ltr', textAlign: isFa ? 'right' : 'left' }}>{contactLine}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, width: '100%', padding: '0 16px' }}>
          <div style={{ color: '#666', fontSize: 8, letterSpacing: 1, direction: 'ltr' }}>{customer?.nationalCode || ''}</div>
          <div style={{ color: t.color, fontSize: 10 }}>{pointsText}</div>
        </div>

        <div style={{ color: '#555', fontSize: 6, textAlign: 'center', position: 'relative', zIndex: 1 }}>{footerText}</div>
      </>
    )
  }

  const handlePrint = () => {
    const qrCanvas = document.getElementById('qr-canvas')
    const qrUrl = qrCanvas?.toDataURL() || ''
    const logoImg = currentLogo || ''
    const t = tiers[customer?.tier] || tiers.gold
    const addr = ml(settings?.address, 'fa')
    const addr2 = ml(settings?.address2, 'fa')
    const hours = ml(settings?.workingHours, 'fa')
    const phone = settings?.phone || ''
    const mobile = settings?.mobile || ''
    const contactLine = [phone, mobile].filter(Boolean).join(' | ')
    const faces = ['fa', 'en']
    const faceData = {
      fa: { footer: 'ده نشین · باشگاه مشتریان', tier: t.label, points: `${customer?.points || 0} امتیاز`, codeLabel: 'کد مشتری' },
      en: { footer: 'Deh Neshin · Customer Club', tier: t.labelEn, points: `${customer?.points || 0} Points`, codeLabel: 'Customer Code' },
    }

    const cardsHtml = faces.map((lang, fi) => {
      const isFa2 = lang === 'fa'
      const fd = faceData[lang]
      const dig2 = isFa2 ? s => s : s => String(s).replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
      const pName = isFa2 ? (customer?.name_fa || customer?.name) : (customer?.name_en || customer?.name)
      const pAddr = ml(settings?.address, lang)
      const pAddr2 = ml(settings?.address2, lang)
      const pHours = ml(settings?.workingHours, lang)
      const pPhone = isFa2 ? phone : dig2(phone)
      const pMobile = isFa2 ? mobile : dig2(mobile)
      const pContact = [pPhone, pMobile].filter(Boolean).join(' | ')
      const infoParts = [pAddr, pAddr2, pHours, pContact].filter(Boolean)
      return `
        <div class="page">
        <div class="card card-${lang}" dir="${isFa2 ? 'rtl' : 'ltr'}">
          <div class="bg-shine"></div>
          ${logoImg ? `<img src="${logoImg}" class="watermark-logo" />` : ''}
          <div class="ir-flag">🇮🇷</div>
          <div class="logo">${isFa2 ? 'ده نشین' : 'DEH NESHIN'}</div>
          <div class="tier-badge">${fd.tier}</div>
          <div class="hr"></div>
          <div class="mid" style="flex-direction:${isFa2 ? 'row-reverse' : 'row'}">
            <div class="qr"><img src="${qrUrl}" style="width:42px;height:42px" /></div>
            <div style="text-align:${isFa2 ? 'right' : 'left'}">
              <div class="name">${pName}</div>
              <div class="phone">${customer?.phone || ''}</div>
              <div class="cust-code">${fd.codeLabel}: ${customer?.customerCode || '-'}</div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="info-line" dir="${isFa2 ? 'rtl' : 'ltr'}" style="text-align:${isFa2 ? 'right' : 'left'}">${infoParts.join(' | ')}</div>
          <div class="bottom">
            <div class="code">${customer?.nationalCode || ''}</div>
            <div class="points">${fd.points}</div>
          </div>
          <div class="footer-text">${fd.footer}</div>
        </div>
        ${fi < faces.length - 1 ? '<div class="page-break"></div>' : ''}
      </div>`
    }).join('')

    const w = window.open('', '', 'width=700,height=500')
    w.document.write(`
      <html dir="rtl"><head><title>کارت ${t.label} - ${customer?.name_fa || customer?.name}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; font-family: Tahoma, sans-serif; }
        .page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
        .page-break { page-break-after: always; }
        .card { width: 85mm; height: 54mm; border-radius: 8px; padding: 6mm 0; background: ${'linear-gradient(135deg,' + t.bgStops.join(',') + ')'}; border: 2px solid ${t.borderColor}; position: relative; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
        .bg-shine { position: absolute; top: -50%; right: -30%; width: 80%; height: 200%; background: radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%); }
        .watermark-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: auto; opacity: 0.12; object-fit: contain; pointer-events: none; }
        .ir-flag { position: absolute; top: 5mm; font-size: 20px; line-height: 1; }
        .card-en .ir-flag { left: 5mm; }
        .card-fa .ir-flag { right: 5mm; }
        .logo { color: ${t.color}; font-size: 13px; font-weight: bold; text-align: center; margin-top: 5mm; }
        .card-en .logo { letter-spacing: 1px; }
        .card-fa .logo { letter-spacing: 0; }
        .tier-badge { padding: 1px 10px; border-radius: 10px; background: ${'linear-gradient(135deg,' + t.accent.join(',') + ')'}; color: #111; font-size: 9px; font-weight: bold; margin-top: 1mm; }
        .mid { display: flex; gap: 8px; align-items: center; width: 100%; padding: 0 5mm; margin: 2mm 0; }
        .qr { width: 42px; height: 42px; flex-shrink: 0; }
        .name { color: #F5E6C8; font-size: 12px; font-weight: bold; }
        .phone { color: #aaa; font-size: 9px; margin-top: 1px; }
        .cust-code { color: #888; font-size: 7px; margin-top: 1px; }
        .info-line { color: #777; font-size: 7px; padding: 0 5mm; width: 100%; text-align: center; direction: rtl; }
        .bottom { display: flex; justify-content: space-between; align-items: end; width: 100%; padding: 0 5mm; }
        .code { color: #666; font-size: 7px; letter-spacing: 1px; }
        .points { color: ${t.color}; font-size: 8px; }
        .footer-text { color: #555; font-size: 5px; text-align: center; }
        .hr { height: 1px; background: linear-gradient(90deg, transparent, ${t.borderColor}44, transparent); width: 75%; margin: 1.5mm 0; }
        @media print {
          body { min-height: auto; }
          .page { min-height: 100vh; }
        }
      </style></head><body>
      ${cardsHtml}
      <script>window.print();setTimeout(()=>window.close(),500);</script></body></html>
    `)
    w.document.close()
  }

  const handleDownload = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = CARD_W
    canvas.height = CARD_H
    const ctx = canvas.getContext('2d')
    const qrCanvas = document.getElementById('qr-canvas')
    const qrDataUrl = qrCanvas?.toDataURL() || ''
    drawCardFace(ctx, t, customer, qrDataUrl, currentLogo, 'fa', settings)
    const link = document.createElement('a')
    link.download = `card-${customer?.name || 'customer'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [t, customer, currentLogo, settings])

  if (!customer) return null

  return (
    <>
      <div style={{ perspective: 1000, width: 320, height: 200 }}>
        <div ref={cardRef} onClick={() => setFlipped(prev => !prev)} style={{
          width: '100%', height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: 12, overflow: 'hidden',
            background: `linear-gradient(135deg, ${t.bgStops.join(', ')})`,
            border: `2px solid ${t.borderColor}`,
            boxShadow: `0 0 40px ${t.borderColor}4D`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px', boxSizing: 'border-box' }}>
              <FaceContent lang="fa" />
            </div>
          </div>

          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 12, overflow: 'hidden',
            background: `linear-gradient(135deg, ${t.bgStops.join(', ')})`,
            border: `2px solid ${t.borderColor}`,
            boxShadow: `0 0 40px ${t.borderColor}4D`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px', boxSizing: 'border-box' }}>
              <FaceContent lang="en" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 4, color: '#666', fontSize: 11, cursor: 'pointer' }} onClick={() => setFlipped(prev => !prev)}>
        {flipped ? '🇬🇧 سمت انگلیسی' : '🇮🇷 سمت فارسی'} · کلیک برای برگرداندن
      </div>

      {showPrint && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={handlePrint} style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #D4AF37, #8B6914)', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>🖨 چاپ کارت (دو رو)</button>
          <button onClick={handleDownload} style={{
            padding: '10px 24px',
            background: '#333', color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>⬇ دانلود PNG</button>
        </div>
      )}
    </>
  )
}
