import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import 'leaflet/dist/leaflet.css'
import useSEO from '../hooks/useSEO'

const cityCoords = {
  'تهران': [35.6892, 51.3890],
  'اصفهان': [32.6546, 51.6683],
  'تبریز': [38.0825, 46.2915],
  'مشهد': [36.2970, 59.6000],
  'شیراز': [29.6108, 52.5330],
  'کرج': [35.8400, 51.0100],
  'قم': [34.6400, 50.8800],
  'اهواز': [31.3200, 48.6700],
  'رشت': [37.2800, 49.5800],
  'کرمانشاه': [34.3300, 47.0800],
  'زاهدان': [29.5000, 60.8600],
  'همدان': [34.8000, 48.5200],
  'یزد': [31.8900, 54.3700],
  'ارومیه': [37.5500, 45.0800],
  'بندرعباس': [27.1900, 56.2800],
  'ساری': [36.5700, 53.0600],
  'اراک': [34.0900, 49.6900],
  'اردبیل': [38.2500, 48.3000],
  'بوشهر': [28.9200, 50.8400],
  'سنندج': [35.3100, 46.9900],
}

const parseCount = (count) => {
  if (!count) return 0
  const digits = count.replace(/[^0-9]/g, '')
  return parseInt(digits, 10) || 0
}

const getMarkerColor = (count, baseColor) => {
  return baseColor || '#D4AF37'
}

const getMarkerSize = (countNum) => {
  if (countNum >= 100) return 22
  if (countNum >= 50) return 18
  if (countNum >= 10) return 14
  return 10
}

function createNumberedIcon(count, color) {
  const size = getMarkerSize(parseCount(count))
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size * 2}px; height: ${size * 2}px;
      background: ${color}; color: #111;
      border: 2px solid rgba(255,255,255,0.6);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: ${size * 0.5}px; font-weight: 900;
      box-shadow: 0 2px 10px ${color}66;
      cursor: pointer;
    "></div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
  })
}

export default function EcoMap() {
  useSEO({ title: 'نقشه مزارع | ده نشین', description: 'نقشه مزارع و مراکز تولید محصولات ارگانیک ده نشین در سراسر ایران' })
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const { getText, lang } = useLanguage()

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }, [])

  const ms = settings?.mapSettings
  const cities = ms?.items?.length ? ms.items : (settings?.ecoMapCities || [])
  const mapType = ms?.type || 'iran-provinces'
  const title = getText(settings?.ecoMapTitle) || 'نقشه مزارع ارگانیک ایران'
  const subtitle = getText(settings?.ecoMapSubtitle) || 'مهم‌ترین قطب‌های تولید محصولات ارگانیک در سراسر ایران'

  const getCityName = (city) => typeof city.name === 'object' ? getText(city.name) : city.name
  const getCityCount = (city) => city.count || ''
  const getCountry = (city) => typeof city.country === 'object' ? getText(city.country) : (city.country || '')

  const defaultCenter = mapType === 'iran-provinces' ? [32.4, 54.3] : [20, 0]
  const defaultZoom = mapType === 'iran-provinces' ? 6 : 2
  const center = defaultCenter

  return (
    <div className="page-bg" style={{ minHeight: '100vh', padding: '40px 0', position: 'relative' }}>
      <button onClick={() => navigate(-1)} style={{
        position: 'fixed', top: 90, right: 20, zIndex: 1000,
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37',
        fontSize: 20, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ color: '#D4AF37', textAlign: 'center', fontSize: 32, marginBottom: 8 }}>
          {title}
        </h1>
        <p style={{ color: '#F5E6C8', textAlign: 'center', fontSize: 15, marginBottom: 40, opacity: 0.8 }}>
          {subtitle}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 24,
          marginBottom: 40,
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: 12,
            border: '1px solid #2C1810',
            overflow: 'hidden',
            height: 500,
          }}>
            <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {cities.filter(c => {
                if (c.lat && c.lng) return true
                return cityCoords[getCityName(c)]
              }).map((city, i) => {
                const pos = (city.lat && city.lng) ? [city.lat, city.lng] : cityCoords[getCityName(city)]
                if (!pos) return null
                const countNum = parseCount(city.count)
                const color = getMarkerColor(city.count, city.color)
                return (
                  <Marker
                    key={i}
                    position={pos}
                    icon={createNumberedIcon(city.count, color)}
                    eventHandlers={{ click: () => setSelectedCity(city) }}
                  >
                    <Popup>
                      <div style={{ textAlign: 'center', fontSize: 13 }}>
                        <strong>{getCityName(city)}</strong>
                        {getCountry(city) && <><br /><span style={{ color: '#888', fontSize: 11 }}>{getCountry(city)}</span></>}
                        <br />
                        <span style={{ color: '#666' }}>{getCityCount(city)}</span>
                        {city.branches?.length > 0 && <><br /><span style={{ color: '#D4AF37', fontSize: 10 }}>{city.branches.join(' · ')}</span></>}
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>

          <div style={{
            background: '#1a1a1a',
            borderRadius: 12,
            border: '1px solid #2C1810',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {selectedCity ? (
              <>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: `${selectedCity.color || '#D4AF37'}22`,
                  border: `2px solid ${selectedCity.color || '#D4AF37'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 900, color: selectedCity.color || '#D4AF37',
                  marginBottom: 16, alignSelf: 'center',
                }}>
                  {parseCount(selectedCity.count)}
                </div>
                <h2 style={{ color: '#D4AF37', fontSize: 24, margin: '0 0 8px', textAlign: 'center' }}>
                  {getCityName(selectedCity)}
                </h2>
                {getCountry(selectedCity) && (
                  <p style={{ color: '#888', fontSize: 13, textAlign: 'center', margin: '0 0 4px' }}>
                    {getCountry(selectedCity)}
                  </p>
                )}
                <p style={{ color: '#F5E6C8', fontSize: 16, textAlign: 'center', opacity: 0.8 }}>
                  {getCityCount(selectedCity)}
                </p>
                {selectedCity.branches?.length > 0 && (
                  <div style={{ marginTop: 12, flex: 1 }}>
                    <p style={{ color: '#D4AF37', fontSize: 12, marginBottom: 6 }}>شعبه‌ها:</p>
                    {selectedCity.branches.map((b, i) => (
                      <div key={i} style={{ color: '#aaa', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #222' }}>
                        {b}
                      </div>
                    ))}
                  </div>
                )}
                {selectedCity.desc && (
                  <p style={{ color: '#aaa', lineHeight: 1.7, fontSize: 14, marginTop: 12, flex: 1 }}>
                    {selectedCity.desc}
                  </p>
                )}
                {selectedCity.phone && (
                  <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>
                    📞 {selectedCity.phone}
                  </p>
                )}
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: '#666',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗺</div>
                <p style={{ fontSize: 14, textAlign: 'center' }}>
                  روی هر شهر روی نقشه کلیک کنید
                </p>
                <p style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                  برای مشاهده اطلاعات دقیق‌تر
                </p>
              </div>
            )}
          </div>
        </div>

        <h2 style={{ color: '#D4AF37', fontSize: 22, marginBottom: 16 }}>شهرها و قطب‌های کشاورزی ارگانیک</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {cities.map((city, i) => {
            const name = getCityName(city)
            const countNum = parseCount(city.count)
            const color = getMarkerColor(city.count, city.color)
            return (
              <div
                key={i}
                onClick={() => {
                  setSelectedCity(city)
                  const pos = (city.lat && city.lng) ? [city.lat, city.lng] : cityCoords[name]
                  if (pos) {
                    const el = document.querySelector('.leaflet-map-pane')
                    if (el) {
                      const mapEl = document.querySelector('.leaflet-container')
                      if (mapEl && mapEl._leaflet_id) {
                        const map = Object.values(mapEl).find(v => v && v.flyTo)
                        if (map) map.flyTo(pos, 8, { duration: 1 })
                      }
                    }
                  }
                }}
                style={{
                  background: selectedCity === city ? '#2C1810' : '#1a1a1a',
                  borderRadius: 10,
                  padding: 20,
                  border: selectedCity === city ? `1px solid ${color}` : '1px solid #2a2a2a',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: `${color}22`,
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: color,
                  margin: '0 auto 10px',
                }}>
                  {countNum}
                </div>
                <h3 style={{ color: '#D4AF37', fontSize: 15, margin: '0 0 4px' }}>{name}</h3>
                <p style={{ color: '#888', fontSize: 13, margin: 0 }}>{getCityCount(city)}</p>
              </div>
            )
          })}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40,
          padding: 20, background: '#1a1a1a', borderRadius: 12,
          border: '1px solid #2C1810', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#D4AF37', display: 'inline-block' }} />
            <span style={{ color: '#888', fontSize: 12 }}>۱۰+ بازار</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#E8C84A', display: 'inline-block' }} />
            <span style={{ color: '#888', fontSize: 12 }}>۵۰+ بازار</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#8B6914', display: 'inline-block' }} />
            <span style={{ color: '#888', fontSize: 12 }}>۱۰۰+ بازار</span>
          </div>
        </div>
      </div>
    </div>
  )
}
