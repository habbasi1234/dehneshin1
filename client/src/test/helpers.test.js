import { describe, it, expect } from 'vitest'

const getColors = (product) => {
  if (Array.isArray(product.colors)) return product.colors
  if (typeof product.colors === 'string') return product.colors.split(',').map(c => c.trim()).filter(Boolean)
  return []
}

const getProductImages = (product) => {
  if (Array.isArray(product.images)) return product.images
  if (typeof product.images === 'string') {
    try { return JSON.parse(product.images) } catch { return [] }
  }
  if (product.image) return [product.image]
  return []
}

const getWoodColors = (product) => {
  const raw = product.woodColors || product.colors
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') return raw.split(',').map(c => c.trim()).filter(Boolean)
  return []
}

const getFabrics = (product) => {
  const raw = product.fabrics
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') return raw.split(',').map(c => c.trim()).filter(Boolean)
  return []
}

const calcStageDuration = (history, status) => {
  const idx = history.findIndex(h => h.status === status)
  const nextIdx = history.findIndex((h, i) => i > idx && ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled'].includes(h.status))
  if (idx === -1) return null
  const start = new Date(history[idx].date)
  const end = nextIdx !== -1 ? new Date(history[nextIdx].date) : new Date()
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
}

const calcTotalDuration = (order) => {
  if (!order || !order.createdAt) return null
  const start = new Date(order.createdAt)
  const end = order.status === 'completed' || order.status === 'cancelled' ? new Date(order.updatedAt) : new Date()
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
}

const parseStatusFlow = (status) => {
  const flow = ['pending', 'processing', 'design', 'production', 'delivery', 'completed']
  return flow.indexOf(status)
}

describe('getColors', () => {
  it('returns array when colors is array', () => {
    expect(getColors({ colors: ['#D4AF37', '#8B4513'] })).toEqual(['#D4AF37', '#8B4513'])
  })
  it('splits comma string', () => {
    expect(getColors({ colors: 'طلایی, گردویی, مشکی' })).toEqual(['طلایی', 'گردویی', 'مشکی'])
  })
  it('returns empty array for undefined', () => {
    expect(getColors({})).toEqual([])
  })
})

describe('getProductImages', () => {
  it('returns array when images is array', () => {
    expect(getProductImages({ images: ['a.jpg', 'b.jpg'] })).toEqual(['a.jpg', 'b.jpg'])
  })
  it('parses JSON string', () => {
    expect(getProductImages({ images: '["a.jpg","b.jpg"]' })).toEqual(['a.jpg', 'b.jpg'])
  })
  it('falls back to image field', () => {
    expect(getProductImages({ image: 'main.jpg' })).toEqual(['main.jpg'])
  })
  it('returns empty for invalid', () => {
    expect(getProductImages({})).toEqual([])
  })
})

describe('getWoodColors', () => {
  it('uses woodColors first', () => {
    expect(getWoodColors({ woodColors: 'گردویی, طلایی', colors: '#D4AF37' })).toEqual(['گردویی', 'طلایی'])
  })
  it('falls back to colors', () => {
    expect(getWoodColors({ colors: '#8B4513, #D4AF37' })).toEqual(['#8B4513', '#D4AF37'])
  })
  it('returns empty when missing', () => {
    expect(getWoodColors({})).toEqual([])
  })
})

describe('getFabrics', () => {
  it('parses comma string', () => {
    expect(getFabrics({ fabrics: 'مخمل, ساده, لوزی' })).toEqual(['مخمل', 'ساده', 'لوزی'])
  })
  it('returns empty when missing', () => {
    expect(getFabrics({})).toEqual([])
  })
})

describe('calcStageDuration', () => {
  const now = new Date()
  const dayMs = 1000 * 60 * 60 * 24
  const history = [
    { status: 'pending', date: new Date(now - 10 * dayMs).toISOString() },
    { status: 'processing', date: new Date(now - 7 * dayMs).toISOString() },
    { status: 'design', date: new Date(now - 3 * dayMs).toISOString() },
  ]
  it('calculates days between stages', () => {
    expect(calcStageDuration(history, 'pending')).toBe(3)
    expect(calcStageDuration(history, 'processing')).toBe(4)
  })
  it('returns null for missing status', () => {
    expect(calcStageDuration(history, 'delivery')).toBeNull()
  })
})

describe('calcTotalDuration', () => {
  it('calculates total days', () => {
    const days = calcTotalDuration({
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      updatedAt: new Date().toISOString(),
    })
    expect(days).toBe(15)
  })
})

describe('parseStatusFlow', () => {
  it('returns correct index', () => {
    expect(parseStatusFlow('pending')).toBe(0)
    expect(parseStatusFlow('design')).toBe(2)
    expect(parseStatusFlow('completed')).toBe(5)
    expect(parseStatusFlow('cancelled')).toBe(-1)
  })
})
