import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .replace('/api', '')

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
  const { isAdmin, isCustomer } = useAuth()
  const { addItem } = useCart()

  const imgSrc = item.image
    ? `${API_BASE}/storage/${item.image}`
    : null

  const handleAddToCart = () => {
    if (!item.is_available || item.stock_quantity <= 0) return
    addItem(item)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
      {/* Image */}
      <div className="h-40 bg-orange-50 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl">🍽️</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold
              ${item.is_available && item.stock_quantity > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'}`}
          >
            {item.is_available && item.stock_quantity > 0 ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-orange-600 font-bold text-base">
            ₱{Number(item.price).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">Stock: {item.stock_quantity}</span>
        </div>

        {/* Low stock warning */}
        {item.is_low_stock && item.stock_quantity > 0 && (
          <p className="text-xs text-amber-600 font-medium mt-1">⚠ Low stock</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {isCustomer && (
            <button
              onClick={handleAddToCart}
              disabled={!item.is_available || item.stock_quantity <= 0}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-orange-500 py-2 text-white text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> Add to Cart
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => onToggle(item)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition"
                title="Toggle availability"
              >
                {item.is_available ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onEdit(item)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}