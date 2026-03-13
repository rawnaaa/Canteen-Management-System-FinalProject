import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  BarChart2,
  Users,
  X,
} from 'lucide-react'

const adminLinks = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/menu',       label: 'Menu',         icon: UtensilsCrossed },
  { to: '/orders',     label: 'Orders',       icon: ShoppingBag },
  { to: '/inventory',  label: 'Inventory',    icon: Package },
  { to: '/reports',    label: 'Reports',      icon: BarChart2 },
  { to: '/users',      label: 'Users',        icon: Users },
]

const cashierLinks = [
  { to: '/pos',        label: 'POS',          icon: ShoppingBag },
  { to: '/orders',     label: 'Order Queue',  icon: Package },
  { to: '/menu',       label: 'Menu',         icon: UtensilsCrossed },
  { to: '/inventory',  label: 'Inventory',    icon: Package },
]

const customerLinks = [
  { to: '/menu',       label: 'Menu',         icon: UtensilsCrossed },
  { to: '/my-orders',  label: 'My Orders',    icon: ShoppingBag },
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin, isCashier } = useAuth()
  const links = isAdmin ? adminLinks : isCashier ? cashierLinks : customerLinks

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-700">
          <span className="font-bold text-lg text-orange-400">🍽️ CampusBite</span>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition
                ${isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}