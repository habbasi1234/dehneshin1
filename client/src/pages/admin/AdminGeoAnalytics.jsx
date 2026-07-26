import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function AdminGeoAnalytics() {
  const [data, setData] = useState(null)
  const [productData, setProductData] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get(`/api/analytics/admin/geo?period=${period}`),
      axios.get(`/api/analytics/admin/geo/products?period=${period}`),
    ]).then(([geoRes, prodRes]) => {
      setData(geoRes.data)
      setProductData(prodRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [period])

  useEffect(() => {
    if (!data?.geoPoints?.length || mapInstance.current) return
    let map, markers = []
    import('leaflet').then(async (L) => {
      await import('leaflet/dist/leaflet.css')
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      map = L.map(mapRef.current, { zoomControl: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(map)
      const bounds = []
      data.geoPoints.forEach(p => {
        const lat = p._id.lat, lon = p._id.lon
        if (lat && lon) {
          const m = L.marker([lat, lon])
            .bindPopup(`<b>${p._id.city}, ${p._id.province}</b><br>${p.count} بازدید`)
            .addTo(map)
          markers.push(m)
          bounds.push([lat, lon])
        }
      })
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [30, 30] })
      else map.setView([35.6892, 51.3890], 4)
      mapInstance.current = map
    }).catch(() => {})
    return () => {
      markers.forEach(m => { try { m.remove() } catch {} })
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [data])

  const tableRow = (item, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
      <span style={{ color: '#6B6B6B', fontSize: 11, minWidth: 20 }}>{i + 1}</span>
      <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: '#2D2D2D', fontSize: 12 }}>{item._id?.province || item._id?.country || item._id || 'Unknown'}</span>
        {item._id?.country && <span style={{ color: '#6B6B6B', fontSize: 11 }}>({item._id.country})</span>}
      </div>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(item.count / (data?.byCountry?.[0]?.count || 1)) * 100}%`, background: '#D4AF37', borderRadius: 3, opacity: 0.6 }} />
      </div>
      <span style={{ color: '#6B6B6B', fontSize: 11, minWidth: 30, textAlign: 'left' }}>{item.count}</span>
      <span style={{ color: '#6B6B6B', fontSize: 10, minWidth: 24, textAlign: 'left' }}>{item.uniqueVisitors} کاربر</span>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ color: '#4CAF50', fontSize: 22, margin: 0 }}>🗺️ آنالیتیکس جغرافیایی</h2>
          <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 4 }}>موقعیت مکانی بازدیدکنندگان و علایق منطقه‌ای</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'today', label: 'امروز' },
            { value: 'week', label: 'هفته' },
            { value: 'month', label: 'ماه' },
            { value: 'year', label: 'سال' },
          ].map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                background: period === p.value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                border: period === p.value ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.1)',
                color: period === p.value ? '#D4AF37' : '#A89880',
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4CAF50' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopcolor: '#4CAF50', borderRadius: '50%', margin: '0 auto 20px' }} />
          در حال بارگذاری...
        </div>
      ) : (
        <>
          <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.12)', marginBottom: 24 }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 16 }}>🌍 بر اساس کشور</h3>
              {data?.byCountry?.length ? data.byCountry.map(tableRow) : <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>داده‌ای وجود ندارد</div>}
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 16 }}>📍 بر اساس استان</h3>
              {data?.byProvince?.length ? data.byProvince.slice(0, 15).map(tableRow) : <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>داده‌ای وجود ندارد</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 16 }}>🏙️ بر اساس شهر</h3>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {data?.byCity?.length ? data.byCity.slice(0, 30).map(tableRow) : <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>داده‌ای وجود ندارد</div>}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 16 }}>🔍 علایق هر استان</h3>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {data?.interestsByProvince?.length ? data.interestsByProvince.slice(0, 20).map((item, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#2D2D2D', fontSize: 12, fontWeight: 600 }}>{item.province} {item.country !== 'Iran' && <span style={{ color: '#6B6B6B', fontWeight: 400 }}>({item.country})</span>}</span>
                      <span style={{ color: '#6B6B6B', fontSize: 11 }}>{item.total} بازدید</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {item.sections.slice(0, 5).map((s, si) => (
                        <span key={si} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: 'rgba(212,175,55,0.1)', color: '#4CAF50' }}>
                          {s.section} {s.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>داده‌ای وجود ندارد</div>}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 16 }}>📦 محصولات مورد علاقه هر استان</h3>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {productData?.productsByProvince?.length ? productData.productsByProvince.slice(0, 20).map((item, i) => (
                <div key={i} style={{ marginBottom: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#2D2D2D', fontSize: 12, fontWeight: 600 }}>{item.province}</span>
                    <span style={{ color: '#6B6B6B', fontSize: 11 }}>{item.total} بازدید</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {item.products.slice(0, 5).map((p, pi) => (
                      <span key={pi} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: 'rgba(212,175,55,0.08)', color: '#4CAF50' }}>
                        محصول {p.productId}: {p.count}
                      </span>
                    ))}
                  </div>
                </div>
              )) : <div style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', padding: 20 }}>داده‌ای وجود ندارد</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
