import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map(toast => (
          <div key={toast.id} onClick={() => removeToast(toast.id)} style={{
            padding: '14px 24px',
            borderRadius: 10,
            background: toast.type === 'success' ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : 
                        toast.type === 'error' ? 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' :
                        'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
            border: `1px solid ${toast.type === 'success' ? '#4CAF50' : toast.type === 'error' ? '#ff4444' : '#4488ff'}`,
            color: '#2D2D2D', fontSize: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            minWidth: 300,
            textAlign: 'center',
            animation: 'slideDown 0.3s ease',
          }}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
