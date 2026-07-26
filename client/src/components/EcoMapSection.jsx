import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

export default function EcoMapSection() {
  const [settings, setSettings] = useState(null)
  const { getText } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const ms = settings?.mapSettings
  const items = ms?.items?.length ? ms.items : (settings?.ecoMapCities || [])
  const title = getText(settings?.ecoMapTitle)
  const subtitle = getText(settings?.ecoMapSubtitle)
  const btnText = getText(settings?.ecoMapButtonText)

  return (
    <section className="section-padding" style={{
      padding: '60px 20px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{
          color: '#D4AF37',
          fontSize: 28,
          marginBottom: 8,
        }}>
          {title || 'نقشه مزارع ارگانیک ایران'}
        </h2>
        <p style={{
          color: '#F5E6C8',
          opacity: 0.7,
          fontSize: 14,
          marginBottom: 40,
        }}>
          {subtitle || 'مهم‌ترین قطب‌های تولید محصولات ارگانیک در سراسر ایران'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: '#1a1a1a',
              border: `1px solid ${item.color || '#D4AF37'}44`,
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: item.color || '#D4AF37',
                marginBottom: 4,
              }}>
                {typeof item.name === 'object' ? getText(item.name) : item.name}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>{item.count}</div>
              {item.branches?.length > 0 && (
                <div style={{ color: '#666', fontSize: 11, marginTop: 6 }}>
                  {item.branches.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/farm-map">
          <button style={{
            padding: '14px 36px',
            background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            {btnText || 'مشاهده نقشه تعاملی بازارها'}
          </button>
        </Link>
      </div>
    </section>
  )
}
