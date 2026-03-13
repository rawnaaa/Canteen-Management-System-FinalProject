import { useState, useEffect, useCallback } from 'react'
import orderService from '../../services/orderService'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700',  next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-700',      next: 'ready',     nextLabel: 'Mark Ready' },
  ready:     { label: 'Ready',     color: 'bg-green-100 text-green-700',    next: 'completed', nextLabel: 'Complete' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600',      next: null },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',        next: null },
}

function OrderCard({ order, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status]
  const [updating, setUpdating] = useState(false)

  const advance = async () => {
    if (!cfg.next) return
    setUpdating(true)
    try {
      await orderService.updateStatus(order.id, cfg.next)
      onStatusChange()
      toast.success(`Order ${order.order_number} → ${cfg.next}`)
    } catch {
      toast.error('Status update failed.')
    } finally {
      setUpdating(false)
    }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setUpdating(true)
    try {
      await orderService.updateStatus(order.id, 'cancelled')
      onStatusChange()
      toast.success('Order cancelled.')
    } catch {
      toast.error('Cancel failed.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-800 text-sm">{order.order_number}</p>
          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('en-PH')}</p>
          {order.user && <p className="text-xs text-gray-500 mt-0.5">Customer: {order.user.name}</p>}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-1">
        {order.order_items?.map((oi) => (
          <li key={oi.id} className="flex justify-between text-xs text-gray-600">
            <span>{oi.menu_item?.name} × {oi.quantity}</span>
            <span>₱{Number(oi.subtotal).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">📝 {order.notes}</p>
      )}

      <div className="flex items-center justify-between border-t pt-2">
        <span className="font-bold text-orange-600 text-sm">₱{Number(order.total_amount).toFixed(2)}</span>
        <div className="flex gap-2">
          {!['completed', 'cancelled'].includes(order.status) && (
            <button
              onClick={cancel}
              disabled={updating}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          {cfg.next && (
            <button
              onClick={advance}
              disabled={updating}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {updating ? '…' : cfg.nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const TABS = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

export default function OrderQueue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderService.getAll({ status: tab, per_page: 50 })
      setOrders(data.data)
    } catch {
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    setLoading(true)
    fetchOrders()
    // Auto-refresh every 15s
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Order Queue</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition
              ${tab === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>No {tab} orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  )
}