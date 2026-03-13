import { CheckCircle, Printer, Plus } from 'lucide-react'

export default function OrderReceipt({ order, onNew }) {
  const handlePrint = () => window.print()

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Order Placed!</h2>
          <p className="text-sm text-gray-500 mt-1">Your order has been received.</p>
        </div>

        {/* Order info */}
        <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order #</span>
            <span className="font-bold text-gray-800">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold capitalize text-orange-600">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-700">{new Date(order.created_at).toLocaleString('en-PH')}</span>
          </div>
          {order.notes && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Notes</span>
              <span className="text-gray-700 text-right max-w-[60%]">{order.notes}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items Ordered</p>
          {order.order_items?.map((oi) => (
            <div key={oi.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{oi.menu_item?.name}</p>
                <p className="text-xs text-gray-400">₱{Number(oi.unit_price).toFixed(2)} × {oi.quantity}</p>
              </div>
              <span className="font-semibold text-gray-700">₱{Number(oi.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="font-bold text-gray-700">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            ₱{Number(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
        <button
          onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>
    </div>
  )
}