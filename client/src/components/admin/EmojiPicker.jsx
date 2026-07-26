import { useState } from 'react'

const emojiGroups = [
  {
    label: 'رسانه‌های اجتماعی',
    items: ['📷', '✈', '💬', '▶', '📌', '💛', '🔵', '📱', '🌐', '🎵', '🐦', '💡', '📺', '🎬', '🔴', '📢', '📡', '🔗'],
  },
  {
    label: 'دست‌ها و اشاره‌ها',
    items: ['👍', '👎', '👌', '✌', '🤝', '👏', '🙌', '🤲', '👋', '🖐', '✋', '💪', '🤳', '👆', '👇', '👉', '👈'],
  },
  {
    label: 'آیکون‌های تجاری',
    items: ['👑', '🎨', '💎', '🛡', '✨', '⭐', '🏆', '🥇', '🎯', '🚀', '💼', '📊', '📈', '🔑', '🛒', '🎁', '🏅', '📋'],
  },
  {
    label: 'اشیاء و ابزار',
    items: ['🪚', '🔨', '🛠', '⚙', '🔧', '🖌', '✏', '📏', '📐', '🪛', '🔩', '🧰', '🪵', '🪑', '🛋', '💡', '🕯', '🖼'],
  },
  {
    label: 'اشکال و نمادها',
    items: ['✅', '❌', '⚠', '🚫', '🔰', '♻', '💯', '🔝', '🔜', '🔄', '🔁', '🔂', '▶', '⏩', '⏪', '🔼', '🔽', '➡'],
  },
  {
    label: 'طبیعت و غذا',
    items: ['🌿', '🌺', '🌸', '🌹', '🌻', '🌳', '🍀', '🍃', '🍂', '🌾', '🌲', '🌴', '🍇', '🍊', '🍋', '🍓', '🍫', '☕'],
  },
  {
    label: 'احساسات و چهره‌ها',
    items: ['😊', '😍', '🤩', '😎', '👍', '✌', '🤗', '😇', '🥰', '😁', '😂', '🤣', '😃', '😄', '😅', '🤔', '🤭', '👻'],
  },
]

export default function EmojiPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const allEmojis = emojiGroups.flatMap(g => g.items)
  const filtered = search ? allEmojis.filter(e => e.includes(search)) : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FFFFFF', borderRadius: 14, padding: 16, maxWidth: 500, width: '100%',
        border: '1px solid rgba(76,175,80,0.2)', maxHeight: '80vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h4 style={{ color: '#4CAF50', margin: 0, fontSize: 14 }}>انتخاب آیکون</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی آیکون..."
          style={{ width: '100%', padding: '6px 10px', background: '#F0F0EA', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 12, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {(filtered ? [{ label: 'نتایج جستجو', items: filtered }] : emojiGroups).map(group => (
            <div key={group.label} style={{ marginBottom: 10 }}>
              <div style={{ color: '#6B6B6B', fontSize: 10, marginBottom: 4 }}>{group.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {group.items.map(emoji => (
                  <button key={emoji} onClick={() => { onSelect(emoji); onClose() }}
                    style={{
                      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: '1px solid transparent', borderRadius: 6,
                      cursor: 'pointer', fontSize: 18, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(76,175,80,0.15)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >{emoji}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
