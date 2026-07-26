import { describe, it, expect } from 'vitest'

const ORDER_STATUSES = ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled']

const STATUS_LABELS = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}

function canAdvance(current) {
  const idx = ORDER_STATUSES.indexOf(current)
  return idx >= 0 && idx < ORDER_STATUSES.length - 2 && ORDER_STATUSES[idx + 1] !== 'cancelled'
}

function canGoBack(current) {
  const idx = ORDER_STATUSES.indexOf(current)
  return idx > 0 && ORDER_STATUSES[idx] !== 'cancelled'
}

function getNextStatus(current) {
  const idx = ORDER_STATUSES.indexOf(current)
  if (idx === -1 || idx >= ORDER_STATUSES.length - 2) return null
  return ORDER_STATUSES[idx + 1]
}

function getPrevStatus(current) {
  const idx = ORDER_STATUSES.indexOf(current)
  if (idx <= 0) return null
  return ORDER_STATUSES[idx - 1]
}

function isTerminal(status) {
  return status === 'completed' || status === 'cancelled'
}

describe('Order Status Flow', () => {
  it('has 7 statuses', () => {
    expect(ORDER_STATUSES.length).toBe(7)
  })

  it('pending is first', () => {
    expect(ORDER_STATUSES[0]).toBe('pending')
  })

  it('completed is second-to-last', () => {
    expect(ORDER_STATUSES[5]).toBe('completed')
  })

  it('cancelled is last', () => {
    expect(ORDER_STATUSES[6]).toBe('cancelled')
  })
})

describe('canAdvance', () => {
  it('allows advance from pending', () => {
    expect(canAdvance('pending')).toBe(true)
  })

  it('allows advance from delivery', () => {
    expect(canAdvance('delivery')).toBe(true)
  })

  it('does not allow advance from completed', () => {
    expect(canAdvance('completed')).toBe(false)
  })

  it('does not allow advance from cancelled', () => {
    expect(canAdvance('cancelled')).toBe(false)
  })
})

describe('canGoBack', () => {
  it('does not allow going back from pending', () => {
    expect(canGoBack('pending')).toBe(false)
  })

  it('allows going back from processing', () => {
    expect(canGoBack('processing')).toBe(true)
  })

  it('does not allow going back from cancelled', () => {
    expect(canGoBack('cancelled')).toBe(false)
  })
})

describe('getNextStatus', () => {
  it('pending -> processing', () => {
    expect(getNextStatus('pending')).toBe('processing')
  })

  it('design -> production', () => {
    expect(getNextStatus('design')).toBe('production')
  })

  it('completed -> null', () => {
    expect(getNextStatus('completed')).toBeNull()
  })

  it('unknown -> null', () => {
    expect(getNextStatus('unknown')).toBeNull()
  })
})

describe('getPrevStatus', () => {
  it('processing -> pending', () => {
    expect(getPrevStatus('processing')).toBe('pending')
  })

  it('pending -> null', () => {
    expect(getPrevStatus('pending')).toBeNull()
  })
})

describe('isTerminal', () => {
  it('completed is terminal', () => {
    expect(isTerminal('completed')).toBe(true)
  })

  it('cancelled is terminal', () => {
    expect(isTerminal('cancelled')).toBe(true)
  })

  it('pending is not terminal', () => {
    expect(isTerminal('pending')).toBe(false)
  })
})
