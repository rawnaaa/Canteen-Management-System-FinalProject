import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = useCallback((menuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem.id)
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [
        ...prev,
        {
          menu_item_id: menuItem.id,
          name: menuItem.name,
          unit_price: parseFloat(menuItem.price),
          quantity,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menu_item_id !== menuItemId))
  }, [])

  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menu_item_id !== menuItemId))
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.menu_item_id === menuItemId ? { ...i, quantity } : i
        )
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}