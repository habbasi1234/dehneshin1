import { describe, it, expect } from 'vitest'

function addToCart(cart, item) {
  const existing = cart.find(c => c.cartKey === item.cartKey)
  if (existing) {
    return cart.map(c => c.cartKey === item.cartKey ? { ...c, quantity: c.quantity + item.quantity } : c)
  }
  return [...cart, item]
}

function removeFromCart(cart, cartKey) {
  return cart.filter(c => c.cartKey !== cartKey)
}

function updateQuantity(cart, cartKey, quantity) {
  if (quantity <= 0) return removeFromCart(cart, cartKey)
  return cart.map(c => c.cartKey === cartKey ? { ...c, quantity } : c)
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const price = parseInt(String(item.price).replace(/,/g, '')) || 0
    return sum + price * item.quantity
  }, 0)
}

describe('Cart Operations', () => {
  const item1 = { cartKey: '1-گردویی-مخمل', productId: 1, name: 'مبل', quantity: 1, price: '5,000,000' }
  const item2 = { cartKey: '2-طلایی-ساده', productId: 2, name: 'صندلی', quantity: 2, price: '3,000,000' }

  it('adds item to empty cart', () => {
    const result = addToCart([], item1)
    expect(result.length).toBe(1)
    expect(result[0].cartKey).toBe('1-گردویی-مخمل')
  })

  it('merges quantity for duplicate cartKey', () => {
    const cart = [{ ...item1, quantity: 1 }]
    const result = addToCart(cart, { ...item1, quantity: 2 })
    expect(result.length).toBe(1)
    expect(result[0].quantity).toBe(3)
  })

  it('adds different items separately', () => {
    const cart = [item1]
    const result = addToCart(cart, item2)
    expect(result.length).toBe(2)
  })

  it('removes item by cartKey', () => {
    const cart = [item1, item2]
    const result = removeFromCart(cart, '1-گردویی-مخمل')
    expect(result.length).toBe(1)
    expect(result[0].cartKey).toBe('2-طلایی-ساده')
  })

  it('updates quantity', () => {
    const cart = [item1]
    const result = updateQuantity(cart, '1-گردویی-مخمل', 5)
    expect(result[0].quantity).toBe(5)
  })

  it('removes item when quantity is 0', () => {
    const cart = [item1, item2]
    const result = updateQuantity(cart, '1-گردویی-مخمل', 0)
    expect(result.length).toBe(1)
  })

  it('removes item when quantity is negative', () => {
    const cart = [item1]
    const result = updateQuantity(cart, '1-گردویی-مخمل', -1)
    expect(result.length).toBe(0)
  })

  it('calculates cart total correctly', () => {
    const cart = [item1, item2]
    const total = getCartTotal(cart)
    expect(total).toBe(11000000)
  })

  it('returns 0 for empty cart', () => {
    expect(getCartTotal([])).toBe(0)
  })
})
