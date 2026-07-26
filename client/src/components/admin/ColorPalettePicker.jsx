import { useState } from 'react'

const DEFAULT_WOODS = [
  { name: 'گردو', hex: '#5C3A1E' },
  { name: 'راش', hex: '#C4936B' },
  { name: 'بلوط', hex: '#8B6914' },
  { name: 'افرا', hex: '#E8C8A0' },
  { name: 'ساج', hex: '#A07348' },
  { name: 'ماهون', hex: '#6B2E1A' },
  { name: 'آبنوس', hex: '#1A1100' },
  { name: 'ون', hex: '#D4A373' },
  { name: 'توسکا', hex: '#8B5E3C' },
  { name: 'توت', hex: '#CD853F' },
  { name: 'ملچ', hex: '#DEB887' },
  { name: 'سرو', hex: '#A0522D' },
]

const DEFAULT_FABRICS = [
  { name: 'مخمل', hex: '#800020' },
  { name: 'ساتن', hex: '#D4AF37' },
  { name: 'چرم', hex: '#2C1810' },
  { name: 'کتان', hex: '#F5E6C8' },
  { name: 'ابریشم', hex: '#C0A080' },
  { name: 'پشم', hex: '#A09080' },
  { name: 'میکروفایبر', hex: '#605040' },
  { name: 'نمد', hex: '#4A3A2A' },
]

export default function ColorPalettePicker({ value = [], onChange, presets, label }) {
  const items = typeof value === 'string' ? (() => {
    try { return JSON.parse(value) } catch { return [] }
  })() : (Array.isArray(value) ? value : [])

  const [showPicker, setShowPicker] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editName, setEditName] = useState('')
  const [editHex, setEditHex] = useState('#D4AF37')

  const addItem = (item) => {
    const next = [...items, { ...item }]
    onChange(JSON.stringify(next))
  }

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx)
    onChange(JSON.stringify(next))
  }

  const startEdit = (idx) => {
    setEditingIndex(idx)
    setEditName(items[idx].name)
    setEditHex(items[idx].hex)
  }

  const saveEdit = () => {
    if (editingIndex < 0) return
    const next = items.map((item, i) =>
      i === editingIndex ? { name: editName, hex: editHex } : item
    )
    onChange(JSON.stringify(next))
    setEditingIndex(-1)
  }

  const presetColors = presets === 'wood' ? DEFAULT_WOODS : presets === 'fabric' ? DEFAULT_FABRICS : presets || []

  return (
    <div>
      <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 6 }}>{label}</label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px 3px 4px', borderRadius: 6,
            background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              background: item.hex || '#888',
            }} />
            <span style={{ color: '#6B6B6B', fontSize: 12 }}>{item.name}</span>
            {editingIndex === idx ? (
              <span style={{ fontSize: 10, color: '#4CAF50', cursor: 'pointer' }}
                onClick={() => { setEditingIndex(-1); saveEdit() }}>✓</span>
            ) : (
              <span style={{ fontSize: 10, color: '#6B6B6B', cursor: 'pointer' }}
                onClick={() => startEdit(idx)}>✎</span>
            )}
            <span style={{ fontSize: 10, color: '#EF5350', cursor: 'pointer' }}
              onClick={() => removeItem(idx)}>✕</span>
          </div>
        ))}
        <button onClick={() => setShowPicker(!showPicker)} style={{
          padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
          background: 'rgba(76,175,80,0.1)', border: '1px dashed rgba(76,175,80,0.3)',
          color: '#4CAF50', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          + افزودن
        </button>
      </div>

      {showPicker && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 8, padding: 10,
          marginBottom: 6,
        }}>
          {editingIndex >= 0 ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                placeholder="نام" style={{ flex: 1, padding: '4px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }}
              />
              <input type="color" value={editHex} onChange={e => setEditHex(e.target.value)}
                style={{ width: 32, height: 28, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
              />
              <button onClick={saveEdit} style={{ padding: '4px 10px', background: '#4CAF50', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, cursor: 'pointer' }}>ذخیره</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                <input
                  value={editName} onChange={e => setEditName(e.target.value)}
                  placeholder="نام رنگ"
                  style={{ flex: 1, minWidth: 100, padding: '5px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }}
                />
                <input type="color" value={editHex} onChange={e => setEditHex(e.target.value)}
                  style={{ width: 34, height: 30, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                />
                <button onClick={() => { if (editName.trim()) { addItem({ name: editName.trim(), hex: editHex }); setEditName(''); setEditHex('#D4AF37') } }}
                  style={{ padding: '5px 12px', background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50', borderRadius: 4, color: '#4CAF50', fontSize: 11, cursor: 'pointer' }}>
                  افزودن
                </button>
              </div>
              {presetColors.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>رنگ‌های پیش‌فرض:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {presetColors.map((pc, i) => (
                      <button key={i} onClick={() => {
                        if (!items.find(x => x.name === pc.name)) addItem(pc)
                        else setShowPicker(false)
                      }} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                        background: items.find(x => x.name === pc.name) ? 'rgba(76,175,80,0.08)' : 'transparent',
                        border: items.find(x => x.name === pc.name) ? '1px solid rgba(76,175,80,0.2)' : '1px solid #D4D0C8',
                        color: items.find(x => x.name === pc.name) ? '#4CAF50' : '#999',
                        fontSize: 11, opacity: items.find(x => x.name === pc.name) ? 0.5 : 1,
                      }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: pc.hex, flexShrink: 0 }} />
                        {pc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
