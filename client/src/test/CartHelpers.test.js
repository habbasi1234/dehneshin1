import { describe, it, expect } from 'vitest'

const statusFlow = ['pending', 'processing', 'delivery', 'completed']
const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش',
  delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusColors = {
  pending: '#FFA726', processing: '#42A5F5',
  delivery: '#26A69A', completed: '#4CAF50', cancelled: '#EF5350',
}

const shippingMethods = [
  { id: 'post', label: 'پست پیشتاز', icon: '📮', time: '۲ تا ۳ روز کاری', cost: 30000 },
  { id: 'tipax', label: 'تیپاکس', icon: '🚚', time: '۱ تا ۲ روز کاری', cost: 45000 },
  { id: 'freight', label: 'باربری', icon: '📦', time: '۳ تا ۵ روز کاری', cost: 20000 },
  { id: 'express', label: 'ارسال فوری', icon: '⚡', time: 'همان روز (تهران)', cost: 80000 },
]

const trustBadges = [
  { icon: '🛡', title: 'ضمانت کیفیت' },
  { icon: '🚀', title: 'ارسال سریع' },
  { icon: '💳', title: 'پرداخت امن' },
  { icon: '✅', title: 'ضمانت تازگی' },
]

const freeShippingThreshold = 500000

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => {
    const price = parsePrice(item.price)
    return sum + price * item.quantity
  }, 0)
}

function calcOriginalTotal(cart) {
  return cart.reduce((sum, item) => {
    const orig = item.originalPrice ? parsePrice(item.originalPrice) : parsePrice(item.price)
    return sum + orig * item.quantity
  }, 0)
}

function calcDiscount(subtotal, origTotal) {
  return Math.max(0, origTotal - subtotal)
}

function calcShipping(subtotal, methodId) {
  const method = shippingMethods.find(s => s.id === methodId)
  if (!method) return 0
  return subtotal >= freeShippingThreshold ? 0 : method.cost
}

function calcTotal(subtotal, shipping, promoDiscount = 0) {
  return subtotal + shipping - promoDiscount
}

function parsePrice(price) {
  if (typeof price === 'number') return price
  return parseInt(String(price).replace(/,/g, '')) || 0
}

function applyPromo(code, subtotal) {
  const c = code.trim().toLowerCase()
  if (c === 'dehnesin10') return Math.round(subtotal * 0.1)
  if (c === 'dehnesin20') return Math.round(subtotal * 0.2)
  return 0
}

function getCartImage(item, products) {
  if (item.image) return item.image
  const p = products.find(p => p.id === item.productId)
  if (!p) return ''
  let imgs = p.images
  if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
  return Array.isArray(imgs) ? imgs[0] || '' : p.image || ''
}

function suggestedProducts(cart, products) {
  const cartCategories = [...new Set(cart.map(item => {
    const p = products.find(pr => pr.id === item.productId)
    return p?.category || ''
  }).filter(Boolean))]
  return products
    .filter(p => !cart.find(c => c.productId === p.id) && cartCategories.includes(p.category))
    .slice(0, 4)
}

describe('statusFlow', () => {
  it('has 4 steps', () => {
    expect(statusFlow.length).toBe(4)
  })

  it('starts with pending', () => {
    expect(statusFlow[0]).toBe('pending')
  })

  it('ends with completed', () => {
    expect(statusFlow[statusFlow.length - 1]).toBe('completed')
  })
})

describe('statusLabels', () => {
  it('has labels for all statuses', () => {
    expect(statusLabels.pending).toBeDefined()
    expect(statusLabels.processing).toBeDefined()
    expect(statusLabels.delivery).toBeDefined()
    expect(statusLabels.completed).toBeDefined()
    expect(statusLabels.cancelled).toBeDefined()
  })
})

describe('statusColors', () => {
  it('has colors for all statuses', () => {
    Object.values(statusColors).forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('shippingMethods', () => {
  it('has 4 methods', () => {
    expect(shippingMethods.length).toBe(4)
  })

  it('each has required fields', () => {
    shippingMethods.forEach(method => {
      expect(method).toHaveProperty('id')
      expect(method).toHaveProperty('label')
      expect(method).toHaveProperty('cost')
      expect(typeof method.cost).toBe('number')
      expect(method.cost).toBeGreaterThan(0)
    })
  })

  it('has post method with cost 30000', () => {
    expect(shippingMethods.find(m => m.id === 'post').cost).toBe(30000)
  })

  it('has express as most expensive', () => {
    const express = shippingMethods.find(m => m.id === 'express')
    expect(express.cost).toBe(Math.max(...shippingMethods.map(m => m.cost)))
  })
})

describe('trustBadges', () => {
  it('has 4 badges', () => {
    expect(trustBadges.length).toBe(4)
  })
})

describe('parsePrice', () => {
  it('parses string with commas', () => {
    expect(parsePrice('5,000,000')).toBe(5000000)
  })

  it('parses plain number string', () => {
    expect(parsePrice('100000')).toBe(100000)
  })

  it('returns number as-is', () => {
    expect(parsePrice(1000)).toBe(1000)
  })

  it('returns 0 for invalid', () => {
    expect(parsePrice('')).toBe(0)
    expect(parsePrice(undefined)).toBe(0)
    expect(parsePrice(null)).toBe(0)
  })
})

describe('calcSubtotal', () => {
  const cart = [
    { price: '5,000,000', quantity: 2 },
    { price: '3,000,000', quantity: 1 },
  ]

  it('calculates subtotal correctly', () => {
    expect(calcSubtotal(cart)).toBe(13000000)
  })

  it('returns 0 for empty cart', () => {
    expect(calcSubtotal([])).toBe(0)
  })
})

describe('calcOriginalTotal', () => {
  it('uses originalPrice when available', () => {
    const cart = [{ price: '5,000,000', originalPrice: '6,000,000', quantity: 1 }]
    expect(calcOriginalTotal(cart)).toBe(6000000)
  })

  it('falls back to price when no originalPrice', () => {
    const cart = [{ price: '5,000,000', quantity: 1 }]
    expect(calcOriginalTotal(cart)).toBe(5000000)
  })
})

describe('calcDiscount', () => {
  it('calculates discount amount', () => {
    expect(calcDiscount(5000000, 6000000)).toBe(1000000)
  })

  it('returns 0 when no discount', () => {
    expect(calcDiscount(5000000, 5000000)).toBe(0)
  })

  it('returns 0 when orig < subtotal (should not happen but defensive)', () => {
    expect(calcDiscount(6000000, 5000000)).toBe(0)
  })
})

describe('calcShipping', () => {
  it('calculates shipping for post', () => {
    expect(calcShipping(100000, 'post')).toBe(30000)
  })

  it('returns 0 for free shipping threshold met', () => {
    expect(calcShipping(500000, 'post')).toBe(0)
  })

  it('returns 0 for unknown method', () => {
    expect(calcShipping(100000, 'unknown')).toBe(0)
  })

  it('threshold is exact', () => {
    expect(calcShipping(499999, 'post')).toBe(30000)
    expect(calcShipping(500001, 'post')).toBe(0)
  })
})

describe('calcTotal', () => {
  it('adds subtotal + shipping - promo', () => {
    expect(calcTotal(100000, 30000, 10000)).toBe(120000)
  })

  it('handles zero promo', () => {
    expect(calcTotal(100000, 30000, 0)).toBe(130000)
  })
})

describe('applyPromo', () => {
  it('10% discount for dehnesin10', () => {
    expect(applyPromo('dehnesin10', 1000000)).toBe(100000)
  })

  it('20% discount for dehnesin20', () => {
    expect(applyPromo('dehnesin20', 1000000)).toBe(200000)
  })

  it('returns 0 for invalid code', () => {
    expect(applyPromo('invalid', 1000000)).toBe(0)
  })

  it('returns 0 for empty code', () => {
    expect(applyPromo('', 1000000)).toBe(0)
  })

  it('is case insensitive', () => {
    expect(applyPromo('DEHNESIN10', 1000000)).toBe(100000)
  })

  it('rounds discount', () => {
    expect(applyPromo('dehnesin10', 1001)).toBe(100)
  })
})

describe('getCartImage', () => {
  const products = [
    { id: 1, image: 'main.jpg', images: '["a.jpg","b.jpg"]' },
    { id: 2, image: 'fallback.jpg' },
    { id: 3, images: ['only.jpg'] },
  ]

  it('returns item.image first', () => {
    expect(getCartImage({ image: 'item.jpg' }, products)).toBe('item.jpg')
  })

  it('parses JSON string images from product', () => {
    expect(getCartImage({ productId: 1 }, products)).toBe('a.jpg')
  })

  it('falls back to product.image', () => {
    expect(getCartImage({ productId: 2 }, products)).toBe('fallback.jpg')
  })

  it('returns first array image', () => {
    expect(getCartImage({ productId: 3 }, products)).toBe('only.jpg')
  })

  it('returns empty when product not found', () => {
    expect(getCartImage({ productId: 999 }, products)).toBe('')
  })

  it('returns empty when no item image and no product', () => {
    expect(getCartImage({ productId: 999 }, [])).toBe('')
  })
})

describe('suggestedProducts', () => {
  const products = [
    { id: 1, category: 'fruits', name: 'Apple' },
    { id: 2, category: 'fruits', name: 'Orange' },
    { id: 3, category: 'dairy', name: 'Milk' },
    { id: 4, category: 'dairy', name: 'Yogurt' },
    { id: 5, category: 'grains', name: 'Rice' },
  ]

  it('suggests products from same categories not in cart', () => {
    const cart = [{ productId: 1 }]
    const suggestions = suggestedProducts(cart, products)
    expect(suggestions.some(p => p.id === 2)).toBe(true)
  })

  it('excludes products already in cart', () => {
    const cart = [{ productId: 1 }, { productId: 2 }]
    const suggestions = suggestedProducts(cart, products)
    expect(suggestions.some(p => p.id === 1)).toBe(false)
    expect(suggestions.some(p => p.id === 2)).toBe(false)
  })

  it('limits to 4 suggestions', () => {
    const cart = [{ productId: 5 }]
    const suggestions = suggestedProducts(cart, products)
    expect(suggestions.length).toBeLessThanOrEqual(4)
  })

  it('returns empty for empty cart', () => {
    expect(suggestedProducts([], products)).toEqual([])
  })
})
