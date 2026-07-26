import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0)

  const getCartCount = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      return cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    } catch { return 0 }
  }, [])

  const refreshCart = useCallback(() => {
    setCartCount(getCartCount())
  }, [getCartCount])

  useEffect(() => {
    refreshCart()
    const handler = () => refreshCart()
    window.addEventListener('cart-update', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('cart-update', handler)
      window.removeEventListener('storage', handler)
    }
  }, [refreshCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  return ctx || { cartCount: 0, refreshCart: () => {} }
}
