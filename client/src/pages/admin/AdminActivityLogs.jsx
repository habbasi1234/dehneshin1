import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const gold = '#D4AF37'
const textPrimary = '#F5E6C8'
const textSecondary = '#A89880'
const borderGlass = 'rgba(212, 175, 55, 0.12)'
const actionColors = { create: '#4CAF50', update: '#D4AF37', delete: '#f44336', login: '#2196F3', logout: '#FF9800' }
const actionLabels = { create: 'ایجاد', update: 'ویرایش', delete: 'حذف', login: 'ورود', logout: 'خروج' }

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(0)
  const limit = 30

  useEffect(() => {
    const params = new URLSearchParams({ limit, skip: page * limit })
    if (actionFilter) params.set('action', actionFilter)
    axios.get(`/api/admin/activity?${params}`).then(({ data }) => {
      setLogs(data.items || [])
      setTotal(data.total || 0)
    })
  }, [page, actionFilter])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: textPrimary, margin: 0, fontSize: 18 }}>لاگ فعالیت مدیران</h2>
        <p style={{ color: textSecondary, fontSize: 13, margin: '6px 0 0' }}>تاریخچه عملیات مدیران سیستم</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'create', 'update', 'delete'].map(a => (
          <motion.button key={a} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setActionFilter(a); setPage(0) }}
            style={{
              padding: '6px 18px', borderRadius: 8, border: '1px solid ' + borderGlass,
              background: actionFilter === a ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: actionFilter === a ? gold : textSecondary, cursor: 'pointer', fontSize: 12,
            }}
          >
            {a ? actionLabels[a] || a : 'همه'}
          </motion.button>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid ' + borderGlass, borderRadius: 16, overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: textSecondary, fontSize: 13 }}>فعالیتی ثبت نشده</div>
        ) : (
          <div>
            {logs.map((log, i) => (
              <motion.div key={log._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                style={{ padding: '12px 20px', borderBottom: '1px solid ' + borderGlass, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: (actionColors[log.action] || '#888') + '22', border: '1px solid ' + (actionColors[log.action] || '#888') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, color: actionColors[log.action] || '#888' }}>
                  {log.action === 'create' ? '＋' : log.action === 'update' ? '✎' : log.action === 'delete' ? '✕' : '●'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ color: textPrimary, fontSize: 13 }}>{log.username || 'ادمین'}</strong>
                    <span style={{ color: '#fff', fontSize: 10, padding: '2px 10px', borderRadius: 4, background: (actionColors[log.action] || '#888') + '33' }}>{actionLabels[log.action] || log.action}</span>
                    <span style={{ color: textSecondary, fontSize: 12 }}>{log.resource?.replace('/api/', '') || ''}</span>
                    {log.resourceId && <span style={{ color: 'rgba(168,152,128,0.4)', fontSize: 11, direction: 'ltr' }}>#{log.resourceId}</span>}
                  </div>
                  {log.details && (
                    <div style={{ color: 'rgba(168,152,128,0.4)', fontSize: 11, marginTop: 4, maxHeight: 40, overflow: 'hidden' }}>
                      {log.details?.slice(0, 200)}
                    </div>
                  )}
                  <div style={{ color: 'rgba(168,152,128,0.3)', fontSize: 10, marginTop: 4 }}>
                    {new Date(log.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid ' + borderGlass, background: 'transparent', color: page === 0 ? 'rgba(168,152,128,0.3)' : gold, cursor: page === 0 ? 'default' : 'pointer', fontSize: 12 }}
          >قبلی</motion.button>
          <span style={{ color: textSecondary, fontSize: 12 }}>{page + 1} از {totalPages}</span>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid ' + borderGlass, background: 'transparent', color: page >= totalPages - 1 ? 'rgba(168,152,128,0.3)' : gold, cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: 12 }}
          >بعدی</motion.button>
        </div>
      )}
    </div>
  )
}
