import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import LowStockAlert from './LowStockAlert'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Package, RefreshCw, Search } from 'lucide-react'

function AdjustModal({ item, onClose, onSaved }) {
  const [change, setChange] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!change || change === '0') return toast.error('Enter a non-zero quantity.')
    if (!reason.trim()) return toast.error('Reason is required.')
    setSaving(true)
    try {
      await api.patch(`/inventory/${item.id}/adjust`, {
        quantity_change: parseInt(change),
        reason,
      })
      toast.success('Stock adjusted.')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Adjust Stock</h2>
        <p className="text-sm text-gray-500">
          <strong>{item.name}</strong> — Current stock: <strong>{item.stock_quantity}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Change (use negative to deduct)
            </label>
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="e.g. 20 or -5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Weekly restock"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InventoryTable() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustItem, setAdjustItem] = useState(null)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (lowStockOnly) params.low_stock = 'true'
      const { data } = await api.get('/inventory', { params })
      setItems(data.data)
    } catch {
      toast.error('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [lowStockOnly])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter((i) => i.is_low_stock && i.stock_quantity > 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Low stock alert */}
      <LowStockAlert items={lowStockItems} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          <span className="text-sm text-gray-600 font-medium">Low stock only</span>
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading inventory…" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Item', 'Category', 'Price', 'Stock', 'Threshold', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.category?.name}</td>
                      <td className="px-4 py-3 text-gray-700">₱{Number(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${item.stock_quantity <= item.low_stock_threshold ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.low_stock_threshold}</td>
                      <td className="px-4 py-3">
                        {item.stock_quantity === 0 ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Out of Stock</span>
                        ) : item.is_low_stock ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Low Stock</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">In Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setAdjustItem(item)}
                          className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSaved={() => { setAdjustItem(null); fetchInventory() }}
        />
      )}
    </div>
  )
}