import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import MenuItemCard from './MenuItemCard'
import MenuForm from './MenuForm'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Search } from 'lucide-react'

export default function MenuList() {
  const { isAdmin } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (selectedCategory) params.category_id = selectedCategory
      const { data } = await api.get('/menu', { params })
      setMenuItems(data.data)
    } catch {
      toast.error('Failed to load menu.')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data))
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchMenu, 300)
    return () => clearTimeout(timer)
  }, [fetchMenu])

  const handleEdit = (item) => { setEditItem(item); setShowForm(true) }
  const handleAdd  = ()     => { setEditItem(null); setShowForm(true) }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    try {
      await api.delete(`/menu/${item.id}`)
      toast.success('Deleted.')
      fetchMenu()
    } catch {
      toast.error('Delete failed.')
    }
  }

  const handleToggle = async (item) => {
    try {
      await api.patch(`/menu/${item.id}/toggle-availability`)
      fetchMenu()
    } catch {
      toast.error('Failed to update availability.')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Loading menu…" />
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p>No menu items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <MenuForm
          item={editItem}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchMenu() }}
        />
      )}
    </div>
  )
}