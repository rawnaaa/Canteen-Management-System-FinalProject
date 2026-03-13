import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ShoppingCart, LogOut, User } from 'lucide-react'

export default function Navbar({ onMenuToggle }) {
  const { user, logout, isCustomer } = useAuth()
  const { itemCount } = useCart()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-gray-500 hover:text-gray-800 md:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold text-orange-500 text-lg">
          🍽️ <span className="hidden sm:inline">CampusBite</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {isCustomer && (
          <Link
            to="/cart"
            className="relative flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-orange-600 hover:bg-orange-100 transition text-sm font-medium"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-4 w-4 text-gray-400" />
          <span className="hidden sm:inline font-medium">{user?.name}</span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 capitalize font-semibold">
            {user?.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}