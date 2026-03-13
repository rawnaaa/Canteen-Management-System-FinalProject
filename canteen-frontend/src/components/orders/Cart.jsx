import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      }))

      const { data } = await api.post('/orders', {
        items: orderItems,
        notes: '',
      })

      console.log('Order created:', data)
      toast.success('Order placed successfully!')
      clearCart()
      // Redirect to My Orders after a brief delay to ensure state updates
      setTimeout(() => {
        navigate('/my-orders')
      }, 500)
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err)
      const errorMsg = err.response?.data?.message || 'Failed to place order'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
        <p className="text-gray-500 text-sm mt-1">Review and checkout your items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add items from the menu to get started</p>
              <button
                onClick={() => navigate('/menu')}
                className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                  {/* Item Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ₱{Number(item.unit_price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                      {' '}each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.menu_item_id, Math.max(0, item.quantity - 1))
                      }
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-32">
                    <p className="font-semibold text-gray-800">
                      ₱
                      {Number(item.unit_price * item.quantity).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.menu_item_id)}
                    className="p-2 hover:bg-red-100 rounded transition text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>

              {/* Breakdown */}
              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>
                    ₱
                    {Number(total).toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Items</span>
                  <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>
                  ₱
                  {Number(total).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
                <button
                  onClick={() => navigate('/menu')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => clearCart()}
                  className="w-full text-red-600 py-2 hover:bg-red-50 rounded-lg transition text-sm"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
