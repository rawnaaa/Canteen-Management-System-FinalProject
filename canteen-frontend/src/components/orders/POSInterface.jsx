import { useState, useEffect } from 'react'
import api from '../../services/api'
import orderService from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import OrderReceipt from './OrderReceipt'
import toast from 'react-hot-toast'
import { Plus, Minus, Trash2, Search, ShoppingCart } from 'lucide-react'

export default function POSInterface() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart]   = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    Promise.all([api.get('/menu', { params: { available: 'true' } }), api.get('/categories')])
      .then(([menuRes, catRes]) => {
        setMenuItems(menuRes.data.data)
        setCategories(catRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter ? String(item.category_id) === String(catFilter) : true
    return matchSearch && matchCat
  })

  const addToCart = (item) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.menu_item_id === item.id)
      if (ex) return prev.map((c) => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menu_item_id: item.id, name: item.name, unit_price: parseFloat(item.price), quantity: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => c.menu_item_id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    )
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.menu_item_id !== id))

  const total = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0)

  const handleSubmit = async () => {
    if (!cart.length) return toast.error('Cart is empty.')
    setSubmitting(true)
    try {
      const payload = {
        items: cart.map((c) => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
        notes,
      }
      const { data } = await orderService.create(payload)
      setCompletedOrder(data.data)
      setCart([])
      setNotes('')
      toast.success('Order placed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading POS…" />

  if (completedOrder) {
    return <OrderReceipt order={completedOrder} onNew={() => setCompletedOrder(null)} />
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Left: Menu */}
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white border border-gray-100 rounded-xl p-3 text-left hover:border-orange-300 hover:shadow transition"
            >
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 truncate">{item.category?.name}</p>
              <p className="text-orange-600 font-bold mt-1 text-sm">₱{Number(item.price).toFixed(2)}</p>
              <p className="text-xs text-gray-400">Stock: {item.stock_quantity}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-80 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <ShoppingCart className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold text-gray-800">Order Cart</h2>
          {cart.length > 0 && (
            <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 font-bold">
              {cart.length}
            </span>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No items yet.</p>
          ) : (
            cart.map((c) => (
              <div key={c.menu_item_id} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">₱{(c.unit_price * c.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(c.menu_item_id, -1)} className="rounded p-1 hover:bg-gray-200">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{c.quantity}</span>
                  <button onClick={() => updateQty(c.menu_item_id, 1)} className="rounded p-1 hover:bg-gray-200">
                    <Plus className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeFromCart(c.menu_item_id)} className="rounded p-1 hover:bg-red-100 text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notes */}
        <div className="px-3 pb-2">
          <textarea
            placeholder="Order notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Total & submit */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-orange-600 text-lg">₱{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !cart.length}
            className="w-full rounded-lg bg-orange-500 py-3 text-white font-bold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}