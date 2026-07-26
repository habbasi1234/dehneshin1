import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

export default function AdminTable({ columns, data, onEdit, onDelete, onRowClick, searchKeys = [], loading = false, emptyMessage = 'موردی یافت نشد' }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const isMobile = useIsMobile()

  const filtered = useMemo(() => {
    let result = [...data]
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase()
      result = result.filter(item =>
        searchKeys.some(key => String(item[key] || '').toLowerCase().includes(q))
      )
    }
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey] || '', vb = b[sortKey] || ''
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
        return sortAsc ? cmp : -cmp
      })
    }
    return result
  }, [data, search, sortKey, sortAsc])

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '3px solid rgba(76,175,80,0.2)', borderTopColor: '#4CAF50', borderRadius: '50%', margin: '0 auto' }}
        />
        <p style={{ color: '#6B6B6B', marginTop: 16 }}>در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <div>
      {searchKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو..."
            style={{
              width: '100%', maxWidth: 350, padding: '10px 14px',
              background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 8,
              color: '#2D2D2D', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      )}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60, color: '#6B6B6B',
          background: '#FFFFFF', borderRadius: 12, border: '1px solid #D4D0C8',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p>{search ? 'نتیجه‌ای یافت نشد' : emptyMessage}</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onRowClick?.(item)}
              style={{
                background: '#FFFFFF', borderRadius: 10, padding: 14,
                border: '1px solid #D4D0C8', cursor: onRowClick ? 'pointer' : undefined,
              }}
            >
              {columns.map(col => (
                <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', gap: 8 }}>
                  <span style={{ color: '#4CAF50', fontSize: 11, whiteSpace: 'nowrap' }}>{col.label}</span>
                  <span style={{ color: '#2D2D2D', fontSize: 12, textAlign: 'left', wordBreak: 'break-word', maxWidth: '65%' }}>
                    {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
                  </span>
                </div>
              ))}
              {(onEdit || onDelete) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-start' }}>
                  {onEdit && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item) }} style={{
                      flex: 1, padding: '8px 0', background: '#E8E4DC', color: '#4CAF50',
                      border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                    }}>
                      ویرایش
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item) }} style={{
                      flex: 1, padding: '8px 0', background: '#FDEDED', color: '#ff6b6b',
                      border: '1px solid #ff6b6b', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                    }}>
                      حذف
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          <div style={{ padding: '8px 4px', color: '#666', fontSize: 12 }}>
            {filtered.length} مورد
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {columns.map(col => (
                  <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={{
                    padding: '12px 10px', textAlign: 'right', color: '#4CAF50',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none', whiteSpace: 'nowrap',
                    fontSize: 12, letterSpacing: '0.5px',
                  }}>
                    {col.label}
                    {sortKey === col.key && <span style={{ marginRight: 4 }}>{sortAsc ? '↑' : '↓'}</span>}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th style={{ padding: '12px 10px', textAlign: 'left', color: '#4CAF50', fontSize: 12 }}>
                    عملیات
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <motion.tr
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', transition: 'background 0.2s', cursor: onRowClick ? 'pointer' : undefined }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '10px 10px', color: '#2D2D2D' }}>
                      {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={{ padding: '10px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {onEdit && (
                        <button onClick={() => onEdit(item)} style={{
                          padding: '6px 14px', background: '#E8E4DC', color: '#4CAF50',
                          border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer',
                          marginLeft: 6, fontSize: 12, transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#4CAF50'; e.currentTarget.style.color = '#FFFFFF' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#E8E4DC'; e.currentTarget.style.color = '#4CAF50' }}
                        >
                          ویرایش
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} style={{
                          padding: '6px 14px', background: '#FDEDED', color: '#ff6b6b',
                          border: '1px solid #ff6b6b', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ff4444'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FDEDED'; e.currentTarget.style.color = '#ff6b6b' }}
                        >
                          حذف
                        </button>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div style={{
            padding: '12px 10px', color: '#666', fontSize: 12,
            borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'left',
          }}>
            {filtered.length} مورد
          </div>
        </div>
      )}
    </div>
  )
}