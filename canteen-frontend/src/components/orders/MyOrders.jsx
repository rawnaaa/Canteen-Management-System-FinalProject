import { useState, useEffect } from 'react'
import { Eye, Download } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      // Handle paginated response from backend
      let ordersData = []
      if (response.data?.data) {
        // Paginated response: response.data = { data: [...], current_page, etc }
        ordersData = response.data.data.data || response.data.data
      } else if (Array.isArray(response.data)) {
        // Direct array response
        ordersData = response.data
      }
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err) {
      toast.error('Failed to load orders')
      console.error(err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">View and track your orders</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No orders yet. Start ordering from the menu!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₱{Number(order.total_amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleViewDetails(order)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Order #{selectedOrder.id}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-PH', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </div>

            <div className="space-y-6">
              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-gray-600">Item</th>
                      <th className="text-center py-2 text-gray-600">Qty</th>
                      <th className="text-right py-2 text-gray-600">Price</th>
                      <th className="text-right py-2 text-gray-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items && Array.isArray(selectedOrder.order_items) && selectedOrder.order_items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800">{item.menu_item_name}</td>
                        <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-800">
                          ₱{Number(item.price).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 text-right text-gray-800 font-semibold">
                          ₱{Number(item.subtotal).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>
                    ₱
                    {Number(selectedOrder.total_amount - (selectedOrder.tax_amount || 0)).toLocaleString(
                      'en-PH',
                      { minimumFractionDigits: 2 }
                    )}
                  </span>
                </div>
                {selectedOrder.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>
                      ₱
                      {Number(selectedOrder.tax_amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>
                    ₱
                    {Number(selectedOrder.total_amount).toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
