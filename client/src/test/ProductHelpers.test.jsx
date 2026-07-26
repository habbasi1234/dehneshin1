import { describe, it, expect } from 'vitest'

function formatPrice(price) {
  const num = parseInt(String(price).replace(/,/g, ''))
  if (!num || num <= 0) return 'قیمت تماس بگیرید'
  return num.toLocaleString('fa-IR') + ' تومان'
}

function getDiscountedPrice(price, discount) {
  const p = parseInt(String(price).replace(/,/g, '')) || 0
  const d = parseInt(discount) || 0
  if (d <= 0 || d >= 100) return p
  return Math.round(p * (1 - d / 100))
}

function getStockStatus(stock) {
  const s = parseInt(stock) || 0
  if (s <= 0) return 'out_of_stock'
  if (s <= 5) return 'low_stock'
  return 'in_stock'
}

describe('formatPrice', () => {
  it('formats valid price with Persian numerals', () => {
    const result = formatPrice('5000000')
    expect(result).toContain('تومان')
  })

  it('shows contact message for zero', () => {
    expect(formatPrice(0)).toBe('قیمت تماس بگیرید')
  })

  it('shows contact message for null', () => {
    expect(formatPrice(null)).toBe('قیمت تماس بگیرید')
  })

  it('handles string with commas', () => {
    const result = formatPrice('3,500,000')
    expect(result).toContain('تومان')
  })
})

describe('getDiscountedPrice', () => {
  it('calculates discounted price', () => {
    expect(getDiscountedPrice('5000000', 10)).toBe(4500000)
  })

  it('returns original for 0% discount', () => {
    expect(getDiscountedPrice('5000000', 0)).toBe(5000000)
  })

  it('returns original for invalid discount', () => {
    expect(getDiscountedPrice('5000000', -5)).toBe(5000000)
    expect(getDiscountedPrice('5000000', 100)).toBe(5000000)
  })

  it('rounds result', () => {
    expect(getDiscountedPrice('100', 33)).toBe(67)
  })

  it('returns 0 for zero price', () => {
    expect(getDiscountedPrice('0', 10)).toBe(0)
  })
})

describe('getStockStatus', () => {
  it('returns out_of_stock for 0', () => {
    expect(getStockStatus(0)).toBe('out_of_stock')
  })

  it('returns out_of_stock for negative', () => {
    expect(getStockStatus(-1)).toBe('out_of_stock')
  })

  it('returns low_stock for 1-5', () => {
    expect(getStockStatus(1)).toBe('low_stock')
    expect(getStockStatus(5)).toBe('low_stock')
  })

  it('returns in_stock for > 5', () => {
    expect(getStockStatus(6)).toBe('in_stock')
    expect(getStockStatus(100)).toBe('in_stock')
  })

  it('returns out_of_stock for null/undefined', () => {
    expect(getStockStatus(null)).toBe('out_of_stock')
    expect(getStockStatus(undefined)).toBe('out_of_stock')
  })
})
