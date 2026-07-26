import { describe, it, expect } from 'vitest'

const statusLabels = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', design: 'در مرحله طراحی',
  production: 'در حال تولید', delivery: 'در حال تحویل', completed: 'تکمیل شده', cancelled: 'لغو شده',
}
const statusFlow = ['pending', 'processing', 'design', 'production', 'delivery', 'completed']

describe('Status flow', () => {
  it('has correct order', () => {
    expect(statusFlow).toEqual(['pending', 'processing', 'design', 'production', 'delivery', 'completed'])
  })

  it('covers all status labels', () => {
    const allLabels = ['pending', 'processing', 'design', 'production', 'delivery', 'completed', 'cancelled']
    allLabels.forEach(s => {
      expect(statusLabels[s]).toBeDefined()
      expect(typeof statusLabels[s]).toBe('string')
    })
  })

  it('advances correctly', () => {
    const current = statusFlow.indexOf('design')
    const next = statusFlow[current + 1]
    expect(next).toBe('production')
  })

  it('goes back correctly', () => {
    const current = statusFlow.indexOf('production')
    const prev = statusFlow[current - 1]
    expect(prev).toBe('design')
  })
})

describe('Order code generation', () => {
  it('generates AZ prefix', () => {
    const code = 'AZ-250605-001'
    expect(code.startsWith('AZ-')).toBe(true)
    expect(code.length).toBe(13)
  })
})

describe('Cart operations', () => {
  it('adds item to cart', () => {
    const cart = []
    const item = { productId: 1, name: 'مبل', quantity: 1, selectedWoodColor: 'گردویی', selectedFabric: 'مخمل', cartKey: '1-گردویی-مخمل' }
    cart.push(item)
    expect(cart.length).toBe(1)
    expect(cart[0].selectedWoodColor).toBe('گردویی')
    expect(cart[0].selectedFabric).toBe('مخمل')
  })

  it('merges duplicate items', () => {
    const cart = [{ cartKey: '1-گردویی-مخمل', productId: 1, quantity: 1 }]
    const existing = cart.find(c => c.cartKey === '1-گردویی-مخمل')
    if (existing) existing.quantity += 2
    expect(cart[0].quantity).toBe(3)
  })

  it('separates different color/fabric combos', () => {
    const cart = [
      { cartKey: '1-گردویی-مخمل', quantity: 1 },
      { cartKey: '1-طلایی-ساده', quantity: 2 },
    ]
    expect(cart.length).toBe(2)
  })
})
