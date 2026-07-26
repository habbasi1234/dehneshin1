import { useEffect, useRef, useCallback } from 'react'

let sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

const track = (type, data = {}) => {
  try {
    const payload = { type, data, session: sessionId }
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', JSON.stringify(payload))
    } else {
      fetch('/api/analytics/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), keepalive: true,
      })
    }
  } catch {}
}

export function usePageTracking() {
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    track('pageview', { path: window.location.pathname, referrer: document.referrer })

    return () => {
      track('pageleave', {
        path: window.location.pathname,
        duration: Math.round((Date.now() - startRef.current) / 1000),
      })
    }
  }, [])
}

export function useProductTracking(productId, productName) {
  const hoverStart = useRef(null)
  const hoverCount = useRef(0)

  useEffect(() => {
    if (productId) {
      track('product_view', { productId, productName })
    }
  }, [productId, productName])

  const onImageEnter = useCallback(() => {
    hoverStart.current = Date.now()
    hoverCount.current++
    track('image_hover_start', { productId, productName })
  }, [productId, productName])

  const onImageLeave = useCallback(() => {
    if (hoverStart.current) {
      track('image_hover_end', {
        productId, productName,
        duration: Math.round((Date.now() - hoverStart.current) / 1000),
        count: hoverCount.current,
      })
      hoverStart.current = null
    }
  }, [productId, productName])

  const trackClick = useCallback(() => {
    track('product_click', { productId, productName })
  }, [productId, productName])

  return { onImageEnter, onImageLeave, trackClick, hoverCount }
}

export default track