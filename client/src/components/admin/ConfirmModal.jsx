import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'تأیید', message = 'آیا اطمینان دارید؟', confirmText = 'تأیید', cancelText = 'انصراف', danger = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10001, direction: 'rtl', padding: 16,
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 16, padding: '28px 32px',
              border: `1px solid ${danger ? '#ff4444' : '#4CAF50'}`,
              maxWidth: 440, width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: 42, textAlign: 'center', marginBottom: 12,
              lineHeight: 1,
            }}>
              {danger ? '⚠️' : '💡'}
            </div>
            <h3 style={{
              color: '#4CAF50', margin: '0 0 8px', textAlign: 'center', fontSize: 18,
              fontFamily: "'Vazirmatn', sans-serif", fontWeight: 800,
            }}>
              {title}
            </h3>
            <p style={{
              color: '#6B6B6B', textAlign: 'center', fontSize: 14, lineHeight: 1.8,
              margin: '0 0 24px', wordBreak: 'break-word',
            }}>
              {message}
            </p>
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button onClick={onClose} style={{
                padding: '12px 28px', background: '#F0F0EA', color: '#2D2D2D',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                fontWeight: 500, minWidth: 100, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E8E4DC' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F0F0EA' }}
              >
                {cancelText}
              </button>
              <button
                onClick={() => { onConfirm(); onClose() }}
                style={{
                  padding: '12px 28px',
                  background: danger ? '#ff4444' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
                  color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, minWidth: 100,
                  boxShadow: danger ? '0 4px 20px rgba(255,68,68,0.3)' : '0 4px 20px rgba(212,175,55,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!danger) e.currentTarget.style.background = 'linear-gradient(135deg, #66BB6A, #4CAF50)'
                  else e.currentTarget.style.background = '#ff6666'
                }}
                onMouseLeave={e => {
                  if (!danger) e.currentTarget.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)'
                  else e.currentTarget.style.background = '#ff4444'
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
