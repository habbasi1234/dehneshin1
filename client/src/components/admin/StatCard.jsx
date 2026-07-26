import { motion } from 'framer-motion'

export default function StatCard({ icon, value, label, color = '#4CAF50', onClick, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: '#FAFAF7', borderRadius: 14, padding: '24px 28px',
        border: `1px solid ${color}33`, cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `${color}15`, opacity: 0.5,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color, lineHeight: 1, marginBottom: 6 }}>
            {value}
          </div>
          <div style={{ color: '#6B6B6B', fontSize: 13 }}>{label}</div>
          {trend && (
            <div style={{
              marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
              color: trend.up ? '#4CAF50' : '#ff6b6b',
            }}>
              <span>{trend.up ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>{icon}</div>
      </div>
    </motion.div>
  )
}
