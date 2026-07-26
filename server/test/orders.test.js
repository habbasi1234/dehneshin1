import { describe, it, expect } from 'vitest'

const ORDER_STATUSES = ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled']

const STATUS_LABELS = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}

function normalizeMobile(m) {
  let s = String(m).replace(/[\s\-]/g, '').replace(/^(\+|00)?98/, '')
  if (s.startsWith('0')) s = s.slice(1)
  return s
}

function generateOrderCode(count) {
  const prefix = 'AZ'
  const date = new Date()
  const d = String(date.getFullYear()).slice(2) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0')
  const num = String(count + 1).padStart(3, '0')
  return `${prefix}-${d}-${num}`
}

describe('Order Statuses', () => {
  it('has all 7 statuses', () => {
    expect(ORDER_STATUSES.length).toBe(7)
  })

  it('each status has a Persian label', () => {
    ORDER_STATUSES.forEach(status => {
      expect(STATUS_LABELS[status]).toBeDefined()
      expect(typeof STATUS_LABELS[status]).toBe('string')
    })
  })

  it('cancelled is not in the flow progression', () => {
    const flow = ORDER_STATUSES.filter(s => s !== 'cancelled')
    expect(flow).toEqual(['pending', 'processing', 'design', 'production', 'delivery', 'completed'])
  })
})

describe('Order Code Generation', () => {
  it('starts with AZ prefix', () => {
    const code = generateOrderCode(0)
    expect(code.startsWith('AZ-')).toBe(true)
  })

  it('has correct format AZ-YYMMDD-NNN', () => {
    const code = generateOrderCode(0)
    const parts = code.split('-')
    expect(parts.length).toBe(3)
    expect(parts[0]).toBe('AZ')
    expect(parts[1].length).toBe(6)
    expect(parts[2].length).toBe(3)
  })

  it('increments order number', () => {
    const c1 = generateOrderCode(0)
    const c2 = generateOrderCode(5)
    const n1 = parseInt(c1.split('-')[2])
    const n2 = parseInt(c2.split('-')[2])
    expect(n2).toBe(n1 + 5)
  })
})

describe('normalizeMobile (orders)', () => {
  it('handles +98 prefix', () => {
    expect(normalizeMobile('+989121234567')).toBe('9121234567')
  })

  it('handles 0 prefix', () => {
    expect(normalizeMobile('09121234567')).toBe('9121234567')
  })

  it('handles spaces', () => {
    expect(normalizeMobile('0912 123 4567')).toBe('9121234567')
  })
})
