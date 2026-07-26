import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

let sessionId = localStorage.getItem('visitSession')
if (!sessionId) {
  sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  localStorage.setItem('visitSession', sessionId)
}

const tracked = new Set()
let lastPath = ''

export default function useVisitTracker() {
  const location = useLocation()
  const startTime = useRef(Date.now())
  const intervalRef = useRef(null)

  useEffect(() => {
    const path = location.pathname + location.search
    if (path === lastPath) return
    lastPath = path

    startTime.current = Date.now()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const productMatch = path.match(/\/products\/(.+)/)
    const payload = {
      type: 'pageview',
      session: sessionId,
      path: path,
      data: {
        path,
        productId: productMatch ? productMatch[1] : undefined,
        product: productMatch ? productMatch[1] : undefined,
      },
      referrer: document.referrer || '',
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || '',
    }

    axios.post('/api/analytics/track', payload).catch(() => {})

    intervalRef.current = setInterval(() => {
      const dur = Math.floor((Date.now() - startTime.current) / 1000)
      axios.post('/api/analytics/track/duration', {
        session: sessionId,
        path: path,
        duration: dur,
      }).catch(() => {})
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleBeforeUnload = () => {
      const dur = Math.floor((Date.now() - startTime.current) / 1000)
      navigator.sendBeacon('/api/analytics/track/duration', JSON.stringify({
        session: sessionId,
        path: lastPath,
        duration: dur,
      }))
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])
}
