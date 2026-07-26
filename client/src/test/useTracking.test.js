import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('track function', () => {
  let sendBeaconSpy, fetchSpy

  beforeEach(() => {
    sendBeaconSpy = vi.fn(() => true)
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy })
    fetchSpy = vi.fn(() => Promise.resolve({ ok: true }))
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const track = (type, data = {}) => {
    try {
      const payload = { type, data, session: 'sess_test_session' }
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

  it('sends beacon with correct URL and JSON payload', () => {
    track('pageview', { path: '/home' })

    expect(sendBeaconSpy).toHaveBeenCalledOnce()
    const [url, body] = sendBeaconSpy.mock.calls[0]
    expect(url).toBe('/api/analytics/track')

    const payload = JSON.parse(body)
    expect(payload.type).toBe('pageview')
    expect(payload.data.path).toBe('/home')
  })

  it('includes session ID in payload', () => {
    track('click', { button: 'buy' })

    const payload = JSON.parse(sendBeaconSpy.mock.calls[0][1])
    expect(typeof payload.session).toBe('string')
    expect(payload.session.length).toBeGreaterThan(0)
  })

  it('sends with empty data when no data arg', () => {
    track('pageleave')

    const payload = JSON.parse(sendBeaconSpy.mock.calls[0][1])
    expect(payload.type).toBe('pageleave')
    expect(payload.data).toEqual({})
  })

  it('falls back to fetch when sendBeacon is unavailable', () => {
    vi.stubGlobal('navigator', {})

    track('product_view', { productId: 1 })

    expect(sendBeaconSpy).not.toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, opts] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/analytics/track')
    expect(opts.method).toBe('POST')
    expect(opts.keepalive).toBe(true)

    const payload = JSON.parse(opts.body)
    expect(payload.type).toBe('product_view')
    expect(payload.data.productId).toBe(1)
  })

  it('handles errors silently without throwing', () => {
    sendBeaconSpy.mockImplementation(() => { throw new Error('fail') })

    expect(() => track('error_test', {})).not.toThrow()
  })

  it('serializes complex data structures', () => {
    track('complex', { nested: { a: 1 }, arr: [1, 2, 3] })

    const payload = JSON.parse(sendBeaconSpy.mock.calls[0][1])
    expect(payload.data.nested).toEqual({ a: 1 })
    expect(payload.data.arr).toEqual([1, 2, 3])
  })

  it('payload has three top-level keys', () => {
    track('test')
    const payload = JSON.parse(sendBeaconSpy.mock.calls[0][1])
    expect(Object.keys(payload).sort()).toEqual(['data', 'session', 'type'])
  })
})

describe('useProductTracking', () => {
  let sendBeaconSpy

  beforeEach(() => {
    sendBeaconSpy = vi.fn(() => true)
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks product_view on mount', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    renderHook(() => useProductTracking(1, 'Test Product'))

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'product_view' && e.data.productId === 1)).toBe(true)
  })

  it('does not track when productId is null', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    renderHook(() => useProductTracking(null, 'Product'))

    expect(sendBeaconSpy).not.toHaveBeenCalled()
  })

  it('returns trackClick callback that sends product_click', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    const { result } = renderHook(() => useProductTracking(5, 'Chair'))

    act(() => {
      result.current.trackClick()
    })

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'product_click' && e.data.productId === 5)).toBe(true)
  })

  it('returns onImageEnter and onImageLeave callbacks', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    const { result } = renderHook(() => useProductTracking(1, 'Product'))

    expect(typeof result.current.onImageEnter).toBe('function')
    expect(typeof result.current.onImageLeave).toBe('function')
    expect(typeof result.current.trackClick).toBe('function')
  })

  it('onImageEnter fires image_hover_start event', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    const { result } = renderHook(() => useProductTracking(3, 'Sofa'))

    act(() => {
      result.current.onImageEnter()
    })

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'image_hover_start' && e.data.productId === 3)).toBe(true)
  })

  it('onImageLeave fires image_hover_end when hover started', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    const { result } = renderHook(() => useProductTracking(3, 'Sofa'))

    act(() => {
      result.current.onImageEnter()
    })
    sendBeaconSpy.mockClear()

    act(() => {
      result.current.onImageLeave()
    })

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'image_hover_end')).toBe(true)
  })

  it('onImageLeave does nothing when no hover started', async () => {
    const { useProductTracking } = await import('../hooks/useTracking')

    const { result } = renderHook(() => useProductTracking(3, 'Sofa'))
    act(() => {})
    sendBeaconSpy.mockClear()

    act(() => {
      result.current.onImageLeave()
    })

    expect(sendBeaconSpy).not.toHaveBeenCalled()
  })
})

describe('usePageTracking', () => {
  let sendBeaconSpy

  beforeEach(() => {
    sendBeaconSpy = vi.fn(() => true)
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends pageview on mount', async () => {
    const { usePageTracking } = await import('../hooks/useTracking')

    renderHook(() => usePageTracking())

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'pageview')).toBe(true)
    const pvEvent = events.find(e => e.type === 'pageview')
    expect(pvEvent.data.path).toBeDefined()
  })

  it('sends pageleave on unmount', async () => {
    const { usePageTracking } = await import('../hooks/useTracking')

    const { unmount } = renderHook(() => usePageTracking())
    sendBeaconSpy.mockClear()

    unmount()

    const events = sendBeaconSpy.mock.calls.map(c => JSON.parse(c[1]))
    expect(events.some(e => e.type === 'pageleave')).toBe(true)
    const leaveEvent = events.find(e => e.type === 'pageleave')
    expect(leaveEvent.data.duration).toBeGreaterThanOrEqual(0)
  })
})
